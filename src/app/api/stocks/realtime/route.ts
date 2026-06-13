import { NextResponse } from 'next/server';
import { getQuotes } from '@/services/yahooFinance';
import { StockData } from '@/types';
import { DEFAULT_SYMBOLS } from '@/lib/watchlist';
import { sanitizeSymbols } from '@/lib/symbols';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// SERVERLESS CAVEAT: per-instance memory; still blunts single-instance hammering.

const CACHE_TTL_MS = 60_000;

// Per-symbol cache entry
interface CacheEntry {
  data: StockData;
  ts: number;
}

// Module-level per-symbol cache — shared across concurrent requests
const symbolCache = new Map<string, CacheEntry>();
// Per-symbol in-flight dedup so overlapping requests share one fetch
const inFlightMap = new Map<string, Promise<void>>();

async function fetchAndCacheSymbols(stale: string[]): Promise<void> {
  const quotes = await getQuotes(stale);
  const now = Date.now();
  quotes.forEach((quote) => {
    if (quote && typeof quote.regularMarketPrice === 'number') {
      symbolCache.set(quote.symbol, {
        data: {
          regularMarketPrice: quote.regularMarketPrice,
          regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
        },
        ts: now,
      });
    }
  });
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'realtime');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSecs) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');

  let requested: string[];
  if (symbolsParam && symbolsParam.trim()) {
    requested = sanitizeSymbols(symbolsParam.split(','));
    if (requested.length === 0) requested = DEFAULT_SYMBOLS;
  } else {
    requested = DEFAULT_SYMBOLS;
  }

  const now = Date.now();
  const stale = requested.filter(s => {
    const entry = symbolCache.get(s);
    return !entry || now - entry.ts >= CACHE_TTL_MS;
  });

  if (stale.length > 0) {
    // Build a dedup key for this exact stale set
    const dedupKey = [...stale].sort().join(',');
    let fetcher = inFlightMap.get(dedupKey);
    if (!fetcher) {
      fetcher = fetchAndCacheSymbols(stale).finally(() => {
        inFlightMap.delete(dedupKey);
      });
      inFlightMap.set(dedupKey, fetcher);
    }
    try {
      await fetcher;
    } catch (error) {
      console.error('Real-time API fetch error:', error);
      // Fall through and serve whatever is cached; 502 only if nothing cached at all
    }
  }

  // Assemble response from cache
  const stocks: Record<string, StockData> = {};
  for (const sym of requested) {
    const entry = symbolCache.get(sym);
    if (entry) stocks[sym] = entry.data;
  }

  if (Object.keys(stocks).length === 0) {
    return NextResponse.json(
      { error: 'Failed to fetch real-time data from Yahoo Finance' },
      { status: 502 }
    );
  }

  const oldestTs = requested.reduce((min, sym) => {
    const entry = symbolCache.get(sym);
    return entry ? Math.min(min, entry.ts) : min;
  }, Infinity);

  const hasStale = stale.length > 0 && requested.some(s => {
    const entry = symbolCache.get(s);
    return entry && now - entry.ts >= CACHE_TTL_MS;
  });

  return NextResponse.json({
    stocks,
    timestamp: oldestTs === Infinity ? now : oldestTs,
    source: stale.length === 0 ? 'cache' : hasStale ? 'stale-cache' : 'api-polling',
  });
}
