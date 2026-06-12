import type { GlossaryTerm } from './types';

export const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'P/E Ratio',
    short: 'Price-to-Earnings ratio — how much investors pay per rupee of earnings.',
    full: 'The P/E Ratio compares a stock\'s current share price to its earnings per share (EPS). A higher P/E suggests investors expect strong future growth, while a low P/E may signal undervaluation or poor growth prospects. In India, P/E benchmarks vary by sector — IT and FMCG stocks often trade at higher multiples than PSU banks or commodities.',
  },
  {
    term: 'P/E (Trailing)',
    short: 'P/E based on actual earnings over the past 12 months (TTM).',
    full: 'Trailing P/E uses earnings per share from the most recently completed 12-month period (Trailing Twelve Months, or TTM). Because it relies on reported rather than forecasted numbers, it is considered more reliable than forward P/E. It is the most commonly quoted P/E figure for Indian equities on NSE/BSE data feeds.',
  },
  {
    term: 'P/E (Forward)',
    short: 'P/E based on analysts\' estimated earnings for the next 12 months.',
    full: 'Forward P/E divides the current share price by the consensus earnings-per-share estimate for the coming fiscal year. It reflects future expectations rather than historical performance. If a company is expected to grow earnings significantly, the forward P/E will be lower than the trailing P/E, which can make it appear more attractively valued.',
  },
  {
    term: 'EPS',
    short: 'Earnings Per Share — net profit divided by the number of shares outstanding.',
    full: 'EPS (Earnings Per Share) measures how much profit a company generates for each share of stock. It is calculated by dividing net profit by the weighted average number of equity shares outstanding. In India, listed companies report EPS quarterly with their financial results filed on BSE/NSE. Rising EPS over time is generally a sign of business health.',
  },
  {
    term: 'EPS (TTM)',
    short: 'EPS calculated over the trailing twelve months of reported results.',
    full: 'TTM EPS aggregates the earnings per share across the four most recently reported quarters, giving a rolling 12-month view. This metric is more current than annual EPS and smooths out seasonal fluctuations. It is the EPS figure most commonly used to compute a stock\'s trailing P/E ratio.',
  },
  {
    term: 'Market Cap',
    short: 'Total market value of a company — share price multiplied by shares outstanding.',
    full: 'Market capitalisation is the total rupee value of a company\'s outstanding shares. In India, SEBI and stock exchanges categorise companies into Large Cap (top 100 by market cap), Mid Cap (101–250), and Small Cap (251 and below). Large-cap stocks such as Reliance, TCS, and HDFC Bank are generally more liquid and less volatile than mid- and small-cap stocks.',
  },
  {
    term: '52W High',
    short: 'The highest price a stock has traded at over the past 52 weeks.',
    full: 'The 52-week high marks the peak price recorded for a stock or index over the trailing 12 months. Technical analysts and traders often watch this level as a potential resistance zone. When a stock breaks above its 52-week high on strong volume, it is frequently interpreted as a bullish signal. The data is widely displayed on NSE and BSE quote pages.',
  },
  {
    term: '52W Low',
    short: 'The lowest price a stock has traded at over the past 52 weeks.',
    full: 'The 52-week low is the trough price for a stock over the previous 12 months. It can act as a support level and is used by value investors to identify potentially oversold stocks. A stock trading near its 52-week low may be cheap relative to recent history, but it may also reflect deteriorating fundamentals — context matters.',
  },
  {
    term: 'Beta',
    short: 'Measures a stock\'s volatility relative to the broader market (Nifty 50).',
    full: 'Beta quantifies how much a stock\'s price moves relative to a benchmark index, typically the Nifty 50 in India. A beta of 1.0 means the stock tends to move in line with the index; a beta above 1 means it is more volatile; below 1 means it is less volatile. Defensive sectors like FMCG and pharma often have low betas, while cyclical sectors like metals and real estate tend to have higher betas.',
  },
  {
    term: 'Dividend Yield',
    short: 'Annual dividends per share divided by the current share price, expressed as a %.',
    full: 'Dividend yield shows the income return from holding a stock. It is calculated as (annual dividend per share / current share price) × 100. In India, dividends are now taxed in the hands of the recipient at their applicable income-tax slab rate. High-dividend-yield stocks are common in PSUs (public sector undertakings), utilities, and established FMCG companies.',
  },
  {
    term: 'Volume',
    short: 'Number of shares traded during a given period (usually today or average).',
    full: 'Trading volume represents the total number of shares that changed hands in a given time frame. High volume on an up-day confirms buying interest; high volume on a down-day confirms selling pressure. Average volume (typically 30-day or 90-day) is used as a baseline to assess whether current trading is unusually heavy or light. Very low volume can make it difficult to buy or sell large quantities without moving the price.',
  },
  {
    term: 'NAV',
    short: 'Net Asset Value — per-unit price of a mutual fund, calculated daily.',
    full: 'NAV (Net Asset Value) is the market value of a mutual fund\'s net assets — total assets minus liabilities — divided by the number of units outstanding. SEBI mandates that AMCs publish NAV by 11 PM on each business day. Unlike stock prices, NAV does not fluctuate during the day; all buy and sell transactions placed before the cut-off time get the same day\'s NAV. For equity funds the cut-off is typically 3 PM.',
  },
  {
    term: 'Expense Ratio',
    short: 'Annual fee charged by a mutual fund as a % of assets under management.',
    full: 'The expense ratio represents the annual cost of running a mutual fund, expressed as a percentage of average AUM. It covers fund management fees, administrative costs, and distribution expenses. SEBI caps expense ratios for equity schemes at 2.25% for regular plans and slightly less for direct plans. Lower expense ratios directly improve investor returns, which is why direct plans consistently outperform regular plans of the same fund over long horizons.',
  },
  {
    term: 'Fund Family',
    short: 'The Asset Management Company (AMC) that manages a mutual fund.',
    full: 'The fund family, also called an AMC (Asset Management Company), is the entity registered with SEBI to manage one or more mutual fund schemes. Prominent Indian AMCs include SBI Mutual Fund, HDFC AMC, ICICI Prudential AMC, Nippon India, and Mirae Asset. Each AMC may offer dozens of schemes across equity, debt, and hybrid categories.',
  },
  {
    term: 'Category',
    short: 'SEBI-defined classification of a mutual fund (e.g., Large Cap, Flexi Cap).',
    full: 'SEBI categorises mutual funds into standardised buckets so investors can compare similar schemes. Equity categories include Large Cap, Mid Cap, Small Cap, Flexi Cap, ELSS, and more. Debt categories include Liquid, Ultra Short Duration, Short Duration, and Gilt funds. The category determines the fund\'s investment mandate and risk profile, making it easier to shortlist appropriate options.',
  },
  {
    term: '1Y Return',
    short: 'Total return (including dividends reinvested) over the past 1 year.',
    full: 'One-year return measures how much an investment has grown or shrunk over the trailing 12 months, expressed as a percentage. For mutual funds, returns are typically shown on a point-to-point basis or as a rolling return. Short time windows can be misleading because market cycles are longer than one year. SEBI mandates that fund advertisements show 1Y, 3Y, 5Y, and since-inception returns.',
  },
  {
    term: '3Y Return',
    short: 'Annualised return over the past 3 years (CAGR).',
    full: 'The three-year return is usually expressed as a CAGR (Compound Annual Growth Rate), indicating the annualised growth rate needed to achieve the actual cumulative return over three years. A 3Y period typically captures at least one full market cycle, making it a more reliable performance indicator than a 1Y return. It is one of the primary metrics recommended by SEBI for evaluating mutual fund performance.',
  },
  {
    term: '5Y Return',
    short: 'Annualised return over the past 5 years (CAGR).',
    full: 'The five-year CAGR is considered one of the most meaningful performance benchmarks for equity mutual funds because it spans more than one full market cycle. Funds are required by SEBI regulations to disclose 5Y returns in factsheets and key information documents. Comparing a fund\'s 5Y return against its benchmark index and category peers is the standard way to evaluate a fund manager\'s skill.',
  },
  {
    term: '1Y',
    short: 'One-year return — total return (including dividends) over the past 12 months.',
    full: 'The 1Y (one-year) return measures how much an investment has grown or shrunk over the trailing 12 months, expressed as a percentage. For mutual funds, it is shown on a point-to-point basis. Short time windows can be misleading as market cycles are longer than one year.',
  },
  {
    term: '3Y',
    short: 'Three-year annualised return (CAGR) over the past 3 years.',
    full: 'The 3Y return is expressed as a CAGR (Compound Annual Growth Rate), indicating the smoothed annual growth rate over three years. A 3Y period typically spans at least one market cycle, making it more reliable than a 1Y return for evaluating mutual fund performance.',
  },
  {
    term: '5Y',
    short: 'Five-year annualised return (CAGR) over the past 5 years.',
    full: 'The 5Y CAGR is one of the most meaningful benchmarks for equity mutual funds as it spans more than one full market cycle. SEBI requires funds to disclose 5Y returns in factsheets. Comparing a fund\'s 5Y return to its benchmark and category peers is the standard performance evaluation method.',
  },
  {
    term: 'YTD',
    short: 'Year-to-Date return — performance from January 1st to today.',
    full: 'YTD return measures how much a fund or stock has gained or lost since the start of the current calendar year. It is a useful gauge of recent performance but can be misleading because a fund that fell sharply in December may show a strong YTD just by recovering. Always compare YTD returns against the relevant benchmark index over the same period.',
  },
  {
    term: 'Analyst Target Price',
    short: 'Analyst consensus estimate of a stock\'s fair value price over 12 months.',
    full: 'The analyst target price is the average (mean) 12-month price objective set by sell-side equity research analysts who cover a stock. It represents where analysts collectively expect the stock price to be in one year, based on their financial models and industry analysis. The upside or downside percentage is calculated relative to the current market price. Targets should be treated as estimates, not guarantees.',
  },
  {
    term: 'Target Price',
    short: 'Analyst consensus estimate of a stock\'s fair value price over 12 months.',
    full: 'Target price is the average 12-month price objective published by equity research analysts at brokerage firms. It combines valuation methods such as discounted cash flow analysis, peer comparisons, and sum-of-the-parts. A stock trading significantly below analyst target prices may be considered undervalued, though analysts do revise targets frequently as new data becomes available.',
  },
  {
    term: 'Strong Buy',
    short: 'Analyst rating indicating high conviction that the stock will outperform significantly.',
    full: 'A Strong Buy rating is the most bullish recommendation an analyst can assign. It signals that the analyst has high conviction the stock will significantly outperform its peers or the broader market over the next 12 months. This is distinct from a plain Buy rating, which implies expected outperformance but with somewhat less certainty or magnitude.',
  },
  {
    term: 'Buy',
    short: 'Analyst rating suggesting the stock is expected to outperform the market.',
    full: 'A Buy rating indicates that an analyst believes the stock will deliver returns exceeding the benchmark index or sector peers over the coming 12 months. It falls one notch below Strong Buy in terms of conviction. Most sell-side research skews positive — around 40–60% of ratings on Indian stocks are Buy or Strong Buy at any given time — so it is worth comparing the target price to the current price.',
  },
  {
    term: 'Hold',
    short: 'Analyst rating suggesting the stock will perform in line with the market.',
    full: 'A Hold (or Neutral) rating means the analyst expects the stock to deliver returns roughly in line with the broader market or its sector over the next 12 months. It is neither a buy nor a sell recommendation. Analysts sometimes use Hold as a diplomatic way to downgrade a stock without issuing an explicit Sell, which can damage relationships with the covered company.',
  },
  {
    term: 'Sell',
    short: 'Analyst rating indicating the stock is expected to underperform the market.',
    full: 'A Sell rating is issued when an analyst believes the stock will underperform the broader market or its peers over the next 12 months. Sell ratings are relatively rare in sell-side research — usually representing fewer than 10% of all ratings — partly because brokerage firms have business relationships with the companies they cover. When a reputable analyst issues a Sell, it is worth paying attention.',
  },
  {
    term: 'Strong Sell',
    short: 'Analyst rating with high conviction the stock will significantly underperform.',
    full: 'Strong Sell is the most bearish analyst rating, indicating high conviction that the stock will significantly underperform the market or its sector. It may also signal concerns about the company\'s fundamentals, corporate governance, or balance sheet. Strong Sell ratings are very rare and typically trigger sharp price reactions when published by well-regarded research houses.',
  },
  {
    term: 'Nifty 50',
    short: 'NSE\'s flagship index of India\'s top 50 large-cap stocks by free-float market cap.',
    full: 'The Nifty 50 is the benchmark equity index of the National Stock Exchange (NSE) of India, comprising the 50 largest and most liquid stocks listed on NSE. It covers about 13 sectors and represents roughly 65% of the total float-adjusted market capitalisation of NSE-listed companies. It is the underlying index for India\'s most popular equity derivatives and a large number of index funds and ETFs.',
  },
  {
    term: 'Sensex',
    short: 'BSE\'s benchmark index of India\'s top 30 large-cap stocks.',
    full: 'The Sensex (Sensitive Index) is the flagship index of the Bombay Stock Exchange (BSE), comprising 30 well-established large-cap companies. It was launched in 1986 and is one of the oldest equity indices in India. The Sensex is a free-float market-cap-weighted index and is widely used as a barometer of the overall health of the Indian equity market. Crossing round-number milestones (10,000, 50,000, etc.) receives significant media coverage in India.',
  },
  {
    term: 'NSE',
    short: 'National Stock Exchange — India\'s largest stock exchange by trading volume.',
    full: 'NSE (National Stock Exchange of India) was established in 1992 and commenced trading in 1994. It introduced screen-based electronic trading to India, replacing the open-outcry system used at BSE. NSE handles the majority of India\'s equity and derivative trading volume. Its flagship index is the Nifty 50. All trades on NSE are settled through the National Securities Clearing Corporation Limited (NSCCL).',
  },
  {
    term: 'BSE',
    short: 'Bombay Stock Exchange — Asia\'s oldest stock exchange, founded in 1875.',
    full: 'BSE (Bombay Stock Exchange), now officially known as BSE Ltd, is Asia\'s oldest stock exchange, established in 1875 under a banyan tree on Dalal Street in Mumbai. It lists over 5,000 companies, far more than NSE, though NSE dominates in trading volumes. BSE\'s benchmark index is the Sensex. BSE also runs the SME platform for small and medium enterprises seeking capital market access.',
  },
  {
    term: 'SIP',
    short: 'Systematic Investment Plan — investing a fixed amount in a mutual fund regularly.',
    full: 'A SIP (Systematic Investment Plan) allows investors to invest a fixed sum — as little as ₹100 per month in some funds — at regular intervals (monthly, fortnightly, or weekly). SIPs benefit from rupee cost averaging: you buy more units when prices are low and fewer when prices are high, reducing the average cost per unit over time. SIPs are the most popular route for retail investors to build long-term equity fund portfolios in India.',
  },
  {
    term: 'Lumpsum',
    short: 'A one-time, single large investment in a mutual fund.',
    full: 'A lumpsum investment means deploying a large amount of capital at once, as opposed to the periodic small amounts of a SIP. Lumpsum investments can outperform SIPs in strongly trending bull markets because the entire amount benefits from the upward move immediately. However, lumpsums carry timing risk: investing at a market peak can take years to recover. Many advisors recommend deploying large lumpsums in tranches over 3–6 months to reduce timing risk.',
  },
  {
    term: 'CAGR',
    short: 'Compound Annual Growth Rate — the smoothed annual return rate over a period.',
    full: 'CAGR represents the rate at which an investment would have grown if it grew at a steady annual rate. The formula is: CAGR = (Ending Value / Beginning Value)^(1/n) − 1, where n is the number of years. It is the standard metric for comparing mutual fund performance, portfolio returns, and corporate earnings growth over multi-year periods. CAGR does not reflect the volatility experienced during the period.',
  },
  {
    term: 'Demat Account',
    short: 'An electronic account that holds shares and securities in dematerialised form.',
    full: 'A Demat (Dematerialised) account holds financial securities — shares, bonds, ETFs, mutual fund units — in electronic form, eliminating the risk of physical certificate loss or forgery. In India, Demat accounts are maintained by two depositories: NSDL (National Securities Depository Limited) and CDSL (Central Depository Services Limited). Opening a Demat account requires KYC (Know Your Customer) verification. A separate trading account is needed to place buy/sell orders; brokers typically open both together.',
  },
  {
    term: 'Face Value',
    short: 'The nominal value of a share as stated in the company\'s balance sheet.',
    full: 'Face value (also called par value) is the original nominal value assigned to a share when it is issued. In India, common face values are ₹10, ₹5, ₹2, or ₹1. Dividends and bonus share ratios are often stated as a percentage of face value. The book value and market price of a share are almost always very different from face value. Stock splits change the face value (e.g., ₹10 to ₹2 in a 5:1 split) but do not affect a company\'s total equity.',
  },
  {
    term: 'Book Value',
    short: 'Net worth of a company per share — total assets minus total liabilities divided by shares.',
    full: 'Book value per share is calculated as total shareholders\' equity divided by the number of outstanding shares. It represents the accounting value of a company\'s net assets on a per-share basis. A stock trading below its book value (Price-to-Book ratio < 1) may suggest undervaluation, though it can also reflect poor asset quality or low return on equity. PSU banks in India frequently trade near or below book value.',
  },
  {
    term: 'Upside/Downside',
    short: 'The % difference between the analyst target price and the current market price.',
    full: 'Upside/downside is the percentage gap between where analysts project a stock to trade (the target price) and its current market price. Positive upside means analysts think the stock should rise; negative upside (downside) means they think it will fall. This figure is prominently displayed in equity research reports and helps investors quickly gauge analyst conviction relative to current valuations.',
  },
  {
    term: 'ROE',
    short: 'Return on Equity — net profit as a percentage of shareholders\' equity.',
    full: 'Return on Equity measures how efficiently a company generates profit from shareholders\' capital. It is calculated as (net profit / average shareholders\' equity) × 100. High ROE over sustained periods — typically above 15–20% — indicates a business with competitive advantages and efficient capital allocation. In India, companies like HDFC Bank, Asian Paints, and TCS are known for consistently high ROE.',
  },
  {
    term: 'Debt-to-Equity',
    short: 'Total debt divided by shareholders\' equity — a measure of financial leverage.',
    full: 'The debt-to-equity (D/E) ratio shows how much a company relies on borrowed money relative to its own equity. A high D/E ratio means greater financial risk, especially in high-interest-rate environments. Capital-intensive sectors like infrastructure and real estate naturally carry higher D/E ratios. In India, investors often prefer companies with D/E below 1 for equity investments, though this threshold varies by industry.',
  },
  {
    term: 'STT',
    short: 'Securities Transaction Tax — a tax levied on every buy or sell of securities in India.',
    full: 'STT (Securities Transaction Tax) is a direct tax collected at the time of a securities transaction on Indian exchanges. The rate varies by transaction type: equity delivery purchases attract 0.1% on both buyer and seller; intraday equity trades attract 0.025% on the sell side only; equity futures attract 0.02% on sell; options attract a fixed ₹2,100 per crore of turnover on the sell side (post-Budget 2024 revision). STT is non-refundable and cannot be set off against tax liability.',
  },
  {
    term: 'LTCG',
    short: 'Long-Term Capital Gains — profit on assets held over 12 months, taxed at 12.5% above ₹1.25L.',
    full: 'Long-Term Capital Gains (LTCG) on listed equity shares and equity mutual funds in India apply when the holding period exceeds 12 months. Post-July 23, 2024 (Union Budget 2024), LTCG is taxed at 12.5% without the benefit of indexation. The first ₹1.25 lakh of LTCG per financial year is exempt. Grandfathering applies to gains accrued up to January 31, 2018 (pre-Budget 2018 positions).',
  },
  {
    term: 'STCG',
    short: 'Short-Term Capital Gains — profit on equity held under 12 months, taxed at 20%.',
    full: 'Short-Term Capital Gains (STCG) on listed equity shares and equity mutual funds arise when the holding period is 12 months or less. Post-July 23, 2024 (Union Budget 2024), STCG is taxed at a flat rate of 20% (increased from 15%), regardless of the investor\'s income tax slab. STCG is reported in ITR-2 or ITR-3 and must be paid even if the overall income is below the basic exemption limit.',
  },
  {
    term: 'Invested Value',
    short: 'Total capital deployed — sum of (quantity × buy price) across all holdings.',
    full: 'Invested Value (also called Cost Basis) represents the total amount of money you have put into your portfolio across all buying transactions. It is calculated as the sum of (quantity × buy price) for each holding lot. Comparing the invested value with the current market value reveals the absolute profit or loss on your portfolio.',
  },
  {
    term: 'Current Value',
    short: 'Present market value of your portfolio — sum of (quantity × last traded price).',
    full: 'Current Value is the real-time market worth of your holdings, calculated as quantity multiplied by the latest traded price for each position. Because stock prices fluctuate continuously during market hours, the current value changes every tick. Comparing current value with invested value gives your unrealised profit or loss.',
  },
  {
    term: 'Day Change',
    short: 'Change in portfolio value since the previous market close.',
    full: 'Day Change measures how much the total market value of your holdings has moved since the previous trading session\'s closing prices. It is calculated by multiplying each holding\'s quantity by its daily price change. A positive day change means the portfolio has gained value today; a negative day change means it has lost value relative to the prior close.',
  },
  {
    term: 'Unrealized P&L',
    short: 'Paper profit or loss on open positions — current value minus invested value.',
    full: 'Unrealised Profit & Loss (P&L) is the gain or loss on holdings you still own but have not yet sold. It is computed as (current value − invested value). Because the position is still open, the P&L is "unrealised" — it becomes realised (and potentially taxable) only when you sell. Unrealised P&L fluctuates with market prices throughout the trading day.',
  },
  {
    term: 'Allocation',
    short: 'The percentage of portfolio value held in each stock or asset type.',
    full: 'Allocation shows how your investment capital is distributed across individual stocks, sectors, or asset types (equity, mutual funds, etc.). It is expressed as a percentage of total portfolio value. A well-diversified portfolio typically avoids excessive concentration in a single stock or sector. Reviewing allocation helps identify over-concentration risk and guides rebalancing decisions.',
  },
];
