# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Indian stock market dashboard (NSE/BSE stocks, Nifty 50, Sensex) built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and Recharts. Data comes from Yahoo Finance via the `yahoo-finance2` library.

## Commands

```bash
npm run dev      # Next.js dev server (Turbopack is the default in 16) (http://localhost:3000)
npm run ws       # Standalone WebSocket server on ws://localhost:4000 (real-time data; optional)
npm run build    # Production build
npm run lint     # ESLint (eslint .)
npm test         # Run all Jest tests
npx jest src/hooks/__tests__/useWebSocket.test.ts          # Run a single test file
npx jest -t "test name"                                     # Run tests matching a name
```

Tests use Jest + jsdom + React Testing Library (`jest-websocket-mock` for WebSocket tests). Test files live in `__tests__/` directories next to the code they test. Note: `jest.config.ts` defines `moduleNameMapper` entries only for `@/components`, `@/hooks`, `@/types`, and `@/services` — add a mapping there if a test imports from another `@/` path.

## Architecture

### Two real-time data paths (WebSocket with polling fallback)

The core architectural feature is dual-mode real-time data delivery, handled by `src/hooks/useWebSocket.ts`:

1. **WebSocket mode (local dev)**: `ws-server.ts` (repo root, run via `npm run ws`, compiled with `tsconfig.ws.json`) is a standalone Node server. It fetches quotes for a hardcoded list of Indian symbols every 60s, caches the latest quote per symbol, broadcasts to all clients, and replays the cache to newly connected clients.
2. **Polling fallback (Vercel/production)**: when the WebSocket connection fails or closes, the hook automatically polls `GET /api/stocks/realtime` every 30s. Vercel cannot host the WebSocket server, so production always runs in polling mode — no configuration needed.

The hook reports `{ connected, isPolling }`; the header in `src/app/page.tsx` displays this as "WebSocket Connected" / "Polling Mode" / "Disconnected".

The default symbol list is single-sourced in `src/lib/watchlist.ts` (`DEFAULT_SYMBOLS`). Both `ws-server.ts` and `src/app/api/stocks/realtime/route.ts` import from there — no more duplication. The realtime route accepts an optional `?symbols=SYM1,SYM2,...` query parameter so each client can poll for its own watchlist; absent/empty falls back to `DEFAULT_SYMBOLS`. Both paths push only `{ regularMarketPrice, regularMarketChangePercent }` per symbol, wrapped in the `WSMessage` shape (`src/types/index.ts`).

### Data flow

- `src/services/yahooFinance.ts` is the single wrapper around `yahoo-finance2` (`getQuote`, `getHistorical`, `getSummary`, `search`). All server-side data access goes through it — both the API routes and `ws-server.ts`.
- API routes (`src/app/api/`):
  - `quote/route.ts` — multiplexes via `?type=quote|historical|summary` (historical takes `&range=`)
  - `search/route.ts` — Yahoo search filtered to Indian equities only (`.NS`/`.BO` suffixes)
  - `stocks/realtime/route.ts` — batch quotes for the polling fallback. Accepts optional `?symbols=` query param; defaults to `DEFAULT_SYMBOLS` from `src/lib/watchlist.ts`. Uses a per-symbol `Map` cache (60s TTL) with per-batch in-flight dedup. Fetches only stale/missing symbols in one batched `getQuotes` call. Serves stale entries on upstream failure; returns 502 only when nothing is cached for the requested set.
- Client hooks fetch from these routes: `useHistoricalData` (chart data via `/api/quote?type=historical`), `useDebounce` (used by `StockSearch`).
- `src/app/page.tsx` is a single client component holding all page state: a `Record<symbol, StockData>` updated by incoming messages, and an `activeSymbol` that drives the chart. The first symbol to arrive becomes the active chart symbol.

### Theming

Dark/light mode uses `next-themes` (`ThemeProvider`/`ThemeToggle` in `src/components/`) with Tailwind CSS variables (`bg-background`, `text-foreground`, `bg-card`, etc. defined in `globals.css`). Charts read theme colors dynamically — use the CSS-variable-based Tailwind tokens rather than hardcoded colors.

### Symbol conventions

NSE symbols end in `.NS`, BSE in `.BO`; indices use caret prefixes (`^NSEI` = Nifty 50, `^BSESN` = Sensex).

## Deployment

Vercel deployment is documented in `DEPLOYMENT.md`. Key point: the WebSocket server is not deployed; production relies entirely on the polling fallback. No environment variables are required.
