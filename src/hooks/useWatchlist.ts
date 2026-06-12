"use client";

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_SYMBOLS, loadWatchlist, saveWatchlist } from '@/lib/watchlist';
import { sanitizeSymbols } from '@/lib/symbols';
import { useAuth } from '@/components/auth/AuthProvider';
import { createBrowserSupabase } from '@/lib/supabase/client';

interface UseWatchlistResult {
  symbols: string[];
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  hydrated: boolean;
}

async function fetchCloudWatchlist(userId: string): Promise<string[] | null> {
  const supabase = createBrowserSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('watchlists')
    .select('symbols')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  const syms = data.symbols;
  if (Array.isArray(syms) && syms.length > 0) return syms as string[];
  return null;
}

async function saveCloudWatchlist(userId: string, symbols: string[]): Promise<void> {
  const supabase = createBrowserSupabase();
  if (!supabase) return;
  await supabase
    .from('watchlists')
    .upsert({ user_id: userId, symbols, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

export default function useWatchlist(): UseWatchlistResult {
  // Start with defaults to avoid hydration mismatch; replace with stored value after mount
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Cloud mode: fetch from Supabase
      fetchCloudWatchlist(user.id).then((cloudSymbols) => {
        if (cloudSymbols) {
          setSymbols(cloudSymbols);
        } else {
          // No cloud watchlist yet — seed from localStorage
          const local = loadWatchlist();
          setSymbols(local);
          // Persist the local watchlist to the cloud
          saveCloudWatchlist(user.id, local);
        }
        setHydrated(true);
      });
    } else {
      // Guest mode: use localStorage
      setSymbols(loadWatchlist());
      setHydrated(true);
    }
  }, [user]);

  const add = useCallback((symbol: string) => {
    setSymbols(prev => {
      const next = sanitizeSymbols([...prev, symbol]);
      if (user) {
        saveCloudWatchlist(user.id, next);
      } else {
        saveWatchlist(next);
      }
      return next;
    });
  }, [user]);

  const remove = useCallback((symbol: string) => {
    setSymbols(prev => {
      const upper = symbol.toUpperCase();
      const next = prev.filter(s => s !== upper);
      if (user) {
        saveCloudWatchlist(user.id, next);
      } else {
        saveWatchlist(next);
      }
      return next;
    });
  }, [user]);

  return { symbols, add, remove, hydrated };
}
