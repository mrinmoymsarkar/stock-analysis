'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aggregateBySymbol } from '@/lib/portfolio';
import type { Holding, Quote } from '@/lib/portfolio';

interface Props {
  holdings: Holding[];
  quotes: Record<string, Quote>;
  onAddLot: (symbol: string, name?: string) => void;
  onRemoveLot: (id: string) => void;
}

function formatINR(value: number | undefined, compact = false): string {
  if (value === undefined) return '—';
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)}Cr`;
    if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNum(value: number | undefined, decimals = 2): string {
  if (value === undefined) return '—';
  return value.toFixed(decimals);
}

function PnlCell({ value, percent }: { value: number | undefined; percent: number | undefined }) {
  if (value === undefined) return <span className="text-muted-foreground">—</span>;
  const colorClass = value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  return (
    <span className={`tabular-nums font-medium ${colorClass}`}>
      {formatINR(value, true)}
      {percent !== undefined && (
        <span className="block text-xs">
          {value >= 0 ? '+' : ''}{percent.toFixed(2)}%
        </span>
      )}
    </span>
  );
}

function DayCell({ value }: { value: number | undefined }) {
  if (value === undefined) return <span className="text-muted-foreground">—</span>;
  const colorClass = value >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  return <span className={`tabular-nums ${colorClass}`}>{value >= 0 ? '+' : ''}{value.toFixed(2)}%</span>;
}

export default function HoldingsTable({ holdings, quotes, onAddLot, onRemoveLot }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const aggregates = aggregateBySymbol(holdings, quotes);

  // Build a map from symbol → lots for expanded view
  const lotsBySymbol = holdings.reduce<Record<string, Holding[]>>((acc, h) => {
    if (!acc[h.symbol]) acc[h.symbol] = [];
    acc[h.symbol].push(h);
    return acc;
  }, {});

  const toggleExpand = (symbol: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  if (aggregates.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
        No holdings yet.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8"></th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Symbol</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Avg Buy</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">LTP</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Day %</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Invested</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Current</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">P&amp;L</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {aggregates.map((agg) => {
              const quote = quotes[agg.symbol];
              const isExpanded = expanded.has(agg.symbol);
              const lots = lotsBySymbol[agg.symbol] ?? [];
              return (
                <React.Fragment key={agg.symbol}>
                  <tr className="hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      {lots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(agg.symbol)}
                          className="text-muted-foreground hover:text-foreground"
                          aria-label={isExpanded ? 'Collapse lots' : 'Expand lots'}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/stock/${encodeURIComponent(agg.symbol)}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {agg.symbol}
                      </Link>
                      {lots.length > 1 && (
                        <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                          {lots.length} lots
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{agg.totalQty}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(agg.avgBuyPrice)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {quote ? formatINR(quote.price) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DayCell value={quote?.changePercent} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(agg.invested, true)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatINR(agg.currentValue, true)}</td>
                    <td className="px-4 py-3 text-right">
                      <PnlCell value={agg.unrealizedPnl} percent={agg.pnlPercent} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onAddLot(agg.symbol, lots[0]?.name)}
                        title="Add lot"
                      >
                        <Plus size={14} />
                      </Button>
                    </td>
                  </tr>
                  {isExpanded && lots.map((lot) => (
                    <tr key={lot.id} className="bg-muted/20 text-xs">
                      <td className="pl-8 py-2"></td>
                      <td className="px-4 py-2 text-muted-foreground">Lot {lot.buyDate}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{lot.quantity}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{formatINR(lot.buyPrice)}</td>
                      <td colSpan={4} />
                      <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                        {formatINR(lot.quantity * lot.buyPrice, true)}
                      </td>
                      <td colSpan={1} />
                      <td className="px-4 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onRemoveLot(lot.id)}
                          title="Delete lot"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-border">
        {aggregates.map((agg) => {
          const quote = quotes[agg.symbol];
          const lots = lotsBySymbol[agg.symbol] ?? [];
          const isExpanded = expanded.has(agg.symbol);
          return (
            <div key={agg.symbol} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/stock/${encodeURIComponent(agg.symbol)}`}
                    className="font-semibold text-foreground hover:text-primary text-base"
                  >
                    {agg.symbol}
                  </Link>
                  {lots.length > 1 && (
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      {lots.length} lots
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onAddLot(agg.symbol, lots[0]?.name)}>
                    <Plus size={14} />
                  </Button>
                  {lots.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleExpand(agg.symbol)}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Qty</div>
                  <div className="tabular-nums font-medium">{agg.totalQty}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg Buy</div>
                  <div className="tabular-nums">{formatINR(agg.avgBuyPrice, true)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">LTP</div>
                  <div className="tabular-nums">{quote ? formatINR(quote.price, true) : '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Invested</div>
                  <div className="tabular-nums">{formatINR(agg.invested, true)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="tabular-nums">{formatINR(agg.currentValue, true)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">P&amp;L</div>
                  <PnlCell value={agg.unrealizedPnl} percent={agg.pnlPercent} />
                </div>
              </div>
              {isExpanded && lots.map((lot) => (
                <div key={lot.id} className="pl-4 flex items-center justify-between text-xs text-muted-foreground border-l-2 border-border">
                  <span>{lot.buyDate} · {lot.quantity} @ {formatINR(lot.buyPrice, true)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onRemoveLot(lot.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
