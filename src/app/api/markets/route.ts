import { NextResponse } from 'next/server';
import { getMarketsData, MarketsData } from '@/services/markets';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// SERVERLESS CAVEAT: per-instance memory; still blunts single-instance hammering.

// 5-minute TTL — generous enough to stay within Yahoo rate limits on Vercel
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  data: MarketsData;
  ts: number;
}

// Module-level cache + in-flight dedup (same pattern as src/app/api/news/route.ts)
let cache: CacheEntry | null = null;
let inFlight: Promise<CacheEntry> | null = null;

async function fetchAndCache(): Promise<CacheEntry> {
  const data = await getMarketsData();
  const entry: CacheEntry = { data, ts: Date.now() };
  cache = entry;
  return entry;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'markets');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSecs) } }
    );
  }

  const now = Date.now();

  if (cache && now - cache.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...cache.data, source: 'cache' });
  }

  if (!inFlight) {
    inFlight = fetchAndCache().finally(() => {
      inFlight = null;
    });
  }

  try {
    const entry = await inFlight;
    return NextResponse.json({ ...entry.data, source: 'api' });
  } catch (error) {
    console.error('Markets API error:', error);
    if (cache) {
      // Serve stale data on upstream failure
      return NextResponse.json({ ...cache.data, source: 'stale-cache' });
    }
    return NextResponse.json(
      { error: 'Failed to fetch market data', gainers: [], losers: [], mostActive: [], trending: [], nearHigh: [], nearLow: [], updatedAt: new Date().toISOString() },
      { status: 502 }
    );
  }
}
