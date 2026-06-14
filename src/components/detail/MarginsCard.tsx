'use client';

import MetricTooltip from '@/components/ui/MetricTooltip';

interface MarginsCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
}

function fmtPct(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (isNaN(n)) return null;
  return `${(n * 100).toFixed(2)}%`;
}

interface MetricRow {
  term: string;
  label: string;
  value: string | null;
  positive?: boolean; // undefined = neutral (no colour)
}

export default function MarginsCard({ summary }: MarginsCardProps) {
  const fd = summary?.financialData ?? {};

  const rows: MetricRow[] = [
    {
      term: 'Profit Margin',
      label: 'Profit Margin',
      value: fmtPct(fd.profitMargins),
      positive: typeof fd.profitMargins === 'number' ? fd.profitMargins >= 0 : undefined,
    },
    {
      term: 'Operating Margin',
      label: 'Operating Margin',
      value: fmtPct(fd.operatingMargins),
      positive: typeof fd.operatingMargins === 'number' ? fd.operatingMargins >= 0 : undefined,
    },
    {
      term: 'ROE',
      label: 'ROE',
      value: fmtPct(fd.returnOnEquity),
      positive: typeof fd.returnOnEquity === 'number' ? fd.returnOnEquity >= 0 : undefined,
    },
    {
      term: 'ROA',
      label: 'ROA',
      value: fmtPct(fd.returnOnAssets),
      positive: typeof fd.returnOnAssets === 'number' ? fd.returnOnAssets >= 0 : undefined,
    },
    // Gross margin from financialData if present
    {
      term: 'Profit Margin',
      label: 'Gross Margin',
      value: fmtPct(fd.grossMargins),
      positive: typeof fd.grossMargins === 'number' ? fd.grossMargins >= 0 : undefined,
    },
  ];

  // Use unique term+label combos; keep only rows with data
  const seen = new Set<string>();
  const visible = rows.filter((r) => {
    const key = r.label;
    if (r.value === null || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Profitability</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {visible.map(({ term, label, value, positive }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">
              <MetricTooltip term={term}>{label}</MetricTooltip>
            </p>
            <p className={`text-sm font-semibold ${
              positive === undefined
                ? 'text-foreground'
                : positive
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
