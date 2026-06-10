import YahooFinance from 'yahoo-finance2';

// v3: the default export is a class; create one shared client instance
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

/**
 * Wraps yahoo-finance2 calls to provide strongly-typed helpers.
 */
export async function getQuote(symbol: string) {
  return yahooFinance.quote(symbol);
}

// Fetches all symbols in a single Yahoo request — far less likely to be
// rate-limited than one request per symbol.
export async function getQuotes(symbols: string[]) {
  return yahooFinance.quote(symbols);
}

export async function getHistorical(symbol: string, range: string = '1mo') {
  const period2 = new Date();
  const period1 = new Date();

  switch (range) {
    case '1d':
      // The API often needs a buffer for '1d', so we ask for a few days
      period1.setDate(period2.getDate() - 3);
      break;
    case '5d':
      period1.setDate(period2.getDate() - 7);
      break;
    case '1mo':
      period1.setMonth(period2.getMonth() - 1);
      break;
    case '6mo':
      period1.setMonth(period2.getMonth() - 6);
      break;
    case '1y':
      period1.setFullYear(period2.getFullYear() - 1);
      break;
    case '5y':
      period1.setFullYear(period2.getFullYear() - 5);
      break;
    default:
      period1.setMonth(period2.getMonth() - 1); // Default to 1 month
  }

  // Format dates to YYYY-MM-DD
  const formattedPeriod1 = period1.toISOString().split('T')[0];
  const formattedPeriod2 = period2.toISOString().split('T')[0];

  // Ensure period1 and period2 are not the same day, which can cause API errors
  if (formattedPeriod1 === formattedPeriod2) {
    period1.setDate(period1.getDate() - 1);
  }

  const options = {
    period1: period1.toISOString().split('T')[0],
    period2: formattedPeriod2,
    interval: '1d' as const,
  };

  return yahooFinance.chart(symbol, options);
}

export async function getSummary(symbol: string) {
  // Select a handful of common modules – adjust as needed.
  return yahooFinance.quoteSummary(symbol, {
    modules: ['price', 'summaryDetail', 'defaultKeyStatistics'],
  });
}

export async function search(query: string) {
  return yahooFinance.search(query);
}
