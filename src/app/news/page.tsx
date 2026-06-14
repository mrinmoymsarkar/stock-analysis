'use client';

import { useEffect, useState } from 'react';
import NewsList from '@/components/detail/NewsList';

interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date | number | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  thumbnail?: any;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((res) => res.json())
      .then((data) => setNews(Array.isArray(data.news) ? data.news : []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Market News</h1>
      <NewsList news={news} loading={loading} />
      {!loading && news.length === 0 && (
        <p className="text-muted-foreground text-center py-16">No news available at this time.</p>
      )}
    </div>
  );
}
