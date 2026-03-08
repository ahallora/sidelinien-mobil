import httpClient from "./httpClient";

/**
 * Send a shout message to the vBShout shoutbox.
 */
export default async function sendShout(
  message: string,
  bb_userid: string,
  bb_password: string,
  securitytoken: string,
): Promise<string> {
  if (!message || !bb_userid || !bb_password || !securitytoken) {
    throw new Error("Missing required data to process sendShout");
  }

  // Enforce a reasonable message length
  if (message.length > 2000) {
    throw new Error("Beskeden er for lang (maks 2000 tegn)");
  }

  const postData = new URLSearchParams({
    message,
    securitytoken,
    do: "ajax",
    action: "save",
    instanceid: "1",
    tabid: "shouts",
    shoutorder: "DESC",
    pmtime: "0",
  });

  const res = await httpClient.post("/vbshout.php", postData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: `bb_userid=${bb_userid}; bb_password=${bb_password};`,
      Referer: "http://sidelinien.dk/forums/",
      Origin: "http://sidelinien.dk",
    },
  });

  return res.data;
}
