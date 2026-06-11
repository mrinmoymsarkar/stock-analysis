import { loadWatchlist, saveWatchlist, DEFAULT_SYMBOLS } from '../watchlist';

describe('watchlist storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns DEFAULT_SYMBOLS when nothing is stored', () => {
    expect(loadWatchlist()).toEqual(DEFAULT_SYMBOLS);
  });

  it('round-trips save/load correctly', () => {
    const symbols = ['RELIANCE.NS', '^NSEI'];
    saveWatchlist(symbols);
    expect(loadWatchlist()).toEqual(symbols);
  });

  it('returns DEFAULT_SYMBOLS for invalid JSON', () => {
    localStorage.setItem('watchlist', 'not-json{{');
    expect(loadWatchlist()).toEqual(DEFAULT_SYMBOLS);
  });

  it('returns DEFAULT_SYMBOLS for an empty array', () => {
    localStorage.setItem('watchlist', JSON.stringify([]));
    expect(loadWatchlist()).toEqual(DEFAULT_SYMBOLS);
  });

  it('returns DEFAULT_SYMBOLS for non-array JSON', () => {
    localStorage.setItem('watchlist', JSON.stringify({ a: 1 }));
    expect(loadWatchlist()).toEqual(DEFAULT_SYMBOLS);
  });
});
