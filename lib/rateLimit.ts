/**
 * Simple in-memory rate limiter using a Map.
 * Note: If the app is deployed to a serverless environment like Vercel,
 * the memory is isolated per function instance and will be lost on cold starts.
 * However, it provides basic protection against rapid, consecutive requests from the same user.
 */
const rateCache = new Map();

export default function rateLimit(options: {
  interval: number;
  uniqueTokenPerInterval: number;
}) {
  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = rateCache.get(token) || [0];
        if (tokenCount[0] === 0) {
          rateCache.set(token, tokenCount);
        }
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage >= limit;
        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader(
          "X-RateLimit-Remaining",
          isRateLimited ? 0 : limit - currentUsage,
        );

        setTimeout(() => {
          rateCache.delete(token);
        }, options.interval);

        if (isRateLimited) {
          return reject();
        }
        resolve();
      }),
  };
}

export const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});
