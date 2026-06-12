"use client";

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StockData } from '@/types';

const PINNED_INDICES = [
  { symbol: '^NSEI', label: 'NIFTY 50' },
  { symbol: '^BSESN', label: 'SENSEX' },
] as const;

const INR = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface IndexStripProps {
  stocks: Record<string, StockData>;
  onSetActive: (symbol: string) => void;
  connected: boolean;
  isPolling: boolean;
}

function StatusDot({ connected, isPolling }: { connected: boolean; isPolling: boolean }) {
  let dotClass: string;
  let statusText: string;
  let title: string;

  if (connected && !isPolling) {
    dotClass = 'bg-green-500';
    statusText = 'Live';
    title = 'WebSocket Connected';
  } else if (connected && isPolling) {
    dotClass = 'bg-yellow-500';
    statusText = 'Polling';
    title = 'Polling Mode';
  } else {
    dotClass = 'bg-red-500';
    statusText = 'Offline';
    title = 'Disconnected';
  }

  return (
    <span className="flex items-center gap-1.5" title={title}>
      <span
        className={`inline-block w-2 h-2 rounded-full shrink-0 ${dotClass}`}
        aria-hidden="true"
      />
      <span className="hidden sm:inline text-xs text-muted-foreground">{statusText}</span>
    </span>
  );
}

export default function IndexStrip({ stocks, onSetActive, connected, isPolling }: IndexStripProps) {
  const visibleIndices = PINNED_INDICES.filter(({ symbol }) => stocks[symbol] !== undefined);

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-10 gap-4">
          {/* Index cells */}
          <div className="flex items-center gap-6">
            {PINNED_INDICES.map(({ symbol, label }) => {
              const data = stocks[symbol];
              if (!data) return null;
              const up = data.regularMarketChangePercent >= 0;
              return (
                <button
                  key={symbol}
                  onClick={() => onSetActive(symbol)}
                  className="flex items-center gap-2 text-sm hover:opacity-75 transition-opacity"
                  aria-label={`Select ${label}`}
                >
                  <span className="font-semibold text-foreground">{label}</span>
                  <span className="tabular-nums font-medium text-foreground">
                    {INR.format(data.regularMarketPrice)}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 tabular-nums text-xs font-medium ${
                      up ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {up ? <ArrowUpRight size={12} aria-hidden="true" /> : <ArrowDownRight size={12} aria-hidden="true" />}
                    {Math.abs(data.regularMarketChangePercent).toFixed(2)}%
                  </span>
                </button>
              );
            })}
            {visibleIndices.length === 0 && (
              <span className="text-xs text-muted-foreground">Loading indices…</span>
            )}
          </div>

          {/* Status dot */}
          <StatusDot connected={connected} isPolling={isPolling} />
        </div>
      </div>
    </div>
  );
}
