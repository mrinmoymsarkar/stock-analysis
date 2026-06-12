'use client';

import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { allocations } from '@/lib/portfolio';
import type { Holding, Quote } from '@/lib/portfolio';

// Chart palette — good contrast in both light and dark themes
const CHART_COLORS = [
  '#6366f1', // indigo-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#06b6d4', // cyan-500
  '#a855f7', // purple-500
];

function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

interface Props {
  holdings: Holding[];
  quotes: Record<string, Quote>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { key: string; percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { key, percent } = payload[0].payload;
  const value = payload[0].value;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground">{key}</p>
      <p className="text-muted-foreground">{formatted}</p>
      <p className="text-muted-foreground">{percent.toFixed(1)}%</p>
    </div>
  );
}

export default function AllocationChart({ holdings, quotes }: Props) {
  const [view, setView] = useState<'symbol' | 'type'>('symbol');

  const { bySymbol, byType } = allocations(holdings, quotes);
  const data = view === 'symbol' ? bySymbol : byType;

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
        No allocation data.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          <span className="group relative inline-flex items-center gap-0.5">Allocation</span>
        </h3>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            className={`px-3 py-1 transition-colors ${view === 'symbol' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            onClick={() => setView('symbol')}
          >
            By Stock
          </button>
          <button
            type="button"
            className={`px-3 py-1 transition-colors ${view === 'type' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-accent'}`}
            onClick={() => setView('type')}
          >
            By Type
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={entry.key} fill={getColor(index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
