import axios, { AxiosInstance } from "axios";

/**
 * Shared axios instance with browser-like defaults for sidelinien.dk.
 *
 * When PROXY_URL and PROXY_SECRET are set (Vercel production), requests
 * are routed through a Cloudflare Worker proxy to bypass Cloudflare's
 * bot detection on datacenter IPs.
 *
 * Locally, requests go directly to sidelinien.dk over HTTP (which
 * bypasses Cloudflare's JA3 TLS fingerprinting).
 */

const PROXY_URL = process.env.PROXY_URL; // e.g. https://sidelinien-proxy.<you>.workers.dev
const PROXY_SECRET = process.env.PROXY_SECRET;
const useProxy = !!(PROXY_URL && PROXY_SECRET);

// When using the proxy, the baseURL points to the Worker.
// The Worker then forwards requests to sidelinien.dk/forums/...
const baseURL = useProxy
  ? `${PROXY_URL}/forums`
  : "http://sidelinien.dk/forums";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "da-DK,da;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Cache-Control": "max-age=0",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Sec-Ch-Ua":
    '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
};

// Add proxy auth header when using the Cloudflare Worker
if (useProxy) {
  BROWSER_HEADERS["x-proxy-secret"] = PROXY_SECRET!;
}

const httpClient: AxiosInstance = axios.create({
  baseURL,
  headers: BROWSER_HEADERS,
  timeout: 15_000,
  maxRedirects: 5,
  // Don't throw on non-2xx so we can inspect login redirects
  validateStatus: (status) => status >= 200 && status < 400,
});

export { BROWSER_HEADERS };
export default httpClient;
