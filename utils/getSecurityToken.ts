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
 * Log in to sidelinien.dk via a direct HTTP POST and extract
 * the SECURITYTOKEN + session cookies.
 *
 * This replaces the old Puppeteer-based flow that was being
 * blocked by bot protection.
 */
export default async function getSecurityToken(
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

  // Step 1: POST login credentials (vBulletin form-encoded login)
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

  const loginRes = await httpClient.post(
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

  const setCookies: string[] = loginRes.headers["set-cookie"] ?? [];

  const bb_userid = getCookieValue(setCookies, "bb_userid");
  const bb_password = getCookieValue(setCookies, "bb_password");
  const bb_sessionhash = getCookieValue(setCookies, "bb_sessionhash");

  if (!bb_userid || bb_userid === "0" || !bb_password) {
    throw new Error("Login mislykkedes — tjek brugernavn og password");
  }

  // Step 2: Fetch a page while authenticated to extract SECURITYTOKEN
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

  const pageRes = await httpClient.get(
    "/search.php?do=getnew&contenttype=vBForum_Event",
    {
      headers: {
        Cookie: cookieHeader,
        Referer: "http://sidelinien.dk/forums/",
      },
    },
  );

  const html: string =
    typeof pageRes.data === "string"
      ? pageRes.data
      : pageRes.data.toString("utf-8");

  // Extract SECURITYTOKEN from the page JavaScript
  const tokenMatch = html.match(/var\s+SECURITYTOKEN\s*=\s*"([^"]+)"/);
  const securitytoken = tokenMatch?.[1] ?? "";

  if (!securitytoken || securitytoken === "guest") {
    throw new Error(
      "Kunne ikke hente security token — login lykkedes men token mangler",
    );
  }

  return {
    securitytoken,
    bb_sessionhash,
    bb_userid,
    bb_password,
  };
}
