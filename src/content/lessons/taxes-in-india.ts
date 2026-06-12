import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'taxes-in-india',
  title: 'Taxes on Investments in India',
  level: 'advanced',
  summary:
    'A comprehensive guide to capital gains taxes (STCG and LTCG on equity and debt), dividend taxation, STT, and ITR filing for Indian investors — with a reminder that tax rules change frequently and should be verified with a professional.',
  sections: [
    {
      heading: 'Overview: Why Tax Matters for Investors',
      body: `Taxes are a major and often underestimated drag on investment returns. An investor who earns 12% gross returns but pays 20% STCG on frequent trades keeps only about 9.6% net — and that gap widens each time a position is churned. Understanding the tax treatment of your investments before you invest allows you to structure your portfolio and holding periods efficiently and legally.

India taxes investment income through multiple layers: capital gains tax (on profits from selling assets), dividend distribution tax (passed to investors since 2020), and Securities Transaction Tax (STT) — a transaction-level levy that applies regardless of whether a trade is profitable. Each layer interacts differently depending on the asset type, holding period, and the investor's overall income level.

Indian tax law in this area changes frequently — Budget announcements can and do alter rates, exemption limits, and even the very definition of which assets qualify for which treatment. The rules described in this lesson reflect the regime as of Budget 2024 (Union Budget presented on July 23, 2024) and are intended to give you a solid working understanding, not definitive legal advice.

Always verify current rates with a SEBI-registered investment advisor, a chartered accountant, or the official Income Tax Department portal (incometax.gov.in) before filing your return or making major investment decisions. Tax rules that were in place when you invested may not be the rules in place when you sell.`,
    },
    {
      heading: 'Short-Term Capital Gains (STCG) on Equity',
      body: `Short-Term Capital Gains (STCG) arise when you sell listed equity shares or equity-oriented mutual fund units within 12 months of purchase (i.e., holding period of 12 months or less). Post-Budget 2024 (effective from July 23, 2024), the flat STCG rate on equity is 20%, increased from the earlier 15%. This rate applies regardless of your income tax slab and is added on top of any applicable surcharge and education cess.

STCG is computed as: Sale Price − Purchase Price − Brokerage/Transaction Costs. You cannot apply indexation benefit (inflation adjustment) to equity STCG. If you buy 100 shares at ₹200 and sell at ₹250 within 6 months, your STCG is ₹5,000 and the tax due is ₹1,000 (20%). STT paid on the transactions is not deductible from the gain but is a separate cost that reduces your effective profit.

STCG must be reported in your Income Tax Return even if your total income is below the basic exemption limit. The applicable ITR form for investors with capital gains is ITR-2 (if you have no business income) or ITR-3 (if you also have business income). Most brokers provide a tax P&L report at year-end that pre-calculates your STCG and LTCG, which significantly simplifies ITR preparation.

Advance tax provisions apply if your total tax liability for the year (including STCG) exceeds ₹10,000. Quarterly advance tax instalments (15% by June 15, 45% by September 15, 75% by December 15, 100% by March 15) must be paid to avoid interest under Sections 234B and 234C. Ignoring advance tax on equity gains is a common error that results in unexpected interest payments.`,
    },
    {
      heading: 'Long-Term Capital Gains (LTCG) on Equity',
      body: `Long-Term Capital Gains (LTCG) apply when listed equity shares or equity-oriented mutual fund units are held for more than 12 months before being sold. Post-Budget 2024, the LTCG rate is 12.5% without the benefit of indexation (previously it was 10% with an annual exemption of ₹1 lakh). The annual exemption has been revised upward to ₹1.25 lakh per financial year.

This means: if your total LTCG in a financial year is ₹1.25 lakh or less, you pay zero LTCG tax. If your LTCG is ₹2 lakh, you pay 12.5% only on (₹2 lakh − ₹1.25 lakh) = ₹75,000, which works out to ₹9,375. The exemption applies to the aggregate LTCG across all equity and equity mutual fund transactions in the year, not separately for each transaction.

Grandfathering provisions introduced with the original LTCG reintroduction in Budget 2018 still apply. Shares and equity mutual funds held as of January 31, 2018 are subject to "grandfathering": the cost basis for computing gains is deemed to be the higher of (a) the original acquisition cost and (b) the NAV or lower of the market price on January 31, 2018 or the actual sale price. Any gain up to January 31, 2018 remains permanently exempt. This primarily affects long-term investors who bought shares before 2018.

Tax-loss harvesting is a legal strategy worth understanding. If you have unrealised LTCG close to the ₹1.25 lakh exemption limit, you can sell appreciated positions before the financial year ends to "realise" gains within the exempt limit, then repurchase — resetting your cost basis higher. Similarly, selling loss-making positions offsets gains in the same year. LTCG losses can be carried forward for up to 8 years and set off only against future LTCG (not STCG or other income).`,
    },
    {
      heading: 'Debt Fund Taxation Post April 2023',
      body: `The taxation of debt mutual funds underwent a fundamental change with the Finance Act 2023, effective from April 1, 2023. Before this date, debt funds held for more than 36 months qualified for Long-Term Capital Gains with indexation benefit, effectively taxed at a very low effective rate for long-term investors. This made debt funds more tax-efficient than bank fixed deposits for investors in the 30% tax bracket.

After April 1, 2023, all mutual funds with less than 35% allocation to Indian equities — which includes all debt funds, international funds, gold funds, fund of funds, and most arbitrage funds that hold predominantly debt — are taxed at the investor's applicable income tax slab rate, regardless of the holding period. There is no distinction between short-term and long-term for these funds anymore.

This change made debt funds broadly tax-equivalent to bank FDs for investors in the 30% slab, eliminating one of their main advantages. However, debt funds still offer other benefits: higher liquidity (T+1 redemption vs FD penalty for premature withdrawal), mark-to-market transparency, professional credit and duration management, and the ability to invest in short-term paper through liquid and overnight funds.

The revised taxation framework has significant implications for asset allocation. Many investors who had large debt fund allocations have shifted to: direct bonds and NCDs (which retain the pre-2023 debt fund-like tax treatment under certain conditions), bank FDs (now tax-equivalent for most investors), arbitrage funds (which hold equity delivery positions and derivatives, qualify for equity taxation — LTCG/STCG rules — despite having low equity risk), and equity savings funds (partial equity exposure with equity-like tax treatment).`,
    },
    {
      heading: 'Dividend Taxation',
      body: `Since April 1, 2020, dividends from Indian companies and mutual funds are taxable in the hands of the investor at their applicable income tax slab rate. Prior to that date, dividends were tax-free in the hands of investors because the company paid a Dividend Distribution Tax (DDT) before distributing. The shift to investor-level taxation significantly changed the calculus for high-income investors who previously received dividends tax-free.

For investors in the 30% tax slab (plus surcharge and cess, potentially 35%+), dividends from Indian companies are now effectively taxed at more than 35%. This has made dividend-paying stocks less attractive relative to growth stocks for high-income investors, particularly in sectors like FMCG and IT that historically maintained high dividend payout ratios.

Companies are required to deduct TDS (Tax Deducted at Source) at 10% on dividends paid to resident individuals exceeding ₹5,000 in a financial year. This TDS is credited against your final tax liability when you file your ITR. If your actual tax on dividends is higher than the TDS deducted (because you are in a higher slab), the balance is payable as tax. If your income is below the taxable threshold, you can file Form 15G/15H to prevent TDS deduction.

For mutual fund dividends (technically called "Income Distribution cum Capital Withdrawal" or IDCW after a SEBI-mandated name change in 2021), the same slab-rate taxation applies. The name change from "Dividend Plan" to "IDCW Plan" was intended to make it clear that part of the distribution may be a return of capital (which it always was in an IDCW plan), not purely income. For most long-term investors, Growth plans remain more tax-efficient than IDCW plans because gains compound without being taxed until redemption.`,
    },
    {
      heading: 'STT, Exchange Charges, and Transaction Costs',
      body: `Securities Transaction Tax (STT) is levied on transactions in securities markets and is collected by the exchange at the time of the trade. It applies to equity delivery purchases (0.1% on both buy and sell sides), equity intraday trades (0.025% on the sell side only), equity futures (0.02% on the sell side), and equity options (₹2,100 per crore of notional turnover on the sell side, revised in Budget 2024 from ₹625 per crore).

STT was introduced in 2004 to improve tax compliance and reduce settlement-related tax evasion in the equity markets. It is non-refundable and cannot be set off against capital gains tax liability. However, STT paid is treated as a deductible expense for computing business income in cases where securities trading is treated as a business (applicable to traders who treat equity gains as business income rather than capital gains).

The choice between treating equity transactions as capital gains versus business income has significant tax implications. Capital gains treatment gives you access to the lower STCG (20%) and LTCG (12.5%) rates and the LTCG exemption. Business income treatment subjects all profits to slab rates (up to 30%+) but allows deduction of all trading-related expenses including internet, hardware, software, and office costs, plus the ability to carry forward business losses for 8 years against any business income.

Other transaction charges are smaller but add up over a large number of trades: SEBI charges (₹10 per crore of turnover), exchange transaction charges (NSE charges 0.00297% on equity delivery), GST at 18% on brokerage and exchange charges, and DP charges (approximately ₹13–15 per ISIN per sell transaction). These are clearly itemised in your broker's contract note for every trade, and tracking them helps you evaluate the true cost of your trading activity.`,
    },
    {
      heading: 'ITR Filing for Investors',
      body: `If you have any capital gains from selling securities, you must file an Income Tax Return (ITR), even if your total income is below the basic exemption limit. The applicable forms are ITR-2 (for individuals and HUFs with capital gains but no business income) and ITR-3 (for those who also have business or professional income). ITR-1 (Sahaj) cannot be used if you have capital gains from securities.

The deadline for filing ITR for the financial year is typically July 31 of the following year (e.g., April 2024–March 2025 income must be filed by July 31, 2025) for individuals who are not required to get their accounts audited. A belated return can be filed until December 31 with a penalty of ₹5,000 (₹1,000 for income below ₹5 lakh). Revised returns can be filed before December 31 to correct errors.

The Capital Gains Schedule in the ITR form requires you to enter each transaction (sale date, buy date, sale price, purchase price, gain amount) for short-term and long-term gains separately across different asset classes. Most brokers provide a downloadable "Capital Gains Statement" or "Tax P&L Report" at year-end that lists every transaction in the required format. Some brokers also integrate directly with ITR filing portals to pre-fill the schedule.

Maintain records of all investment transactions for at least 8 years beyond the financial year in which you sell the securities, as this matches the period during which the Income Tax Department can issue a notice for assessment. Keep contract notes, Demat account statements, and mutual fund account statements. For investments made before 2018 that qualify for grandfathering, keep the original purchase records and the January 31, 2018 NAV statements as well.`,
    },
    {
      heading: 'Important Disclaimer: Tax Rules Change',
      body: `The tax provisions described in this lesson are based on the Indian Union Budget presented on July 23, 2024, and reflect the law as understood at that time. Indian tax law, particularly in the area of capital markets, changes with every annual Budget. Rates, exemption limits, definitions, and entire categories of taxation can be altered or introduced with as little as one day's notice (effective from the day of Budget announcement).

Specific provisions that have changed significantly in the recent past include: LTCG reintroduced on equity in Budget 2018 (after a 14-year absence), DDT on dividends abolished and dividend taxation shifted to investors in Budget 2020, debt fund taxation fundamentally changed in Finance Act 2023, and STCG and LTCG rates revised in Budget 2024 (STCG up from 15% to 20%, LTCG up from 10% to 12.5%, exemption up from ₹1 lakh to ₹1.25 lakh). Any of these may change again in future Budgets.

This lesson is intended to provide a conceptual framework for understanding investment taxation, not as a substitute for professional tax advice. Before making any significant investment or disinvestment decision that is primarily tax-driven, consult a Chartered Accountant (CA) or a SEBI-Registered Investment Advisor (RIA) who is current on the latest provisions. Decisions based on outdated tax information can result in unexpected tax liability or missed optimisation opportunities.

The Income Tax Department's official portal (incometax.gov.in), the Finance Ministry's Budget documents, and the SEBI website (sebi.gov.in) are the primary authoritative sources for current rules. AMFI's website also publishes guidance on mutual fund taxation that is regularly updated. Always verify any tax information you encounter — including in this lesson — against these official sources or with a qualified professional.`,
    },
  ],
};

export default lesson;
