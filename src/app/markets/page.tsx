'use client';

import { useEffect, useState, useRef } from 'react';
import MoverList from '@/components/markets/MoverList';
import { MarketsData } from '@/services/markets';

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function SkeletonCard({ rows = 8 }: { rows?: number }) {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <div className="h-4 w-28 bg-muted rounded animate-pulse" />
      </div>
      <ul role="list" className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-2 px-4 py-2.5">
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse opacity-60" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-12 bg-muted rounded animate-pulse opacity-60" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MarketsPage() {
  const [data, setData] = useState<MarketsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Increment to trigger a retry — change causes the effect to re-run
  const [retryCount, setRetryCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request from a previous run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch('/api/markets', { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<MarketsData>;
      })
      .then((json) => {
        setData(json);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((n) => n + 1);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Indian Markets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            NSE equities — Nifty 100 universe
          </p>
        </div>
        {data && (
          <p className="text-xs text-muted-foreground shrink-0">
            Updated:{' '}
            {new Date(data.updatedAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="mb-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load market data: {error}
          </p>
          <button
            onClick={handleRetry}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data && !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <MoverList title="Top Gainers" items={data.gainers} />
          <MoverList title="Top Losers" items={data.losers} />
          <MoverList title="Most Active" items={data.mostActive} showVolume />
          <MoverList title="Trending in India" items={data.trending} />
          <MoverList title="Near 52-Week High" items={data.nearHigh} />
          <MoverList title="Near 52-Week Low" items={data.nearLow} />
        </div>
      ) : null}
    </main>
  );
}
