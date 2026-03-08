import { useState, useEffect, Fragment, useRef, useCallback } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import LoadSpinner from "./LoadSpinner";
import ErrorBox from "./ErrorBox";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Input } from "@/Components/ui/input";
import { Loader2 } from "lucide-react";
import { formatRelativeDanish } from "../lib/dateUtils";

const SIDELINIEN_ID = "sidlin_id";
const SIDELINIEN_PWD = "sidlin_pwd"; // Will be removed in future

const saveToDevice = (key: string, value: string) =>
  typeof window !== "undefined" && window.localStorage.setItem(key, value);
const getFromDevice = (key: string): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
const deleteFromDevice = (key: string) =>
  typeof window !== "undefined" && window.localStorage.removeItem(key);

/**
 * Sanitize HTML from vBulletin shout messages.
 * Allows basic formatting (bold, italic, links, images) but strips
 * scripts, event handlers, and other XSS vectors.
 */
const sanitizeHtml = (dirty: string): string => {
  // Add hook to transform links
  DOMPurify.addHook("afterSanitizeAttributes", (node: any) => {
    if (node.tagName === "A" && node.hasAttribute("href")) {
      const href = node.getAttribute("href") || "";
      // If it doesn't have a protocol or start with //, it's relative
      if (!href.match(/^(https?:)?\/\//i)) {
        const prefix = href.startsWith("/") ? "" : "/";
        node.setAttribute(
          "href",
          `http://sidelinien.dk/forums${prefix}${href}`,
        );
      }
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "nofollow noopener noreferrer");
    }
  });

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "u",
      "em",
      "strong",
      "a",
      "br",
      "img",
      "span",
      "font",
      "strike",
      "s",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "color",
      "style",
      "class",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"],
  });

  DOMPurify.removeHook("afterSanitizeAttributes");
  return clean;
};

interface Shout {
  userid: string;
  id: string;
  time: string | null;
  name: string;
  message: string;
  hue: string;
  type: string;
}

interface LoginProps {
  hideHeader?: boolean;
}

