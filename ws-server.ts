import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import yahooFinance from 'yahoo-finance2';
import { getQuotes } from './src/services/yahooFinance';

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 4000;

// Initialize the yahoo-finance2 library.
// This is crucial because the library needs to fetch cookies and a crumb
// to communicate with Yahoo's API, and this can fail occasionally.
// By doing it once on startup, we make the server more robust.
async function initializeYahooFinance() {
  try {
    console.log('Initializing yahoo-finance2...');
    // We use a common, liquid stock like AAPL for a reliable initialization check.
    await yahooFinance.quote('AAPL');
    console.log('yahoo-finance2 initialized successfully.');
  } catch (error) {
    console.error('Fatal: Failed to initialize yahoo-finance2. The server will exit.', error);
    // If we can't initialize, the server is useless, so we exit.
    process.exit(1);
  }
}

const server = http.createServer();
const wss = new WebSocketServer({ server });
const latestDataCache: Map<string, unknown> = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send the cached data to the newly connected client
  if (latestDataCache.size > 0) {
    console.log('Sending cached data to new client...');
    latestDataCache.forEach((data) => {
      ws.send(JSON.stringify(data));
    });
    console.log(`${latestDataCache.size} cached items sent.`);
  }

  ws.on('close', () => console.log('Client disconnected'));
});

// Broadcasts data to all connected clients.
function broadcast(data: unknown) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// List of key Indian stocks and indices to track.
const symbols = [
  'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS',
  'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS',
  'RELIANCE.NS', 'ONGC.NS', 'NTPC.NS',
  'ITC.NS', 'HINDUNILVR.NS', 'NESTLEIND.NS',
  'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS',
  '^NSEI', // Nifty 50
  '^BSESN' // Sensex
];

// Fetches quotes for all symbols in a single batched request and broadcasts them.
async function fetchAndBroadcastAll() {
  console.log("Starting new batched fetch cycle for all symbols...");

  let quotes;
  try {
    quotes = await getQuotes(symbols);
  } catch (error) {
    console.error('Failed to fetch batched quotes:', error);
    return;
  }

  quotes.forEach((quote) => {
    if (quote && typeof quote.regularMarketPrice === 'number') {
      const message = {
        symbol: quote.symbol,
        data: {
          regularMarketPrice: quote.regularMarketPrice,
          regularMarketChangePercent: quote.regularMarketChangePercent,
        },
        ts: Date.now(),
      };
      latestDataCache.set(quote.symbol, message); // Update cache
      broadcast(message);
      console.log(`Broadcasted data for ${quote.symbol}`);
    } else {
      console.warn(`No valid data returned for ${quote?.symbol ?? 'unknown symbol'}`);
    }
  });

  console.log("Fetch cycle complete.");
}

// Main server startup sequence.
async function main() {
  await initializeYahooFinance();

  // Do the initial fetch and wait for it to complete before starting the server.
  // This ensures the cache is populated for the first client that connects.
  console.log('Performing initial data fetch...');
  await fetchAndBroadcastAll();
  console.log('Initial data fetch complete. Cache is populated.');

  // Now, start the recurring fetch loop.
  setInterval(fetchAndBroadcastAll, 60000);

  server.listen(PORT, () => {
    console.log(`WebSocket server listening on ws://localhost:${PORT}`);
  });
}

main();

