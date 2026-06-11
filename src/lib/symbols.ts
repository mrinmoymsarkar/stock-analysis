const SYMBOL_RE = /^[A-Z0-9^&.\-]{1,20}$/;
const MAX_SYMBOLS = 30;

export function isValidSymbol(s: string): boolean {
  return SYMBOL_RE.test(s.toUpperCase());
}

export function sanitizeSymbols(input: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input) {
    const s = raw.trim().toUpperCase();
    if (isValidSymbol(s) && !seen.has(s)) {
      seen.add(s);
      result.push(s);
      if (result.length === MAX_SYMBOLS) break;
    }
  }
  return result;
}

export function symbolsKey(symbols: string[]): string {
  return [...symbols].sort().join(',');
}
