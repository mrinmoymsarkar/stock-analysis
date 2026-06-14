'use client';

import { useEffect, useState } from 'react';
import useWatchlist from '@/hooks/useWatchlist';
import AddToWatchlistButton from '@/components/cards/AddToWatchlistButton';
import StockHeader from '@/components/detail/StockHeader';
import KeyStats from '@/components/detail/KeyStats';
import FundProfile from '@/components/detail/FundProfile';
import AnalystRecs from '@/components/detail/AnalystRecs';
import FinancialsCard from '@/components/detail/FinancialsCard';
import EarningsCard from '@/components/detail/EarningsCard';
import MarginsCard from '@/components/detail/MarginsCard';
import DetailChart from '@/components/detail/DetailChart';
import NewsList from '@/components/detail/NewsList';

interface StockDetailViewProps {
  symbol: string;
}

interface DetailData {
  quoteType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quote: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
}

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thumbnail?: any;
}

export default function StockDetailView({ symbol }: StockDetailViewProps) {
  const { symbols, add } = useWatchlist();
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/symbol/${encodeURIComponent(symbol)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setDetail(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));

    setNewsLoading(true);
    fetch(`/api/news?symbol=${encodeURIComponent(symbol)}`)
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data.news) ? data.news : []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-24 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-destructive text-lg font-medium">{error}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Could not load data for <span className="font-mono">{symbol}</span>.
        </p>
      </div>
    );
  }

  const quoteType = detail?.quoteType ?? 'EQUITY';
  const quote = detail?.quote ?? {};
  const summary = detail?.summary ?? {};
  const currentPrice: number | undefined =
    typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <StockHeader quote={quote} quoteType={quoteType} />
        <div className="shrink-0 pt-1">
          <AddToWatchlistButton
            symbol={symbol}
            inWatchlist={symbols.includes(symbol)}
            onAdd={add}
          />
        </div>
      </div>

      {quoteType === 'EQUITY' && (
        <KeyStats summary={summary} quote={quote} />
      )}

      {quoteType === 'MUTUALFUND' && (
        <FundProfile summary={summary} />
      )}

      {quoteType === 'EQUITY' && summary.recommendationTrend && (
        <AnalystRecs summary={summary} currentPrice={currentPrice} />
      )}

      {quoteType === 'EQUITY' && (
        <MarginsCard summary={summary} />
      )}

      {quoteType === 'EQUITY' && (
        <FinancialsCard summary={summary} />
      )}

      {quoteType === 'EQUITY' && (
        <EarningsCard summary={summary} />
      )}

      <DetailChart symbol={symbol} />

      <NewsList news={news} loading={newsLoading} />
    </div>
  );
}
