import { NextResponse } from 'next/server';
import { getQuotes } from '@/services/yahooFinance';
import { StockData } from '@/types';

// List of key Indian stocks and indices to track
const symbols = [
  'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS',
  'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS',
  'RELIANCE.NS', 'ONGC.NS', 'NTPC.NS',
  'ITC.NS', 'HINDUNILVR.NS', 'NESTLEIND.NS',
  'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS',
  '^NSEI', // Nifty 50
  '^BSESN' // Sensex
];

// Module-level cache so concurrent visitors share one Yahoo fetch per TTL
// window (persists for the lifetime of a warm serverless instance).
const CACHE_TTL_MS = 30_000;
let cache: { stocks: Record<string, StockData>; timestamp: number } | null = null;
let inFlight: Promise<Record<string, StockData>> | null = null;

async function fetchStocks(): Promise<Record<string, StockData>> {
  // Single batched request for all symbols instead of one request each
  const quotes = await getQuotes(symbols);
  const stocks: Record<string, StockData> = {};

  quotes.forEach((quote) => {
    if (quote && typeof quote.regularMarketPrice === 'number') {
      stocks[quote.symbol] = {
        regularMarketPrice: quote.regularMarketPrice,
        regularMarketChangePercent: quote.regularMarketChangePercent ?? 0,
      };
    }
  });

  if (Object.keys(stocks).length === 0) {
    throw new Error('Yahoo Finance returned no usable quotes');
  }

  return stocks;
}

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      stocks: cache.stocks,
      timestamp: cache.timestamp,
      source: 'cache',
    });
  }

  try {
    // Dedupe concurrent requests into one upstream fetch
    if (!inFlight) {
      inFlight = fetchStocks().finally(() => {
        inFlight = null;
      });
    }
    const stocks = await inFlight;

    cache = { stocks, timestamp: Date.now() };
    return NextResponse.json({
      stocks,
      timestamp: cache.timestamp,
      source: 'api-polling',
    });
  } catch (error) {
    console.error('Real-time API error:', error);

    // Serve stale data over no data if we have it
    if (cache) {
      return NextResponse.json({
        stocks: cache.stocks,
        timestamp: cache.timestamp,
        source: 'stale-cache',
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch real-time data from Yahoo Finance' },
      { status: 502 }
    );
  }
}
