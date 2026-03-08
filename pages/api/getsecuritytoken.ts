import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";

import { success, failure, methodNotAllowed } from "../../utils/responses";
import getSecurityToken from "../../utils/getSecurityToken";
import rateLimit from "../../lib/rateLimit";
import { sessionOptions, SessionData } from "../../lib/session";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async function getSecurityTokenEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const ip = (req.headers["x-forwarded-for"] as string) || "anonymous";
    await limiter.check(res, 10, ip); // Max 10 attempts per minute per IP
  } catch {
    res.status(429).json({ error: "For mange forsøg. Prøv igen om lidt." });
    return;
  }

  try {
    const body = req.body;

    if (!body?.username || !body?.password) {
      failure(res, "Missing username or password", 400);
      return;
    }

    const { username, password } = body;

    if (username.length > 100 || password.length > 200) {
      failure(res, "Invalid input length", 400);
      return;
    }

    const result = await getSecurityToken(username, password);

    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.securitytoken = result.securitytoken;
    session.bb_sessionhash = result.bb_sessionhash;
    session.bb_userid = result.bb_userid;
    session.bb_password = result.bb_password;
    await session.save();

    success(res, {
      success: true,
      bb_userid: result.bb_userid,
      hasSecurityToken: !!result.securitytoken,
    });
  } catch (err: any) {
    console.error("getsecuritytoken error:", err?.message || err);
    failure(res, "Failed to get security token");
  }
}
