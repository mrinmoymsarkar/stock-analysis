'use client';

import MetricTooltip from '@/components/ui/MetricTooltip';

interface EarningsCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
}

const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

function fmtEps(value: number | null | undefined, currency = 'INR'): string | null {
  if (value === null || value === undefined || isNaN(Number(value))) return null;
  if (currency === 'INR') return inrFull.format(value);
  return value.toFixed(2);
}

function fmtDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(d));
  } catch {
    return null;
  }
}

interface NormalisedQuarter {
  label: string;
  actual: number | null;
  estimate: number | null;
  /** Surprise as a decimal fraction (0.29 = 29%). Null if unavailable. */
  surpriseFraction: number | null;
}

/**
 * Normalise an earningsHistory entry.
 * surprisePercent is a decimal (0.29 = 29%).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromHistory(h: any): NormalisedQuarter {
  return {
    label: h.period ?? '—',
    actual: typeof h.epsActual === 'number' ? h.epsActual : null,
    estimate: typeof h.epsEstimate === 'number' ? h.epsEstimate : null,
    surpriseFraction: typeof h.surprisePercent === 'number' ? h.surprisePercent : null,
  };
}

/**
 * Normalise an earningsChart.quarterly entry.
 * surprisePct is a string already expressed as a percentage ("29.12").
 * We convert to decimal to keep a unified interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromChartQuarter(q: any): NormalisedQuarter {
  const surprisePctStr = q.surprisePct;
  const surpriseFraction =
    surprisePctStr !== null && surprisePctStr !== undefined
      ? Number(surprisePctStr) / 100
      : null;
  return {
    label: q.fiscalQuarter ?? q.date ?? '—',
    actual: typeof q.actual === 'number' ? q.actual : null,
    estimate: typeof q.estimate === 'number' ? q.estimate : null,
    surpriseFraction: isNaN(Number(surpriseFraction)) ? null : surpriseFraction,
  };
}

export default function EarningsCard({ summary }: EarningsCardProps) {
  // Next earnings date — prefer calendarEvents, fall back to earningsChart
  const ceEarnings = summary?.calendarEvents?.earnings;
  const earningsChart = summary?.earnings?.earningsChart;

  const nextDates: (Date | string)[] = [
    ...(Array.isArray(ceEarnings?.earningsDate) ? ceEarnings.earningsDate : []),
    ...(Array.isArray(earningsChart?.earningsDate) ? earningsChart.earningsDate : []),
  ];
  // Pick the soonest valid earnings date from the combined list.
  // We do not filter by "now" (avoids calling the impure Date.now in render);
  // Yahoo's data already surfaces upcoming dates first.
  const nextEarningsDate: string | null = (() => {
    const parsed = nextDates
      .map((d) => new Date(d))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());
    return parsed.length > 0 ? fmtDate(parsed[0]) : null;
  })();
  const isEstimated: boolean = ceEarnings?.isEarningsDateEstimate === true;

  // Prefer earningsHistory — normalise surprisePercent (decimal) to fraction
  const rawHistory = Array.isArray(summary?.earningsHistory?.history)
    ? summary.earningsHistory.history
    : [];
  const rawChartQuarterly = Array.isArray(earningsChart?.quarterly)
    ? earningsChart.quarterly
    : [];

  const historyNorm: NormalisedQuarter[] = rawHistory.map(fromHistory).reverse();
  const chartNorm: NormalisedQuarter[] = rawChartQuarterly.map(fromChartQuarter);

  // Use earningsHistory when available; fall back to chart quarterly
  const quartersSource = historyNorm.length > 0 ? historyNorm : chartNorm;

  // Keep last 4 quarters with at least actual or estimate data
  const quarters = quartersSource
    .filter((q) => q.actual !== null || q.estimate !== null)
    .slice(-4);

  const currency: string = summary?.earnings?.financialCurrency ?? 'INR';

  const hasNextDate = nextEarningsDate !== null;
  const hasQuarters = quarters.length > 0;

  if (!hasNextDate && !hasQuarters) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Earnings</h2>
      <div className="bg-card border border-border rounded-lg p-4 space-y-5">
        {hasNextDate && (
          <div className="flex items-center gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                <MetricTooltip term="Next Earnings Date">Next Earnings Date</MetricTooltip>
              </p>
              <p className="text-sm font-semibold text-foreground">
                {nextEarningsDate}
                {isEstimated && (
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">(estimated)</span>
                )}
              </p>
            </div>
          </div>
        )}

        {hasQuarters && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Quarterly EPS — Actual vs Estimate
              {currency !== 'INR' && (
                <span className="ml-1">({currency})</span>
              )}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[340px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-1.5 pr-3 text-xs font-medium text-muted-foreground">Quarter</th>
                    <th className="text-right py-1.5 px-3 text-xs font-medium text-muted-foreground">
                      <MetricTooltip term="EPS Actual">Actual</MetricTooltip>
                    </th>
                    <th className="text-right py-1.5 px-3 text-xs font-medium text-muted-foreground">
                      <MetricTooltip term="EPS Estimate">Estimate</MetricTooltip>
                    </th>
                    <th className="text-right py-1.5 pl-3 text-xs font-medium text-muted-foreground">
                      <MetricTooltip term="EPS Surprise">Surprise</MetricTooltip>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quarters.map((q, i) => {
                    const actual = fmtEps(q.actual, currency);
                    const estimate = fmtEps(q.estimate, currency);
                    const beat =
                      q.actual !== null && q.estimate !== null && q.actual >= q.estimate;
                    return (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="py-2 pr-3 text-foreground font-medium text-xs">{q.label}</td>
                        <td className={`py-2 px-3 text-right font-semibold text-xs ${
                          actual !== null ? (beat ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'
                        }`}>
                          {actual ?? '—'}
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground text-xs">
                          {estimate ?? '—'}
                        </td>
                        <td className={`py-2 pl-3 text-right text-xs font-medium ${
                          q.surpriseFraction === null
                            ? 'text-muted-foreground'
                            : q.surpriseFraction >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {q.surpriseFraction !== null
                            ? `${q.surpriseFraction >= 0 ? '+' : ''}${(q.surpriseFraction * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
