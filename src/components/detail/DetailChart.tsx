'use client';

import { useState } from 'react';
import useHistoricalData from '@/hooks/useHistoricalData';
import PriceChart from '@/components/charts/PriceChart';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector';

interface DetailChartProps {
  symbol: string;
}

export default function DetailChart({ symbol }: DetailChartProps) {
  const [range, setRange] = useState('1mo');
  const { data: chartData, loading: chartLoading, error: chartError } = useHistoricalData(symbol, range);

  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">Price Chart</h2>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex justify-end mb-4">
          <TimeRangeSelector selectedRange={range} onSelectRange={setRange} />
        </div>
        {chartLoading && (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading chart...</p>
          </div>
        )}
        {chartError && (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-destructive">{chartError}</p>
          </div>
        )}
        {!chartLoading && !chartError && chartData.length > 0 && (
          <PriceChart data={chartData} />
        )}
        {!chartLoading && !chartError && chartData.length === 0 && (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-muted-foreground">No chart data available for this range.</p>
          </div>
        )}
      </div>
    </section>
  );
}
