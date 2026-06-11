export const DEFAULT_SYMBOLS: string[] = [
  'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS',
  'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS',
  'RELIANCE.NS', 'ONGC.NS', 'NTPC.NS',
  'ITC.NS', 'HINDUNILVR.NS', 'NESTLEIND.NS',
  'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS',
  '^NSEI',
  '^BSESN',
];

const STORAGE_KEY = 'watchlist';

export function loadWatchlist(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SYMBOLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SYMBOLS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
    return DEFAULT_SYMBOLS;
  } catch {
    return DEFAULT_SYMBOLS;
  }
}

export function saveWatchlist(symbols: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
}
