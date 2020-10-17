export function success(body: any, code = 200) {
  return buildResponse(code, body);
}

export function failure(body: any, code = 500) {
  return buildResponse(code, body);
}

export function buildResponse(statusCode: number, body: any) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}
