import YahooFinance from 'yahoo-finance2';

// Shared client instance (same pattern as yahooFinance.ts)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// ---------------------------------------------------------------------------
// Nifty-100 constituent list — NSE symbols (.NS suffix)
// Used as the universe for gainers / losers / most-active / 52-wk proximity.
// Screener is US-centric even with region overrides, so we compute everything
// ourselves from this hardcoded list.
// ---------------------------------------------------------------------------
export const NIFTY_100_SYMBOLS: string[] = [
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
  'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS',
  'BAJFINANCE.NS', 'ASIANPAINT.NS', 'AXISBANK.NS', 'MARUTI.NS', 'HCLTECH.NS',
  'SUNPHARMA.NS', 'TITAN.NS', 'ADANIENT.NS', 'WIPRO.NS', 'NTPC.NS',
  'ULTRACEMCO.NS', 'ONGC.NS', 'POWERGRID.NS', 'M&M.NS', 'TATAMOTORS.NS',
  'ITC.NS', 'NESTLEIND.NS', 'TATASTEEL.NS', 'JSWSTEEL.NS', 'HINDALCO.NS',
  'COALINDIA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'BAJAJFINSV.NS', 'DIVISLAB.NS',
  'HDFCLIFE.NS', 'TECHM.NS', 'GRASIM.NS', 'INDUSINDBK.NS', 'BPCL.NS',
  'SBILIFE.NS', 'ADANIPORTS.NS', 'TRENT.NS', 'ZOMATO.NS', 'SHREECEM.NS',
  'EICHERMOT.NS', 'VEDL.NS', 'DABUR.NS', 'MARICO.NS', 'BERGEPAINT.NS',
  'HAVELLS.NS', 'TORNTPHARM.NS', 'APOLLOHOSP.NS', 'NAUKRI.NS', 'DLF.NS',
  'BRITANNIA.NS', 'SIEMENS.NS', 'MCDOWELL-N.NS', 'GODREJCP.NS', 'AMBUJACEM.NS',
  'PIIND.NS', 'SRF.NS', 'CHOLAFIN.NS', 'ICICIGI.NS', 'BAJAJ-AUTO.NS',
  'HEROMOTOCO.NS', 'BOSCHLTD.NS', 'MUTHOOTFIN.NS', 'LICI.NS', 'HAL.NS',
  'BEL.NS', 'PERSISTENT.NS', 'COFORGE.NS', 'MPHASIS.NS', 'INDIGO.NS',
  'TATACONSUM.NS', 'PIDILITIND.NS', 'COLPAL.NS', 'BANDHANBNK.NS', 'PNB.NS',
  'CANBK.NS', 'BANKBARODA.NS', 'IDFCFIRSTB.NS', 'FEDERALBNK.NS', 'RBLBANK.NS',
  'HINDPETRO.NS', 'IOC.NS', 'GAIL.NS', 'SAIL.NS', 'NHPC.NS',
  'IRFC.NS', 'RECLTD.NS', 'PFC.NS', 'CONCOR.NS', 'OBEROIRLTY.NS',
  'PRESTIGE.NS', 'GODREJPROP.NS', 'PHOENIXLTD.NS', 'LTIM.NS', 'OFSS.NS',
];

export interface MarketMover {
  symbol: string;
  shortName: string;
  price: number;
  changePercent: number;
  volume?: number;
}

export interface MarketsData {
  gainers: MarketMover[];
  losers: MarketMover[];
  mostActive: MarketMover[];
  trending: MarketMover[];
  nearHigh: MarketMover[];
  nearLow: MarketMover[];
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Pure computation helpers (unit-testable without any network calls)
// ---------------------------------------------------------------------------

export interface RawQuote {
  symbol: string;
  shortName?: string | null;
  regularMarketPrice?: number | null;
  regularMarketChangePercent?: number | null;
  regularMarketVolume?: number | null;
  fiftyTwoWeekHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
}

/** Convert raw Yahoo quote to MarketMover, returning null when required fields are missing. */
export function toMover(q: RawQuote): MarketMover | null {
  const price = q.regularMarketPrice ?? null;
  const changePercent = q.regularMarketChangePercent ?? null;
  if (price === null || changePercent === null) return null;
  return {
    symbol: q.symbol,
    shortName: q.shortName ?? q.symbol,
    price,
    changePercent,
    volume: q.regularMarketVolume ?? undefined,
  };
}

/** Sort by changePercent descending, take top N. */
export function computeGainers(quotes: RawQuote[], n = 10): MarketMover[] {
  return quotes
    .map(toMover)
    .filter((m): m is MarketMover => m !== null)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, n);
}

