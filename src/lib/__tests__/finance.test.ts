/**
 * Tests for src/lib/finance.ts
 *
 * Uses RELATIVE imports because @/lib is not in jest moduleNameMapper.
 */

import {
  sipFutureValue,
  lumpsumFutureValue,
  requiredSip,
  stepUpSipFutureValue,
  inflationAdjusted,
  sipProjection,
} from '../finance';

// ─── sipFutureValue ───────────────────────────────────────────────────────────

describe('sipFutureValue', () => {
  it('₹10,000/mo @ 12% for 120 months ≈ ₹23,23,391 (within 0.1%)', () => {
    const result = sipFutureValue(10_000, 12, 120);
    // Published annuity-due SIP formula: ~23,23,391
    expect(result).toBeCloseTo(2_323_391, -3);
    // Within 0.1%
    expect(Math.abs(result - 2_323_391) / 2_323_391).toBeLessThan(0.001);
  });

  it('₹5,000/mo @ 15% for 240 months — value > total invested', () => {
    const invested = 5_000 * 240; // 12,00,000
    const fv = sipFutureValue(5_000, 15, 240);
    expect(fv).toBeGreaterThan(invested);
  });

  it('higher rate → higher FV', () => {
    const low = sipFutureValue(10_000, 10, 120);
    const high = sipFutureValue(10_000, 15, 120);
    expect(high).toBeGreaterThan(low);
  });

  it('zero-rate edge case: FV = P × n (no division by zero)', () => {
    expect(() => sipFutureValue(10_000, 0, 120)).not.toThrow();
    const fv = sipFutureValue(10_000, 0, 120);
    expect(fv).toBeCloseTo(10_000 * 120, 0);
  });

  it('single month: FV ≈ P × (1 + i) for small i', () => {
    const i = 12 / 12 / 100; // 0.01
    const expected = 10_000 * (1 + i); // one month, annuity-due
    expect(sipFutureValue(10_000, 12, 1)).toBeCloseTo(expected, 2);
  });
});

// ─── lumpsumFutureValue ───────────────────────────────────────────────────────

describe('lumpsumFutureValue', () => {
  it('₹1,00,000 @ 10% for 10 years ≈ ₹2,59,374', () => {
    const result = lumpsumFutureValue(1_00_000, 10, 10);
    // 1,00,000 × 1.1^10 = 2,59,374.25
    expect(result).toBeCloseTo(2_59_374, -1);
  });

  it('zero rate: FV = principal', () => {
    expect(lumpsumFutureValue(5_00_000, 0, 20)).toBeCloseTo(5_00_000, 0);
  });

  it('1 year: FV = principal × (1 + r)', () => {
    expect(lumpsumFutureValue(1_00_000, 8, 1)).toBeCloseTo(1_08_000, 0);
  });

  it('longer tenure → higher FV', () => {
    const fv10 = lumpsumFutureValue(1_00_000, 10, 10);
    const fv20 = lumpsumFutureValue(1_00_000, 10, 20);
    expect(fv20).toBeGreaterThan(fv10);
  });
});

// ─── requiredSip ─────────────────────────────────────────────────────────────

describe('requiredSip', () => {
  it('is the inverse of sipFutureValue (round-trip)', () => {
    const monthlyAmount = 10_000;
    const annualRate = 12;
    const months = 120;
    const fv = sipFutureValue(monthlyAmount, annualRate, months);
    const required = requiredSip(fv, annualRate, months);
    expect(required).toBeCloseTo(monthlyAmount, 0);
  });

  it('is the inverse of sipFutureValue for different inputs', () => {
    const monthlyAmount = 25_000;
    const annualRate = 14;
    const months = 240;
    const fv = sipFutureValue(monthlyAmount, annualRate, months);
    const required = requiredSip(fv, annualRate, months);
    expect(required).toBeCloseTo(monthlyAmount, 0);
  });

  it('zero-rate edge case: required = target / months', () => {
    expect(() => requiredSip(12_00_000, 0, 120)).not.toThrow();
    expect(requiredSip(12_00_000, 0, 120)).toBeCloseTo(10_000, 0);
  });

  it('higher return rate → lower required SIP for same target', () => {
    const target = 50_00_000;
    const months = 180;
    const lowRate = requiredSip(target, 10, months);
    const highRate = requiredSip(target, 14, months);
    expect(highRate).toBeLessThan(lowRate);
  });
});

// ─── stepUpSipFutureValue ─────────────────────────────────────────────────────

