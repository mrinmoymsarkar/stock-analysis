"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date | number | string;
}

function relativeTime(ts: Date | number | string): string {
  const ms = ts instanceof Date ? ts.getTime() : typeof ts === 'number' ? ts * 1000 : new Date(ts).getTime();
  if (isNaN(ms)) return '';
  const diffMs = Date.now() - ms;
  const diffSecs = Math.floor(diffMs / 1000);
  if (diffSecs < 60) return 'just now';
  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function SkeletonRow() {
  return (
    <div className="flex flex-col gap-1.5 animate-pulse">
      <div className="h-3.5 bg-muted rounded w-4/5" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  );
}

export default function NewsTeaser() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/news')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch news');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const items: NewsItem[] = Array.isArray(data?.news) ? data.news : [];
        setNews(items.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // On error or no data after loading: render nothing
  if (!loading && (error || news.length === 0)) return null;

  return (
    <div className="bg-card border border-border rounded-lg px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span>Latest Market News</span>
        </h2>
        <Link
          href="/news"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
          <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : (
        <ul className="flex flex-col gap-3" role="list">
          {news.map((item) => (
            <li key={item.uuid} className="flex flex-col gap-0.5">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-foreground hover:text-primary line-clamp-1 transition-colors"
              >
                {item.title}
              </a>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{item.publisher}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{relativeTime(item.providerPublishTime)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
