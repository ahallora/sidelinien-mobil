import httpClient from "./httpClient";

/**
 * Fetch shouts from the vBShout shoutbox.
 * Uses the authenticated user's cookies to access the endpoint.
 */
export default async function getShouts(
  bb_userid: string,
  bb_password: string,
): Promise<string> {
  if (!bb_userid || !bb_password) {
    throw new Error("Credentials are required to fetch shouts");
  }

  const ts = Date.now();

  const res = await httpClient.get("/vbshout.php", {
    params: {
      type: "shouts",
      do: "ajax",
      action: "fetch",
      instanceid: "1",
      tabid: "shouts",
      shoutorder: "DESC",
      pmtime: "0",
      v: ts.toString(),
    },
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "*/*",
      Cookie: `bb_userid=${bb_userid}; bb_password=${bb_password}`,
      Referer: "http://sidelinien.dk/forums/",
    },
    responseType: "arraybuffer",
  });

  if (!res.data) {
    throw new Error("Data kunne ikke hentes");
  }

  // vBulletin uses latin1/ISO-8859-1 encoding for shout responses
  const html = Buffer.from(res.data).toString("latin1");
  return html;
}
