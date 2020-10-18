import { success, failure } from "../utils/responses";
import sendShout from "../utils/sendShout";

export async function main(event: any, context: any) {
  try {
    const body = JSON.parse(event.body);

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
    return success(result);
  } catch (err) {
    console.log(err);
    return failure(err.message || err);
  }
}
