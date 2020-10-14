import axios from "axios";

export default async function getShouts(username, password) {
  const ts = Date.now();
  const url = `http://sidelinien.dk/forums/vbshout.php?&type=shouts&do=ajax&action=fetch&instanceid=1&tabid=shouts&shoutorder=DESC&pmtime=0&v=${ts}`;
  const headers = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "da,en-US;q=0.9,en;q=0.8",
    cookie: `bb_userid=${username}; bb_password=${password}`
  };

  const res = await axios({
    method: "get",
    url,
    headers,
    responseType: "arraybuffer",
    responseEncoding: "binary"
  });

  if (!res.data) throw Error(res);
  let html = res.data.toString("latin1");
  return html;
}
