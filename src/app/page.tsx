"use client";

import { useCallback, useEffect, useState } from 'react';
import useWebSocket from '@/hooks/useWebSocket';
import useWatchlist from '@/hooks/useWatchlist';
import useHistoricalData from '@/hooks/useHistoricalData';
import IndexStrip from '@/components/dashboard/IndexStrip';
import ChartPanel from '@/components/dashboard/ChartPanel';
import WatchlistPanel from '@/components/dashboard/WatchlistPanel';
import NewsTeaser from '@/components/dashboard/NewsTeaser';
import { StockData, WSMessage } from '@/types';

export default function Home() {
  const { symbols, add, remove, hydrated } = useWatchlist();
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [activeSymbol, setActiveSymbol] = useState<string>('');

  const handleMessage = useCallback((message: WSMessage) => {
    const { symbol, data } = message;
    if (symbol && data && typeof (data as StockData).regularMarketPrice === 'number') {
      setStocks(prev => ({ ...prev, [symbol]: data as StockData }));
    }
  }, []);

  // Default the chart to Nifty 50 when available (instead of whichever
  // quote happens to arrive first), falling back to the first watchlist entry.
  useEffect(() => {
    if (hydrated && !activeSymbol && symbols.length > 0) {
      setActiveSymbol(symbols.includes('^NSEI') ? '^NSEI' : symbols[0]);
    }
  }, [hydrated, activeSymbol, symbols]);

  const { connected, isPolling } = useWebSocket('ws://localhost:4000', {
    onMessage: handleMessage,
    fallbackToPolling: true,
    pollingInterval: 30000,
    symbols: hydrated ? symbols : undefined,
  });

  const [range, setRange] = useState('1mo');
  const { data: chartData, loading: chartLoading, error: chartError } = useHistoricalData(activeSymbol, range);

  const handleSymbolSelect = useCallback((symbol: string) => {
    add(symbol);
    setActiveSymbol(symbol);
  }, [add]);

  const handleRemove = useCallback((symbol: string) => {
    remove(symbol);
    setActiveSymbol(prev => (prev === symbol ? '' : prev));
    setStocks(prev => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  }, [remove]);

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Slim index strip */}
      <IndexStrip
        stocks={stocks}
        onSetActive={setActiveSymbol}
        connected={connected}
        isPolling={isPolling}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {/* Main two-column grid: chart (left) + watchlist (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
          <ChartPanel
            activeSymbol={activeSymbol}
            stocks={stocks}
            range={range}
            setRange={setRange}
            chartData={chartData}
            chartLoading={chartLoading}
            chartError={chartError}
            symbols={symbols}
            onAdd={add}
          />
          <WatchlistPanel
            symbols={symbols}
            stocks={stocks}
            activeSymbol={activeSymbol}
            onSetActive={setActiveSymbol}
            onRemove={handleRemove}
            onSymbolSelect={handleSymbolSelect}
          />
        </div>

        {/* News teaser strip */}
        <NewsTeaser />
      </main>
    </div>
  );
}
