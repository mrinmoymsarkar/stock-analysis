import { renderHook, act, waitFor } from '@testing-library/react';
import useWebSocket from '../useWebSocket';
import WS from 'jest-websocket-mock';
import { WSMessage } from '@/types';

const TEST_URL = 'ws://localhost:4000';

// jsdom doesn't ship with fetch; provide a no-op default so the polling
// fallback (triggered by WS close/error) doesn't throw.
const noop = () => Promise.reject(new Error('fetch not mocked'));
(global as any).fetch = (global as any).fetch ?? noop;

describe('useWebSocket', () => {
  let server: WS;

  beforeEach(() => {
    server = new WS(TEST_URL);
    // Default: polling fails silently so it doesn't interfere with WS tests
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('fetch unavailable'));
  });

  afterEach(() => {
    WS.clean();
    jest.restoreAllMocks();
  });

  it('should establish a connection and receive correctly structured messages', async () => {
    const mockOnMessage = jest.fn();
    renderHook(() => useWebSocket(TEST_URL, { onMessage: mockOnMessage }));

    await server.connected;

    const testMessage: WSMessage = {
      symbol: 'TCS.NS',
      data: {
        regularMarketPrice: 3500,
        regularMarketChangePercent: 1.5,
      },
      ts: Date.now(),
    };

    act(() => {
      server.send(JSON.stringify(testMessage));
    });

    expect(mockOnMessage).toHaveBeenCalledWith(testMessage);
    expect(mockOnMessage).toHaveBeenCalledTimes(1);
  });

  it('should update connection status correctly', async () => {
    const { result } = renderHook(() =>
      useWebSocket(TEST_URL, { onMessage: jest.fn(), fallbackToPolling: false })
    );

    expect(result.current.connected).toBe(false);

    await server.connected;
    await waitFor(() => expect(result.current.connected).toBe(true));

    act(() => server.close());
    await waitFor(() => expect(result.current.connected).toBe(false));
  });

  it('should clean up the connection on unmount', async () => {
    const { unmount } = renderHook(() => useWebSocket(TEST_URL, { onMessage: jest.fn() }));
    await server.connected;
    unmount();
    await expect(server.closed).resolves.toBeUndefined();
  });

  it('polls with ?symbols= and skips WebSocket for a custom symbol set', async () => {
    const customSymbols = ['WIPRO.NS', 'HCLTECH.NS'];
    const mockOnMessage = jest.fn();

    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        stocks: {
          'WIPRO.NS': { regularMarketPrice: 400, regularMarketChangePercent: 0.5 },
          'HCLTECH.NS': { regularMarketPrice: 1200, regularMarketChangePercent: -0.3 },
        },
        timestamp: Date.now(),
        source: 'api-polling',
      }),
    } as Response);

    const { result } = renderHook(() =>
      useWebSocket(TEST_URL, { onMessage: mockOnMessage, symbols: customSymbols })
    );

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const calledUrl = ((global.fetch as jest.Mock).mock.calls[0][0] as string);
    expect(calledUrl).toContain('/api/stocks/realtime?symbols=');
    expect(calledUrl).toContain('WIPRO.NS');

    // No WebSocket connection should have been made for the custom symbol set
    expect(server.server.clients().length).toBe(0);

    await waitFor(() => expect(result.current.isPolling).toBe(true));
  });
});
