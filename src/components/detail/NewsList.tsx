'use client';

import Image from 'next/image';

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thumbnail?: any;
}

interface NewsListProps {
  news: NewsItem[];
  loading?: boolean;
}

function relativeTime(ts: number): string {
  const diffMs = Date.now() - ts * 1000;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

function getThumbnailUrl(thumbnail: unknown): string | null {
  if (!thumbnail || typeof thumbnail !== 'object') return null;
  const t = thumbnail as Record<string, unknown>;
  // Yahoo Finance thumbnail shape: { resolutions: [{url, width, height}] }
  const resolutions = t.resolutions;
  if (Array.isArray(resolutions) && resolutions.length > 0) {
    const first = resolutions[0] as Record<string, unknown>;
    if (typeof first?.url === 'string') return first.url;
  }
  return null;
}

export default function NewsList({ news, loading }: NewsListProps) {
  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">News</h2>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 flex gap-3 animate-pulse">
              <div className="shrink-0 w-16 h-16 bg-muted rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (news.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">News</h2>
      <div className="space-y-2">
        {news.map((item) => {
          const thumbUrl = getThumbnailUrl(item.thumbnail);
          return (
            <article
              key={item.uuid}
              className="bg-card border border-border rounded-lg p-4 flex gap-3 hover:bg-accent/30 transition-colors"
            >
              {thumbUrl && (
                <div className="shrink-0 relative w-16 h-16 rounded overflow-hidden">
                  <Image
                    src={thumbUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-primary line-clamp-2 block"
                >
                  {item.title}
                </a>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.publisher}</span>
                  <span>&middot;</span>
                  <span>{relativeTime(item.providerPublishTime)}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
