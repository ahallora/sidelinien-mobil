import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";

import { success, failure, methodNotAllowed } from "../../utils/responses";
import getShouts from "../../utils/getShouts";
import xmlConvert from "../../utils/xmlConvert";
import { sessionOptions, SessionData } from "../../lib/session";

export default async function getShoutsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    methodNotAllowed(res);
    return;
  }

  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.bb_userid || !session.bb_password) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const output = await getShouts(session.bb_userid, session.bb_password);

    const jsonxml = await xmlConvert(output);
    if (!jsonxml) {
      failure(res, "Malformed data received");
      return;
    }

    success(res, jsonxml);
  } catch (err: any) {
    console.error("getshouts error:", err?.message || err);
    failure(res, "Failed to fetch shouts");
  }
}
