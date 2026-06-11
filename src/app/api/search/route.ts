import { NextResponse } from 'next/server';
import { search } from '@/services/yahooFinance';

const INDIAN_INDICES = new Set(['NSI', 'BSE', 'NSEI', 'BSESN']);

function isIndianIndex(quote: Record<string, unknown>): boolean {
  const exchange = typeof quote.exchange === 'string' ? quote.exchange : '';
  const name = typeof quote.longname === 'string' ? quote.longname :
    typeof quote.shortname === 'string' ? quote.shortname : '';
  return (
    INDIAN_INDICES.has(exchange) ||
    /nifty|sensex|nse|bse/i.test(name)
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const results = await search(query);
    const indianResults = results.quotes
      .filter((quote) => {
        if (!('symbol' in quote) || !('quoteType' in quote) || typeof quote.symbol !== 'string') {
          return false;
        }
        const { symbol, quoteType } = quote as { symbol: string; quoteType: string };

        if (quoteType === 'EQUITY') {
          return symbol.endsWith('.NS') || symbol.endsWith('.BO');
        }
        if (quoteType === 'MUTUALFUND') {
          return symbol.endsWith('.NS') || symbol.endsWith('.BO');
        }
        if (quoteType === 'INDEX') {
          return isIndianIndex(quote as Record<string, unknown>);
        }
        return false;
      })
      .map((quote) => ({
        ...(quote as object),
        quoteType: (quote as { quoteType: string }).quoteType,
      }));

    return NextResponse.json({ data: indianResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
