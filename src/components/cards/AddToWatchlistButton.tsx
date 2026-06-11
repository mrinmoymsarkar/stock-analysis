"use client";

import { Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddToWatchlistButtonProps {
  symbol: string;
  inWatchlist: boolean;
  onAdd: (symbol: string) => void;
}

export default function AddToWatchlistButton({ symbol, inWatchlist, onAdd }: AddToWatchlistButtonProps) {
  if (inWatchlist) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1 text-xs">
        <Check size={14} />
        In watchlist
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onAdd(symbol)}
      className="gap-1 text-xs"
    >
      <Plus size={14} />
      Add to watchlist
    </Button>
  );
}
