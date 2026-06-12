'use client';

import MetricTooltip from '@/components/ui/MetricTooltip';

interface AnalystRecsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
  currentPrice?: number;
}

interface TrendEntry {
  period?: string;
  strongBuy?: number;
  buy?: number;
  hold?: number;
  sell?: number;
  strongSell?: number;
}

const ratingConfig = [
  { key: 'strongBuy', label: 'Strong Buy', color: 'bg-green-600 text-white' },
  { key: 'buy', label: 'Buy', color: 'bg-green-400 text-white' },
  { key: 'hold', label: 'Hold', color: 'bg-yellow-500 text-white' },
  { key: 'sell', label: 'Sell', color: 'bg-red-400 text-white' },
  { key: 'strongSell', label: 'Strong Sell', color: 'bg-red-600 text-white' },
] as const;

export default function AnalystRecs({ summary, currentPrice }: AnalystRecsProps) {
  const trend = summary?.recommendationTrend;
  if (!trend) return null;

  const trends: TrendEntry[] = Array.isArray(trend.trend) ? trend.trend : [];
  const latest: TrendEntry | undefined = trends[0];

  if (!latest) return null;

  const targetPrice: number | undefined =
    typeof summary?.financialData?.targetMeanPrice === 'number'
      ? summary.financialData.targetMeanPrice
      : undefined;

  const upside =
    targetPrice !== undefined && currentPrice !== undefined && currentPrice > 0
      ? ((targetPrice - currentPrice) / currentPrice) * 100
      : undefined;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Analyst Recommendations</h2>
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        {targetPrice !== undefined && (
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <div>
              <p className="text-xs text-muted-foreground"><MetricTooltip term="Analyst Target Price">Analyst Target Price</MetricTooltip></p>
              <p className="text-lg font-bold text-foreground">₹{targetPrice.toFixed(2)}</p>
            </div>
            {upside !== undefined && (
              <div>
                <p className="text-xs text-muted-foreground"><MetricTooltip term="Upside/Downside">Upside/Downside</MetricTooltip></p>
                <p className={`text-sm font-semibold ${upside >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {ratingConfig.map(({ key, label, color }) => {
            const count = latest[key];
            if (count === undefined || count === 0) return null;
            return (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`text-xs px-2 py-0.5 rounded font-semibold ${color}`}><MetricTooltip term={label}>{label}</MetricTooltip></span>
                <span className="text-sm font-semibold text-foreground">{count}</span>
              </div>
            );
          })}
        </div>
        {latest.period && (
          <p className="text-xs text-muted-foreground">Period: {latest.period}</p>
        )}
      </div>
    </section>
  );
}
