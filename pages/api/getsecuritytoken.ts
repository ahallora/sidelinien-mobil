import type { NextApiRequest, NextApiResponse } from "next";

import { success, failure } from "../../utils/responses";
import getSecurityToken from "../../utils/getSecurityToken";

export default async function getSecurityTokenEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    //const body = JSON.parse(req.body);
    const body = req.body;

    if (!body?.username || !body?.password)
      throw Error("Missing username or password");

    const { username, password } = body;
    const result = await getSecurityToken(username, password);
    console.log("getSecurityToken", result);
    return success(res, result);
  } catch (err) {
    console.log(err);
    return failure(res, err.message || err);
  }
}
