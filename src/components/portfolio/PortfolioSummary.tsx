'use client';

import React from 'react';
import MetricTooltip from '@/components/ui/MetricTooltip';
import type { PortfolioSummary as PortfolioSummaryData } from '@/lib/portfolio';

interface Props {
  summary: PortfolioSummaryData;
}

function formatINR(value: number, compact = false): string {
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e7) {
      return `₹${(value / 1e7).toFixed(2)}Cr`;
    }
    if (abs >= 1e5) {
      return `₹${(value / 1e5).toFixed(2)}L`;
    }
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null, digits = 2): string {
  if (value === null) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;
}

interface StatCardProps {
  label: string;
  tooltipTerm?: string;
  value: string;
  subValue?: string;
  colorClass?: string;
}

function StatCard({ label, tooltipTerm, value, subValue, colorClass }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {tooltipTerm ? (
          <MetricTooltip term={tooltipTerm}>{label}</MetricTooltip>
        ) : (
          label
        )}
      </span>
      <span className={`text-lg font-semibold tabular-nums ${colorClass ?? 'text-foreground'}`}>
        {value}
      </span>
      {subValue && (
        <span className={`text-sm tabular-nums ${colorClass ?? 'text-muted-foreground'}`}>
          {subValue}
        </span>
      )}
    </div>
  );
}

export default function PortfolioSummary({ summary }: Props) {
  const {
    totalInvested,
    currentValue,
    totalPnl,
    totalPnlPercent,
    dayChange,
    dayChangePercent,
    pricedLotCount,
    totalLotCount,
  } = summary;

  const pnlColor = totalPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const dayColor = dayChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

  const unpricedCount = totalLotCount - pricedLotCount;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Invested"
          tooltipTerm="Invested Value"
          value={formatINR(totalInvested, true)}
          subValue={formatINR(totalInvested)}
        />
        <StatCard
          label="Current Value"
          tooltipTerm="Current Value"
          value={formatINR(currentValue, true)}
          subValue={formatINR(currentValue)}
        />
        <StatCard
          label="Unrealized P&L"
          tooltipTerm="Unrealized P&L"
          value={formatINR(totalPnl, true)}
          subValue={formatPercent(totalPnlPercent)}
          colorClass={pnlColor}
        />
        <StatCard
          label="Day Change"
          tooltipTerm="Day Change"
          value={formatINR(dayChange, true)}
          subValue={formatPercent(dayChangePercent)}
          colorClass={dayColor}
        />
      </div>

      {unpricedCount > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {pricedLotCount} of {totalLotCount} lots priced — {unpricedCount} lot
          {unpricedCount !== 1 ? 's' : ''} without a live quote are excluded from P&amp;L.
        </p>
      )}
    </div>
  );
}
