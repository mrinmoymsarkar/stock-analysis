"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import useDebounce from '@/hooks/useDebounce';
import { Search, ExternalLink } from 'lucide-react';

interface SearchResult {
  symbol: string;
  longname?: string;
  shortname?: string;
  exchange: string;
  quoteType: string;
}

interface StockSearchProps {
  onSymbolSelect: (symbol: string) => void;
}

const QUOTE_TYPE_LABELS: Record<string, string> = {
  EQUITY: 'Stock',
  MUTUALFUND: 'Fund',
  INDEX: 'Index',
};

export default function StockSearch({ onSymbolSelect }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      setLoading(true);
      fetch(`/api/search?q=${debouncedQuery}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.error ? [] : data.data);
          setIsOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const handleSelect = (symbol: string) => {
    onSymbolSelect(symbol);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef]);

  return (
    <div className="relative w-full max-w-xs" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          placeholder="Search for a stock (e.g., INFY.NS)"
          className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
        />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && <div className="p-3 text-muted-foreground">Searching...</div>}
          {!loading && results.length === 0 && debouncedQuery && (
            <div className="p-3 text-muted-foreground">No results found.</div>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((result) => (
                <li
                  key={result.symbol}
                  className="px-4 py-2 hover:bg-accent border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelect(result.symbol)}
                      className="flex-1 text-left cursor-pointer min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">{result.symbol}</span>
                        {result.quoteType && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                            {QUOTE_TYPE_LABELS[result.quoteType] ?? result.quoteType}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {result.longname ?? result.shortname ?? ''}
                      </div>
                    </button>
                    <Link
                      href={`/stock/${encodeURIComponent(result.symbol)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={`View ${result.symbol} details`}
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
