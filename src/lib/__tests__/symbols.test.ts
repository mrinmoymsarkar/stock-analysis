import { isValidSymbol, sanitizeSymbols, symbolsKey } from '../symbols';

describe('isValidSymbol', () => {
  it('accepts valid NSE symbols', () => {
    expect(isValidSymbol('TCS.NS')).toBe(true);
    expect(isValidSymbol('INFY.NS')).toBe(true);
  });

  it('accepts index symbols with caret', () => {
    expect(isValidSymbol('^NSEI')).toBe(true);
    expect(isValidSymbol('^BSESN')).toBe(true);
  });

  it('normalizes lowercase to uppercase before validating', () => {
    expect(isValidSymbol('tcs.ns')).toBe(true);
  });

  it('rejects symbols with injection characters', () => {
    expect(isValidSymbol('TCS;DROP')).toBe(false);
    expect(isValidSymbol('TCS NS')).toBe(false);
    expect(isValidSymbol('../../etc')).toBe(false);
  });

  it('rejects symbols longer than 20 characters', () => {
    expect(isValidSymbol('A'.repeat(21))).toBe(false);
    expect(isValidSymbol('A'.repeat(20))).toBe(true);
  });

  it('rejects empty string', () => {
    expect(isValidSymbol('')).toBe(false);
  });
});

describe('sanitizeSymbols', () => {
  it('trims whitespace and uppercases', () => {
    expect(sanitizeSymbols(['  tcs.ns  '])).toEqual(['TCS.NS']);
  });

  it('deduplicates symbols', () => {
    expect(sanitizeSymbols(['TCS.NS', 'tcs.ns', 'TCS.NS'])).toEqual(['TCS.NS']);
  });

  it('filters out invalid symbols', () => {
    expect(sanitizeSymbols(['TCS.NS', 'bad symbol!', '^NSEI'])).toEqual(['TCS.NS', '^NSEI']);
  });

  it('caps at 30 symbols', () => {
    const input = Array.from({ length: 40 }, (_, i) => `SYM${i}.NS`);
    const result = sanitizeSymbols(input);
    expect(result).toHaveLength(30);
  });

  it('returns empty array for all-invalid input', () => {
    expect(sanitizeSymbols(['bad!', '  ', 'a b'])).toEqual([]);
  });
});

describe('symbolsKey', () => {
  it('produces a stable sorted comma-joined key', () => {
    expect(symbolsKey(['INFY.NS', 'TCS.NS'])).toBe('INFY.NS,TCS.NS');
    expect(symbolsKey(['TCS.NS', 'INFY.NS'])).toBe('INFY.NS,TCS.NS');
  });

  it('is order-independent — same symbols produce the same key', () => {
    const a = ['C.NS', 'A.NS', 'B.NS'];
    const b = ['B.NS', 'C.NS', 'A.NS'];
    expect(symbolsKey(a)).toBe(symbolsKey(b));
  });
});
