import { safeNextPath } from '../safeNext';

describe('safeNextPath', () => {
  it('allows same-origin relative paths', () => {
    expect(safeNextPath('/portfolio')).toBe('/portfolio');
    expect(safeNextPath('/stock/RELIANCE.NS?range=1y')).toBe('/stock/RELIANCE.NS?range=1y');
  });

  it('falls back to / for empty or missing values', () => {
    expect(safeNextPath(null)).toBe('/');
    expect(safeNextPath(undefined)).toBe('/');
    expect(safeNextPath('')).toBe('/');
  });

  it('rejects absolute URLs and protocol-relative redirects', () => {
    expect(safeNextPath('https://evil.com')).toBe('/');
    expect(safeNextPath('http://evil.com/phish')).toBe('/');
    expect(safeNextPath('//evil.com')).toBe('/');
    expect(safeNextPath('/\\evil.com')).toBe('/');
    expect(safeNextPath('javascript:alert(1)')).toBe('/');
  });
});
