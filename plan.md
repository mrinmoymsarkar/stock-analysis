# Stock Analysis → Multi-User Investing Platform

## Context

The app today is a read-only dashboard: a hardcoded list of 17 NSE stocks + 2 indices, one chart, and a search that only switches the chart. Goal: make it something users adopt — personal watchlists (stocks, mutual funds, indices), per-symbol analysis pages, news, SIP/goal calculators, an investing-education hub, and eventually login + portfolio tracking.

**Strategy (user-confirmed): quick wins first, database later.** Phases 1–4 need NO backend/auth — everything runs on localStorage + the existing Yahoo API routes, deployable to Vercel immediately. Phases 5–6 add Supabase auth + portfolio.

**Verified:** yahoo-finance2 v3 already supports mutual funds (`quoteType: MUTUALFUND`; `fundProfile`/`fundPerformance`/`topHoldings` modules; Indian MFs = `0P0000XXXX.BO`) and news (`search()` returns `news[]`). No new data vendor, no env vars needed for Phases 1–4.

**Standing rules:** Yahoo rate-limits datacenter IPs — every new server-side fetch goes behind a TTL cache + in-flight dedup + stale-on-error (model: `src/app/api/stocks/realtime/route.ts:16-84`). UI work uses the `frontend-design` skill. Every phase ends with `npm run lint && npm test && npm run build`.

