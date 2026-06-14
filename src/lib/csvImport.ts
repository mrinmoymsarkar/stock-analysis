/**
 * Pure CSV import utilities for portfolio holdings.
 * No React, no network — fully unit-testable.
 */

import Papa from 'papaparse';
import { isValidSymbol } from '@/lib/symbols';

const MAX_IMPORT_ROWS = 200;

// Month abbreviations for DD-MMM-YYYY parsing
const MONTH_ABBR: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  may: '05', jun: '06', jul: '07', aug: '08',
  sep: '09', oct: '10', nov: '11', dec: '12',
};

export interface ColumnMapping {
  symbol?: string;
  quantity?: string;
  buyPrice?: string;
  buyDate?: string;
  name?: string;
  isin?: string;
  exchange?: string;
}

export interface ParsedRow {
  symbol: string;
  name?: string;
  quoteType: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  dateDefaulted?: boolean;
}

export interface SkippedRow {
  row: number;
  raw: Record<string, string>;
  reason: string;
}

export interface ParseHoldingsCsvResult {
  valid: ParsedRow[];
  skipped: SkippedRow[];
  detected: ColumnMapping;
  headers: string[];
}

// ─── Header auto-detection ────────────────────────────────────────────────────

const HEADER_PATTERNS: Array<{ field: keyof ColumnMapping; re: RegExp }> = [
  { field: 'symbol',    re: /symbol|ticker|scrip|instrument/i },
  { field: 'quantity',  re: /qty|quantity|units|shares/i },
  { field: 'buyPrice',  re: /avg|average|buy.?price|purchase.?price|cost|nav|price/i },
  { field: 'buyDate',   re: /date/i },
  { field: 'name',      re: /name|company/i },
  { field: 'isin',      re: /isin/i },
  { field: 'exchange',  re: /exchange|segment|venue/i },
];

function detectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const { field, re } of HEADER_PATTERNS) {
    const matched = headers.find((h) => re.test(h));
    if (matched && !Object.values(mapping).includes(matched)) {
      mapping[field] = matched;
    }
  }
  return mapping;
}

// ─── Date normalisation ───────────────────────────────────────────────────────

/**
 * Normalise a date string to "YYYY-MM-DD".
 * Accepted formats:
 *   YYYY-MM-DD      (passthrough)
 *   DD-MM-YYYY
 *   DD/MM/YYYY
 *   DD-MMM-YYYY  (e.g. 10-Jan-2025)
 * Returns null on failure.
 */
function normaliseDate(raw: string): string | null {
  const s = raw.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : s;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    const candidate = `${yyyy}-${mm}-${dd}`;
    const d = new Date(candidate);
    return isNaN(d.getTime()) ? null : candidate;
  }

  // DD-MMM-YYYY  (e.g. 10-Jan-2025)
  const dmmm = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (dmmm) {
    const [, dd, mon, yyyy] = dmmm;
    const mm = MONTH_ABBR[mon.toLowerCase()];
    if (!mm) return null;
    const candidate = `${yyyy}-${mm}-${dd.padStart(2, '0')}`;
    const d = new Date(candidate);
    return isNaN(d.getTime()) ? null : candidate;
  }

  return null;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Symbol normalisation ─────────────────────────────────────────────────────

interface NormaliseSymbolResult {
  symbol: string;
  skippedReason?: string;
}

