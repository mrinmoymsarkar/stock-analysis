"use client";

import Link from 'next/link';
import { ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import PriceChart from '@/components/charts/PriceChart';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import AddToWatchlistButton from '@/components/cards/AddToWatchlistButton';
import { StockData } from '@/types';

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface ChartData {
  date: string;
  price: number;
}

interface ChartPanelProps {
  activeSymbol: string;
  stocks: Record<string, StockData>;
  range: string;
  setRange: (range: string) => void;
  chartData: ChartData[];
  chartLoading: boolean;
  chartError: string | null;
  symbols: string[];
  onAdd: (symbol: string) => void;
}

const SYMBOL_DISPLAY: Record<string, string> = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'SENSEX',
};

function symbolDisplay(symbol: string): string {
  return SYMBOL_DISPLAY[symbol] ?? symbol;
}

export default function ChartPanel({
  activeSymbol,
  stocks,
  range,
  setRange,
  chartData,
  chartLoading,
  chartError,
  symbols,
  onAdd,
}: ChartPanelProps) {
  const liveData = activeSymbol ? stocks[activeSymbol] : undefined;
  const up = (liveData?.regularMarketChangePercent ?? 0) >= 0;
  const inWatchlist = symbols.includes(activeSymbol);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col min-h-[420px]">
      {/* Header row */}
      <div className="px-4 pt-4 pb-3 border-b border-border flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-0.5 min-w-0">
          {activeSymbol ? (
            <>
              <h2 className="text-base font-semibold text-foreground leading-tight">
                {symbolDisplay(activeSymbol)}
                <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                  {activeSymbol}
                </span>
              </h2>
              {liveData ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums text-foreground">
                    ₹{INR.format(liveData.regularMarketPrice)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 text-sm font-medium tabular-nums ${
                      up ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {up ? <ArrowUpRight size={14} aria-hidden="true" /> : <ArrowDownRight size={14} aria-hidden="true" />}
                    {Math.abs(liveData.regularMarketChangePercent).toFixed(2)}%
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="h-7 w-28 bg-muted rounded animate-pulse inline-block" />
                  <span className="h-4 w-16 bg-muted rounded animate-pulse inline-block" />
                </div>
              )}
            </>
          ) : (
            <h2 className="text-base font-semibold text-muted-foreground">Select a symbol</h2>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {activeSymbol && !inWatchlist && (
            <AddToWatchlistButton symbol={activeSymbol} inWatchlist={false} onAdd={onAdd} />
          )}
          {activeSymbol && (
            <Link
              href={`/stock/${encodeURIComponent(activeSymbol)}`}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border rounded-md px-2.5 py-1.5"
            >
              View details
              <ExternalLink size={12} aria-hidden="true" />
            </Link>
          )}
          <TimeRangeSelector selectedRange={range} onSelectRange={setRange} />
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 px-1 pb-2 pt-1">
        {chartLoading && (
          <div className="h-[350px] flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Loading chart…</span>
          </div>
        )}
        {!chartLoading && chartError && (
          <div className="h-[350px] flex items-center justify-center">
            <span className="text-sm text-red-500">{chartError}</span>
          </div>
        )}
        {!chartLoading && !chartError && chartData.length > 0 && (
          <PriceChart data={chartData} />
        )}
        {!activeSymbol && !chartLoading && (
          <div className="h-[350px] flex items-center justify-center text-center px-4">
            <p className="text-sm text-muted-foreground">
              Search for a stock or click a symbol in the watchlist to view its chart.
            </p>
          </div>
        )}
        {activeSymbol && !chartLoading && !chartError && chartData.length === 0 && (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No chart data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
