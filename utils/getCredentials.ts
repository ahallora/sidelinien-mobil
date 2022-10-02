import querystring from "querystring";
import Axios, { AxiosRequestConfig } from "axios";
import md5 from "./md5";

const getCookieValue = (arr: any[], cookieName: string) =>
  arr.find((x) => x.name === cookieName)
    ? arr.find((x) => x.name === cookieName).value
    : null;

const convertCookieToObjects = (arr: any[]): any[] => {
  try {
    return arr
      .map((x) => x.split("="))
      .map((x) => {
        return {
          name: x[0],
          value: x[1].split(";")[0],
        };
      });
  } catch (e) {
    console.log(e);
    return [];
  }
};

export default async function getCredentials(username: any, password: any) {
  try {
    const config: AxiosRequestConfig = {
      method: "POST",
      url: "https://sidelinien.dk/forums/login.php?do=login",
      data: querystring.stringify({
        vb_login_username: username,
        vb_login_password: "",
        vb_login_password_hint: "Password",
        do: "login",
        s: "",
        cookieuser: "1",
        securitytoken: "guest",
        vb_login_md5password_utf: md5(username),
        vb_login_md5password: md5(password),
      }),
    };

    const res = await Axios(config);
    const cookies = convertCookieToObjects(res.headers["set-cookie"]);

    const data = {
      securitytoken: "",
      bb_sessionhash: getCookieValue(cookies, "bb_sessionhash"),
      bb_userid: getCookieValue(cookies, "bb_userid"),
      bb_password: getCookieValue(cookies, "bb_password"),
    };

    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
