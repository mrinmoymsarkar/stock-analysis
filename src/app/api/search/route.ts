import { NextResponse } from 'next/server';
import { search } from '@/services/yahooFinance';

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
    // Filter results to only include Indian equities from NSE (.NS) and BSE (.BO)
    const indianResults = results.quotes.filter((quote) => {
      // Type guard to ensure we are only dealing with stock quotes
      if ('symbol' in quote && 'quoteType' in quote && typeof quote.symbol === 'string') {
        return (
          quote.quoteType === 'EQUITY' &&
          (quote.symbol.endsWith('.NS') || quote.symbol.endsWith('.BO'))
        );
      }
      return false;
    });
    return NextResponse.json({ data: indianResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}
