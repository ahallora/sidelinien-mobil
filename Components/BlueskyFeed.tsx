import { useEffect, useState } from "react";
import { formatRelativeDanish } from "../lib/dateUtils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface BskyPost {
  cid: string;
  uri: string;
  author: {
    handle: string;
    displayName: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
  };
}

interface BlueskyFeedProps {
  title: string;
  subtitle: string;
  endpoint: string;
  hideHeader?: boolean;
}

export default function BlueskyFeed({
  title,
  subtitle,
  endpoint,
  hideHeader = false,
}: BlueskyFeedProps) {
  const [posts, setPosts] = useState<BskyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        // Using internal proxy to avoid CORS issues
        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error("Failed to fetch Bluesky posts");
        }
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
        setRefreshCountdown(30);
      }
    }

    fetchPosts();
    // Poll every 30 seconds
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [endpoint]);

  return (
    <div className="flex flex-col h-full bg-card overflow-hidden">
      {!hideHeader && (
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {title}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {subtitle}
            </span>
          </h2>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
            <span className="w-4 text-right">{refreshCountdown}s</span>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 p-4">
        {loading && posts.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && posts.length === 0 && (
          <div className="text-destructive text-center p-4">{error}</div>
        )}

        {posts.length === 0 && !loading && !error && (
          <div className="text-center text-muted-foreground p-4">
            No recent posts found.
          </div>
        )}

        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <Card key={post.cid} className="overflow-hidden">
              <CardHeader className="p-4 pb-2 flex flex-row items-center gap-3 space-y-0">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs">
                    {post.author.handle.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <CardTitle className="text-sm truncate">
                    {post.author.displayName || post.author.handle}
                  </CardTitle>
                  <CardDescription className="text-xs truncate">
                    @{post.author.handle} ·{" "}
                    {formatRelativeDanish(post.record.createdAt)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-sm whitespace-pre-wrap">
                {post.record.text}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
