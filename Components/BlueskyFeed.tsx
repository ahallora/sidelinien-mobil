import { useEffect, useState, useMemo } from "react";
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

interface BskyImage {
  thumb: string;
  fullsize: string;
  alt: string;
}

interface BskyEmbed {
  $type: string;
  images?: BskyImage[];
  media?: {
    $type: string;
    images?: BskyImage[];
  };
  external?: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
}

interface BskyFacetFeature {
  $type: string;
  uri?: string;
}

interface BskyFacet {
  index: { byteStart: number; byteEnd: number };
  features: BskyFacetFeature[];
}

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
    facets?: BskyFacet[];
  };
  embed?: BskyEmbed;
}

interface BlueskyFeedProps {
  title: string;
  subtitle: string;
  endpoint: string;
  hideHeader?: boolean;
}

function renderRichText(text: string, facets?: BskyFacet[]) {
  if (!facets || facets.length === 0) {
    // Fallback: linkify URLs with regex
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    if (parts.length === 1) return text;
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  // Use facets for precise link rendering
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  const sortedFacets = [...facets].sort(
    (a, b) => a.index.byteStart - b.index.byteStart,
  );

  const segments: React.ReactNode[] = [];
  let lastEnd = 0;

  for (const facet of sortedFacets) {
    const { byteStart, byteEnd } = facet.index;
    const linkFeature = facet.features.find(
      (f) => f.$type === "app.bsky.richtext.facet#link",
    );

    if (byteStart > lastEnd) {
      segments.push(decoder.decode(bytes.slice(lastEnd, byteStart)));
    }

    const segmentText = decoder.decode(bytes.slice(byteStart, byteEnd));

    if (linkFeature?.uri) {
      segments.push(
        <a
          key={byteStart}
          href={linkFeature.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {segmentText}
        </a>,
      );
    } else {
      segments.push(segmentText);
    }

    lastEnd = byteEnd;
  }

  if (lastEnd < bytes.length) {
    segments.push(decoder.decode(bytes.slice(lastEnd)));
  }

  return segments;
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
                {renderRichText(post.record.text, post.record.facets)}
                {post.embed?.images && post.embed.images.length > 0 && (
                  <div
                    className={`mt-2 grid gap-1 ${post.embed.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                  >
                    {post.embed.images.map((img, i) => (
                      <img
                        key={i}
                        src={img.fullsize}
                        alt={img.alt || ""}
                        className="rounded-md w-full object-cover max-h-72"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                {post.embed?.media?.images &&
                  post.embed.media.images.length > 0 && (
                    <div
                      className={`mt-2 grid gap-1 ${post.embed.media.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                    >
                      {post.embed.media.images.map((img, i) => (
                        <img
                          key={i}
                          src={img.fullsize}
                          alt={img.alt || ""}
                          className="rounded-md w-full object-cover max-h-72"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                {post.embed?.external && (
                  <a
                    href={post.embed.external.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block border rounded-md overflow-hidden hover:bg-muted/50 transition-colors"
                  >
                    {post.embed.external.thumb && (
                      <img
                        src={post.embed.external.thumb}
                        alt=""
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    )}
                    <div className="p-2">
                      <p className="font-medium text-xs truncate">
                        {post.embed.external.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {post.embed.external.description}
                      </p>
                    </div>
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
