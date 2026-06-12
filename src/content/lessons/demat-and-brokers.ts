import type { Lesson } from '../types';

const lesson: Lesson = {
  slug: 'demat-and-brokers',
  title: 'Demat Accounts and Brokers',
  level: 'beginner',
  summary:
    'Learn how Demat and trading accounts work, how to open one online, the difference between discount and full-service brokers, and all the charges involved in buying and selling shares.',
  sections: [
    {
      heading: 'What is a Demat Account?',
      body: `A Demat (Dematerialised) account holds your financial securities — shares, bonds, mutual fund units, ETFs, sovereign gold bonds — in electronic form. Before dematerialisation, investors received physical share certificates, which could be lost, stolen, forged, or damaged. Dematerialisation eliminated all these risks.

In India, Demat accounts are maintained by two depositories: NSDL (National Securities Depository Limited) and CDSL (Central Depository Services Limited). Your broker acts as a Depository Participant (DP) — an intermediary between you and the depository. When you buy shares, NSCCL or ICCL instructs the relevant depository to credit the shares to your Demat account. When you sell, the shares are debited.

Each Demat account has a unique 16-digit beneficiary account number (16 digits for CDSL; NSDL uses an IN-prefixed 14-digit format). You will need this number when applying for IPOs. The securities held in your Demat account are entirely segregated from your broker's proprietary holdings — your broker cannot legally use your shares as collateral for its own borrowings.

It is a good practice to hold your Demat account with a depository participant registered with both NSDL and CDSL, or to maintain accounts at both depositories if you use multiple brokers. This ensures you can participate in all IPOs and receive corporate actions (dividends, bonus shares, rights issues) correctly regardless of which depository your shares are held at.`,
    },
    {
      heading: 'Trading Account vs Demat Account',
      body: `Many beginners confuse the two. A Demat account is purely a storage account — it holds your securities. A trading account is a transactional account that allows you to place buy and sell orders on stock exchanges. You need both to invest in Indian equities, and most brokers open them together as a linked pair.

The trading account is connected to both your bank account (for funds) and your Demat account (for securities). When you buy shares: the funds move from your bank to the exchange settlement pool, and the shares move from the seller's Demat to yours. When you sell: the shares move out of your Demat account, and the sale proceeds (minus charges) are credited to your bank account, typically within one business day.

For mutual fund investments, you technically do not need a trading account or even a Demat account — you can invest directly through the AMC's website, the BSE Star MF platform, or apps like MF Central. However, if you want to hold mutual fund units in Demat form (which makes portfolio tracking easier), a Demat account is needed.

Annual Maintenance Charges (AMC) are levied by the DP for maintaining your Demat account, typically ranging from ₹0 to ₹750 per year. Some brokers waive AMC for the first year or permanently as a promotional offer. Demat AMC is charged by the depository participant regardless of whether you hold any securities or trade — make sure you understand this ongoing cost before opening an account.`,
    },
    {
      heading: 'How to Open an Account — KYC and the Process',
      body: `The entire account-opening process in India is now digital. You will need: a PAN card (mandatory for all financial transactions in India), an Aadhaar card (for e-KYC via OTP or biometric), a selfie or short video for identity verification, a cancelled cheque or bank statement for bank account linking, and your signature on a white paper (for upload).

Start by visiting your chosen broker's website and clicking "Open Account." Fill in personal details, upload your documents, complete the in-person verification (IPV) via a video call or selfie-based flow, and e-sign the account opening form using your Aadhaar-linked OTP. You will receive your Demat and trading account credentials via email and SMS within one to two working days once the broker's back-office team approves your application.

SEBI requires all brokers to verify two-factor authentication (2FA) for logins. This typically means your login password plus a TOTP (Time-Based One-Time Password) from an authenticator app, or an OTP sent to your registered mobile. Always use the 2FA to protect your account.

After your account is active, link your bank account in the trading portal and complete any additional bank-mandate setup for auto-pay. Fund your trading account via UPI (instant, up to ₹1 lakh per transaction), NEFT, RTGS, or net banking. Note that funds added to your trading account are held in a "client pool account" with the exchange — they must be used for trades or withdrawn back to your bank. You cannot earn interest on funds sitting in a trading account.`,
    },
    {
      heading: 'Discount Brokers vs Full-Service Brokers',
      body: `Discount brokers charge very low or zero brokerage on equity delivery trades and a flat fee (typically ₹20 per executed order) on intraday and derivatives. They offer feature-rich online platforms but no personalised investment advice. Leading discount brokers in India include Zerodha, Upstox, Groww, Angel One, and Paytm Money. These are the right choice for self-directed investors who research their own trades.

Full-service brokers charge a percentage-based commission (typically 0.3%–0.5% of trade value on delivery) in exchange for personalised advisory services, dedicated relationship managers, research reports, and portfolio management. Examples include ICICI Direct, HDFC Securities, Motilal Oswal, and Kotak Securities. For high-net-worth individuals who want hand-holding, the service premium may be worthwhile.

When choosing a broker, prioritise safety and reliability over cost. Check that the broker is registered with SEBI, NSE, and BSE. Look at the uptime history of their trading platform — a platform crash during a volatile market day can be very costly. Review user complaints on SEBI SCORES. A broker's margin policy (how much they allow you to trade versus your deposited funds) is also important, as aggressive margin usage can amplify both gains and losses.

Newer fintech platforms like Groww and Paytm Money focus primarily on mutual funds but also offer equity trading. They are good for beginners who want a simplified experience. However, experienced traders often prefer Zerodha's Kite or Upstox Pro for their advanced charting, API access, and options trading capabilities.`,
    },
    {
      heading: 'Charges You Will Pay',
      body: `Understanding the full cost of trading is essential for evaluating profitability. The charges that apply to equity delivery trades (where you hold shares overnight) are: brokerage (often zero for delivery at discount brokers), STT (Securities Transaction Tax — 0.1% of trade value on both buy and sell sides for equity delivery), exchange transaction charges (NSE levies 0.00297% on delivery trades), GST (18% on brokerage and exchange charges), SEBI turnover charges (₹10 per crore of turnover), and stamp duty (0.015% on the buy side in most states, as per a unified regime since 2020).

For intraday equity trades, STT is charged only on the sell side at 0.025%, and brokerage is typically a flat fee of ₹20 per order at discount brokers. Derivatives — equity futures and options — carry their own STT rates and regulatory charges. Post-Budget 2024, STT on equity options was increased to ₹2,100 per crore of notional turnover on the sell side.

Demat-related charges include: DP transaction charges (levied when you sell shares — shares are debited from your Demat) typically around ₹13–15 per ISIN per transaction, and annual maintenance charges. When buying, there are no DP charges since shares are credited (not debited) to your account.

Taxes add a significant layer: Short-Term Capital Gains (STCG) on shares held less than 12 months is taxed at 20% (post-July 2024). Long-Term Capital Gains (LTCG) on shares held over 12 months is taxed at 12.5% on gains exceeding ₹1.25 lakh per year. Maintaining a record of every trade in a tax-efficient manner — a task that most good brokers automate through tax P&L reports — is important for accurate ITR filing.`,
    },
    {
      heading: 'Keeping Your Account Safe',
      body: `Your Demat and trading accounts are as sensitive as your bank account. Never share your login credentials, OTPs, or TPIN (the six-digit Demat debit PIN) with anyone — including people claiming to be from your broker's customer service. Legitimate brokers never ask for these credentials. Scams involving fake customer service numbers, WhatsApp investment groups, and social media trading tips are widespread in India.

Enable two-factor authentication (2FA) on your trading account and set up email and SMS alerts for every login, order placement, and fund transfer. Review your Demat holdings statement regularly on CDSL Easiest or NSDL Speed-e portals — these allow you to verify your holdings independently of your broker. The consolidated account statement (CAS) sent monthly to your registered email by NSDL/CDSL also shows all holdings and transactions.

Be cautious with Power of Attorney (POA) arrangements. Many brokers ask you to sign a POA during account opening that allows them to debit your Demat account for delivering shares against sales. SEBI has tightened POA regulations significantly since 2021, and you can now use the "pledge-and-repledge" mechanism for margin instead of signing a full POA. Read any POA document carefully before signing.

If you suspect unauthorised activity in your trading or Demat account, immediately call your broker's customer service, freeze your account if possible, and file a complaint on SEBI SCORES. In serious cases, a police complaint under the IT Act and relevant sections of the IPC may also be warranted. Acting quickly limits your losses and creates an evidence trail.`,
    },
    {
      heading: 'Nominee and Estate Planning',
      body: `Adding a nominee to your Demat and trading accounts is an important but often neglected step. A nominee is the person who will receive the transfer of your holdings in the event of your death. Without a nomination, your legal heirs will face a lengthy and expensive process involving court orders (succession certificate or probate) to claim the securities.

SEBI mandates that all Demat account holders either add a nominee or explicitly opt out of nomination. You can add up to three nominees and specify a percentage split. The nomination can be updated at any time through your broker's portal or by submitting a physical form to your DP.

It is important to communicate the existence of your investment accounts to trusted family members. Keep a record (stored securely, not on public cloud storage) of your Demat account number, DP ID, broker name, and registered email/mobile. In India, unclaimed financial assets worth thousands of crores sit in dormant accounts because families do not know the accounts exist.

For estate planning purposes, investments held in Demat form are much easier to transfer than physical assets. Some investors also use joint Demat accounts (operated as "Either or Survivor") to make inheritance straightforward. Consult a registered investment advisor or chartered accountant for personalised estate-planning guidance involving securities.`,
    },
  ],
};

export default lesson;
