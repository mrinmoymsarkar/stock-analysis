import { NextResponse } from 'next/server';
import { getNews } from '@/services/yahooFinance';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { fetchRssNews } from '@/services/rssNews';
import { mergeAndDedupeNews, NewsItem } from '@/lib/newsFeeds';

// SERVERLESS CAVEAT: per-instance memory; still blunts single-instance hammering.

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const inFlightMap = new Map<string, Promise<CacheEntry>>();

// Yahoo's search endpoint returns nothing for long phrase queries, so the
// general feed aggregates several short queries that do carry news.
const GENERAL_FEED_KEY = '__general__';
const GENERAL_QUERIES = ['Nifty 50', 'Sensex', 'NSEI'];

async function fetchGeneralFeed() {
  const [yahooResults, rssItems] = await Promise.all([
    Promise.allSettled(GENERAL_QUERIES.map((q) => getNews(q, 10))),
    fetchRssNews().catch((err) => { console.error('[news] RSS fetch error:', err); return []; }),
  ]);

  const yahooItems: NewsItem[] = yahooResults
    .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof getNews>>> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .map((item) => ({
      uuid: item.uuid,
      title: item.title,
      publisher: item.publisher,
      link: item.link,
      providerPublishTime: item.providerPublishTime,
      thumbnail: item.thumbnail,
    }));

  return mergeAndDedupeNews([yahooItems, rssItems]);
}

async function fetchAndCache(query: string): Promise<CacheEntry> {
  const data =
    query === GENERAL_FEED_KEY ? await fetchGeneralFeed() : await getNews(query);
  const entry: CacheEntry = { data, ts: Date.now() };
  cache.set(query, entry);
  return entry;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'news');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSecs) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get('symbol');

  // Bound the symbol param to prevent excessively long inputs
  if (symbolParam && symbolParam.length > 20) {
    return NextResponse.json(
      { error: '"symbol" must be at most 20 characters' },
      { status: 400 }
    );
  }

  let query: string;
  if (symbolParam && symbolParam.trim()) {
    // Strip .NS/.BO suffix and ^ prefix to form a clean query string
    query = symbolParam.trim()
      .replace(/\.(NS|BO)$/i, '')
      .replace(/^\^/, '');
  } else {
    query = GENERAL_FEED_KEY;
  }

  const now = Date.now();
  const cached = cache.get(query);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ news: cached.data, source: 'cache' });
  }

  let inFlight = inFlightMap.get(query);
  if (!inFlight) {
    inFlight = fetchAndCache(query).finally(() => {
      inFlightMap.delete(query);
    });
    inFlightMap.set(query, inFlight);
  }

  try {
    const entry = await inFlight;
    return NextResponse.json({ news: entry.data, source: 'api' });
  } catch (error) {
    console.error('News API error:', error);
    if (cached) {
      return NextResponse.json({ news: cached.data, source: 'stale-cache' });
    }
    return NextResponse.json({ news: [] });
  }
}