function normaliseSymbol(
  raw: string,
  isin?: string,
  exchange?: string
): NormaliseSymbolResult {
  let sym = raw.trim().toUpperCase();

  // Already qualified
  if (sym.endsWith('.NS') || sym.endsWith('.BO') || sym.startsWith('^')) {
    return { symbol: sym };
  }

  // US detection: ISIN starts with 'US' or exchange matches US markets
  const isUsIsin = isin ? /^US/i.test(isin.trim()) : false;
  const isUsExchange = exchange ? /\b(us|nasdaq|nyse|nsdq)\b/i.test(exchange.trim()) : false;

  if (isUsIsin || isUsExchange) {
    return { symbol: sym, skippedReason: 'US stocks not yet supported' };
  }

  // Default: append .NS for Indian equity
  sym = sym + '.NS';
  return { symbol: sym };
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseHoldingsCsv(
  text: string,
  mappingOverride?: ColumnMapping
): ParseHoldingsCsvResult {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const headers: string[] = (result.meta.fields ?? []) as string[];
  const detected: ColumnMapping = detectMapping(headers);
  const mapping: ColumnMapping = { ...detected, ...mappingOverride };

  const valid: ParsedRow[] = [];
  const skipped: SkippedRow[] = [];

  const rows = result.data;

  rows.forEach((rawRow, idx) => {
    const rowNum = idx + 1; // 1-based for user display

    // Cap at 200 rows
    if (rowNum > MAX_IMPORT_ROWS) {
      skipped.push({
        row: rowNum,
        raw: rawRow as Record<string, string>,
        reason: `Row limit of ${MAX_IMPORT_ROWS} exceeded`,
      });
      return;
    }

    const raw = rawRow as Record<string, string>;
    const skip = (reason: string) => skipped.push({ row: rowNum, raw, reason });

    // ─── Symbol ──────────────────────────────────────────────────────────────
    const rawSymbol = mapping.symbol ? (raw[mapping.symbol] ?? '') : '';
    if (!rawSymbol.trim()) {
      skip('Missing symbol');
      return;
    }

    const isinVal = mapping.isin ? (raw[mapping.isin] ?? '').trim() : undefined;
    const exchangeVal = mapping.exchange ? (raw[mapping.exchange] ?? '').trim() : undefined;

    const { symbol, skippedReason } = normaliseSymbol(rawSymbol, isinVal, exchangeVal);
    if (skippedReason) {
      skip(skippedReason);
      return;
    }

    if (!isValidSymbol(symbol)) {
      skip(`Invalid symbol: "${symbol}"`);
      return;
    }

    // ─── Quantity ─────────────────────────────────────────────────────────────
    const rawQty = mapping.quantity ? (raw[mapping.quantity] ?? '') : '';
    const quantity = parseFloat(rawQty.replace(/,/g, ''));
    if (!rawQty.trim() || isNaN(quantity) || quantity <= 0) {
      skip('Invalid or missing quantity (must be > 0)');
      return;
    }

    // ─── Buy Price ───────────────────────────────────────────────────────────
    const rawPrice = mapping.buyPrice ? (raw[mapping.buyPrice] ?? '') : '';
    const buyPrice = parseFloat(rawPrice.replace(/,/g, '').replace(/[₹$]/g, ''));
    if (!rawPrice.trim() || isNaN(buyPrice) || buyPrice < 0) {
      skip('Invalid or missing buy price (must be ≥ 0)');
      return;
    }

    // ─── Buy Date ────────────────────────────────────────────────────────────
    const rawDate = mapping.buyDate ? (raw[mapping.buyDate] ?? '').trim() : '';
    let buyDate: string;
    let dateDefaulted = false;

    if (!rawDate) {
      buyDate = todayIso();
      dateDefaulted = true;
    } else {
      const normalised = normaliseDate(rawDate);
      if (!normalised) {
        skip(`Unrecognized date format: "${rawDate}"`);
        return;
      }
      buyDate = normalised;
    }

    // ─── Name (optional) ─────────────────────────────────────────────────────
    const name = mapping.name ? (raw[mapping.name] ?? '').trim() || undefined : undefined;

    const parsed: ParsedRow = {
      symbol,
      name,
      quoteType: 'EQUITY',
      quantity,
      buyPrice,
      buyDate,
    };
    if (dateDefaulted) parsed.dateDefaulted = true;

    valid.push(parsed);
  });

  return { valid, skipped, detected, headers };
}

// ─── Template ─────────────────────────────────────────────────────────────────

export function holdingsCsvTemplate(): string {
  return 'symbol,quantity,buy_price,buy_date\nRELIANCE.NS,10,2450.50,2024-06-15\n';
}
