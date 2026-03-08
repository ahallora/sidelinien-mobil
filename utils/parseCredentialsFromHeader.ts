import { IncomingHttpHeaders } from "http";

export interface ParsedCredentials {
  bb_userid: string;
  bb_password: string;
}

/**
 * Parse vBulletin session credentials from the Basic Authorization header.
 * Expected format: Basic base64(bb_userid:bb_password)
 */
export const parseCredentialsFromHeader = (
  headers: IncomingHttpHeaders,
): ParsedCredentials => {
  const authHeader: string | string[] | undefined =
    headers.authorization || (headers["Authorization"] as string | undefined);

  if (!authHeader) {
    throw new Error("No authorization header on request");
  }

  const authString = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!authString.startsWith("Basic ")) {
    throw new Error("Invalid authorization scheme — expected Basic");
  }

  const encoded = authString.slice(6); // Remove "Basic " prefix

  let decoded: string;
  try {
    decoded = Buffer.from(encoded, "base64").toString("utf-8");
  } catch {
    throw new Error("Invalid base64 in authorization header");
  }

  const colonIndex = decoded.indexOf(":");
  if (colonIndex === -1) {
    throw new Error("Invalid credentials format — expected userid:password");
  }

  const bb_userid = decoded.slice(0, colonIndex);
  const bb_password = decoded.slice(colonIndex + 1);

  if (!bb_userid || !bb_password) {
    throw new Error("Empty credentials in authorization header");
  }

  return { bb_userid, bb_password };
};
