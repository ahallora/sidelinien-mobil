import type { NextApiRequest, NextApiResponse } from "next";
import { BskyAgent } from "@atproto/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { feed, actor, limit = 50 } = req.query;

  if (!feed && !actor) {
    return res.status(400).json({ error: "Missing feed or actor parameter" });
  }

  // Sanitize the limit parameter (min 1, max 100)
  const parsedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const MAX_RETRIES = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const agent = new BskyAgent({ service: "https://bsky.social" });

      if (process.env.BLUESKY_IDENTIFIER && process.env.BLUESKY_PASSWORD) {
        await agent.login({
          identifier: process.env.BLUESKY_IDENTIFIER,
          password: process.env.BLUESKY_PASSWORD,
        });
      }

      let posts = [];
      if (feed) {
        const response = await agent.app.bsky.feed.getFeed({
          feed: feed as string,
          limit: parsedLimit,
        });
        posts = response.data.feed.map((item) => item.post);
      } else if (actor) {
        const response = await agent.app.bsky.feed.getAuthorFeed({
          actor: actor as string,
          limit: parsedLimit,
        });
        posts = response.data.feed.map((item) => item.post);
      }

      return res.status(200).json({ posts });
    } catch (error: any) {
      lastError = error;
      console.error(
        `Bluesky API Attempt ${attempt} failed:`,
        error?.message || error,
      );

      // If it's a socket error, wait a bit before retrying
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 500; // Exponential-ish backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If we reach here, all retries failed
  console.error("Bluesky API: All retry attempts failed.", lastError);
  res.status(500).json({
    error: "Failed to fetch from Bluesky. Please try again later.",
  });
}
