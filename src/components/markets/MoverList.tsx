'use client';

import Link from 'next/link';
import { MarketMover } from '@/services/markets';

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const VOL = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

interface MoverListProps {
  title: string;
  items: MarketMover[];
  showVolume?: boolean;
}

export default function MoverList({ title, items, showVolume = false }: MoverListProps) {
  return (
    <div className="bg-card border border-border rounded-lg flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-8 px-4 text-sm text-muted-foreground">
          No data available
        </div>
      ) : (
        <ul role="list" className="divide-y divide-border">
          {items.map((item) => {
            const up = item.changePercent >= 0;
            return (
              <li key={item.symbol}>
                <Link
                  href={`/stock/${encodeURIComponent(item.symbol)}`}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-muted/60 transition-colors"
                >
                  {/* Symbol + name */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold text-foreground truncate leading-tight">
                      {item.symbol.replace(/\.(NS|BO)$/, '')}
                    </span>
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {item.shortName}
                    </span>
                  </div>

                  {/* Volume (optional) */}
                  {showVolume && item.volume != null && (
                    <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                      {VOL.format(item.volume)}
                    </span>
                  )}

                  {/* Price + change */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-medium tabular-nums text-foreground">
                      ₹{INR.format(item.price)}
                    </span>
                    <span
                      className={`text-xs tabular-nums font-medium ${
                        up ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {up ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
