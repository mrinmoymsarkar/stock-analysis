'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import useHoldings from '@/hooks/useHoldings';
import useWebSocket from '@/hooks/useWebSocket';
import PortfolioSummary from '@/components/portfolio/PortfolioSummary';
import HoldingsTable from '@/components/portfolio/HoldingsTable';
import AllocationChart from '@/components/portfolio/AllocationChart';
import AddHoldingDialog from '@/components/portfolio/AddHoldingDialog';
import { portfolioSummary } from '@/lib/portfolio';
import type { Quote } from '@/lib/portfolio';
import type { WSMessage, StockData } from '@/types';

export default function PortfolioPage() {
  const { user, loading: authLoading, supabaseEnabled } = useAuth();
  const { holdings, add, remove, loading: holdingsLoading, enabled } = useHoldings();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [prefillSymbol, setPrefillSymbol] = useState<string | undefined>();
  const [prefillName, setPrefillName] = useState<string | undefined>();

  // Distinct symbols from holdings for live quotes
  const symbols = useMemo(
    () => [...new Set(holdings.map((h) => h.symbol))],
    [holdings]
  );

  const handleMessage = useCallback((message: WSMessage) => {
    const { symbol, data } = message;
    if (symbol && data && typeof (data as StockData).regularMarketPrice === 'number') {
      const stock = data as StockData;
      setQuotes((prev) => ({
        ...prev,
        [symbol]: {
          price: stock.regularMarketPrice,
          changePercent: stock.regularMarketChangePercent,
        },
      }));
    }
  }, []);

  // Only wire WebSocket when there are holdings to track
  useWebSocket('ws://localhost:4000', {
    onMessage: handleMessage,
    fallbackToPolling: true,
    pollingInterval: 30000,
    symbols: symbols.length > 0 ? symbols : undefined,
  });

  const openAddDialog = useCallback((symbol?: string, name?: string) => {
    setPrefillSymbol(symbol);
    setPrefillName(name);
    setDialogOpen(true);
  }, []);

  const handleAddSubmit = useCallback(async (input: Parameters<typeof add>[0]) => {
    await add(input);
  }, [add]);

  const summary = useMemo(() => portfolioSummary(holdings, quotes), [holdings, quotes]);

  // ─── Auth states ─────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading…</p>
      </div>
    );
  }

  // State (a): Supabase not configured
  if (!supabaseEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center space-y-4">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold text-foreground">Authentication Not Configured</h1>
          <p className="text-sm text-muted-foreground">
            The portfolio tracker requires Supabase authentication. To enable it, set
            <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs font-mono">NEXT_PUBLIC_SUPABASE_URL</code>
            and
            <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            in your environment.
          </p>
          <p className="text-sm text-muted-foreground">
            See the{' '}
            <Link href="/deployment" className="text-primary hover:underline">
              deployment guide
            </Link>{' '}
            for detailed setup instructions.
          </p>
        </div>
      </div>
    );
  }

  // State (b): configured but not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full text-center space-y-4">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-semibold text-foreground">Sign in to view your Portfolio</h1>
          <p className="text-sm text-muted-foreground">
            Your portfolio is securely stored in the cloud. Sign in to access your holdings and track performance.
          </p>
          <Button asChild>
            <Link href="/login?next=/portfolio">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  // State (c): signed in
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
            {holdingsLoading && (
              <p className="text-sm text-muted-foreground mt-0.5">Loading holdings…</p>
            )}
          </div>
          <Button size="sm" onClick={() => openAddDialog()}>
            <Plus size={16} className="mr-1.5" />
            Add Holding
          </Button>
        </div>

        {/* Empty state */}
        {!holdingsLoading && holdings.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">No holdings yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Start tracking your Indian stock portfolio by adding your first holding.
            </p>
            <Button onClick={() => openAddDialog()}>
              <Plus size={16} className="mr-1.5" />
              Add Your First Holding
            </Button>
          </div>
        )}

        {/* Summary + table + chart */}
        {holdings.length > 0 && (
          <>
            <PortfolioSummary summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
              <HoldingsTable
                holdings={holdings}
                quotes={quotes}
                onAddLot={openAddDialog}
                onRemoveLot={remove}
              />
              <AllocationChart holdings={holdings} quotes={quotes} />
            </div>
          </>
        )}
      </main>

      <AddHoldingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleAddSubmit}
        prefillSymbol={prefillSymbol}
        prefillName={prefillName}
      />
    </div>
  );
}
