import querystring from "querystring";
import Axios, { AxiosRequestConfig } from "axios";
import { success, failure } from "./responses";

export default async function sendShout(
  message: string,
  bb_userid: string,
  bb_password: string,
  securitytoken: string
) {
  try {
    if (!message || !bb_userid || !bb_password || !securitytoken)
      throw Error("Missing required data to process sendShout");

    const config: AxiosRequestConfig = {
      method: "POST",
      url: "http://sidelinien.dk/forums/vbshout.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: `bb_userid=${bb_userid}; bb_password=${bb_password};`
      },
      data: querystring.stringify(
        {
          message: message,
          securitytoken: securitytoken,
          do: "ajax",
          action: "save",
          instanceid: "1",
          tabid: "shouts",
          shoutorder: "DESC",
          pmtime: "0"
        },
        null,
        null,
        {
          encodeURIComponent: escape // override the default encoding to support the old vbscript escaping type
        }
      )
    };

    const res = await Axios(config);
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
    return failure(err.message || err || "Generisk fejl");
  }
}
