import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { getQuotes } from './src/services/yahooFinance';
import { DEFAULT_SYMBOLS } from './src/lib/watchlist';

const PORT = process.env.WS_PORT ? Number(process.env.WS_PORT) : 4000;

const server = http.createServer();
const wss = new WebSocketServer({ server });
const latestDataCache: Map<string, unknown> = new Map();

wss.on('connection', (ws) => {
  console.log('Client connected');

  if (latestDataCache.size > 0) {
    console.log('Sending cached data to new client...');
    latestDataCache.forEach((data) => {
      ws.send(JSON.stringify(data));
    });
    console.log(`${latestDataCache.size} cached items sent.`);
  }

  ws.on('close', () => console.log('Client disconnected'));
});

function broadcast(data: unknown) {
  const json = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

async function fetchAndBroadcastAll() {
  console.log("Starting new batched fetch cycle for all symbols...");

  let quotes;
  try {
    quotes = await getQuotes(DEFAULT_SYMBOLS);
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
      latestDataCache.set(quote.symbol, message);
      broadcast(message);
      console.log(`Broadcasted data for ${quote.symbol}`);
    } else {
      console.warn(`No valid data returned for ${quote?.symbol ?? 'unknown symbol'}`);
    }
  });

  console.log("Fetch cycle complete.");
}

async function main() {
  server.listen(PORT, () => {
    console.log(`WebSocket server listening on ws://localhost:${PORT}`);
  });

  console.log('Performing initial data fetch...');
  try {
    await fetchAndBroadcastAll();
    console.log('Initial data fetch complete. Cache is populated.');
  } catch (error) {
    console.warn('Initial fetch failed, will retry in 60 s:', (error as Error).message);
  }

  setInterval(fetchAndBroadcastAll, 60000);
}

main();
