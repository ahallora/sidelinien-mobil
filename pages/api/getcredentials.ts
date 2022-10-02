import type { NextApiRequest, NextApiResponse } from "next";

import { success, failure } from "../../utils/responses";
import getCredentials from "../../utils/getCredentials";

export default async function getCredentialsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body;

    if (!body?.username || !body?.password)
      throw Error("Missing username or password");

    const { username, password } = body;
    const result = await getCredentials(username, password);
    return success(res, result);
  } catch (err) {
    console.log(err);
    return failure(res, err.message || err);
  }
}
