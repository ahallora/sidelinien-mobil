import httpClient from "./httpClient";
import md5 from "./md5";

const getCookieValue = (
  cookies: string[],
  cookieName: string,
): string | null => {
  for (const cookie of cookies) {
    const [nameVal] = cookie.split(";");
    const [name, ...valueParts] = nameVal.split("=");
    if (name.trim() === cookieName) {
      return valueParts.join("=").trim();
    }
  }
  return null;
};

/**
 * Authenticate against sidelinien.dk and return the session cookies.
 * Does NOT retrieve a SECURITYTOKEN (use getSecurityToken for that).
 */
export default async function getCredentials(
  username: string,
  password: string,
): Promise<{
  securitytoken: string;
  bb_sessionhash: string | null;
  bb_userid: string | null;
  bb_password: string | null;
}> {
  if (!username || !password) {
    throw new Error("Username and password are required");
  }

  const loginData = new URLSearchParams({
    vb_login_username: username,
    vb_login_password: "",
    vb_login_password_hint: "Password",
    do: "login",
    s: "",
    cookieuser: "1",
    securitytoken: "guest",
    vb_login_md5password: md5(password),
    vb_login_md5password_utf: md5(password),
  });

  const res = await httpClient.post(
    "/login.php?do=login",
    loginData.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "http://sidelinien.dk/forums/login.php",
        Origin: "http://sidelinien.dk",
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400,
    },
  );

  const setCookies: string[] = res.headers["set-cookie"] ?? [];

  const bb_userid = getCookieValue(setCookies, "bb_userid");
  const bb_password = getCookieValue(setCookies, "bb_password");
  const bb_sessionhash = getCookieValue(setCookies, "bb_sessionhash");

  if (!bb_userid || bb_userid === "0" || !bb_password) {
    throw new Error("Login mislykkedes — tjek brugernavn og password");
  }

  return {
    securitytoken: "",
    bb_sessionhash,
    bb_userid,
    bb_password,
  };
}
