'use client';

import MetricTooltip from '@/components/ui/MetricTooltip';

interface FundProfileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
}

function pct(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (isNaN(n)) return null;
  return `${(n * 100).toFixed(2)}%`;
}

export default function FundProfile({ summary }: FundProfileProps) {
  const sd = summary?.summaryDetail ?? {};
  const fp = summary?.fundProfile ?? {};
  const fperf = summary?.fundPerformance ?? {};
  const th = summary?.topHoldings ?? {};
  const price = summary?.price ?? {};

  const nav: number | undefined =
    typeof sd.navPrice === 'number'
      ? sd.navPrice
      : typeof price.regularMarketPrice === 'number'
      ? price.regularMarketPrice
      : undefined;

  const fundFamily: string | undefined = fp.familyName ?? fp.fundFamily;
  const category: string | undefined = fp.categoryName ?? fp.legalType;
  const expenseRatio: string | null = pct(fp.annualReportExpenseRatio ?? fp.annualHoldingsTurnover);

  // Trailing returns: check multiple shapes
  const trailingReturns =
    fperf.trailingReturns ?? fperf.annualTotalReturns ?? null;

  const holdings: Array<{ holdingName?: string; symbol?: string; holdingPercent?: number }> =
    Array.isArray(th.holdings) ? th.holdings : [];

  const hasProfile = nav !== undefined || fundFamily || category || expenseRatio;
  const hasReturns = trailingReturns !== null && typeof trailingReturns === 'object';
  const hasHoldings = holdings.length > 0;

  if (!hasProfile && !hasReturns && !hasHoldings) return null;

  return (
    <section className="space-y-6">
      {hasProfile && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Fund Profile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {nav !== undefined && (
              <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground"><MetricTooltip term="NAV">NAV</MetricTooltip></p>
                <p className="text-sm font-semibold text-foreground">₹{nav.toFixed(4)}</p>
              </div>
            )}
            {fundFamily && (
              <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground"><MetricTooltip term="Fund Family">Fund Family</MetricTooltip></p>
                <p className="text-sm font-semibold text-foreground">{fundFamily}</p>
              </div>
            )}
            {category && (
              <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground"><MetricTooltip term="Category">Category</MetricTooltip></p>
                <p className="text-sm font-semibold text-foreground">{category}</p>
              </div>
            )}
            {expenseRatio && (
              <div className="bg-card border border-border rounded-lg p-3 space-y-1">
                <p className="text-xs text-muted-foreground"><MetricTooltip term="Expense Ratio">Expense Ratio</MetricTooltip></p>
                <p className="text-sm font-semibold text-foreground">{expenseRatio}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {hasReturns && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Trailing Returns</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(['ytd', 'oneYear', 'threeYear', 'fiveYear'] as const).map((key) => {
              const val = (trailingReturns as Record<string, unknown>)[key];
              const formatted = pct(val);
              if (!formatted) return null;
              const labels: Record<string, string> = {
                ytd: 'YTD',
                oneYear: '1Y',
                threeYear: '3Y',
                fiveYear: '5Y',
              };
              const n = Number(val);
              const isPositive = n >= 0;
              return (
                <div key={key} className="bg-card border border-border rounded-lg p-3 space-y-1">
                  <p className="text-xs text-muted-foreground"><MetricTooltip term={labels[key]}>{labels[key]}</MetricTooltip></p>
                  <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{formatted}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasHoldings && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Top Holdings</h2>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-2 text-muted-foreground font-medium">Holding</th>
                  <th className="text-right px-4 py-2 text-muted-foreground font-medium">Weight</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 10).map((h, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0 hover:bg-accent/30">
                    <td className="px-4 py-2 text-foreground">
                      {h.holdingName ?? h.symbol ?? `Holding ${i + 1}`}
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground">
                      {h.holdingPercent !== undefined ? pct(h.holdingPercent) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
