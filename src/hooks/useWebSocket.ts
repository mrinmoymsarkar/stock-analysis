import { useEffect, useRef, useState, useCallback } from 'react';
import { WSMessage } from '@/types';
import { DEFAULT_SYMBOLS } from '@/lib/watchlist';
import { symbolsKey } from '@/lib/symbols';

interface UseWebSocketOptions {
  onMessage: (message: WSMessage) => void;
  fallbackToPolling?: boolean;
  pollingInterval?: number;
  symbols?: string[];
}

export default function useWebSocket(url: string, {
  onMessage,
  fallbackToPolling = true,
  pollingInterval = 30000,
  symbols,
}: UseWebSocketOptions) {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Stable callback identity — frozen on purpose (existing contract)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOnMessage = useCallback(onMessage, []);

  // Whether to skip WebSocket and poll directly (custom symbol set)
  const useCustomSymbols =
    symbols !== undefined &&
    symbolsKey(symbols) !== symbolsKey(DEFAULT_SYMBOLS);

  // Keep latest symbols in a ref so the polling closure reads the current set
  // without needing to be re-created. Updated inside an effect to satisfy lint.
  const symbolsRef = useRef<string[] | undefined>(symbols);
  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  const buildPollingUrl = useCallback(() => {
    const syms = symbolsRef.current;
    const isCustom =
      syms !== undefined && symbolsKey(syms) !== symbolsKey(DEFAULT_SYMBOLS);
    if (isCustom && syms) {
      return `/api/stocks/realtime?symbols=${encodeURIComponent(syms.join(','))}`;
    }
    return '/api/stocks/realtime';
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(async (immediate = false) => {
    if (!fallbackToPolling) return;
    if (pollingRef.current) {
      if (immediate) {
        try {
          const response = await fetch(buildPollingUrl());
          if (response.ok) {
            const data = await response.json();
            if (data.stocks) {
              setError(null);
              Object.entries(data.stocks).forEach(([symbol, stockData]) => {
                memoizedOnMessage({ symbol, data: stockData as WSMessage['data'], ts: Date.now() });
              });
            }
          }
        } catch { /* swallowed; handled in main poll */ }
      }
      return;
    }

    setIsPolling(true);

    const poll = async () => {
      try {
        const response = await fetch(buildPollingUrl());
        if (response.ok) {
          const data = await response.json();
          if (data.stocks) {
            setError(null);
            Object.entries(data.stocks).forEach(([symbol, stockData]) => {
              memoizedOnMessage({ symbol, data: stockData as WSMessage['data'], ts: Date.now() });
            });
          }
        } else {
          const body = await response.json().catch(() => null);
          setError(body?.error || `Data API returned ${response.status}`);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setError('Unable to reach the data API');
      }
    };

    pollingRef.current = setInterval(poll, pollingInterval);
    await poll();
  }, [fallbackToPolling, pollingInterval, memoizedOnMessage, buildPollingUrl]);

  // Restart polling when the symbol set changes (only while already polling)
  const prevSymbolsKeyRef = useRef<string | null>(null);
  const currentSymbolsKey = symbols !== undefined ? symbolsKey(symbols) : null;

  useEffect(() => {
    const keyChanged =
      currentSymbolsKey !== null &&
      prevSymbolsKeyRef.current !== null &&
      prevSymbolsKeyRef.current !== currentSymbolsKey;
    prevSymbolsKeyRef.current = currentSymbolsKey;

    if (keyChanged && pollingRef.current) {
      stopPolling();
      startPolling(true);
    }
  }, [currentSymbolsKey, stopPolling, startPolling]);

  useEffect(() => {
    if (useCustomSymbols) {
      // Skip WebSocket entirely for custom symbol sets
      startPolling(true);
      return () => stopPolling();
    }

    // Default path: try WebSocket first, fall back to polling
    try {
      ws.current = new WebSocket(url);
      ws.current.onopen = () => {
        setConnected(true);
        stopPolling();
      };
      ws.current.onclose = () => {
        setConnected(false);
        if (fallbackToPolling) startPolling();
      };
      ws.current.onerror = () => {
        setConnected(false);
        if (fallbackToPolling) startPolling();
      };
      ws.current.onmessage = (event) => {
        try {
          const json = JSON.parse(event.data);
          memoizedOnMessage(json);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      if (fallbackToPolling) startPolling();
    }

    return () => {
      ws.current?.close();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, useCustomSymbols]);

  return { connected: connected || isPolling, isPolling, error };
}
