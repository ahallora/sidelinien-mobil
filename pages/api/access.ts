import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "../../lib/session";
import { success, failure, methodNotAllowed } from "../../utils/responses";

export default async function accessRoute(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    methodNotAllowed(res);
    return;
  }

  const { password } = req.body;
  const sharedPassword = process.env.SHARED_SITE_PASSWORD;

  if (!sharedPassword) {
    console.error("SHARED_SITE_PASSWORD is not set in environment variables");
    failure(res, "Server configuration error", 500);
    return;
  }

  if (password === sharedPassword) {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.siteAccess = true;
    await session.save();

    success(res, { success: true });
  } else {
    failure(res, "Incorrect password", 401);
  }
}
