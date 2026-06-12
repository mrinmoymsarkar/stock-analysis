/**
 * Pure portfolio calculation functions — no React, no side effects.
 *
 * Design decision: lots without a live quote are EXCLUDED from both sides of
 * P&L (invested and currentValue), so that the reported P&L is only based on
 * positions we can actually price. The `pricedLotCount` / `totalLotCount`
 * fields let the UI display "n of m lots priced" as a transparency note.
 */

export interface Holding {
  id: string;
  symbol: string;
  name?: string;
  quoteType: string;
  quantity: number;
  buyPrice: number;
  buyDate: string; // ISO date string "YYYY-MM-DD"
}

export interface Quote {
  price: number;
  changePercent: number;
}

export interface LotMetrics {
  invested: number;
  currentValue: number | undefined;
  unrealizedPnl: number | undefined;
  pnlPercent: number | undefined;
  dayChangeValue: number | undefined;
  cagr: number | null; // percent; null when < 1 day or no invested value
}

export interface SymbolAggregate {
  symbol: string;
  totalQty: number;
  avgBuyPrice: number;
  invested: number;
  currentValue: number | undefined;
  unrealizedPnl: number | undefined;
  pnlPercent: number | undefined;
  dayChangeValue: number | undefined;
  lotCount: number;
}

export interface PortfolioSummary {
  totalInvested: number;      // sum of invested across priced lots only
  currentValue: number;       // sum of currentValue across priced lots
  totalPnl: number;           // currentValue - totalInvested (priced lots only)
  totalPnlPercent: number | null; // null when totalInvested === 0
  dayChange: number;          // sum of dayChangeValue across priced lots
  dayChangePercent: number | null; // null when currentValue - dayChange === 0
  pricedLotCount: number;     // lots with a live quote
  totalLotCount: number;      // all lots
}

