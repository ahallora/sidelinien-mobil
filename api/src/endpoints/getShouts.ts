import { success, failure } from "../utils/responses";
import { parseCredentialsFromHeader } from "../utils/parseCredentialsFromHeader";
import getShouts from "../utils/getShouts";
import xmlConvert from "../utils/xmlConvert";

export async function main(event: any, context: any) {
  try {
    const { bb_userid, bb_password } = parseCredentialsFromHeader(
      event.headers
    );
    if (!bb_userid || !bb_password) throw Error("Invalid credentials");

    const output = await getShouts(bb_userid, bb_password);
    // const etag = md5(output);

    // if (etag === req.headers["if-none-match"]) {
    //   return clres.status(304).end();
    // } else {
    //   res.set({
    //     "cache-control": "max-age=5",
    //     ETag: etag
    //   });
    // }

    const jsonxml = await xmlConvert(output);
    if (!jsonxml) throw Error("Malformed data received");

    return success(jsonxml);
  } catch (err) {
    console.log(err);
    return failure(err.message || err);
  }
}
