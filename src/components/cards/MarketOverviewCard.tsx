import { ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

interface MarketOverviewCardProps {
  symbol: string;
  price?: number;
  change?: number;
  onClick?: (symbol: string) => void;
  onRemove?: () => void;
}

export default function MarketOverviewCard({ symbol, price, change, onClick, onRemove }: MarketOverviewCardProps) {
  const loading = price === undefined;
  const up = (change ?? 0) >= 0;

  return (
    <div
      onClick={() => !loading && onClick && onClick(symbol)}
      className={`relative p-4 bg-card text-foreground shadow rounded-lg flex flex-col gap-2 w-full transition-all hover:shadow-md hover:scale-105 ${
        onClick && !loading ? 'cursor-pointer' : ''
      }`}
    >
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-1 right-1 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label={`Remove ${symbol}`}
        >
          <X size={12} />
        </button>
      )}
      <span className="text-xs text-muted-foreground">{symbol}</span>
      {loading ? (
        <>
          <span className="h-7 w-20 bg-muted rounded animate-pulse" />
          <span className="h-4 w-14 bg-muted rounded animate-pulse" />
        </>
      ) : (
        <>
          <span className="text-xl font-semibold">₹{price!.toFixed(2)}</span>
          <span className={`flex items-center text-sm font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
            {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change!.toFixed(2)}%
          </span>
        </>
      )}
    </div>
  );
}
