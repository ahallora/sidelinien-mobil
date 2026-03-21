/**
 * Cloudflare Worker proxy for sidelinien.dk
 *
 * Forwards requests from our Vercel backend to sidelinien.dk,
 * bypassing Cloudflare's bot detection (since Workers run on
 * Cloudflare's own network, they are never blocked).
 *
 * A shared secret prevents unauthorized use of this proxy.
 */

interface Env {
  TARGET_ORIGIN: string;
  PROXY_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Verify the shared secret
    const secret = request.headers.get("x-proxy-secret");
    if (!secret || secret !== env.PROXY_SECRET) {
      return new Response("Unauthorized", { status: 403 });
    }

    const url = new URL(request.url);

    // Build the target URL: keep the path and query string,
    // but point to sidelinien.dk
    const targetUrl = `${env.TARGET_ORIGIN}${url.pathname}${url.search}`;

    // Clone the incoming headers, removing our custom ones
    const headers = new Headers(request.headers);
    headers.delete("x-proxy-secret");

    // Remove the Host header — it points to workers.dev, but we need
    // fetch() to set it to sidelinien.dk automatically
    headers.delete("host");

    // Remove headers that Cloudflare Workers add / that would confuse the target
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("cf-ray");
    headers.delete("cf-visitor");
    headers.delete("cf-worker");

    // Forward the request to sidelinien.dk
    const targetRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
      redirect: "manual", // Don't follow redirects — let our app handle them
    });

    const response = await fetch(targetRequest);

    // Return the response, preserving headers (especially set-cookie for login)
    const responseHeaders = new Headers(response.headers);

    // Add CORS headers so our Vercel backend can read the response
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Headers", "*");
    responseHeaders.set("Access-Control-Expose-Headers", "*");

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
