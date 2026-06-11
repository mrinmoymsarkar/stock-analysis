import { renderHook, act } from '@testing-library/react';
import useWatchlist from '../useWatchlist';
import { DEFAULT_SYMBOLS } from '@/lib/watchlist';

describe('useWatchlist', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns DEFAULT_SYMBOLS before hydration and after hydration with no stored data', async () => {
    const { result } = renderHook(() => useWatchlist());
    // Pre-hydration: still defaults
    expect(result.current.symbols).toEqual(DEFAULT_SYMBOLS);
    // After mount effect runs
    await act(async () => {});
    expect(result.current.symbols).toEqual(DEFAULT_SYMBOLS);
    expect(result.current.hydrated).toBe(true);
  });

  it('loads stored watchlist after mount', async () => {
    const stored = ['RELIANCE.NS', '^NSEI'];
    localStorage.setItem('watchlist', JSON.stringify(stored));

    const { result } = renderHook(() => useWatchlist());
    await act(async () => {});

    expect(result.current.symbols).toEqual(stored);
  });

  it('add appends a new symbol and persists', async () => {
    const { result } = renderHook(() => useWatchlist());
    await act(async () => {});

    act(() => {
      result.current.add('WIPRO.NS');
    });

    expect(result.current.symbols).toContain('WIPRO.NS');
    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]');
    expect(stored).toContain('WIPRO.NS');
  });

  it('add deduplicates', async () => {
    localStorage.setItem('watchlist', JSON.stringify(['TCS.NS']));
    const { result } = renderHook(() => useWatchlist());
    await act(async () => {});

    act(() => result.current.add('TCS.NS'));

    const count = result.current.symbols.filter(s => s === 'TCS.NS').length;
    expect(count).toBe(1);
  });

  it('remove deletes the symbol and persists', async () => {
    localStorage.setItem('watchlist', JSON.stringify(['TCS.NS', 'INFY.NS']));
    const { result } = renderHook(() => useWatchlist());
    await act(async () => {});

    act(() => result.current.remove('TCS.NS'));

    expect(result.current.symbols).not.toContain('TCS.NS');
    expect(result.current.symbols).toContain('INFY.NS');
    const stored = JSON.parse(localStorage.getItem('watchlist') ?? '[]');
    expect(stored).not.toContain('TCS.NS');
  });
});
