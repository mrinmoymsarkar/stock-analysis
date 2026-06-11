'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quote: any;
  quoteType: string;
}

const QUOTE_TYPE_LABELS: Record<string, string> = {
  EQUITY: 'Stock',
  MUTUALFUND: 'Fund',
  INDEX: 'Index',
};

export default function StockHeader({ quote, quoteType }: StockHeaderProps) {
  const name: string = quote?.longName ?? quote?.shortName ?? quote?.symbol ?? '';
  const symbol: string = quote?.symbol ?? '';
  const exchange: string = quote?.fullExchangeName ?? quote?.exchange ?? '';
  const price: number | undefined =
    typeof quote?.regularMarketPrice === 'number' ? quote.regularMarketPrice : undefined;
  const change: number | undefined =
    typeof quote?.regularMarketChange === 'number' ? quote.regularMarketChange : undefined;
  const changePct: number | undefined =
    typeof quote?.regularMarketChangePercent === 'number'
      ? quote.regularMarketChangePercent
      : undefined;

  const up = (changePct ?? 0) >= 0;

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold text-foreground">{name || symbol}</h1>
        {exchange && (
          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
            {exchange}
          </span>
        )}
        <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
          {QUOTE_TYPE_LABELS[quoteType] ?? quoteType}
        </span>
      </div>
      {name && symbol && (
        <p className="text-sm text-muted-foreground font-mono">{symbol}</p>
      )}
      {price !== undefined && (
        <div className="flex items-baseline gap-3 mt-2">
          <span className="text-3xl font-bold text-foreground">
            ₹{price.toFixed(2)}
          </span>
          {changePct !== undefined && (
            <span
              className={`flex items-center text-base font-medium ${up ? 'text-green-600' : 'text-red-600'}`}
            >
              {up ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              {change !== undefined ? `₹${Math.abs(change).toFixed(2)} ` : ''}
              ({up ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
