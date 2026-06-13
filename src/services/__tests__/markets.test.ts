/**
 * Unit tests for pure compute helpers in src/services/markets.ts.
 * No network calls — only fixture objects.
 */
import {
  computeGainers,
  computeLosers,
  computeMostActive,
  computeNearHigh,
  computeNearLow,
  toMover,
  RawQuote,
} from '../markets';

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

function makeQuote(overrides: Partial<RawQuote> & { symbol: string }): RawQuote {
  return {
    shortName: overrides.symbol,
    regularMarketPrice: 1000,
    regularMarketChangePercent: 0,
    regularMarketVolume: 1_000_000,
    fiftyTwoWeekHigh: 1200,
    fiftyTwoWeekLow: 800,
    ...overrides,
  };
}

const FIXTURES: RawQuote[] = [
  makeQuote({ symbol: 'A.NS', regularMarketChangePercent: 5.2, regularMarketVolume: 5_000_000, regularMarketPrice: 1100, fiftyTwoWeekHigh: 1150, fiftyTwoWeekLow: 800 }),
  makeQuote({ symbol: 'B.NS', regularMarketChangePercent: 3.1, regularMarketVolume: 3_000_000, regularMarketPrice: 500 }),
  makeQuote({ symbol: 'C.NS', regularMarketChangePercent: -4.0, regularMarketVolume: 4_500_000, regularMarketPrice: 300, fiftyTwoWeekLow: 295 }),
  makeQuote({ symbol: 'D.NS', regularMarketChangePercent: -2.5, regularMarketVolume: 2_000_000, regularMarketPrice: 800 }),
  makeQuote({ symbol: 'E.NS', regularMarketChangePercent: 1.0, regularMarketVolume: 8_000_000, regularMarketPrice: 400, fiftyTwoWeekHigh: 405 }),
  makeQuote({ symbol: 'F.NS', regularMarketChangePercent: 0.0, regularMarketVolume: 1_200_000, regularMarketPrice: 200 }),
  makeQuote({ symbol: 'NODATA.NS', regularMarketPrice: null, regularMarketChangePercent: null }),
];

// ---------------------------------------------------------------------------
// toMover
// ---------------------------------------------------------------------------
describe('toMover', () => {
  it('returns a MarketMover for a valid quote', () => {
    const result = toMover(makeQuote({ symbol: 'X.NS', regularMarketPrice: 500, regularMarketChangePercent: 2.5, regularMarketVolume: 100 }));
    expect(result).not.toBeNull();
    expect(result?.symbol).toBe('X.NS');
    expect(result?.price).toBe(500);
    expect(result?.changePercent).toBe(2.5);
    expect(result?.volume).toBe(100);
  });

  it('returns null when regularMarketPrice is null', () => {
    expect(toMover(makeQuote({ symbol: 'X.NS', regularMarketPrice: null }))).toBeNull();
  });

  it('returns null when regularMarketChangePercent is null', () => {
    expect(toMover(makeQuote({ symbol: 'X.NS', regularMarketChangePercent: null }))).toBeNull();
  });

  it('falls back to symbol when shortName is null', () => {
    const result = toMover(makeQuote({ symbol: 'X.NS', shortName: null }));
    expect(result?.shortName).toBe('X.NS');
  });
});

// ---------------------------------------------------------------------------
// computeGainers
// ---------------------------------------------------------------------------
describe('computeGainers', () => {
  it('returns items sorted by changePercent descending', () => {
    const result = computeGainers(FIXTURES);
    const percents = result.map((r) => r.changePercent);
    expect(percents).toEqual([...percents].sort((a, b) => b - a));
  });

  it('excludes quotes with missing price/changePercent', () => {
    const result = computeGainers(FIXTURES);
    expect(result.every((r) => r.symbol !== 'NODATA.NS')).toBe(true);
  });

  it('respects the limit', () => {
    const result = computeGainers(FIXTURES, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('returns top gainer first', () => {
    const result = computeGainers(FIXTURES);
    expect(result[0].symbol).toBe('A.NS');
  });
});

// ---------------------------------------------------------------------------
// computeLosers
// ---------------------------------------------------------------------------
describe('computeLosers', () => {
  it('returns items sorted by changePercent ascending', () => {
    const result = computeLosers(FIXTURES);
    const percents = result.map((r) => r.changePercent);
    expect(percents).toEqual([...percents].sort((a, b) => a - b));
  });

  it('returns worst loser first', () => {
    const result = computeLosers(FIXTURES);
    expect(result[0].symbol).toBe('C.NS');
  });

  it('respects the limit', () => {
    const result = computeLosers(FIXTURES, 1);
    expect(result.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computeMostActive
// ---------------------------------------------------------------------------
describe('computeMostActive', () => {
  it('returns items sorted by volume descending', () => {
    const result = computeMostActive(FIXTURES);
    const volumes = result.map((r) => r.volume ?? 0);
    expect(volumes).toEqual([...volumes].sort((a, b) => b - a));
  });

  it('returns highest volume stock first', () => {
    const result = computeMostActive(FIXTURES);
    expect(result[0].symbol).toBe('E.NS');
  });

  it('respects the limit', () => {
    const result = computeMostActive(FIXTURES, 2);
    expect(result.length).toBeLessThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// computeNearHigh
// ---------------------------------------------------------------------------
describe('computeNearHigh', () => {
  it('only includes stocks trading within 5% of 52w high', () => {
    // A.NS: price=1100, high=1150  → (1150-1100)/1150 ≈ 4.3% → included
    // E.NS: price=400, high=405    → (405-400)/405  ≈ 1.2%  → included
    // B.NS: price=500, high=1200   → (1200-500)/1200 ≈ 58%  → excluded
    const result = computeNearHigh(FIXTURES);
    const symbols = result.map((r) => r.symbol);
    expect(symbols).toContain('A.NS');
    expect(symbols).toContain('E.NS');
    expect(symbols).not.toContain('B.NS');
  });

  it('excludes quotes without 52w high data', () => {
    const q = makeQuote({ symbol: 'X.NS', fiftyTwoWeekHigh: null });
    const result = computeNearHigh([q]);
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeNearLow
// ---------------------------------------------------------------------------
describe('computeNearLow', () => {
  it('only includes stocks trading within 5% of 52w low', () => {
    // C.NS: price=300, low=295 → (300-295)/295 ≈ 1.7% → included
    // A.NS: price=1100, low=800 → (1100-800)/800 = 37.5% → excluded
    const result = computeNearLow(FIXTURES);
    const symbols = result.map((r) => r.symbol);
    expect(symbols).toContain('C.NS');
    expect(symbols).not.toContain('A.NS');
  });

  it('excludes quotes without 52w low data', () => {
    const q = makeQuote({ symbol: 'X.NS', fiftyTwoWeekLow: null });
    const result = computeNearLow([q]);
    expect(result).toHaveLength(0);
  });

  it('respects the limit', () => {
    const result = computeNearLow(FIXTURES, 1);
    expect(result.length).toBeLessThanOrEqual(1);
  });
});
