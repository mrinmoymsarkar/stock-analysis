"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createBrowserSupabase } from '@/lib/supabase/client';
import type { Holding } from '@/lib/portfolio';

interface HoldingRow {
  id: string;
  user_id: string;
  symbol: string;
  name: string | null;
  quote_type: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  created_at: string;
}

interface AddHoldingInput {
  symbol: string;
  name?: string;
  quoteType?: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

interface UpdateHoldingInput {
  quantity?: number;
  buyPrice?: number;
  buyDate?: string;
}

interface UseHoldingsResult {
  holdings: Holding[];
  add: (input: AddHoldingInput) => Promise<void>;
  update: (id: string, input: UpdateHoldingInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  enabled: boolean;
}

function rowToHolding(row: HoldingRow): Holding {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name ?? undefined,
    quoteType: row.quote_type,
    quantity: Number(row.quantity),
    buyPrice: Number(row.buy_price),
    buyDate: row.buy_date,
  };
}

export default function useHoldings(): UseHoldingsResult {
  const { user, supabaseEnabled } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = supabaseEnabled && !!user;

  useEffect(() => {
    if (!enabled) {
      setHoldings([]);
      return;
    }

    const supabase = createBrowserSupabase();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    supabase
      .from('holdings')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError(err.message);
        } else {
          setHoldings((data as HoldingRow[]).map(rowToHolding));
        }
        setLoading(false);
      });
  }, [enabled, user]);

  const add = useCallback(
    async (input: AddHoldingInput) => {
      if (!enabled) return;
      const supabase = createBrowserSupabase();
      if (!supabase) return;

      const optimisticId = `opt-${Date.now()}`;
      const optimistic: Holding = {
        id: optimisticId,
        symbol: input.symbol,
        name: input.name,
        quoteType: input.quoteType ?? 'EQUITY',
        quantity: input.quantity,
        buyPrice: input.buyPrice,
        buyDate: input.buyDate,
      };

      // Optimistic update
      setHoldings((prev) => [...prev, optimistic]);
      setError(null);

      const { data, error: err } = await supabase
        .from('holdings')
        .insert({
          user_id: user!.id,
          symbol: input.symbol,
          name: input.name ?? null,
          quote_type: input.quoteType ?? 'EQUITY',
          quantity: input.quantity,
          buy_price: input.buyPrice,
          buy_date: input.buyDate,
        })
        .select('*')
        .single();

      if (err) {
        // Rollback
        setHoldings((prev) => prev.filter((h) => h.id !== optimisticId));
        setError(err.message);
      } else {
        // Replace optimistic with real row
        setHoldings((prev) =>
          prev.map((h) => (h.id === optimisticId ? rowToHolding(data as HoldingRow) : h))
        );
      }
    },
    [enabled, user]
  );

  const update = useCallback(
    async (id: string, input: UpdateHoldingInput) => {
      if (!enabled) return;
      const supabase = createBrowserSupabase();
      if (!supabase) return;

      const previous = holdings.find((h) => h.id === id);
      if (!previous) return;

      // Optimistic update
      setHoldings((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                quantity: input.quantity ?? h.quantity,
                buyPrice: input.buyPrice ?? h.buyPrice,
                buyDate: input.buyDate ?? h.buyDate,
              }
            : h
        )
      );
      setError(null);

      const updatePayload: Record<string, unknown> = {};
      if (input.quantity !== undefined) updatePayload.quantity = input.quantity;
      if (input.buyPrice !== undefined) updatePayload.buy_price = input.buyPrice;
      if (input.buyDate !== undefined) updatePayload.buy_date = input.buyDate;

      const { error: err } = await supabase
        .from('holdings')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user!.id);

      if (err) {
        // Rollback
        setHoldings((prev) => prev.map((h) => (h.id === id ? previous : h)));
        setError(err.message);
      }
    },
    [enabled, user, holdings]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!enabled) return;
      const supabase = createBrowserSupabase();
      if (!supabase) return;

      const previous = holdings.find((h) => h.id === id);
      if (!previous) return;

      // Optimistic remove
      setHoldings((prev) => prev.filter((h) => h.id !== id));
      setError(null);

      const { error: err } = await supabase
        .from('holdings')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (err) {
        // Rollback
        setHoldings((prev) => {
          const idx = prev.findIndex((h) => h.id > id);
          if (idx === -1) return [...prev, previous];
          const next = [...prev];
          next.splice(idx, 0, previous);
          return next;
        });
        setError(err.message);
      }
    },
    [enabled, user, holdings]
  );

  return { holdings, add, update, remove, loading, error, enabled };
}