**Execution (user-confirmed):** Implement Phases 1–4 now using **Sonnet subagents** — one implementation agent per phase (sequential for 1→2 since 2 builds on 1's nav/watchlist; Phases 3 and 4 are independent and can run in parallel with worktree isolation if needed). The main session coordinates, reviews each agent's diff, and runs lint/tests/build between phases. Feature work is committed only when explicitly requested.

---

# QUICK WINS (no database)

## Phase 1 — Personal watchlist via localStorage + personalized realtime

The single biggest win: users add/remove any stock to their own dashboard instead of the hardcoded 19 symbols.

New files:
- `src/lib/watchlist.ts` — `DEFAULT_SYMBOLS` (single source of truth, replaces BOTH duplicated hardcoded lists), localStorage read/write under `watchlist` key (seeded with defaults on first visit)
- `src/lib/symbols.ts` — validation: `^[A-Z0-9^&.\-]{1,20}$` (case-insensitive), cap 30 symbols, dedupe, sorted canonical key
- `src/hooks/useWatchlist.ts` — `{ items, add, remove }` backed by localStorage (designed so a Supabase backend can slot in at Phase 5 without changing consumers)
- `src/components/cards/AddToWatchlistButton.tsx`

Modified:
- `src/app/api/stocks/realtime/route.ts` — accept `?symbols=` (validated, fallback `DEFAULT_SYMBOLS`); switch cache to **per-symbol** `Map<symbol, {quote, ts}>`; batch-fetch only stale symbols; per-symbol in-flight dedup; keep stale-on-error.
- `src/hooks/useWebSocket.ts` — accept `symbols: string[]`; if ≠ `DEFAULT_SYMBOLS`, skip WS and poll `?symbols=...`; restart polling when the sorted-join key changes (watch `memoizedOnMessage`'s `[]` deps at `useWebSocket.ts:22` — keep identity stable).
- `src/app/page.tsx` — symbol list from `useWatchlist()`; remove button on cards; empty-state CTA.
- `src/components/cards/MarketOverviewCard.tsx` — optional `onRemove`, quote-type badge.
- `src/app/api/search/route.ts` + `src/components/controls/StockSearch.tsx` — include MUTUALFUND and INDEX quoteTypes (keep `.NS`/`.BO`/`^` India filter); selecting a result adds it to the watchlist.
- `ws-server.ts` — import `DEFAULT_SYMBOLS` (kills the duplication noted in CLAUDE.md; update CLAUDE.md accordingly).
- `jest.config.ts` — add `@/lib` (and `@/app`, `@/content` while at it) to moduleNameMapper.

Verify: unit tests for `symbols.ts` (cap, injection chars) and `useWatchlist` (mock localStorage); route tests for `?symbols=`; manual — add a stock via search, card appears with live price, survives reload; remove works; >30 rejected.

## Phase 2 — Stock/MF detail page + news

New files:
- `src/app/stock/[symbol]/page.tsx` — detail page (URL-encode `^NSEI` in links, decode in param)
- `src/components/detail/StockHeader.tsx`, `KeyStats.tsx` (P/E, mcap, 52wk, div yield), `AnalystRecs.tsx`, `FundProfile.tsx` (NAV, expense ratio, category, top holdings, trailing returns), `DetailChart.tsx` (reuses `PriceChart` + `TimeRangeSelector` + `useHistoricalData`), `NewsList.tsx`
- `src/app/api/symbol/[symbol]/route.ts` — quoteSummary with modules by quoteType (equities: `summaryDetail,defaultKeyStatistics,price,financialData,recommendationTrend`; MFs: `fundProfile,fundPerformance,topHoldings,summaryDetail,price`); 5-min TTL per symbol
- `src/app/api/news/route.ts` — `search()` news; `?symbol=` for per-symbol, none → general India-markets feed; 10-min TTL
- `src/app/news/page.tsx` — reuses NewsList
- `src/components/layout/NavHeader.tsx` — logo + nav links (Dashboard / News / Planner / Learn) + ThemeToggle (moves header out of page.tsx; gives the app a real shell, ready for UserMenu in Phase 5)

Modified: `src/services/yahooFinance.ts` (add `getDetail`, `getNews`), `MarketOverviewCard.tsx` (card links to `/stock/[symbol]`), `StockSearch.tsx` (option to view detail), `src/app/layout.tsx` (render NavHeader).

Tricky: Indian MF data is sparse — every section renders conditionally; if trailing returns missing, compute from historical NAV.

Verify: component tests with fixtures for RELIANCE.NS, one sparse MF, ^NSEI — no crash on missing modules; manual — open all three types, news links work.

## Phase 3 — SIP / goal planner (pure client, fully independent)

New files:
- `src/lib/finance.ts` — pure functions: `sipFutureValue(monthly, annualRate, months)`, `lumpsumFV`, `requiredSip(goal, rate, months)`, inflation adjustment, step-up SIP
- `src/app/planner/page.tsx` + `src/components/planner/SipCalculator.tsx`, `LumpsumCalculator.tsx`, `GoalPlanner.tsx`, `ProjectionChart.tsx` (Recharts AreaChart: invested vs value over time)

Verify: exact-value unit tests (₹10k/mo @12%/10y ≈ ₹23.2L); no network at all.

## Phase 4 — Education hub + glossary tooltips

New files:
- `src/content/types.ts` — `Lesson { slug, title, level, sections }`, `GlossaryTerm` (typed TS data files, not MDX — no extra deps, testable)
- `src/content/glossary.ts`; `src/content/lessons/` — ~6–8 lessons, Indian context: stock-market-basics, demat-and-brokers, mutual-funds-101, sip-investing, reading-fundamentals, taxes-in-india
- `src/app/learn/page.tsx` (grouped by level) + `src/app/learn/[slug]/page.tsx` (server components, `generateStaticParams`)
- `src/components/ui/MetricTooltip.tsx` — glossary-backed info tooltips

Modified: wrap metric labels in `KeyStats`/`FundProfile` (and later `PortfolioSummary`) with `MetricTooltip`.

Verify: content-integrity tests (unique slugs, non-empty sections, tooltip keys exist in glossary).

**→ After Phase 4 the app is a complete, deployable product for anonymous users. Ship it, then decide when to start Phase 5.**

---

# DATABASE PHASES (Supabase — later)

User-confirmed: Supabase free tier; Google OAuth + email/password + Cloudflare Turnstile CAPTCHA.

## Phase 5 — Auth + cloud watchlist sync

- `@supabase/ssr` cookie sessions: `src/lib/supabase/{client,server,middleware}.ts`, `src/middleware.ts` (session refresh; protect `/portfolio`), `src/components/auth/{AuthProvider,UserMenu,LoginForm}.tsx`, `src/app/login/page.tsx`, `src/app/auth/callback/route.ts` (code exchange)
- SQL migration `supabase/migrations/0001_init.sql`: `profiles`, `watchlist_items` (unique user_id+symbol), `holdings` — all RLS `auth.uid() = user_id`; trigger auto-creates profile on signup
- `useWatchlist` gains the Supabase backend: cloud when logged in, localStorage when guest, one-time guest→account merge on first login
- Deps: `@supabase/ssr`, `@supabase/supabase-js`, `@marsidev/react-turnstile`. Env vars (first for this project): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — fail with clear messages when missing.
- Manual user setup required: create Supabase project, enable Google provider + redirect URLs, create Turnstile site, paste secret in Supabase Auth → Attack Protection, run migration, add Vercel env vars.
- Footguns: always `auth.getUser()` server-side (never `getSession`); middleware must return the cookie-setting client's response object; `captchaToken` only on email/password (OAuth bypasses — fine).

## Phase 6 — Portfolio tracker (auth-required)

- `src/app/portfolio/page.tsx`, `src/hooks/useHoldings.ts` (Supabase CRUD on `holdings`), `src/lib/portfolio.ts` (pure: per-lot + aggregate P&L, day change, allocation, CAGR), `src/components/portfolio/{HoldingsTable,AddHoldingDialog,PortfolioSummary,AllocationChart}.tsx` (AddHoldingDialog reuses StockSearch; AllocationChart = Recharts Pie)
- Live prices via the Phase-1 `?symbols=` realtime path with the holdings symbol set
- Verify: heavy unit tests on `portfolio.ts` (multi-lot, CAGR edges); RLS check with a second account.

## Risks

1. **Yahoo rate limits** — TTL cache mandatory on every new fetch; per-symbol cache shares entries across users. Vercel lambdas don't share module caches — acceptable now; Supabase cache table is the later escape hatch.
2. **Indian MF data sparseness** — optional-by-default sections, sparse fixture in tests.
3. **Supabase SSR cookie/middleware footguns** (Phase 5) — get it exactly right before building on it.
