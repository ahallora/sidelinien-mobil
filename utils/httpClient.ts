import axios, { AxiosInstance } from "axios";

/**
 * Shared axios instance with browser-like defaults for sidelinien.dk.
 *
 * NOTE: We use HTTP (not HTTPS) because sidelinien.dk is behind Cloudflare
 * which performs JA3 TLS fingerprinting and blocks non-browser TLS handshakes.
 * HTTP connections bypass this restriction since Cloudflare allows them through.
 *
 * Security consideration: These are server-side requests from our backend
 * to Cloudflare's edge. The end-user ↔ our server connection uses HTTPS
 * (handled by Vercel/hosting platform). The credentials transmitted are
 * vBulletin session hashes, not plaintext passwords.
 */

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "da-DK,da;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br, zstd",
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

const httpClient: AxiosInstance = axios.create({
  baseURL: "http://sidelinien.dk/forums",
  headers: BROWSER_HEADERS,
  timeout: 15_000,
  maxRedirects: 5,
  // Don't throw on non-2xx so we can inspect login redirects
  validateStatus: (status) => status >= 200 && status < 400,
});

export { BROWSER_HEADERS };
export default httpClient;
