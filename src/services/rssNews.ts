import Parser from 'rss-parser';
import { RSS_FEEDS, normalizeRssItem, NewsItem } from '@/lib/newsFeeds';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function fetchRssNews(perFeedLimit = 10): Promise<NewsItem[]> {
  const parser = new Parser();

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ source, url }) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': UA },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        const feed = await parser.parseString(xml);
        return feed.items
          .slice(0, perFeedLimit)
          .map((item) => normalizeRssItem(item, source))
          .filter((item): item is NewsItem => item !== null);
      } finally {
        clearTimeout(timer);
      }
    })
  );

  const all: NewsItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      all.push(...result.value);
    } else {
      console.error('[rssNews] feed fetch failed:', result.reason);
    }
  }
  return all;
}
