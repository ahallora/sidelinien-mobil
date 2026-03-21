import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "../../lib/session";
import { success, methodNotAllowed } from "../../utils/responses";

export default async function logoutRoute(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.securitytoken = undefined;
  session.bb_sessionhash = undefined;
  session.bb_userid = undefined;
  session.bb_password = undefined;
  await session.save();

  success(res, { success: true });
}
