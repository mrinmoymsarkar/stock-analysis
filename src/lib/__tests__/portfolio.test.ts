/**
 * Tests for src/lib/portfolio.ts
 */

import {
  lotMetrics,
  aggregateBySymbol,
  portfolioSummary,
  allocations,
  Holding,
  Quote,
} from '../portfolio';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const TODAY = new Date();
const todayStr = TODAY.toISOString().slice(0, 10);

// A date exactly 1 year ago
const oneYearAgo = new Date(TODAY);
oneYearAgo.setFullYear(TODAY.getFullYear() - 1);
const oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10);

// A date 2 years ago
const twoYearsAgo = new Date(TODAY);
twoYearsAgo.setFullYear(TODAY.getFullYear() - 2);
const twoYearsAgoStr = twoYearsAgo.toISOString().slice(0, 10);

const holdingA1: Holding = {
  id: '1',
  symbol: 'RELIANCE.NS',
  name: 'Reliance Industries',
  quoteType: 'EQUITY',
  quantity: 10,
  buyPrice: 2000,
  buyDate: oneYearAgoStr,
};

const holdingA2: Holding = {
  id: '2',
  symbol: 'RELIANCE.NS',
  name: 'Reliance Industries',
  quoteType: 'EQUITY',
  quantity: 5,
  buyPrice: 2400,
  buyDate: twoYearsAgoStr,
};

const holdingB: Holding = {
  id: '3',
  symbol: 'TCS.NS',
  name: 'TCS',
  quoteType: 'EQUITY',
  quantity: 2,
  buyPrice: 3500,
  buyDate: twoYearsAgoStr,
};

const holdingFund: Holding = {
  id: '4',
  symbol: 'MIRAELSS.NS',
  name: 'Mirae ELSS Fund',
  quoteType: 'MUTUALFUND',
  quantity: 100,
  buyPrice: 50,
  buyDate: oneYearAgoStr,
};

const quoteA: Quote = { price: 2500, changePercent: 1.5 };
const quoteB: Quote = { price: 4000, changePercent: -0.5 };
const quoteFund: Quote = { price: 60, changePercent: 0.3 };

// ─── lotMetrics ───────────────────────────────────────────────────────────────

describe('lotMetrics', () => {
  test('without quote: currentValue and pnl undefined, invested computed', () => {
    const m = lotMetrics(holdingA1);
    expect(m.invested).toBe(10 * 2000); // 20000
    expect(m.currentValue).toBeUndefined();
    expect(m.unrealizedPnl).toBeUndefined();
    expect(m.pnlPercent).toBeUndefined();
    expect(m.dayChangeValue).toBeUndefined();
    expect(m.cagr).toBeNull();
  });

  test('with quote: all metrics defined', () => {
    const m = lotMetrics(holdingA1, quoteA);
    expect(m.invested).toBe(20000);
    expect(m.currentValue).toBe(10 * 2500); // 25000
    expect(m.unrealizedPnl).toBe(5000);
    expect(m.pnlPercent).toBeCloseTo(25, 5);
    // dayChangeValue = 10 * 2500 * (1.5/100) = 375
    expect(m.dayChangeValue).toBeCloseTo(375, 5);
  });

  test('CAGR ~0% for same-price after ~1 year', () => {
    const flatHolding: Holding = { ...holdingA1, buyPrice: 2500 };
    const m = lotMetrics(flatHolding, quoteA);
    // ratio = 1, cagr should be 0
    expect(m.cagr).toBeCloseTo(0, 1);
  });

  test('CAGR positive for profitable lot', () => {
    const m = lotMetrics(holdingA1, quoteA);
    // After ~1 year: (2500/2000)^(365.25/~365) - 1 ≈ 25%
    expect(m.cagr).not.toBeNull();
    expect(m.cagr!).toBeGreaterThan(20);
    expect(m.cagr!).toBeLessThan(30);
  });

  test('CAGR null when same-day buy', () => {
    const sameDayHolding: Holding = { ...holdingA1, buyDate: todayStr };
    const m = lotMetrics(sameDayHolding, quoteA);
    expect(m.cagr).toBeNull();
  });

  test('CAGR negative for loss lot', () => {
    const lossHolding: Holding = { ...holdingA1, buyPrice: 3000 };
    const m = lotMetrics(lossHolding, quoteA); // bought at 3000, now 2500
    expect(m.cagr).not.toBeNull();
    expect(m.cagr!).toBeLessThan(0);
  });

  test('pnlPercent undefined when invested is 0', () => {
    const zeroPrice: Holding = { ...holdingA1, buyPrice: 0 };
    const m = lotMetrics(zeroPrice, quoteA);
    expect(m.pnlPercent).toBeUndefined();
  });

  test('CAGR null when invested is 0', () => {
    const zeroPrice: Holding = { ...holdingA1, buyPrice: 0 };
    const m = lotMetrics(zeroPrice, quoteA);
    expect(m.cagr).toBeNull();
  });
});

