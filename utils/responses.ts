import { NextApiResponse } from "next";

export function success(res: NextApiResponse, body: any, code = 200) {
  return buildResponse(res, code, body);
}

export function failure(res: NextApiResponse, body: any, code = 500) {
  return buildResponse(res, code, body);
}

export function buildResponse(
  res: NextApiResponse,
  statusCode: number,
  body: any
) {
  const output = res;
  output.setHeader("Access-Control-Allow-Origin", "*");
  output.setHeader("Access-Control-Allow-Credentials", "true");
  output.status(statusCode).json(body);
  return output;
}
