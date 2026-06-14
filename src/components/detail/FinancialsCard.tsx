'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import MetricTooltip from '@/components/ui/MetricTooltip';

interface FinancialsCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
}

/** Compact INR formatter for large numbers (revenue in crores / lakhs crores). */
const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 2,
});

interface YearlyEntry {
  date: number;
  revenue: number;
  earnings: number;
  profitMargin: number;
}

interface ChartEntry {
  year: string;
  revenue: number;
  netIncome: number;
}

function isValidEntry(e: unknown): e is YearlyEntry {
  if (!e || typeof e !== 'object') return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.date === 'number' &&
    typeof obj.revenue === 'number' &&
    typeof obj.earnings === 'number'
  );
}

export default function FinancialsCard({ summary }: FinancialsCardProps) {
  // Data lives at summary.earnings.financialsChart.yearly
  const yearly: unknown[] = summary?.earnings?.financialsChart?.yearly ?? [];
  const currency: string = summary?.earnings?.financialCurrency ?? 'INR';

  const entries: ChartEntry[] = yearly
    .filter(isValidEntry)
    .map((e) => ({
      year: String(e.date),
      revenue: e.revenue,
      netIncome: e.earnings,
    }));

  if (entries.length === 0) return null;

  const formatTick = (value: number) => inrCompact.format(value);

  // Determine bar colour: green for positive net income, red for negative
  const netIncomeColor = (value: number) => (value >= 0 ? '#16a34a' : '#dc2626');

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">
        Financial Trends
        {currency !== 'INR' && (
          <span className="ml-2 text-xs font-normal text-muted-foreground">({currency})</span>
        )}
      </h2>
      <div className="bg-card border border-border rounded-lg p-4 space-y-6">
        {/* Revenue chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            <MetricTooltip term="Revenue Trend">Annual Revenue</MetricTooltip>
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={entries} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatTick}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value: number) => [inrCompact.format(value), 'Revenue']}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar dataKey="revenue" radius={[3, 3, 0, 0]} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Net income chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            <MetricTooltip term="Net Income Trend">Annual Net Income</MetricTooltip>
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={entries} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatTick}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value: number) => [inrCompact.format(value), 'Net Income']}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'hsl(var(--foreground))',
                }}
                cursor={{ fill: 'hsl(var(--muted))' }}
              />
              <Bar dataKey="netIncome" radius={[3, 3, 0, 0]}>
                {entries.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={netIncomeColor(entry.netIncome)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
