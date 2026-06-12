import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'sip-investing',
  title: 'SIP Investing',
  level: 'intermediate',
  summary:
    'Understand how Systematic Investment Plans work, why rupee cost averaging matters, how to set up and step up your SIPs, what duration and amount to choose, and the most common mistakes to avoid.',
  sections: [
    {
      heading: 'How a SIP Works',
      body: `A Systematic Investment Plan (SIP) is an instruction to an AMC to automatically debit a fixed amount from your bank account at regular intervals — monthly, fortnightly, or weekly — and invest it in a chosen mutual fund scheme. The amount buys units at the prevailing NAV on the SIP date. You can start a SIP with as little as ₹500 per month in most equity funds.

Mechanically, you set up a NACH (National Automated Clearing House) mandate or a UPI AutoPay mandate authorising the fund house or its registrar to debit your account. Once active, the SIP runs automatically until you cancel it, reach a specified end date, or the number of instalments you originally opted for is completed. This automation is a key feature — it removes the need to actively remember and execute an investment each month.

The power of a SIP lies in discipline and consistency, not in any special mathematical magic. By investing a fixed amount regularly regardless of market conditions, you accumulate units steadily. In months when markets are high, your fixed amount buys fewer units; in months when markets are low, it buys more. This is rupee cost averaging — your average cost per unit over time tends to be lower than the average NAV over the same period.

A SIP does not guarantee profits or protect against all losses. If the market falls sharply and stays down for many years, a SIP will continue buying at lower NAVs (which is beneficial for long-term accumulation) but the portfolio value will still show a loss in the short term. SIPs are tools for long-term wealth creation, not short-term market timing.`,
    },
    {
      heading: 'Rupee Cost Averaging in Practice',
      body: `Rupee cost averaging (RCA) works because of a mathematical relationship between average cost and average NAV. When you invest a fixed rupee amount, lower NAV values result in more units purchased, and higher NAV values result in fewer units. Consequently, your average cost per unit is always lower than the simple arithmetic average of NAVs over the same period.

Consider a simple three-month example: Month 1 NAV ₹100, Month 2 NAV ₹50, Month 3 NAV ₹100. The arithmetic average NAV is ₹83.33. But if you invest ₹1,000 each month, you buy 10 units in Month 1, 20 in Month 2, and 10 in Month 3 — total 40 units for ₹3,000. Your average cost per unit is ₹75. You benefit from the volatility because you automatically buy more units when prices are low.

The benefit of RCA diminishes in strongly trending markets. In a steadily rising market, lumpsum investment at the beginning outperforms SIPs because the entire corpus benefits from appreciation from day one. In a steadily falling market, SIPs lose money like any equity investment — just less than a lumpsum invested at the beginning. The real advantage of SIPs over lumpsums appears in volatile or sideways markets, which describe most real-world market conditions.

For investors who receive a monthly salary, SIPs are a natural fit because they align investment with income. For investors with irregular income or large lumpsum amounts (bonus, inheritance, property sale proceeds), the choice between SIP and lumpsum should be based on current market valuations and personal financial planning needs, not a blanket rule that one is always better.`,
    },
    {
      heading: 'Choosing the Right SIP Amount',
      body: `The most important principle in choosing a SIP amount is that it should come from surplus after all essential expenses and emergency fund contributions are covered. A SIP that forces you to dip into your emergency fund or delay paying bills creates financial stress and may cause you to cancel the SIP at the worst time — market downturns — which defeats the purpose.

A useful framework for setting a SIP amount is goal-based planning. Decide on a specific financial goal (child's education in 15 years, retirement corpus, home down payment in 7 years), estimate the target corpus in today's rupees adjusted for inflation, then use a SIP calculator to determine the monthly investment needed at an assumed return rate. Most financial planning tools assume 10–12% p.a. for diversified equity funds over the long term, though this is not guaranteed.

Start with an amount you are comfortable with — even ₹2,000/month — and increase it as your income grows. Do not wait until you can afford a "meaningful" SIP amount. The compounding benefits of starting early with a small amount almost always outweigh starting later with a larger amount. A ₹2,000/month SIP started at age 22 will typically create more wealth by age 60 than a ₹5,000/month SIP started at age 30, even though the total absolute investment may be lower.

Avoid the temptation to invest in too many funds simultaneously. Three to four well-chosen funds across different categories provide sufficient diversification. Having 15 different SIPs in 15 different funds does not reduce risk proportionally — most diversified equity funds hold similar underlying stocks, so the marginal benefit of adding more funds declines quickly after the first few.`,
    },
    {
      heading: 'Step-Up SIPs and Auto-Escalation',
      body: `A step-up SIP (also called a top-up SIP) allows you to automatically increase your SIP amount at regular intervals — usually annually. For example, if your salary increases by 10% each year, you can set your SIP to automatically increase by 10% on the same date each year. Most AMCs and SIP platforms support step-up SIPs directly in the mandate form.

The impact of step-up SIPs on long-term wealth creation is dramatic. A flat ₹5,000/month SIP for 25 years at 12% p.a. grows to approximately ₹94 lakh. The same SIP starting at ₹5,000/month but increasing by 10% each year grows to approximately ₹3.45 crore over the same period — roughly 3.7x more, despite the total invested amount being roughly 2.5x more. The extra wealth comes from the power of compounding on the increasing instalments.

When setting up a step-up SIP, be conservative in your escalation assumptions. Link the annual increase to a fixed percentage you are confident about based on your expected income growth, not an optimistic projection. An escalation commitment of 5–10% annually is typically achievable for salaried professionals in India. Overpromising and then cancelling the step-up because you cannot afford it undermines the strategy.

Some platforms allow you to set a ceiling on the maximum SIP amount, which is useful if you want the SIP to step up until it reaches a specific monthly contribution and then plateau. This structure allows you to plan your total monthly investment budget accurately years in advance.`,
    },
    {
      heading: 'Choosing SIP Duration',
      body: `SIP duration should be matched to your financial goal's time horizon. For long-term goals like retirement (15–30 years away) or a child's higher education (10–18 years away), long-running equity fund SIPs are appropriate. For medium-term goals (3–5 years), a mix of equity and debt funds may be more appropriate. For goals less than 3 years away, equity SIPs carry too much short-term volatility risk — debt or hybrid funds with lower equity allocation are safer.

One common mistake is setting an unrealistically short duration for an equity SIP. Equity markets can remain flat or negative for 3–5 years at a stretch. If your goal is just 2 years away, an equity SIP that happens to run into a bear market can leave you significantly below target with no time to recover. The solution is to gradually shift your accumulated equity corpus to debt instruments as the goal approaches — a process called "lifecycle de-risking" or "SIP to SWP" (Systematic Withdrawal Plan) transition.

Perpetual SIPs (no fixed end date) are a practical option for wealth-building goals without a specific deadline. You invest as long as you like and redeem when you need the money. This is the right structure for retirement savings — there is no specific "end date" in the traditional sense; you want the portfolio to keep compounding until retirement and then gradually redeem through a Systematic Withdrawal Plan.

Review your SIP portfolio at least once a year. Check whether the fund is still performing in line with its benchmark and category peers. Check whether the expense ratio has changed. Check whether the fund manager is still the same. Check whether the fund's AUM has grown so large that it can no longer efficiently execute its stated strategy (a known issue with small-cap funds in particular). None of these checks should trigger frequent churn, but they should surface any serious red flags.`,
    },
    {
      heading: 'Common SIP Mistakes to Avoid',
      body: `The most destructive mistake is stopping a SIP during a market crash. Markets falling by 20–30% feel terrifying, but they are exactly when a SIP is working best — buying more units at lower prices that will appreciate when markets recover. Historically, investors who paused their SIPs during the 2008–09 global financial crisis, the 2013 taper tantrum, or the 2020 COVID crash and missed even a few months of bottom-NAV investments severely impaired their long-term returns.

Chasing last year's top-performing fund is another common error. Fund performance rotates across categories and managers. The small-cap fund that was the top performer last year may become the worst performer this year as valuations stretch and sentiment reverses. Consistent top-quartile performance over 5–7 years is more meaningful than last year's return. Switching funds frequently to chase performance also triggers exit loads and potential tax events.

Investing without understanding risk is a third mistake. Many investors start a large SIP in a small-cap or sectoral fund after a period of strong performance, believing the trend will continue. Small-cap funds can fall 50–60% in a severe bear market and may take 4–5 years to recover. Make sure the volatility of the fund you choose is compatible with your risk tolerance and time horizon. The AMFI Risk-o-meter (shown on every fund's factsheet) provides a starting point.

Finally, do not treat an SIP as "set and forget" indefinitely. While automation is the point, a complete absence of review means you might miss important changes. A fund house undergoing significant management upheaval, a fund deviating from its stated mandate (discovered during portfolio overlaps analysis), or a category that has fundamentally changed in risk profile — these are the kinds of changes that may warrant a switch. Annual reviews are sufficient for most investors.`,
    },
  ],
};

export default lesson;
