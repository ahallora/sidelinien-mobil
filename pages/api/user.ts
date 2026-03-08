import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "../../lib/session";
import { success, methodNotAllowed } from "../../utils/responses";

export default async function userRoute(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    methodNotAllowed(res);
    return;
  }

  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (session.bb_userid && session.bb_password) {
    success(res, {
      isLoggedIn: true,
      bb_userid: session.bb_userid,
      // We don't return the password or session hash to the client
      hasSecurityToken: !!session.securitytoken,
    });
  } else {
    success(res, { isLoggedIn: false });
  }
}
