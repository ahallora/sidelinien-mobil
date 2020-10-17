import { success, failure } from "../utils/responses";
import getCredentials from "../utils/getCredentials";

export async function main(event: any, context: any) {
  try {
    const body = JSON.parse(event.body);

    if (!body?.username || !body?.password)
      throw Error("Missing username or password");

    const { username, password } = body;
    const result = await getCredentials(username, password);
    return success(result);
  } catch (err) {
    console.log(err);
    return failure(err.message || err);
  }
}