/** Sort by changePercent ascending, take top N. */
export function computeLosers(quotes: RawQuote[], n = 10): MarketMover[] {
  return quotes
    .map(toMover)
    .filter((m): m is MarketMover => m !== null)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, n);
}

/** Sort by volume descending, take top N. */
export function computeMostActive(quotes: RawQuote[], n = 10): MarketMover[] {
  return quotes
    .map(toMover)
    .filter((m): m is MarketMover => m !== null && m.volume !== undefined)
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))
    .slice(0, n);
}

/**
 * Proximity to 52-week high: ((price - high) / high).
 * Near-high = price is within 5% below the 52w high.
 * Returns closest-to-high first.
 */
export function computeNearHigh(quotes: RawQuote[], n = 10): MarketMover[] {
  return quotes
    .filter((q) => {
      const price = q.regularMarketPrice ?? 0;
      const high = q.fiftyTwoWeekHigh ?? 0;
      if (!price || !high) return false;
      const pct = (high - price) / high; // how far below high (0 = at high)
      return pct >= 0 && pct <= 0.05;
    })
    .map(toMover)
    .filter((m): m is MarketMover => m !== null)
    .sort((a, b) => {
      // Closer to high first — need to re-derive proximity from quotes
      const qa = quotes.find((q) => q.symbol === a.symbol);
      const qb = quotes.find((q) => q.symbol === b.symbol);
      const proxA = qa?.fiftyTwoWeekHigh ? (qa.fiftyTwoWeekHigh - a.price) / qa.fiftyTwoWeekHigh : 1;
      const proxB = qb?.fiftyTwoWeekHigh ? (qb.fiftyTwoWeekHigh - b.price) / qb.fiftyTwoWeekHigh : 1;
      return proxA - proxB;
    })
    .slice(0, n);
}

/**
 * Proximity to 52-week low: ((price - low) / low).
 * Near-low = price is within 5% above the 52w low.
 * Returns closest-to-low first.
 */
export function computeNearLow(quotes: RawQuote[], n = 10): MarketMover[] {
  return quotes
    .filter((q) => {
      const price = q.regularMarketPrice ?? 0;
      const low = q.fiftyTwoWeekLow ?? 0;
      if (!price || !low) return false;
      const pct = (price - low) / low; // how far above low (0 = at low)
      return pct >= 0 && pct <= 0.05;
    })
    .map(toMover)
    .filter((m): m is MarketMover => m !== null)
    .sort((a, b) => {
      const qa = quotes.find((q) => q.symbol === a.symbol);
      const qb = quotes.find((q) => q.symbol === b.symbol);
      const proxA = qa?.fiftyTwoWeekLow ? (a.price - qa.fiftyTwoWeekLow) / qa.fiftyTwoWeekLow : 1;
      const proxB = qb?.fiftyTwoWeekLow ? (b.price - qb.fiftyTwoWeekLow) / qb.fiftyTwoWeekLow : 1;
      return proxA - proxB;
    })
    .slice(0, n);
}

// ---------------------------------------------------------------------------
// Network helpers
// ---------------------------------------------------------------------------

/** Fetch Nifty-100 batch quotes from Yahoo Finance. */
async function fetchNifty100Quotes(): Promise<RawQuote[]> {
  // yahoo-finance2 v3: quote() accepts an array of symbols
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await (yahooFinance.quote as any)(NIFTY_100_SYMBOLS) as RawQuote[];
  return Array.isArray(results) ? results : [results];
}

/** Fetch trending symbols for India and batch-quote them. */
async function fetchTrending(): Promise<MarketMover[]> {
  try {
    const trending = await yahooFinance.trendingSymbols('IN', { count: 20 });
    const symbols = trending.quotes
      .map((q) => q.symbol)
      .filter((s) => s.endsWith('.NS') || s.endsWith('.BO'));

    if (symbols.length === 0) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes = await (yahooFinance.quote as any)(symbols) as RawQuote[];
    const arr: RawQuote[] = Array.isArray(quotes) ? quotes : [quotes];
    return arr.map(toMover).filter((m): m is MarketMover => m !== null);
  } catch {
    return [];
  }
}

/** Main entry point — called by the API route. */
export async function getMarketsData(): Promise<MarketsData> {
  const [niftyQuotes, trending] = await Promise.all([
    fetchNifty100Quotes(),
    fetchTrending(),
  ]);

  return {
    gainers: computeGainers(niftyQuotes),
    losers: computeLosers(niftyQuotes),
    mostActive: computeMostActive(niftyQuotes),
    trending,
    nearHigh: computeNearHigh(niftyQuotes),
    nearLow: computeNearLow(niftyQuotes),
    updatedAt: new Date().toISOString(),
  };
}