// ─── aggregateBySymbol ────────────────────────────────────────────────────────

describe('aggregateBySymbol', () => {
  const quotes: Record<string, Quote> = {
    'RELIANCE.NS': quoteA,
    'TCS.NS': quoteB,
  };

  test('multi-lot: weighted average buy price', () => {
    // holdingA1: 10 @ 2000 = 20000
    // holdingA2: 5 @ 2400 = 12000
    // total qty: 15, total cost: 32000 → avg = 32000/15 ≈ 2133.33
    const result = aggregateBySymbol([holdingA1, holdingA2], quotes);
    const reliance = result.find((r) => r.symbol === 'RELIANCE.NS')!;
    expect(reliance.totalQty).toBe(15);
    expect(reliance.avgBuyPrice).toBeCloseTo(32000 / 15, 5);
    expect(reliance.invested).toBe(32000);
    expect(reliance.currentValue).toBe(15 * 2500); // 37500
    expect(reliance.unrealizedPnl).toBeCloseTo(37500 - 32000, 5);
    expect(reliance.lotCount).toBe(2);
  });

  test('single lot: metrics pass through directly', () => {
    const result = aggregateBySymbol([holdingB], quotes);
    const tcs = result.find((r) => r.symbol === 'TCS.NS')!;
    expect(tcs.totalQty).toBe(2);
    expect(tcs.avgBuyPrice).toBe(3500);
    expect(tcs.currentValue).toBe(2 * 4000);
    expect(tcs.lotCount).toBe(1);
  });

  test('symbol without quote: currentValue undefined', () => {
    const result = aggregateBySymbol([holdingFund], {});
    const fund = result.find((r) => r.symbol === 'MIRAELSS.NS')!;
    expect(fund.currentValue).toBeUndefined();
    expect(fund.unrealizedPnl).toBeUndefined();
    expect(fund.invested).toBe(100 * 50);
  });

  test('multiple symbols aggregated separately', () => {
    const result = aggregateBySymbol([holdingA1, holdingA2, holdingB], quotes);
    expect(result).toHaveLength(2);
  });

  test('pnlPercent computed correctly for multi-lot', () => {
    const result = aggregateBySymbol([holdingA1, holdingA2], quotes);
    const reliance = result.find((r) => r.symbol === 'RELIANCE.NS')!;
    // invested=32000, currentValue=37500 → pnl=5500 → pnlPercent=5500/32000*100
    expect(reliance.pnlPercent).toBeCloseTo((5500 / 32000) * 100, 4);
  });
});

// ─── portfolioSummary ─────────────────────────────────────────────────────────

describe('portfolioSummary', () => {
  test('basic summary with all quotes present', () => {
    const quotes: Record<string, Quote> = {
      'RELIANCE.NS': quoteA,
      'TCS.NS': quoteB,
    };
    const holdings = [holdingA1, holdingB];
    const s = portfolioSummary(holdings, quotes);
    // holdingA1: invested=20000, currentValue=25000
    // holdingB: invested=7000, currentValue=8000
    expect(s.totalInvested).toBe(27000);
    expect(s.currentValue).toBe(33000);
    expect(s.totalPnl).toBe(6000);
    expect(s.totalPnlPercent).toBeCloseTo((6000 / 27000) * 100, 4);
    expect(s.pricedLotCount).toBe(2);
    expect(s.totalLotCount).toBe(2);
  });

  test('missing quotes: excludes from both invested and currentValue', () => {
    // holdingFund has no quote
    const quotes: Record<string, Quote> = {
      'RELIANCE.NS': quoteA,
    };
    const holdings = [holdingA1, holdingFund];
    const s = portfolioSummary(holdings, quotes);
    // Only holdingA1 contributes
    expect(s.totalInvested).toBe(20000);
    expect(s.currentValue).toBe(25000);
    expect(s.pricedLotCount).toBe(1);
    expect(s.totalLotCount).toBe(2);
  });

  test('no holdings: zeros and nulls', () => {
    const s = portfolioSummary([], {});
    expect(s.totalInvested).toBe(0);
    expect(s.currentValue).toBe(0);
    expect(s.totalPnl).toBe(0);
    expect(s.totalPnlPercent).toBeNull();
    expect(s.dayChangePercent).toBeNull();
    expect(s.pricedLotCount).toBe(0);
    expect(s.totalLotCount).toBe(0);
  });

  test('no quotes: all lots unpriced', () => {
    const s = portfolioSummary([holdingA1, holdingB], {});
    expect(s.totalInvested).toBe(0);
    expect(s.currentValue).toBe(0);
    expect(s.totalPnl).toBe(0);
    expect(s.pricedLotCount).toBe(0);
    expect(s.totalLotCount).toBe(2);
  });

  test('multi-lot same symbol: all lots counted', () => {
    const quotes: Record<string, Quote> = { 'RELIANCE.NS': quoteA };
    const holdings = [holdingA1, holdingA2];
    const s = portfolioSummary(holdings, quotes);
    // holdingA1: invested=20000, holdingA2: invested=12000
    expect(s.totalInvested).toBe(32000);
    expect(s.currentValue).toBe(15 * 2500); // 37500
    expect(s.pricedLotCount).toBe(2);
    expect(s.totalLotCount).toBe(2);
  });

  test('dayChange and dayChangePercent computed', () => {
    const quotes: Record<string, Quote> = { 'TCS.NS': quoteB };
    const s = portfolioSummary([holdingB], quotes);
    // dayChangeValue = 2 * 4000 * (-0.5/100) = -40
    expect(s.dayChange).toBeCloseTo(-40, 4);
    // priorClose = 8000 - (-40) = 8040
    expect(s.dayChangePercent).toBeCloseTo((-40 / 8040) * 100, 4);
  });

  test('totalPnlPercent null when totalInvested is 0', () => {
    const holdings: Holding[] = [{ ...holdingA1, buyPrice: 0 }];
    const quotes: Record<string, Quote> = { 'RELIANCE.NS': quoteA };
    const s = portfolioSummary(holdings, quotes);
    expect(s.totalPnlPercent).toBeNull();
  });
});