export interface AllocationEntry {
  key: string;
  value: number;
  percent: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Days between two ISO date strings (or Date objects). Truncated to whole days. */
function daysBetween(from: string, to: Date): number {
  const fromMs = new Date(from).getTime();
  const toMs = to.getTime();
  return Math.floor((toMs - fromMs) / (1000 * 60 * 60 * 24));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute metrics for a single holding lot.
 * `cagr` is in percentage points (e.g. 12.5 means 12.5%).
 */
export function lotMetrics(h: Holding, quote?: Quote): LotMetrics {
  const invested = h.quantity * h.buyPrice;

  if (!quote) {
    // No live price — compute what we can
    const days = daysBetween(h.buyDate, new Date());
    let cagr: number | null = null;
    if (invested > 0 && days >= 1) {
      // Without current price we cannot compute CAGR
      cagr = null;
    }
    return { invested, currentValue: undefined, unrealizedPnl: undefined, pnlPercent: undefined, dayChangeValue: undefined, cagr };
  }

  const currentValue = h.quantity * quote.price;
  const unrealizedPnl = currentValue - invested;
  const pnlPercent = invested > 0 ? (unrealizedPnl / invested) * 100 : undefined;
  const dayChangeValue = h.quantity * quote.price * (quote.changePercent / 100);

  // CAGR: (current/invested)^(365.25/days) − 1, expressed as percent
  const days = daysBetween(h.buyDate, new Date());
  let cagr: number | null = null;
  if (invested > 0 && days >= 1) {
    const ratio = currentValue / invested;
    // Guard: ratio must be positive for Math.pow
    if (ratio > 0) {
      cagr = (Math.pow(ratio, 365.25 / days) - 1) * 100;
    } else {
      cagr = -100; // total loss
    }
  }

  return { invested, currentValue, unrealizedPnl, pnlPercent, dayChangeValue, cagr };
}

/**
 * Aggregate multiple lots of the same symbol into a single row.
 * `quotes` is a map from symbol → Quote.
 */
export function aggregateBySymbol(
  holdings: Holding[],
  quotes: Record<string, Quote>
): SymbolAggregate[] {
  const bySymbol: Record<string, Holding[]> = {};
  for (const h of holdings) {
    if (!bySymbol[h.symbol]) bySymbol[h.symbol] = [];
    bySymbol[h.symbol].push(h);
  }

  return Object.entries(bySymbol).map(([symbol, lots]) => {
    const quote = quotes[symbol];
    let totalQty = 0;
    let totalCost = 0;
    let invested = 0;
    let currentValue: number | undefined = quote ? 0 : undefined;
    let unrealizedPnl: number | undefined = quote ? 0 : undefined;
    let dayChangeValue: number | undefined = quote ? 0 : undefined;

    for (const lot of lots) {
      const m = lotMetrics(lot, quote);
      totalQty += lot.quantity;
      totalCost += lot.quantity * lot.buyPrice;
      invested += m.invested;
      if (quote && m.currentValue !== undefined) {
        currentValue = (currentValue ?? 0) + m.currentValue;
        unrealizedPnl = (unrealizedPnl ?? 0) + (m.unrealizedPnl ?? 0);
        dayChangeValue = (dayChangeValue ?? 0) + (m.dayChangeValue ?? 0);
      }
    }

    const avgBuyPrice = totalQty > 0 ? totalCost / totalQty : 0;
    const pnlPercent =
      invested > 0 && unrealizedPnl !== undefined
        ? (unrealizedPnl / invested) * 100
        : undefined;

    return {
      symbol,
      totalQty,
      avgBuyPrice,
      invested,
      currentValue,
      unrealizedPnl,
      pnlPercent,
      dayChangeValue,
      lotCount: lots.length,
    };
  });
}

/**
 * Compute portfolio-level summary. Only priced lots contribute to currentValue,
 * totalPnl, and dayChange. See module-level comment for rationale.
 */
export function portfolioSummary(
  holdings: Holding[],
  quotes: Record<string, Quote>
): PortfolioSummary {
  let totalInvested = 0;
  let currentValue = 0;
  let dayChange = 0;
  let pricedLotCount = 0;
  const totalLotCount = holdings.length;

  for (const h of holdings) {
    const quote = quotes[h.symbol];
    if (!quote) continue; // exclude quote-less lots from both sides
    const m = lotMetrics(h, quote);
    pricedLotCount++;
    totalInvested += m.invested;
    if (m.currentValue !== undefined) currentValue += m.currentValue;
    if (m.dayChangeValue !== undefined) dayChange += m.dayChangeValue;
  }

  const totalPnl = currentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : null;
  // dayChangePercent: prior close value = currentValue − dayChange
  const priorCloseValue = currentValue - dayChange;
  const dayChangePercent = priorCloseValue !== 0 ? (dayChange / priorCloseValue) * 100 : null;

  return {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    dayChange,
    dayChangePercent,
    pricedLotCount,
    totalLotCount,
  };
}

/**
 * Compute allocations by symbol and by quoteType.
 * Uses currentValue when a quote is available, otherwise falls back to invested.
 * Results are sorted descending by value.
 */
export function allocations(
  holdings: Holding[],
  quotes: Record<string, Quote>
): { bySymbol: AllocationEntry[]; byType: AllocationEntry[] } {
  const symbolValues: Record<string, number> = {};
  const typeValues: Record<string, number> = {};
  let total = 0;

  // Aggregate by symbol first (across lots)
  const bySymbol: Record<string, number> = {};
  for (const h of holdings) {
    const quote = quotes[h.symbol];
    const value = quote ? h.quantity * quote.price : h.quantity * h.buyPrice;
    bySymbol[h.symbol] = (bySymbol[h.symbol] ?? 0) + value;
    typeValues[h.quoteType] = (typeValues[h.quoteType] ?? 0) + value;
    total += value;
  }

  // Only add to symbolValues after full aggregation
  for (const [sym, val] of Object.entries(bySymbol)) {
    symbolValues[sym] = val;
  }

  const toEntries = (map: Record<string, number>): AllocationEntry[] =>
    Object.entries(map)
      .map(([key, value]) => ({
        key,
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

  return {
    bySymbol: toEntries(symbolValues),
    byType: toEntries(typeValues),
  };
}