export default function Login({ hideHeader = false }: LoginProps) {
  const [bb_userid, set_bb_userid] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loggedIn, setLoggedIn] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [shouts, setShouts] = useState<Shout[]>([]);
  const [refreshCountdown, setRefreshCountdown] = useState(10);
  const [sticky, setSticky] = useState("");
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState("");
  const [isSending, setIsSending] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const doLogin = async () => {
    if (username && password) {
      setIsLoggingIn(true);
      try {
        await grabCredentials();
      } catch {
        setShowError("Login fejlede — prøv igen");
      }
      setIsLoggingIn(false);
    }
  };

  const doLogout = async () => {
    if (window.confirm("Vil du gerne logge ud?")) {
      await axios.post("/api/logout");
      setLoggedIn(false);
      setUsername("");
      setPassword("");
      set_bb_userid(null);
      setShouts([]);
      setSticky("");
      setLastUpdate(null);
      setShowError("");

      deleteFromDevice(SIDELINIEN_ID);
      deleteFromDevice(SIDELINIEN_PWD);
    }
  };

  const doSend = async () => {
    setIsSending(true);

    // Refresh credentials transparently if the backend reports missing tokens
    // We try to grab credentials silently if sending fails
    const success = await sendMessage();

    if (!success) {
      if (username && password) {
        await grabCredentials();
        await sendMessage(); // Retry
      } else {
        setShowError("Det lader til, du er blevet logget ud. Log ind igen.");
      }
    }

    setMessage("");
    setIsSending(false);
  };

  const sendMessage = async () => {
    try {
      await axios({
        method: "post",
        url: `/api/sendshout`,
        data: {
          message,
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  const grabCredentials = async () => {
    let data: any = "";

    try {
      const res = await axios({
        method: "post",
        url: `/api/getcredentials`,
        data: {
          username,
          password,
        },
      });
      data = res.data;
    } catch (err: any) {
      setShowError(
        err?.response?.data?.error || "Vi kunne ikke logge dig ind.",
      );
      return;
    }

    if (!data || !data.success) {
      setShowError("Vi kunne ikke logge dig ind.");
      return;
    }

    const { bb_userid: id } = data;

    if (id) {
      set_bb_userid(id);

      setLoggedIn(true);
      setShowError("");

      saveToDevice(SIDELINIEN_ID, id);
    } else {
      setShowError("Vi kunne ikke logge dig ind.");
    }
  };

  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    countdownTimerRef.current = id;
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  const grabShouts = useCallback(async () => {
    if (!loggedIn || !bb_userid) {
      return;
    }

    try {
      const res = await axios({
        url: `/api/getshouts`,
        // Iron-session cookies are sent automatically with the request
      });

      if (res.data?.vbshout?.error) {
        return;
      }

      const rawShouts = res.data?.vbshout?.shouts?.[0]?.shout;
      if (!rawShouts || !Array.isArray(rawShouts)) return;

      const parsedShouts: Shout[] = rawShouts.map(
        (curr: any, index: number, array: any[]) => {
          const next = array[index + 1] || null;
          const time =
            next && curr.time[0] === next.time[0] ? null : curr.time[0];
          return {
            userid: curr.userid[0],
            id: curr.shoutid[0],
            time: time ? time.replace(/\[|\]/gi, "") : null,
            name: curr.jsusername[0],
            message: curr.message[0],
            hue: toHue(curr.jsusername[0]).toString(),
            type: curr.template[0],
          };
        },
      );

      setShouts(parsedShouts);
      setRefreshCountdown(10);

      const stick = res.data.vbshout.sticky?.[0];
      const stickyPost = Array.isArray(stick) ? stick[0] : stick;
      setSticky(stickyPost || "");
      setLastUpdate(Date.now());
    } catch {
      // Silently fail — will retry on next interval
    }
  }, [bb_userid, loggedIn]);

  const grabAutologin = useCallback(async () => {
    try {
      const res = await axios.get("/api/user");
      if (res.data.isLoggedIn && res.data.bb_userid) {
        set_bb_userid(res.data.bb_userid);
        setLoggedIn(true);
      } else {
        // Clear any legacy client state if the server says we're logged out
        setLoggedIn(false);
        set_bb_userid(null);
      }
    } catch {
      // Failed to verify user
    }
  }, []);

  useEffect(() => {
    grabAutologin();
  }, [grabAutologin]);

  const shoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Fetch immediately, then poll
    grabShouts();

    const id = setInterval(() => {
      grabShouts();
    }, 10000);
    shoutTimerRef.current = id;
    return () => {
      if (shoutTimerRef.current) {
        clearInterval(shoutTimerRef.current);
      }
    };
  }, [loggedIn, grabShouts]);

  const toHue = (str: string): number => {
    let hash = 0;
    if (str.length === 0) return 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    return Math.abs(hash % 360);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative bg-[var(--background)]">
      {loggedIn ? (
        <>
          {!hideHeader && (
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Nice FC
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  {shouts.length === 0 ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                  )}
                  <span className="w-4 text-right">{refreshCountdown}s</span>
                </div>
                <button
                  onClick={() => doLogout()}
                  className="text-muted-foreground hover:text-foreground text-2xl leading-none px-2"
                  title="Log ud"
                >
                  &times;
                </button>
              </div>
            </div>
          )}

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 pt-0">
              {shouts.length === 0 && <LoadSpinner />}

              {sticky && <div className="stickyPost">{sticky}</div>}

              {shouts.map((shout) => (
                <div
                  className={`shout ${
                    shout.type === "me"
                      ? " notice"
                      : shout.userid === bb_userid
                        ? "self"
                        : ""
                  }`}
                  key={shout.id}
                >
                  {shout.time && (
                    <div className="time">
                      {formatRelativeDanish(shout.time)}
                    </div>
                  )}
                  <div
                    className={`message${
                      shout.userid === bb_userid ? " self" : ""
                    }`}
                    style={{ "--shout-hue": shout.hue } as React.CSSProperties}
                  >
                    <div className="author">{shout.name}</div>
                    <div
                      className="messageContent"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          shout.type === "me"
                            ? shout.name + " " + shout.message
                            : shout.message,
                        ),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {showError !== "" && (
            <ErrorBox errorText={showError} cb={setShowError} />
          )}

          <div className="footer shrink-0 flex gap-2 p-2 border-t">
            <Input
              type="text"
              disabled={isSending}
              placeholder="Din besked"
              autoComplete="off"
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSending && message.trim()) {
                  doSend();
                }
              }}
              value={message}
            />
            <button
              className="primary"
              disabled={isSending || !message.trim()}
              onClick={() => doSend()}
            >
              {isSending ? "Sender..." : "Send"}
            </button>
          </div>
        </>
      ) : (
        <div className="loginContainer flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
          <p>Vær med i &quot;skakten&quot; på din mobil - uden alt besværet</p>

          <form
            className="flex flex-col gap-4 w-full max-w-sm mt-4"
            onSubmit={(e) => {
              e.preventDefault();
              doLogin();
            }}
          >
            <Input
              type="text"
              placeholder="Brugernavn"
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              disabled={isLoggingIn}
            />
            <Input
              type="password"
              autoComplete="off"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={isLoggingIn}
            />

            <button
              className="primary mt-2"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Logger ind..." : "Log ind"}
            </button>

            {isLoggingIn && <LoadSpinner />}

            {showError !== "" && (
              <ErrorBox errorText={showError} cb={setShowError} />
            )}
          </form>
        </div>
      )}
    </div>
  );
}
