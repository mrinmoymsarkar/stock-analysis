# Stock Analysis India

A full-featured Indian stock market platform — real-time NSE/BSE prices, personal watchlists, stock & mutual fund analysis, portfolio tracker, SIP planner, market movers, and an investing education hub.

**Live demo:** deploy to Vercel in one click (no env vars required — works out of the box).

---

## Features

- **Live prices** — real-time NSE/BSE/indices via WebSocket (local dev) with automatic polling fallback (production)
- **Personal watchlist** — add any stock, mutual fund, or index; saved to cloud when signed in
- **Markets page** — top gainers/losers, most active, 52-week extremes from the Nifty 100
- **Stock & MF detail** — key stats, analyst ratings, financials trend, earnings, mutual fund profile
- **Portfolio tracker** — holdings with live P&L, day change, CAGR, allocation chart; import from CSV or Excel
- **SIP / goal planner** — compound return projections, step-up SIP, inflation adjustment
- **News feed** — per-symbol and general India-markets news via Yahoo Finance
- **Learn** — 6 investing lessons (Indian context) + 40+ glossary terms with in-app tooltips
- **Auth** — email/password + Google OAuth via Supabase (optional; app runs fully in guest mode without it)
- **Dark / light theme**, PWA-installable, mobile-responsive

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS (CSS-variable tokens) |
| Charts | Recharts |
| Data | yahoo-finance2 v3 (no API key needed) |
| Auth & DB | Supabase (optional) |
| Testing | Jest + React Testing Library |
| Deployment | Vercel |

---

## Quick start (no auth required)

```bash
git clone <this-repo>
cd stock-analysis
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works immediately — no env vars, no sign-up needed. Watchlist is stored in localStorage.

**Optional: real-time WebSocket server (local dev only)**

```bash
npm run ws   # starts ws://localhost:4000
```

Without this, the app polls the API every 30 s (same as production).

---

## Environment variables

Copy the example file and fill in values for the features you want:

```bash
cp .env.local.example .env.local
```

| Variable | Required for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Login / cloud watchlist / portfolio | Supabase dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Login / cloud watchlist / portfolio | Supabase dashboard → Settings → API → "anon public" key |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | CAPTCHA on signup form | Cloudflare Turnstile → your site → Site Key |
| `NEXT_PUBLIC_SITE_URL` | Correct sitemap / OG URLs | Your production domain, e.g. `https://your-app.vercel.app` |

> **None of these are required to run the app locally.** Skip them all and everything works in guest mode.

---

## Enabling auth & portfolio (Supabase setup)

If you want login, cloud watchlist sync, and the portfolio tracker:

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project. Choose the Mumbai region for lowest latency.

### 2. Run the database migration

In the Supabase dashboard → SQL Editor → New query, paste and run the contents of:

```
supabase/migrations/0001_init.sql
```

This creates the `profiles`, `watchlist_items`, and `holdings` tables with row-level security (each user sees only their own data).

### 3. Add env vars

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, then restart the dev server.

> **Important:** the variable name must be `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Supabase's dashboard calls it the "publishable key" — use the same value but the name above.

### 4. Configure redirect URLs (required for email confirmation and Google OAuth)

In Supabase → Authentication → URL Configuration:
- **Site URL** → `http://localhost:3000` (or your Vercel domain in production)
- **Redirect URLs** → add `http://localhost:3000/auth/callback` and `https://your-app.vercel.app/auth/callback`

### 5. (Optional) Enable Google sign-in

Supabase → Authentication → Providers → Google → enable. You'll need a Google Cloud OAuth client ID/secret — Supabase's docs walk through it.

### 6. (Optional) Enable CAPTCHA

Create a [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) site, add the **Site Key** to `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, then paste the **Secret Key** into Supabase → Authentication → Attack Protection. Without this, signup works captcha-free.

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com/new](https://vercel.com/new) — framework auto-detected as Next.js
3. Add env vars under Project → Settings → Environment Variables (same names as `.env.local`)
4. Deploy

The WebSocket server does **not** run on Vercel. Production always uses the polling fallback automatically — no configuration needed.

---

## Importing holdings

On the Portfolio page, click **Import CSV**. The importer accepts:
- `.csv` — exports from any broker
- `.xls` / `.xlsx` — direct Excel exports from INDmoney, Zerodha, Groww, etc.

Column auto-detection maps your broker's headers to the right fields. A manual override dropdown is available if detection is wrong. US stocks in the file are flagged and skipped (not silently dropped) — Indian stocks and mutual funds import cleanly.

Download the template from the import dialog if you want to fill in holdings manually.

---

## Development commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run ws       # Standalone WebSocket server on ws://localhost:4000 (optional)
npm run build    # Production build
npm run lint     # ESLint
npm test         # Jest test suite (350+ tests)
```

---

## Project structure

```
src/
  app/               # Next.js App Router pages + API routes
    api/             # markets, quote, search, news, stocks/realtime, symbol/[symbol]
    markets/         # Gainers/losers/movers page
    portfolio/       # Portfolio tracker (auth-gated)
    stock/[symbol]/  # Stock & MF detail page
    planner/         # SIP / goal planner
    learn/           # Education hub + lessons
    news/            # News feed
  components/
    dashboard/       # Index strip, chart panel, watchlist panel, news teaser
    detail/          # StockHeader, KeyStats, AnalystRecs, FundProfile, Financials, Earnings, Margins
    markets/         # MoverList card
    portfolio/       # HoldingsTable, AddHoldingDialog, ImportHoldingsDialog, AllocationChart
    planner/         # SipCalculator, LumpsumCalculator, GoalPlanner, ProjectionChart
    auth/            # AuthProvider, LoginForm, UserMenu
    ui/              # Button, MetricTooltip, ThemeToggle
  hooks/             # useWebSocket, useWatchlist, useHoldings, useHistoricalData
  lib/               # portfolio.ts, csvImport.ts, excelImport.ts, rateLimit.ts, finance.ts, symbols.ts
  services/          # yahooFinance.ts, markets.ts
  content/           # lessons/, glossary.ts
supabase/
  migrations/        # 0001_init.sql — run this in the Supabase SQL editor
```

---

## Architecture notes

- **No API keys required** — all market data comes from `yahoo-finance2` (Yahoo Finance, free).
- **Yahoo rate-limit protection** — every API route uses a module-level TTL cache + in-flight dedup + stale-on-error. High-traffic use should add a persistent cache (e.g. Vercel KV).
- **Per-IP rate limiting** — all API routes reject requests beyond 60/min per IP with a `429 Retry-After` response.
- **Guest mode** — without Supabase env vars the app works fully with localStorage (watchlist) and no portfolio. Zero crashes, no missing-env errors.
- **WebSocket / polling duality** — `ws-server.ts` runs locally; Vercel uses the polling fallback at `/api/stocks/realtime?symbols=`. The `useWebSocket` hook handles both paths transparently.
