import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'mutual-funds-101',
  title: 'Mutual Funds 101',
  level: 'beginner',
  summary:
    'Understand what a mutual fund is, how NAV and units work, what AMCs do, the main fund categories, and the critical difference between direct and regular plans — including how expense ratios silently erode returns.',
  sections: [
    {
      heading: 'What is a Mutual Fund?',
      body: `A mutual fund pools money from many investors and invests it in a diversified portfolio of securities — stocks, bonds, money market instruments, gold, or a combination. The fund is managed by a professional fund manager employed by an Asset Management Company (AMC) registered with SEBI. Each investor owns "units" in the fund proportional to their investment.

Mutual funds democratise investing. A retail investor with ₹500 can gain exposure to a portfolio of 50 large-cap Indian stocks that would otherwise require lakhs of rupees to replicate directly. The fund manager makes all the buy-and-sell decisions, handles paperwork, and ensures regulatory compliance — the investor simply benefits from the collective outcome.

SEBI and the Association of Mutual Funds in India (AMFI) heavily regulate the mutual fund industry. Every scheme must have a clear investment mandate defined in its Scheme Information Document (SID). Fund managers cannot deviate from the mandate — an equity fund cannot suddenly invest 80% of its corpus in fixed deposits to avoid a market downturn. This regulatory discipline protects investors from arbitrary decisions.

Unlike bank fixed deposits, mutual fund investments are not guaranteed. Equity fund returns are linked to market performance and can be negative in the short term. However, over long periods (7–10 years and beyond), equity funds have historically delivered returns that significantly outpace inflation and fixed-income products in India.`,
    },
    {
      heading: 'NAV, Units, and How You Own the Fund',
      body: `NAV (Net Asset Value) is the per-unit price of a mutual fund scheme. It is calculated by dividing the total net assets of the fund (market value of all holdings minus liabilities) by the number of units outstanding. SEBI mandates that AMCs publish the NAV of all schemes by 11 PM on every business day.

When you invest ₹10,000 in a fund with a NAV of ₹50, you receive 200 units (₹10,000 / ₹50). If the NAV rises to ₹60 when you decide to redeem, your 200 units are now worth ₹12,000 — a return of 20%. The number of units you hold stays the same until you buy more or redeem; only the NAV changes daily based on market movements.

A common misconception is that a "low NAV fund" is cheaper or better than a "high NAV fund." This is completely false. The NAV merely reflects the scheme's history — a fund that started at ₹10 five years ago and now has a NAV of ₹80 has grown 700%. Comparing it with a new fund at ₹10 NAV does not make the new fund "cheaper." What matters is the quality of the fund's portfolio and the skill of its manager, not the absolute NAV figure.

For equity funds, the cut-off time for same-day NAV is 3 PM IST. Investments received before 3 PM get that day's NAV; those received after 3 PM get the next business day's NAV. For liquid funds, the cut-off is 1:30 PM. This is relevant when timing large investments — if you transfer money at 2:59 PM on a day with a significant market move, the NAV you get will be very different from what you would get at 3:01 PM.`,
    },
    {
      heading: 'AMCs and the Fund Industry Structure',
      body: `An Asset Management Company (AMC) is SEBI-registered entity that manages one or more mutual fund schemes. India has over 40 AMCs managing thousands of schemes with combined assets under management (AUM) exceeding ₹60 lakh crore (₹60 trillion) as of 2024. Major AMCs include SBI Mutual Fund (largest by AUM), HDFC AMC, ICICI Prudential AMC, Nippon India, Mirae Asset, Axis, and Kotak.

Each AMC must have a sponsor (the parent company), a trustee company (which holds the assets in trust for unitholders), and the AMC itself (which manages the assets). This three-tier structure ensures that the assets of investors are legally separated from the business assets of the AMC. Even if the AMC were to go bankrupt, investors' money would remain protected under the trust structure.

Fund managers are the professionals who make day-to-day investment decisions. A manager's track record, investment philosophy, and tenure at the fund are important factors when evaluating a scheme. Manager tenure matters: if a fund has delivered exceptional returns primarily under a manager who has since left, past performance may not be a reliable indicator of future performance.

The AMFI (Association of Mutual Funds in India) is the industry body for AMCs. AMFI publishes standardised performance data, best-practice guidelines, and the AMFI Risk-o-meter — a mandatory visual indicator of scheme risk level that every fund must display. AMFI's website (amfiindia.com) is a useful free resource for comparing fund returns and checking expense ratios.`,
    },
    {
      heading: 'Fund Categories: Equity, Debt, Hybrid, and Index',
      body: `SEBI has categorised mutual funds into well-defined buckets. Equity funds must invest at least 65% of their corpus in Indian equities. Sub-categories include Large Cap (top 100 stocks), Mid Cap (stocks ranked 101–250), Small Cap (ranked 251+), Multi Cap (at least 25% each in large, mid, and small), Flexi Cap (no sub-category minimum), ELSS (Equity Linked Savings Scheme — the only equity fund with a tax benefit under Section 80C, with a mandatory 3-year lock-in), and Sectoral/Thematic funds (concentrated bets on a single sector or theme).

Debt funds invest in bonds, government securities, commercial paper, and other fixed-income instruments. Key sub-categories include Liquid funds (maturity up to 91 days, used as a parking ground for short-term funds), Ultra Short Duration, Short Duration, Medium Duration, Corporate Bond, Banking and PSU, and Gilt funds (investing only in government securities). Debt funds are generally less volatile than equity funds but are not risk-free — credit risk and interest rate risk remain.

Hybrid funds invest in a mix of equity and debt. Aggressive Hybrid funds allocate 65–80% to equity; Conservative Hybrid funds allocate 75–90% to debt. Balanced Advantage funds (also called Dynamic Asset Allocation funds) dynamically shift between equity and debt based on market valuations — they have become very popular in India because of their relatively smooth return profiles.

Index funds and ETFs (Exchange Traded Funds) passively track a benchmark index like the Nifty 50 or Sensex. They do not try to outperform the index; they simply replicate it. Because no active stock selection is involved, their expense ratios are much lower (often 0.1–0.2% for large-cap index funds versus 1–2% for actively managed funds). Research globally shows that most active fund managers underperform their benchmarks over 10+ year periods, which is why index investing has gained popularity among long-term investors in India.`,
    },
    {
      heading: 'Direct vs Regular Plans',
      body: `Every mutual fund scheme in India is available in two variants: Direct Plan and Regular Plan. In a Direct Plan, you invest directly with the AMC without any distributor or advisor in the middle. In a Regular Plan, a distributor (bank, broker, or agent) facilitates the investment and receives a commission from the AMC — this commission is embedded in the higher expense ratio of the regular plan.

The expense ratio difference between regular and direct plans seems small: typically 0.5–1.0 percentage points per year for equity funds. However, compounded over 10–20 years, this difference is enormous. A ₹1 lakh investment in an equity fund returning 12% p.a. over 20 years grows to about ₹9.6 lakh in the direct plan and about ₹7.4 lakh in the regular plan (assuming 1% expense ratio difference). That is approximately ₹2.2 lakh extra — more than twice the original investment — simply from choosing the direct plan.

Platforms for investing in direct plans include Coin by Zerodha, Groww (for direct plans only), MF Central (the official AMFI platform), each AMC's own website, and myCAMS / KFintech (the two major registrar and transfer agents). You need to be comfortable making your own fund selection decisions when investing directly, as there is no advisor providing recommendations.

If you do use a regular plan through a registered investment advisor (RIA) who charges a transparent fee, that can be worth the slightly higher expense ratio — good advice has value. The problem arises when investors use regular plans through commission-driven distributors who recommend funds for the higher commission rather than the investor's benefit. SEBI mandates that all distributors disclose their commissions to investors.`,
    },
    {
      heading: 'How to Read an Expense Ratio',
      body: `The expense ratio is the annual fee that a mutual fund charges as a percentage of its average assets under management. It covers fund management fees (paid to the fund manager and AMC), administrative and operational costs, registrar fees, and marketing expenses. The expense ratio is deducted from the fund's daily NAV — you never write a cheque for it; it is invisibly subtracted.

SEBI caps expense ratios for equity schemes using a slab structure: 2.25% for the first ₹500 crore of AUM, stepping down to 1.05% for AUM above ₹50,000 crore. Direct plans must be at least 50-65 basis points lower than regular plans. Passively managed index funds and ETFs typically have expense ratios of 0.1–0.2%. Debt funds tend to have lower expense ratios than equity funds.

When evaluating two otherwise similar funds, the one with the lower expense ratio will — all else equal — deliver higher returns to investors. A 1.5% expense ratio versus 0.5% might seem like a small difference, but on a ₹10 lakh portfolio earning 10% gross, the high-expense fund delivers ₹85,000 net while the low-expense fund delivers ₹95,000 net annually — a 12% difference in net return. Over a decade, this gap becomes very significant.

You can find a fund's current expense ratio on its factsheet (published monthly by the AMC), on AMFI's website, or on any fund comparison portal. Check both the direct and regular plan expense ratios. Also look at how the expense ratio has changed over time — some AMCs gradually increase expense ratios as AUM grows above the minimum thresholds. Proactively monitoring your fund's expense ratio is a simple but effective cost-control measure.`,
    },
    {
      heading: 'Liquidity and Redemption',
      body: `One of the major advantages of open-ended mutual funds is liquidity. You can redeem your units on any business day and receive the sale proceeds in your bank account within one to three business days (T+1 for equity funds, T+1 for most debt funds, same day for liquid funds if submitted before the cut-off). There are no penalties for early redemption in most open-ended funds, though some funds levy an exit load.

Exit load is a small fee charged when you redeem within a specified period. For equity funds, a common structure is a 1% exit load if redeemed within 12 months, and zero after that. This is designed to discourage short-term churning. Check the exit load structure in the Scheme Information Document (SID) before investing.

ELSS funds (Equity Linked Savings Schemes) are the main exception to liquidity: they have a mandatory 3-year lock-in because of the Section 80C tax benefit. Close-ended funds (which are launched as NFOs and have a fixed maturity date) also have limited or no interim liquidity. Interval funds allow redemption only during specified windows.

Closed-ended funds can be listed on exchanges, theoretically providing liquidity through secondary market trading. However, these funds often trade at significant discounts to NAV, meaning you may receive less than the fund's actual per-unit value if you sell before maturity. Most retail investors are better served by open-ended funds, which always transact at the true NAV.`,
    },
  ],
};

export default lesson;
