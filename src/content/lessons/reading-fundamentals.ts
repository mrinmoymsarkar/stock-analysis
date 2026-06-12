import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'reading-fundamentals',
  title: 'Reading Stock Fundamentals',
  level: 'intermediate',
  summary:
    'Learn to read the key financial metrics that matter most for evaluating Indian stocks: P/E, EPS, market cap, book value, ROE, debt-to-equity, how to read quarterly results, and how to distinguish quality businesses from cheap ones.',
  sections: [
    {
      heading: 'Why Fundamentals Matter',
      body: `Fundamental analysis is the practice of evaluating a company's intrinsic value by examining its financial statements, business model, competitive position, and macroeconomic environment. The underlying belief is that a stock's market price eventually converges toward the company's intrinsic value — and that the gap between current price and intrinsic value determines whether a stock is cheap, fairly valued, or expensive.

Unlike technical analysis (which focuses purely on price and volume patterns), fundamental analysis asks: how much does this business earn? How fast is it growing? How much debt does it carry? Is its competitive moat durable? These questions require reading financial statements — the income statement, balance sheet, and cash flow statement — all of which Indian listed companies publish quarterly on NSE/BSE.

Fundamental analysis does not tell you when a stock will move — markets can remain irrational for extended periods. Warren Buffett's famous observation that "the market is a voting machine in the short run and a weighing machine in the long run" captures this idea well. Price eventually reflects value, but the timing is uncertain. Long-term investors can accept this uncertainty; short-term traders cannot.

For Indian investors, the starting point for fundamental research is freely available: quarterly results on NSE/BSE, annual reports on company investor-relations pages, analyst presentations, and the economic survey and RBI publications for macroeconomic context. Developing the skill to read these documents is the single most valuable investment you can make in your financial education.`,
    },
    {
      heading: 'P/E Ratio and EPS',
      body: `The Price-to-Earnings (P/E) ratio is the most widely referenced valuation metric. It divides the current share price by the earnings per share (EPS). A P/E of 20 means investors are paying ₹20 for every ₹1 of annual earnings. Equivalently, if you owned the entire company at this valuation, it would take 20 years to recoup your investment at current earnings — assuming earnings neither grow nor shrink.

High P/E ratios are not inherently bad, and low P/E ratios are not inherently good. A company with a P/E of 40 that grows earnings at 25% per year may be cheaper in real terms than a company with a P/E of 15 whose earnings are flat or declining. This is why the PEG ratio (P/E divided by earnings growth rate) is a more nuanced tool for growth companies. A PEG below 1 is often considered attractive.

In India, different sectors trade at vastly different P/E multiples. IT services companies (TCS, Infosys, Wipro) typically trade at 20–30x trailing earnings because of their high margins, strong cash flows, and predictable growth. FMCG companies (HUL, Nestlé) may trade at 40–60x because of their defensiveness and consistent earnings quality. PSU banks often trade at 5–10x because of higher non-performing asset risks and lower growth expectations.

EPS (Earnings Per Share) is the numerator driver of the P/E ratio. Growing EPS consistently — without resorting to financial engineering such as share buybacks or one-time gains — is a reliable indicator of business health. Compare EPS over at least five years to identify the growth trend. Companies with consistently growing EPS, expanding margins, and low capital requirements are often excellent long-term investments.`,
    },
    {
      heading: 'Market Cap and Valuation Context',
      body: `Market capitalisation (market cap) is the total market value of all outstanding shares of a company. It is calculated as current share price multiplied by total shares outstanding. SEBI categorises listed companies into Large Cap (top 100 by market cap), Mid Cap (101–250), and Small Cap (251 and beyond). As of 2024, the top 100 Indian companies by market cap begin at approximately ₹25,000 crore.

Market cap provides important context for valuation. A company with a market cap of ₹10,000 crore and annual revenues of ₹1,000 crore trades at 10x revenue (Price-to-Sales ratio of 10). Whether this is high or low depends on the business's growth rate, margin profile, and capital intensity. High-margin software or pharmaceutical companies can justify high P/S ratios; low-margin commodity companies cannot.

Enterprise Value (EV) is often more meaningful than market cap for comparing capital structures. EV = Market Cap + Total Debt − Cash. The EV/EBITDA ratio (enterprise value divided by earnings before interest, taxes, depreciation, and amortisation) is widely used to compare companies in the same sector regardless of their debt levels or tax positions. For example, comparing two telecom companies — one with heavy debt and one debt-free — using P/E alone would be misleading; EV/EBITDA gives a more apples-to-apples comparison.

When evaluating any company, always contextualise the valuation against: (1) its own historical valuation range (is the current P/E above or below its 5-year average?), (2) its direct competitors in the same sector, and (3) the benchmark index (the Nifty 50's 12-month trailing P/E is publicly available and represents the "market price" for Indian equities on average). A stock trading at a significant premium to all three reference points requires an exceptional growth story to justify the valuation.`,
    },
    {
      heading: 'Book Value and Price-to-Book',
      body: `Book value per share is the accounting net worth of a company divided by its number of outstanding shares. It is calculated as: (Total Assets − Total Liabilities) / Number of Shares. Book value represents what shareholders would theoretically receive if the company liquidated all its assets at their balance sheet values and paid off all liabilities.

The Price-to-Book (P/B) ratio compares the market price to the book value. A P/B below 1 means the stock is trading below its liquidation value, which can indicate undervaluation or significant concern about asset quality. Indian PSU banks have frequently traded below book value in periods of high non-performing assets because investors doubted the stated book value would be realised in a distressed scenario.

For asset-heavy businesses (banks, NBFCs, real estate companies), book value is a central valuation metric. For asset-light businesses (software companies, consulting firms, consumer brands), book value is largely irrelevant because much of the value resides in intangible assets — brand equity, intellectual property, customer relationships — that are not captured on the balance sheet. A software company like TCS trades at 10x book value not because it is expensive relative to its assets, but because its earnings power is far greater than its asset base would suggest.

Return on Book Value (Return on Equity, or ROE) connects valuation to quality. A company with high ROE justifies a high P/B multiple. The classic "DuPont analysis" breaks ROE into three components: net margin (profit divided by sales), asset turnover (sales divided by assets), and financial leverage (assets divided by equity). This decomposition reveals whether high ROE comes from genuine operational efficiency or simply from high debt — the latter is more fragile.`,
    },
    {
      heading: 'ROE and Debt-to-Equity',
      body: `Return on Equity (ROE) measures how efficiently a company generates profit from each rupee of shareholders' equity. It is calculated as (Net Profit / Average Shareholders' Equity) × 100. Companies with consistently high ROE — above 15–20% over 5–10 years — often possess durable competitive advantages: strong brands, switching costs, network effects, or pricing power. Examples in India include HDFC Bank, Asian Paints, TCS, and Bajaj Finance.

The quality of ROE matters as much as its level. ROE inflated by excessive financial leverage (high debt) is not a sign of genuine business quality — it is risk magnification. A company earning ₹100 on ₹1,000 of equity (10% ROE) using no debt is more stable than a company earning ₹200 on ₹1,000 equity (20% ROE) using ₹2,000 of debt, because the latter's earnings would collapse if interest rates rise or revenues fall.

The Debt-to-Equity (D/E) ratio measures financial leverage: how much borrowed capital is used relative to shareholders' equity. In India, as a rough guideline, investors often prefer companies with D/E below 1.0 for non-financial sectors. However, this rule varies significantly by industry. Capital-intensive sectors like infrastructure, power, and real estate routinely operate with D/E of 3–5x. Financial companies like banks and NBFCs use leverage by design (borrowing to lend) and are evaluated using capital adequacy ratios (CAR) instead.

When a company's D/E ratio rises significantly over two or three years without a corresponding increase in asset creation or earnings, it is a warning signal. "Debt rising faster than EBITDA" is a classic sign of a deteriorating credit profile. Always read the notes to the balance sheet to understand the nature of the debt: is it short-term working capital debt or long-term project debt? Is it secured or unsecured? Is there any covenant that could be triggered in a downturn?`,
    },
    {
      heading: 'Reading Quarterly Results',
      body: `Indian listed companies must publish quarterly financial results within 45 days of the end of each quarter (60 days for the fourth quarter). Results are filed on NSE and BSE and typically include: a profit and loss statement (P&L), a balance sheet (quarterly for banks; annual-only in some other sectors), a cash flow statement (in full-year results), segment-wise revenue breakdowns, and a Management Discussion and Analysis (MD&A) note.

The key line items to focus on in the P&L are: Revenue (top line — is the business growing?), Gross Profit and Gross Margin (are margins expanding or contracting?), EBITDA and EBITDA Margin (operational profitability before financing costs), and Profit After Tax / Net Profit (the bottom line after all expenses). Always compare these figures to the same quarter a year ago (YoY growth), not just the previous quarter (QoQ), because many businesses are highly seasonal.

A useful metric that the P&L alone can miss is Free Cash Flow (FCF). FCF = Operating Cash Flow − Capital Expenditure. A company can report high profits but low free cash flow if it is constantly reinvesting in growth (acceptable for high-growth companies) or if its earnings are not translating to actual cash collections (a potential red flag). Companies with consistently strong FCF tend to be more durable businesses than those relying on accounting accruals.

Pay attention to management commentary in conference calls, which most large Indian companies conduct after quarterly results. Management's tone, guidance for the next quarter, and responses to analyst questions provide qualitative context that raw numbers cannot. Red flags include repeated downward guidance revisions, heavy promoter share pledging (visible in quarterly shareholding pattern disclosures), high proportion of revenue from related parties, and auditor qualifications in the annual report.`,
    },
    {
      heading: 'Valuation vs Quality: Getting the Balance Right',
      body: `The perennial debate in stock investing is whether to buy high-quality businesses at fair prices or average businesses at cheap prices. Both strategies can work, but they require different skills and risk tolerances. "Cheap" stocks (low P/E, low P/B) often have deep business problems that justify their cheapness — this is called a "value trap." Conversely, expensive high-quality stocks can underperform if growth disappoints or valuations compress.

Peter Lynch's insight that the best stocks to own are businesses you understand well, with solid fundamentals and a reasonable price, remains a practical heuristic. In the Indian context, this means identifying businesses with strong brands or distribution networks in large, growing domestic markets, reasonable promoter integrity (check SEBI actions and news), manageable debt, and a P/E that is not dramatically higher than the sector average.

One practical framework is to build a watchlist of high-quality companies and wait for price dislocations — market panics, sector-specific sell-offs, or temporary earnings misses — to enter at attractive valuations. Great companies rarely become "cheap" in absolute terms, but they can become reasonably valued relative to their growth trajectory during broader market corrections.

Ultimately, no single metric tells the full story. A complete fundamental picture requires at least: a valuation metric (P/E or EV/EBITDA), a quality metric (ROE or ROCE), a growth metric (EPS CAGR over 5 years), a safety metric (D/E ratio and interest coverage), and a reading of the latest annual report and one or two recent earnings call transcripts. Combining these quantitative and qualitative inputs gives a far better picture of a company's investment merit than any single number.`,
    },
  ],
};

export default lesson;
