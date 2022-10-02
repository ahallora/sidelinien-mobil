import axios, { AxiosRequestConfig } from "axios";

export default async function getShouts(
  bb_userid: string,
  bb_password: string
): Promise<string> {
  const ts = Date.now();
  const url = `https://sidelinien.dk/forums/vbshout.php?type=shouts&do=ajax&action=fetch&instanceid=1&tabid=shouts&shoutorder=DESC&pmtime=0&v=${ts}`;
  const headers = {
    accept: "*/*",
    "accept-language": "da,en-US;q=0.9,en;q=0.8",
    "x-requested-with": "XMLHttpRequest",
    cookie: `bb_userid=${bb_userid}; bb_password=${bb_password}`,
  };

  const res = await axios(<AxiosRequestConfig>{
    method: "GET",
    url,
    headers,
    responseType: "arraybuffer",
    //@ts-ignore
    responseEncoding: "binary",
  });
  if (!res.data) throw Error("Data kunne ikke hentes");
  let html = res.data.toString("latin1");
  return html;
}
