import type { NextApiRequest, NextApiResponse } from "next";

import { success, failure } from "../../utils/responses";
import { parseCredentialsFromHeader } from "../../utils/parseCredentialsFromHeader";
import getShouts from "../../utils/getShouts";
import xmlConvert from "../../utils/xmlConvert";

export default async function getShoutsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { bb_userid, bb_password } = parseCredentialsFromHeader(req.headers);
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

    return success(res, jsonxml);
  } catch (err) {
    console.log(err);
    return failure(res, err.message || err);
  }
}
