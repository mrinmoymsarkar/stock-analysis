'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockSearch from '@/components/controls/StockSearch';

interface AddHoldingInput {
  symbol: string;
  name?: string;
  quoteType?: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: AddHoldingInput) => Promise<void>;
  prefillSymbol?: string;
  prefillName?: string;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddHoldingDialog({ open, onClose, onSubmit, prefillSymbol, prefillName }: Props) {
  const [symbol, setSymbol] = useState(prefillSymbol ?? '');
  const [name, setName] = useState(prefillName ?? '');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(todayStr());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset when opened/prefill changes
  useEffect(() => {
    if (open) {
      setSymbol(prefillSymbol ?? '');
      setName(prefillName ?? '');
      setQuantity('');
      setBuyPrice('');
      setBuyDate(todayStr());
      setErrors({});
      setServerError(null);
      setSubmitting(false);
    }
  }, [open, prefillSymbol, prefillName]);

  // Focus close button on open
  useEffect(() => {
    if (open) {
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!symbol.trim()) errs.symbol = 'Symbol is required.';
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) errs.quantity = 'Quantity must be a positive number.';
    const price = parseFloat(buyPrice);
    if (!buyPrice || isNaN(price) || price < 0) errs.buyPrice = 'Buy price must be 0 or greater.';
    if (!buyDate) {
      errs.buyDate = 'Buy date is required.';
    } else if (buyDate > todayStr()) {
      errs.buyDate = 'Buy date cannot be in the future.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await onSubmit({
        symbol: symbol.trim().toUpperCase(),
        name: name.trim() || undefined,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
        buyDate,
      });
      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to add holding.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-holding-title"
    >
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="add-holding-title" className="text-base font-semibold text-foreground">
            {prefillSymbol ? `Add Lot — ${prefillSymbol}` : 'Add Holding'}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="px-6 py-4 space-y-4">
            {/* Symbol */}
            {!prefillSymbol ? (
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Stock Symbol</label>
                <StockSearch
                  onSymbolSelect={(sym) => setSymbol(sym)}
                  className="max-w-full"
                />
                {symbol && (
                  <p className="text-xs text-muted-foreground">Selected: <strong>{symbol}</strong></p>
                )}
                {errors.symbol && <p className="text-xs text-red-500">{errors.symbol}</p>}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Stock Symbol</label>
                <p className="text-sm text-foreground font-semibold bg-muted px-3 py-2 rounded-md">{prefillSymbol}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-1">
              <label htmlFor="holding-qty" className="text-sm font-medium text-foreground">
                Quantity
              </label>
              <input
                id="holding-qty"
                type="number"
                min="0.001"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.quantity && <p className="text-xs text-red-500">{errors.quantity}</p>}
            </div>

            {/* Buy Price */}
            <div className="space-y-1">
              <label htmlFor="holding-price" className="text-sm font-medium text-foreground">
                Buy Price (₹)
              </label>
              <input
                id="holding-price"
                type="number"
                min="0"
                step="any"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="e.g. 2000.50"
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.buyPrice && <p className="text-xs text-red-500">{errors.buyPrice}</p>}
            </div>

            {/* Buy Date */}
            <div className="space-y-1">
              <label htmlFor="holding-date" className="text-sm font-medium text-foreground">
                Buy Date
              </label>
              <input
                id="holding-date"
                type="date"
                value={buyDate}
                max={todayStr()}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.buyDate && <p className="text-xs text-red-500">{errors.buyDate}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {serverError}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Adding…' : 'Add Holding'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
