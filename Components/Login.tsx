import { useState, useEffect, Fragment, useRef } from "react";
import axios from "axios";
import { useCallback } from "react";
import LoadSpinner from "./LoadSpinner";
import ErrorBox from "./ErrorBox";

const SIDELINIEN_ID = "sidlin_id";
const SIDELINIEN_PWD = "sidlin_pwd";

const saveToDevice = (key: string, value: string) =>
  typeof window !== "undefined" && window.localStorage.setItem(key, value);
const getFromDevice = (key: string) =>
  typeof window !== "undefined" && window.localStorage.getItem(key);
const deleteFromDevice = (key: string) =>
  typeof window !== "undefined" && window.localStorage.removeItem(key);

export default function Login() {
  const [bb_userid, set_bb_userid] = useState(getFromDevice(SIDELINIEN_ID));
  const [bb_password, set_bb_password] = useState(
    getFromDevice(SIDELINIEN_PWD)
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [securitytoken, setSecuritytoken] = useState("");
  const [securitytokenExpire, setSecuritytokenExpire] = useState(-1);

  const [loggedIn, setLoggedIn] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [shouts, setShouts] = useState([]);
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
      } catch (e) {
        console.log(e);
      }
      setIsLoggingIn(false);
    }
  };

  const doLogout = async () => {
    console.log("do log out");

    if (window.confirm("Vil du gerne logge ud?")) {
      setLoggedIn(false);
      setSecuritytoken("");
      setSecuritytokenExpire(-1);
      setUsername("");
      setPassword("");
      set_bb_password("");
      set_bb_userid("");
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
    const tokenExpired = securitytokenExpire + 1000 * 60 * 10 < Date.now();

    if (tokenExpired) {
      if (username && password) {
        console.log("get new token because we have what we need");
        await grabSecurityToken();
      } else {
        setShowError(
          "Øv, dit token er udløbet. Log ud og ind igen for at få et nyt"
        );
        return;
      }
    }

    await sendMessage();

    setMessage("");
    setIsSending(false);
  };

  const sendMessage = async () => {
    try {
      const res = await axios({
        method: "post",
        url: `/api/sendshout`,
        data: {
          bb_userid,
          bb_password,
          securitytoken,
          message,
        },
      });
      return res.data;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const grabSecurityToken = async () => {
    try {
      const res = await axios({
        method: "post",
        url: `/api/getsecuritytoken`,
        data: {
          username: username,
          password: password,
        },
      });
      console.log(res.data);
      return res.data;
    } catch (e) {
      console.log(e);
      return "";
    }
  };

  const grabCredentials = async () => {
    let data: any = "";

    if (securitytoken === "") {
      data = await grabSecurityToken();
    } else {
      const res = await axios({
        method: "post",
        url: `/api/getcredentials`,
        data: {
          username: username,
          password: password,
        },
      });
      data = res.data;
    }

    const { bb_userid: id, bb_password: pwd, securitytoken: token } = data;

    if (id && pwd) {
      set_bb_userid(id);
      set_bb_password(pwd);

      if (token !== "") {
        setSecuritytoken(token);
        setIsSending(false);
        setSecuritytokenExpire(Date.now());
      }

      setLoggedIn(true);
      setShowError("");

      saveToDevice(SIDELINIEN_ID, id);
      saveToDevice(SIDELINIEN_PWD, pwd);
    } else {
      setShowError("Vi kunne ikke logge dig ind.");
    }
  };

  const grabShouts = useCallback(async () => {
    if (!(loggedIn && bb_userid && bb_password)) {
      console.log("not logged in");
      return;
    }

    console.log("grabshouts", loggedIn, bb_userid, bb_password);
    try {
      //@ts-ignore
      clearTimeout(grabShouts);
      const res = await axios({
        url: `/api/getshouts`,
        headers: {
          Authorization: "Basic " + window.btoa(bb_userid + ":" + bb_password),
        },
      });

      if (res.data.vbshout.error) {
        console.log(res.data.vbshout.error);
        return;
      }

      setShouts(res.data.vbshout.shouts[0].shout);

      const stick = res.data.vbshout.sticky[0];
      const stickyPost = Array.isArray(stick) ? stick[0] : stick;
      setSticky(stickyPost);
      setLastUpdate(Date.now());
    } catch (e) {
      console.log(e);
    }
  }, [bb_userid, bb_password, loggedIn]);

  const grabAutologin = useCallback(async () => {
    const id = await getFromDevice(SIDELINIEN_ID);
    const pwd = await getFromDevice(SIDELINIEN_PWD);

    // try to login
    if (id && pwd) {
      set_bb_userid(id);
      set_bb_password(pwd);
      setIsLoggingIn(true);
      try {
        setLoggedIn(true);
      } catch (e) {
        setLoggedIn(false);
        deleteFromDevice(SIDELINIEN_ID);
        deleteFromDevice(SIDELINIEN_PWD);
      }
      setIsLoggingIn(false);
    }
  }, []);

  useEffect(() => {
    grabAutologin();
  }, [grabAutologin]);

  const shoutTimerRef = useRef();

  useEffect(() => {
    const id = setInterval(() => {
      grabShouts();
    }, 6000);
    // @ts-ignore
    shoutTimerRef.current = id;
    return () => {
      clearInterval(shoutTimerRef.current);
    };
  }, [loggedIn, grabShouts]);

  const createMarkup = (str: any) => {
    return { __html: str };
  };

  const toRGB = (str: string) => {
    var hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    var rgb = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 255;
      rgb[i] = value;
    }
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  };
  return (
    <Fragment>
      {loggedIn ? (
        <Fragment>
          <div className="header">
            <h1>Sidelinien</h1>
            <div className="updateTime">
              {new Date(lastUpdate).toLocaleTimeString()}
            </div>
            <button onClick={(e) => doLogout()}>&times;</button>
          </div>

          <div className="shoutContainer">
            {shouts.length === 0 && <LoadSpinner />}

            {sticky && <div className="stickyPost">{sticky}</div>}

            {shouts &&
              Array.isArray(shouts) &&
              shouts
                .map((curr, index, array) => {
                  const next = array[index + 1] || null;
                  const time =
                    next && curr.time[0] === next.time[0] ? null : curr.time[0];
                  return {
                    userid: curr.userid[0],
                    id: curr.shoutid[0],
                    time: time && time.replace(/\[|\]/gi, ""),
                    name: curr.jsusername[0],
                    message: curr.message[0],
                    color: toRGB(curr.jsusername[0]).toString(),
                    type: curr.template[0],
                  };
                })
                .map((shout) => (
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
                    {shout.time && <div className="time">{shout.time}</div>}
                    <div
                      className={`message${
                        shout.userid === bb_userid ? " self" : ""
                      }`}
                      style={{ borderColor: shout.color }}
                    >
                      <div className="author">{shout.name}</div>
                      <div
                        className="messageContent"
                        dangerouslySetInnerHTML={createMarkup(
                          shout.type === "me"
                            ? shout.name + " " + shout.message
                            : shout.message
                        )}
                      />
                    </div>
                  </div>
                ))}
          </div>

          {showError !== "" && (
            <ErrorBox errorText={showError} cb={setShowError} />
          )}

          <div className="footer">
            <input
              type="text"
              className="inputField"
              disabled={isSending}
              placeholder="Din besked"
              autoComplete="off"
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <button
              className="primary"
              disabled={isSending}
              onClick={(e) => doSend()}
            >
              {isSending ? "Sender..." : "Send"}
            </button>
          </div>
        </Fragment>
      ) : (
        <div className="loginContainer">
          <h1>Sidelinien Mobil</h1>
          <p>Vær med i "skakten" på din mobil - uden alt besværet</p>
          <form
            onSubmit={(e) => {
              doLogin();
              e.preventDefault();
              return false;
            }}
          >
            <input
              className="inputField"
              type="text"
              placeholder="Brugernavn"
              autoComplete="off"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              disabled={isLoggingIn}
            />
            <input
              className="inputField"
              type="password"
              autoComplete="off"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={isLoggingIn}
            />
            <br />

            <button className="primary" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logger ind..." : "Log ind"}
            </button>

            {isLoggingIn && <LoadSpinner />}

            {showError !== "" && (
              <ErrorBox errorText={showError} cb={setShowError} />
            )}
          </form>
        </div>
      )}
    </Fragment>
  );
}
