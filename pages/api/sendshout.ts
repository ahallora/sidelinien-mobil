import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import rateLimit from "../../lib/rateLimit";
import { sessionOptions, SessionData } from "../../lib/session";
import { success, failure, methodNotAllowed } from "../../utils/responses";
import sendShout from "../../utils/sendShout";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default async function sendShoutsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  try {
    const ip = (req.headers["x-forwarded-for"] as string) || "anonymous";
    await limiter.check(res, 20, ip); // Max 20 shouts per minute per IP
  } catch {
    res.status(429).json({ error: "For mange forsøg. Prøv igen om lidt." });
    return;
  }

  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session.bb_userid || !session.bb_password || !session.securitytoken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = req.body;

    if (!body?.message) {
      failure(res, "Missing required information to shout", 400);
      return;
    }

    const { message } = body;

    if (typeof message !== "string" || message.length > 2000) {
      failure(res, "Invalid message", 400);
      return;
    }

    const result = await sendShout(
      message,
      session.bb_userid,
      session.bb_password,
      session.securitytoken,
    );
    success(res, result);
  } catch (err: any) {
    console.error("sendshout error:", err?.message || err);
    failure(res, "Failed to send shout");
  }
}
