import { NextResponse } from 'next/server';
import { getQuote, getHistorical, getSummary } from '@/services/yahooFinance';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Max symbol length accepted from query params
const MAX_SYMBOL_LENGTH = 20;
// Max range string length
const MAX_RANGE_LENGTH = 10;

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(ip, 'quote');
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSecs) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type') || 'quote';

  if (!symbol) {
    return NextResponse.json(
      { error: 'Query param "symbol" is required' },
      { status: 400 }
    );
  }

  if (symbol.length > MAX_SYMBOL_LENGTH) {
    return NextResponse.json(
      { error: `"symbol" must be at most ${MAX_SYMBOL_LENGTH} characters` },
      { status: 400 }
    );
  }

  try {
    switch (type) {
      case 'historical': {
        const rawRange = searchParams.get('range') || '1mo';
        const range = rawRange.slice(0, MAX_RANGE_LENGTH);
        const result = await getHistorical(symbol, range);
        // The chart method returns an object with a 'quotes' array
        return NextResponse.json({ data: result.quotes });
      }
      case 'summary': {
        const data = await getSummary(symbol);
        return NextResponse.json({ data });
      }
      default: {
        const data = await getQuote(symbol);
        return NextResponse.json({ data });
      }
    }
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