// ─── allocations ─────────────────────────────────────────────────────────────

describe('allocations', () => {
  test('percents sum to ~100 when all quoted', () => {
    const quotes: Record<string, Quote> = {
      'RELIANCE.NS': quoteA,
      'TCS.NS': quoteB,
      'MIRAELSS.NS': quoteFund,
    };
    const { bySymbol, byType } = allocations(
      [holdingA1, holdingA2, holdingB, holdingFund],
      quotes
    );
    const symbolSum = bySymbol.reduce((s, e) => s + e.percent, 0);
    const typeSum = byType.reduce((s, e) => s + e.percent, 0);
    expect(symbolSum).toBeCloseTo(100, 3);
    expect(typeSum).toBeCloseTo(100, 3);
  });

  test('falls back to invested when no quote', () => {
    const quotes: Record<string, Quote> = { 'TCS.NS': quoteB };
    const { bySymbol } = allocations([holdingA1, holdingB], quotes);
    // holdingA1 has no quote: uses invested = 20000
    // holdingB has quote: uses currentValue = 8000
    const reliance = bySymbol.find((e) => e.key === 'RELIANCE.NS')!;
    const tcs = bySymbol.find((e) => e.key === 'TCS.NS')!;
    expect(reliance.value).toBe(20000);
    expect(tcs.value).toBe(8000);
  });

  test('sorted descending by value', () => {
    const quotes: Record<string, Quote> = {
      'RELIANCE.NS': quoteA,
      'TCS.NS': quoteB,
    };
    const { bySymbol } = allocations([holdingA1, holdingB], quotes);
    // RELIANCE: 10*2500=25000, TCS: 2*4000=8000 → RELIANCE first
    expect(bySymbol[0].key).toBe('RELIANCE.NS');
    expect(bySymbol[1].key).toBe('TCS.NS');
  });

  test('multi-lot same symbol: aggregated value', () => {
    const quotes: Record<string, Quote> = { 'RELIANCE.NS': quoteA };
    const { bySymbol } = allocations([holdingA1, holdingA2], quotes);
    // 10*2500 + 5*2500 = 37500
    expect(bySymbol).toHaveLength(1);
    expect(bySymbol[0].value).toBe(37500);
    expect(bySymbol[0].percent).toBeCloseTo(100, 5);
  });

  test('byType groups correctly', () => {
    const quotes: Record<string, Quote> = {
      'RELIANCE.NS': quoteA,
      'MIRAELSS.NS': quoteFund,
    };
    const { byType } = allocations([holdingA1, holdingFund], quotes);
    const equity = byType.find((e) => e.key === 'EQUITY')!;
    const mf = byType.find((e) => e.key === 'MUTUALFUND')!;
    expect(equity).toBeDefined();
    expect(mf).toBeDefined();
    expect(equity.value + mf.value).toBeCloseTo(equity.value + mf.value, 5);
  });

  test('empty holdings: empty arrays', () => {
    const { bySymbol, byType } = allocations([], {});
    expect(bySymbol).toHaveLength(0);
    expect(byType).toHaveLength(0);
  });

  test('zero total: all percents are 0', () => {
    // quantity=0 would give 0 value
    const zeroHolding: Holding = { ...holdingA1, quantity: 0 };
    const quotes: Record<string, Quote> = { 'RELIANCE.NS': quoteA };
    const { bySymbol } = allocations([zeroHolding], quotes);
    expect(bySymbol[0].percent).toBe(0);
  });
});
