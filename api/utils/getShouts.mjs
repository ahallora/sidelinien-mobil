import axios from "axios";

export default async function getShouts(bb_userid, bb_password) {
  const ts = Date.now();
  const url = `http://sidelinien.dk/forums/vbshout.php?type=shouts&do=ajax&action=fetch&instanceid=1&tabid=shouts&shoutorder=DESC&pmtime=0&v=${ts}`;
  const headers = {
    accept: "*/*",
    "accept-language": "da,en-US;q=0.9,en;q=0.8",
    "x-requested-with": "XMLHttpRequest",
    cookie: `bb_userid=${bb_userid}; bb_password=${bb_password}`
  };

  const res = await axios({
    method: "get",
    url,
    headers,
    referrer: "http://sidelinien.dk/forums/forum.php",
    body: null,
    mode: "cors",
    responseType: "arraybuffer",
    responseEncoding: "binary"
  });

  if (!res.data) throw Error(res);
  let html = res.data.toString("latin1");
  return html;
}
