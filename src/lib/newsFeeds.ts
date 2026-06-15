export const RSS_FEEDS: Array<{ source: string; url: string }> = [
  { source: 'Economic Times', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { source: 'Moneycontrol', url: 'https://www.moneycontrol.com/rss/MCtopnews.xml' },
  { source: 'Business Standard', url: 'https://www.business-standard.com/rss/markets-106.rss' },
  { source: 'Livemint', url: 'https://www.livemint.com/rss/markets' },
  { source: 'BusinessLine', url: 'https://www.thehindubusinessline.com/markets/feeder/default.rss' },
];

export interface NewsItem {
  uuid: string;
  title: string;
  publisher: string;
  link: string;
  providerPublishTime: Date | number | string;
  thumbnail?: { resolutions: Array<{ url: string }> };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRssItem(item: any, source: string): NewsItem | null {
  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const link = typeof item.link === 'string' ? item.link.trim() : '';
  if (!title || !link) return null;

  let thumbUrl: string | undefined;
  if (item.enclosure?.url && typeof item.enclosure.type === 'string' && item.enclosure.type.startsWith('image/')) {
    thumbUrl = item.enclosure.url;
  } else if (item['media:content']?.$?.url) {
    thumbUrl = item['media:content'].$.url;
  } else if (item['media:thumbnail']?.$?.url) {
    thumbUrl = item['media:thumbnail'].$.url;
  }

  return {
    uuid: item.guid ?? link,
    title,
    publisher: source,
    link,
    providerPublishTime: item.isoDate ?? item.pubDate ?? '',
    ...(thumbUrl ? { thumbnail: { resolutions: [{ url: thumbUrl }] } } : {}),
  };
}

function normalizeLink(url: string): string {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).toLowerCase().replace(/\/+$/, '');
  } catch {
    return url.toLowerCase().replace(/\/+$/, '');
  }
}

export function mergeAndDedupeNews(lists: NewsItem[][]): NewsItem[] {
  const seenLinks = new Set<string>();
  const seenTitles = new Set<string>();
  const out: NewsItem[] = [];

  for (const item of lists.flat()) {
    const normLink = normalizeLink(item.link);
    const normTitle = item.title.toLowerCase().trim();
    if (seenLinks.has(normLink) || seenTitles.has(normTitle)) continue;
    seenLinks.add(normLink);
    seenTitles.add(normTitle);
    out.push(item);
  }

  out.sort((a, b) => {
    const ta = a.providerPublishTime instanceof Date
      ? a.providerPublishTime.getTime()
      : typeof a.providerPublishTime === 'number'
        ? a.providerPublishTime * 1000
        : new Date(a.providerPublishTime as string).getTime();
    const tb = b.providerPublishTime instanceof Date
      ? b.providerPublishTime.getTime()
      : typeof b.providerPublishTime === 'number'
        ? b.providerPublishTime * 1000
        : new Date(b.providerPublishTime as string).getTime();
    return tb - ta;
  });

  return out.slice(0, 40);
}
