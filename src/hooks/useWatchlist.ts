"use client";

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SYMBOLS, loadWatchlist, saveWatchlist } from '@/lib/watchlist';
import { sanitizeSymbols } from '@/lib/symbols';

interface UseWatchlistResult {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  hydrated: boolean;
}

export default function useWatchlist(): UseWatchlistResult {
  // Start with defaults to avoid hydration mismatch; replace with stored value after mount
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSymbols(loadWatchlist());
    setHydrated(true);
  }, []);

  const add = useCallback((symbol: string) => {
    setSymbols(prev => {
      const next = sanitizeSymbols([...prev, symbol]);
      saveWatchlist(next);
      return next;
    });
  }, []);

  const remove = useCallback((symbol: string) => {
    setSymbols(prev => {
      const upper = symbol.toUpperCase();
      const next = prev.filter(s => s !== upper);
      saveWatchlist(next);
      return next;
    });
  }, []);

  return { symbols, add, remove, hydrated };
}
