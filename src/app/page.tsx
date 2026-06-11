"use client";

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import useWebSocket from '@/hooks/useWebSocket';
import useWatchlist from '@/hooks/useWatchlist';
import useHistoricalData from '@/hooks/useHistoricalData';
import MarketOverviewCard from '@/components/cards/MarketOverviewCard';
import AddToWatchlistButton from '@/components/cards/AddToWatchlistButton';
import PriceChart from '@/components/charts/PriceChart';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';
import StockSearch from '@/components/controls/StockSearch';
import { StockData, WSMessage } from '@/types';

export default function Home() {
  const { symbols, add, remove, hydrated } = useWatchlist();
  const [stocks, setStocks] = useState<Record<string, StockData>>({});
  const [activeSymbol, setActiveSymbol] = useState<string>('');

  const handleMessage = useCallback((message: WSMessage) => {
    const { symbol, data } = message;
    if (symbol && data && typeof (data as StockData).regularMarketPrice === 'number') {
      setStocks(prev => ({ ...prev, [symbol]: data as StockData }));
      setActiveSymbol(prev => prev || symbol);
    }
  }, []);

  const { connected, isPolling, error: dataError } = useWebSocket('ws://localhost:4000', {
    onMessage: handleMessage,
    fallbackToPolling: true,
    pollingInterval: 30000,
    symbols: hydrated ? symbols : undefined,
  });

  const [range, setRange] = useState('1mo');
  const { data: chartData, loading: chartLoading, error: chartError } = useHistoricalData(activeSymbol, range);

  const getConnectionStatus = () => {
    if (connected && !isPolling) return { text: 'WebSocket Connected', color: 'text-green-600' };
    if (connected && isPolling) return { text: 'Polling Mode', color: 'text-yellow-600' };
    return { text: 'Disconnected', color: 'text-red-600' };
  };

  const connectionStatus = getConnectionStatus();

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
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex-1 flex justify-start">
            <StockSearch onSymbolSelect={handleSymbolSelect} />
          </div>
          <div className="text-sm font-medium shrink-0">
            <span className="text-muted-foreground">Status: </span>
            <span className={connectionStatus.color}>{connectionStatus.text}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {symbols.length > 0 ? (
              symbols.map(symbol => (
                <div key={symbol} className="relative group">
                  <MarketOverviewCard
                    symbol={symbol}
                    price={stocks[symbol]?.regularMarketPrice}
                    change={stocks[symbol]?.regularMarketChangePercent}
                    onClick={setActiveSymbol}
                    onRemove={() => handleRemove(symbol)}
                  />
                  <Link
                    href={`/stock/${encodeURIComponent(symbol)}`}
                    className="absolute bottom-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-foreground"
                    title={`View ${symbol} details`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} />
                  </Link>
                </div>
              ))
            ) : dataError ? (
              <p className="col-span-full text-center text-red-500 py-10">
                Market data unavailable: {dataError}. Retrying automatically...
              </p>
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground mb-2">Your watchlist is empty.</p>
                <p className="text-sm text-muted-foreground">Use the search bar above to add stocks.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <h2 className="text-2xl font-semibold">
              {activeSymbol ? `Chart: ${activeSymbol}` : 'Chart'}
            </h2>
            <div className="flex items-center gap-2">
              {activeSymbol && (
                <>
                  <Link
                    href={`/stock/${encodeURIComponent(activeSymbol)}`}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    View details
                    <ExternalLink size={13} />
                  </Link>
                  <AddToWatchlistButton
                    symbol={activeSymbol}
                    inWatchlist={symbols.includes(activeSymbol)}
                    onAdd={add}
                  />
                </>
              )}
            </div>
          </div>

          <div className="w-full bg-card p-4 rounded-lg shadow">
            <div className="flex justify-end mb-4">
              <TimeRangeSelector selectedRange={range} onSelectRange={setRange} />
            </div>
            {chartLoading && (
              <div className="h-[350px] flex items-center justify-center">
                <p>Loading chart...</p>
              </div>
            )}
            {chartError && (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-red-500">{chartError}</p>
              </div>
            )}
            {!chartLoading && !chartError && chartData.length > 0 && (
              <PriceChart data={chartData} />
            )}
            {!activeSymbol && !chartLoading && (
              <div className="h-[350px] flex items-center justify-center">
                <p className="text-muted-foreground">Search for a stock or select one from above to see its chart.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
