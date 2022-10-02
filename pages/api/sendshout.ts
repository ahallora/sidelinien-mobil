import type { NextApiRequest, NextApiResponse } from "next";
import { success, failure } from "../../utils/responses";
import sendShout from "../../utils/sendShout";

export default async function sendShoutsEndpoint(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const body = req.body;

    if (
      !body?.bb_userid ||
      !body?.bb_password ||
      !body?.message ||
      !body?.securitytoken
    )
      throw Error("Missing required information to shout");

    const { message, bb_userid, bb_password, securitytoken } = body;
    const result = await sendShout(
      message,
      bb_userid,
      bb_password,
      securitytoken
    );
    return success(res, result);
  } catch (err) {
    console.log(err);
    return failure(res, err.message || err);
  }
}
