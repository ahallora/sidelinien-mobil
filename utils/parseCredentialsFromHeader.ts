import { IncomingHttpHeaders } from "http";

export const parseCredentialsFromHeader = (
  headers: IncomingHttpHeaders
): { bb_userid: string; bb_password: string } | undefined => {
  const authHeader: string | string[] | null =
    headers.authorization || headers.Authorization || null;

  if (!authHeader || !authHeader.includes(" "))
    throw Error("No authorization header on request");

  const authString = Array.isArray(authHeader)
    ? authHeader.join(",")
    : authHeader;

  const [bb_userid, bb_password] = Buffer.from(
    authString.split("Basic ")[1],
    "base64"
  )
    .toString("ascii")
    .split(":");

  return { bb_userid, bb_password };
};
