"use client";

import Link from 'next/link';
import { X, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StockSearch from '@/components/controls/StockSearch';
import { StockData } from '@/types';

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// These appear in the IndexStrip; do not repeat them in the watchlist
const STRIP_INDICES = new Set(['^NSEI', '^BSESN']);

interface WatchlistPanelProps {
  symbols: string[];
  stocks: Record<string, StockData>;
  activeSymbol: string;
  onSetActive: (symbol: string) => void;
  onRemove: (symbol: string) => void;
  onSymbolSelect: (symbol: string) => void;
}

export default function WatchlistPanel({
  symbols,
  stocks,
  activeSymbol,
  onSetActive,
  onRemove,
  onSymbolSelect,
}: WatchlistPanelProps) {
  // Filter out the two pinned indices — they're shown in IndexStrip
  const listSymbols = symbols.filter((s) => !STRIP_INDICES.has(s));

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col min-h-[420px]">
      {/* Panel header */}
      <div className="px-3 pt-3 pb-2 border-b border-border flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground shrink-0">Watchlist</h2>
        <StockSearch
          onSymbolSelect={onSymbolSelect}
          className="flex-1 min-w-0"
        />
      </div>

      {/* Scrollable symbol list */}
      <div className="flex-1 overflow-y-auto">
        {listSymbols.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">Your watchlist is empty.</p>
            <p className="text-xs text-muted-foreground">
              Use the search box above to add stocks.
            </p>
          </div>
        ) : (
          <ul role="list">
            {listSymbols.map((symbol) => {
              const data = stocks[symbol];
              const isActive = symbol === activeSymbol;
              const up = (data?.regularMarketChangePercent ?? 0) >= 0;

              return (
                <li key={symbol}>
                  <div
                    className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                      isActive
                        ? 'bg-muted'
                        : 'hover:bg-muted/60'
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSetActive(symbol)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSetActive(symbol);
                      }
                    }}
                    aria-pressed={isActive}
                    aria-label={`Select ${symbol}`}
                  >
                    {/* Symbol + change */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-semibold text-foreground truncate leading-tight">
                        {symbol}
                      </span>
                      {data ? (
                        <span
                          className={`flex items-center gap-0.5 text-xs tabular-nums font-medium ${
                            up ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {up
                            ? <ArrowUpRight size={10} aria-hidden="true" />
                            : <ArrowDownRight size={10} aria-hidden="true" />
                          }
                          {Math.abs(data.regularMarketChangePercent).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="h-3 w-10 bg-muted rounded animate-pulse mt-0.5 inline-block" />
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      {data ? (
                        <span className="text-xs font-medium tabular-nums text-foreground">
                          ₹{INR.format(data.regularMarketPrice)}
                        </span>
                      ) : (
                        <span className="h-3 w-14 bg-muted rounded animate-pulse inline-block" />
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Link
                        href={`/stock/${encodeURIComponent(symbol)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title={`View ${symbol} details`}
                        aria-label={`View ${symbol} details`}
                      >
                        <ExternalLink size={11} aria-hidden="true" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(symbol);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-red-600 hover:bg-accent transition-colors"
                        title={`Remove ${symbol}`}
                        aria-label={`Remove ${symbol}`}
                      >
                        <X size={11} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
