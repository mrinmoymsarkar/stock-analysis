'use client';

const inrCompact = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 2,
});

const inrFull = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

function fmt(value: unknown, type: 'number' | 'currency' | 'compact-currency' | 'percent'): string | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (isNaN(n)) return null;
  switch (type) {
    case 'number':
      return n.toFixed(2);
    case 'currency':
      return inrFull.format(n);
    case 'compact-currency':
      return inrCompact.format(n);
    case 'percent':
      return `${(n * 100).toFixed(2)}%`;
  }
}

interface StatItem {
  label: string;
  value: string | null;
}

interface KeyStatsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  summary: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quote: any;
}

export default function KeyStats({ summary, quote }: KeyStatsProps) {
  const sd = summary?.summaryDetail ?? {};
  const dks = summary?.defaultKeyStatistics ?? {};

  const stats: StatItem[] = [
    { label: 'P/E (Trailing)', value: fmt(sd.trailingPE, 'number') },
    { label: 'P/E (Forward)', value: fmt(dks.forwardPE, 'number') },
    { label: 'Market Cap', value: fmt(sd.marketCap, 'compact-currency') },
    { label: '52W High', value: fmt(sd.fiftyTwoWeekHigh, 'currency') },
    { label: '52W Low', value: fmt(sd.fiftyTwoWeekLow, 'currency') },
    { label: 'Dividend Yield', value: fmt(sd.dividendYield, 'percent') },
    { label: 'EPS (TTM)', value: fmt(dks.trailingEps, 'currency') },
    { label: 'Beta', value: fmt(sd.beta, 'number') },
    {
      label: 'Volume',
      value: (sd.volume ?? sd.averageVolume ?? quote?.regularMarketVolume) !== undefined
        ? new Intl.NumberFormat('en-IN').format(
            Number(sd.volume ?? sd.averageVolume ?? quote?.regularMarketVolume)
          )
        : null,
    },
  ];

  const visible = stats.filter((s) => s.value !== null);

  if (visible.length === 0) return null;

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Key Statistics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {visible.map(({ label, value }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
