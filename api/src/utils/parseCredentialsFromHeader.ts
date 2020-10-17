export const parseCredentialsFromHeader = (headers: {
  [x: string]: string;
}): { bb_userid: string; bb_password: string } | undefined => {
  const authHeader = headers.authorization || headers.Authorization || null;

  if (!authHeader || !authHeader.includes(" "))
    throw Error("No authorization header on request");

  const [bb_userid, bb_password] = new Buffer(
    authHeader.split("Basic ")[1],
    "base64"
  )
    .toString("ascii")
    .split(":");

  return { bb_userid, bb_password };
};
