import { NextApiResponse } from "next";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "";

function setHeaders(res: NextApiResponse): void {
  if (ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
}

export function success(res: NextApiResponse, body: any, code = 200): void {
  setHeaders(res);
  res.status(code).json(body);
}

export function failure(res: NextApiResponse, body: any, code = 500): void {
  setHeaders(res);
  res.status(code).json({
    error: typeof body === "string" ? body : "Internal server error",
  });
}

export function methodNotAllowed(res: NextApiResponse): void {
  setHeaders(res);
  res.status(405).json({ error: "Method not allowed" });
}
