import { NextResponse } from 'next/server';
import { getDetail } from '@/services/yahooFinance';
import { isValidSymbol } from '@/lib/symbols';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// SERVERLESS CAVEAT: per-instance memory; still blunts single-instance hammering.

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  ts: number;
}

const cache = new Map<string, CacheEntry>();
const inFlightMap = new Map<string, Promise<CacheEntry>>();

async function fetchAndCache(symbol: string): Promise<CacheEntry> {
  const data = await getDetail(symbol);
  const entry: CacheEntry = { data, ts: Date.now() };
  cache.set(symbol, entry);
  return entry;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const ip = getClientIp(_request);
  const rl = checkRateLimit(ip, 'symbol');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSecs) } }
    );
  }

  const { symbol: rawSymbol } = await params;
  const symbol = decodeURIComponent(rawSymbol).toUpperCase();

  if (!isValidSymbol(symbol)) {
    return NextResponse.json({ error: 'Invalid symbol' }, { status: 400 });
  }

  const now = Date.now();
  const cached = cache.get(symbol);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.data, source: 'cache' });
  }

  let inFlight = inFlightMap.get(symbol);
  if (!inFlight) {
    inFlight = fetchAndCache(symbol).finally(() => {
      inFlightMap.delete(symbol);
    });
    inFlightMap.set(symbol, inFlight);
  }

  try {
    const entry = await inFlight;
    return NextResponse.json({ ...entry.data, source: 'api' });
  } catch (error) {
    console.error('Symbol detail API error:', error);
    if (cached) {
      return NextResponse.json({ ...cached.data, source: 'stale-cache' });
    }
    return NextResponse.json(
      { error: 'Failed to fetch symbol data' },
      { status: 502 }
    );
  }
}