describe('stepUpSipFutureValue', () => {
  it('step-up > flat SIP for same starting amount', () => {
    const flat = sipFutureValue(10_000, 12, 120);
    const stepUp = stepUpSipFutureValue(10_000, 12, 120, 10);
    expect(stepUp).toBeGreaterThan(flat);
  });

  it('0% step-up equals flat sipFutureValue (within 1%)', () => {
    const flat = sipFutureValue(10_000, 12, 120);
    const stepUp = stepUpSipFutureValue(10_000, 12, 120, 0);
    // Allow small floating-point differences
    expect(Math.abs(stepUp - flat) / flat).toBeLessThan(0.01);
  });

  it('higher step-up → higher FV', () => {
    const low = stepUpSipFutureValue(10_000, 12, 120, 5);
    const high = stepUpSipFutureValue(10_000, 12, 120, 15);
    expect(high).toBeGreaterThan(low);
  });

  it('zero-rate edge case does not throw', () => {
    expect(() => stepUpSipFutureValue(10_000, 0, 24, 10)).not.toThrow();
  });

  it('tenure not a multiple of 12 is handled correctly', () => {
    // 13 months: first 12 months at P, then 1 month at P*(1+step)
    const result = stepUpSipFutureValue(10_000, 12, 13, 10);
    expect(result).toBeGreaterThan(sipFutureValue(10_000, 12, 13));
  });
});

// ─── inflationAdjusted ───────────────────────────────────────────────────────

describe('inflationAdjusted', () => {
  it('₹1,00,00,000 after 20 years @ 6% inflation ≈ ₹31,18,047', () => {
    // 1_00_00_000 / 1.06^20 = ~3_118_047
    const result = inflationAdjusted(1_00_00_000, 6, 20);
    expect(result).toBeCloseTo(31_18_047, -2);
  });

  it('zero inflation: real value = nominal value', () => {
    expect(inflationAdjusted(50_00_000, 0, 15)).toBeCloseTo(50_00_000, 0);
  });

  it('real value is always less than nominal for positive inflation', () => {
    const nominal = 1_00_00_000;
    const real = inflationAdjusted(nominal, 5, 10);
    expect(real).toBeLessThan(nominal);
  });

  it('longer period → lower real value', () => {
    const r10 = inflationAdjusted(1_00_00_000, 6, 10);
    const r20 = inflationAdjusted(1_00_00_000, 6, 20);
    expect(r20).toBeLessThan(r10);
  });
});

// ─── sipProjection ────────────────────────────────────────────────────────────

describe('sipProjection', () => {
  it('always includes the final month', () => {
    const pts = sipProjection(10_000, 12, 37);
    const lastMonth = pts[pts.length - 1].month;
    expect(lastMonth).toBe(37);
  });

  it('short horizon (≤24 months) includes every month', () => {
    const pts = sipProjection(10_000, 12, 24);
    expect(pts.length).toBe(24);
    pts.forEach((p, idx) => expect(p.month).toBe(idx + 1));
  });

  it('long horizon (>24) samples yearly + final', () => {
    const pts = sipProjection(10_000, 12, 120);
    // year-end points: 12, 24, 36, 48, 60, 72, 84, 96, 108, 120 → 10 points
    expect(pts.length).toBe(10);
  });

  it('final value matches sipFutureValue (within 1%)', () => {
    const months = 120;
    const rate = 12;
    const sip = 10_000;
    const fv = sipFutureValue(sip, rate, months);
    const pts = sipProjection(sip, rate, months);
    const projectedFV = pts[pts.length - 1].value;
    expect(Math.abs(projectedFV - fv) / fv).toBeLessThan(0.01);
  });

  it('value is always >= invested (positive returns)', () => {
    const pts = sipProjection(5_000, 12, 60);
    pts.forEach((p) => expect(p.value).toBeGreaterThanOrEqual(p.invested));
  });

  it('step-up projection has higher final value than flat', () => {
    const flat = sipProjection(10_000, 12, 120, 0);
    const stepUp = sipProjection(10_000, 12, 120, 10);
    const flatFinal = flat[flat.length - 1].value;
    const stepFinal = stepUp[stepUp.length - 1].value;
    expect(stepFinal).toBeGreaterThan(flatFinal);
  });

  it('zero rate projection: value equals invested', () => {
    const pts = sipProjection(10_000, 0, 24);
    pts.forEach((p) => expect(p.value).toBeCloseTo(p.invested, 0));
  });
});
