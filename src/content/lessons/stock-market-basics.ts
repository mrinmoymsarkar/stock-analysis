import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'stock-market-basics',
  title: 'Stock Market Basics',
  level: 'beginner',
  summary:
    'Understand what the Indian stock market is, how NSE and BSE work, how orders are placed and executed, what SEBI does, and what the Nifty 50 and Sensex actually represent.',
  sections: [
    {
      heading: 'What is the Stock Market?',
      body: `A stock market is an organised marketplace where buyers and sellers trade shares of publicly listed companies. When a company wants to raise capital from the public, it lists its shares on a stock exchange through an Initial Public Offering (IPO). After listing, those shares can be freely bought and sold by investors on the exchange.

In India, the two primary exchanges are the National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE). Both operate under a strict regulatory framework overseen by the Securities and Exchange Board of India (SEBI). The market is open Monday to Friday from 9:15 AM to 3:30 PM IST, with a pre-opening session from 9:00 AM.

Owning a share means owning a fractional piece of that company. As the company grows and becomes more profitable, the value of your shares tends to increase. Companies may also distribute a portion of their profits as dividends, providing investors with a regular income stream in addition to price appreciation.

The stock market plays a vital role in the economy by channelling savings into productive investment. Companies get access to capital to expand, and investors get the opportunity to participate in that growth. Over long periods, equities have historically delivered better inflation-adjusted returns than most other asset classes available to Indian investors.`,
    },
    {
      heading: 'NSE and BSE — India\'s Two Major Exchanges',
      body: `The National Stock Exchange (NSE) was founded in 1992 and started electronic trading in 1994. It was the first exchange in India to introduce fully automated, screen-based trading, which dramatically improved price transparency and reduced settlement times. Today NSE accounts for the vast majority of equity and derivative trading volumes in India.

The Bombay Stock Exchange (BSE) is Asia's oldest exchange, established in 1875 on Dalal Street in Mumbai. BSE lists more than 5,000 companies — far more than NSE — making it important for smaller and regional companies. Despite the larger number of listings, BSE handles lower trading volumes in most market segments compared to NSE.

Both exchanges operate in what is called a T+1 settlement cycle, meaning trades are settled the next working day. NSCCL (NSE's clearing corporation) and ICCL (BSE's clearing corporation) act as central counterparties, guaranteeing settlement even if one side of the trade defaults. This eliminates counterparty risk for retail investors.

For most liquid large-cap stocks, prices on NSE and BSE are nearly identical because arbitrageurs actively close any price gaps. Indian securities law allows the same share to be traded on both exchanges using the same ISIN (International Securities Identification Number). When you buy a share listed on both exchanges, the share is identical regardless of which exchange the order routes through.`,
    },
    {
      heading: 'How Orders Work',
      body: `When you place a buy or sell order through your broker's platform, it is sent to the exchange's order matching system. The system matches buy and sell orders based on price and time priority — the best bid (highest price a buyer is willing to pay) is matched with the best offer (lowest price a seller is willing to accept). This is called the order book.

There are two primary order types: Market Orders and Limit Orders. A Market Order is executed immediately at the best available price in the market. It guarantees execution but not price. A Limit Order allows you to specify the maximum price you are willing to pay (for a buy) or the minimum you will accept (for a sell). It guarantees price but not execution — if the market never reaches your limit, the order remains unfilled.

Additional order types include Stop-Loss (SL) orders, which automatically trigger a market or limit order when the price crosses a threshold, protecting you from excessive losses. After-market orders (AMO) can be placed outside trading hours and are queued for the next session. IOC (Immediate or Cancel) orders are either executed instantly or cancelled.

All retail orders in India must be routed through SEBI-registered brokers. Discount brokers like Zerodha, Upstox, and Groww offer low-cost order routing, while full-service brokers like ICICI Direct and HDFC Securities provide research and advisory services at higher commissions. The broker sends your filled order details to the exchange, which then instructs the depositories (NSDL or CDSL) to transfer shares from the seller's Demat account to yours.`,
    },
    {
      heading: 'SEBI — India\'s Market Regulator',
      body: `SEBI (Securities and Exchange Board of India) is the statutory regulator for the Indian securities market, established in 1988 and given statutory powers in 1992. Its mandate is to protect investor interests, promote the development of the securities market, and regulate market intermediaries. SEBI is headquartered in Mumbai with regional offices across India.

SEBI regulates every major participant in the market — stock exchanges, depositories, mutual funds, brokers, portfolio managers, investment advisors, and listed companies. It formulates regulations, investigates market manipulation and insider trading, and has the power to levy fines, cancel registrations, or refer cases for criminal prosecution.

Key investor-protection measures introduced by SEBI include the mandatory T+1 settlement cycle, margining requirements for derivatives, the pledge-repledge mechanism for collateral (which prevents brokers from misusing client securities), and the nomination facility for Demat accounts. SEBI also mandates disclosure of insider shareholding patterns, quarterly financial results, and related-party transactions.

For retail investors, SEBI's SCORES (SEBI Complaint Redress System) platform at scores.gov.in allows you to file grievances against any SEBI-regulated entity. SEBI also publishes an Investor Education programme and maintains SEBI Investor (investor.sebi.gov.in) as a resource hub. Understanding SEBI's role helps investors distinguish regulated products from unregistered schemes that are often fraudulent.`,
    },
    {
      heading: 'Indices: Nifty 50 and Sensex',
      body: `A stock market index is a statistical measure of a segment of the market. Rather than tracking every stock, an index tracks a curated basket and shows whether that basket, on average, is rising or falling. Indices serve as benchmarks for portfolio performance and as the underlying for index funds, ETFs, and derivatives.

The Nifty 50 is NSE's flagship index, comprising the 50 largest companies by free-float market capitalisation across 13 sectors. "Free-float" means only shares available for public trading are counted, excluding promoter-held locked-in shares. The index is reviewed every six months; companies that no longer meet eligibility criteria are replaced. Well-known constituents include Reliance Industries, TCS, Infosys, HDFC Bank, and Bajaj Finance.

The Sensex (or S&P BSE Sensex) is BSE's 30-stock benchmark, also weighted by free-float market cap. It was launched in 1986 with a base value of 100. Both the Nifty 50 and Sensex move together most of the time since they represent India's largest companies. The Sensex crossing 100,000 (one lakh) points is frequently discussed in the media as a psychological milestone.

Beyond the flagship indices, NSE and BSE publish dozens of sub-indices: Nifty Bank, Nifty IT, Nifty Pharma, BSE Midcap, BSE Smallcap, and many more. These sector indices help investors track specific parts of the market. When an analyst says "the market was up 1%," they almost always mean the Nifty 50 or Sensex moved by that amount.`,
    },
    {
      heading: 'How to Approach Investing in Stocks',
      body: `Before buying any stock, it is important to understand the difference between investing and trading. Investing typically means holding shares for months or years with the expectation of long-term capital appreciation. Trading involves buying and selling over shorter time frames — days, hours, or even minutes — to capture price movements. Most retail investors who attempt active trading lose money; SEBI's own studies show that more than 90% of retail F&O (futures and options) traders lose money.

For beginners, a sensible starting point is to invest through SEBI-registered equity mutual funds before directly picking individual stocks. Mutual funds provide instant diversification, professional management, and lower minimum investment amounts. Once you have accumulated some experience and developed conviction about specific companies, direct equity investment becomes more appropriate.

Regardless of approach, always invest only money you will not need for at least three to five years. Short-term market volatility is normal — the Nifty 50 has experienced drawdowns of 30% or more several times in the past two decades, yet has recovered and gone on to new highs. Panic-selling during downturns and chasing performance during bull markets are the two most common mistakes retail investors make.

Maintain a written investment rationale for every stock you buy: why you are buying it, what price makes it attractive, and what would make you sell. This discipline prevents emotional decision-making and helps you learn from both wins and losses over time.`,
    },
    {
      heading: 'Getting Started: Practical Steps',
      body: `To begin investing in Indian equities, you need three accounts: a bank account (savings or current), a Demat account (to hold securities electronically), and a trading account (to place buy/sell orders). Most brokers open all three together through a seamless online process.

The account opening process requires KYC (Know Your Customer) verification, which involves submitting your PAN card, Aadhaar, address proof, bank details, and a selfie or video. The entire process has moved online and typically takes one to two working days. Once your accounts are active, you can fund your trading account through UPI, NEFT, or IMPS.

Start by learning to read a basic company fact sheet: revenue growth, profit margins, debt levels, and management quality. SEBI mandates that all listed companies publish quarterly results and annual reports on their BSE/NSE filings pages — all freely accessible to the public. The NSE and BSE websites also provide live market data, indices, and company-specific information at no cost.

Risk management is fundamental. Never invest borrowed money in equities. Diversify across at least 8–10 stocks across different sectors. Review your portfolio at least quarterly, but do not check prices daily — frequent monitoring tends to increase anxiety and leads to poor decisions. Most importantly, continue learning. The more you understand about how businesses and markets work, the better your long-term outcomes will be.`,
    },
  ],
};

export default lesson;
