import { render, screen, fireEvent } from '@testing-library/react';
import IndexStrip from '../IndexStrip';
import { StockData } from '@/types';

const makeStocks = (overrides: Record<string, StockData> = {}): Record<string, StockData> => ({
  '^NSEI': { regularMarketPrice: 23622.5, regularMarketChangePercent: 1.99 },
  '^BSESN': { regularMarketPrice: 75477.0, regularMarketChangePercent: 2.23 },
  ...overrides,
});

describe('IndexStrip', () => {
  const mockOnSetActive = jest.fn();

  beforeEach(() => {
    mockOnSetActive.mockClear();
  });

  it('renders both index labels when data is present', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    expect(screen.getByText('NIFTY 50')).toBeInTheDocument();
    expect(screen.getByText('SENSEX')).toBeInTheDocument();
  });

  it('renders formatted prices for both indices', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    // Intl.NumberFormat en-IN will format 23622.5 as "23,622.50"
    expect(screen.getByText(/23,622\.50/)).toBeInTheDocument();
    expect(screen.getByText(/75,477\.00/)).toBeInTheDocument();
  });

  it('renders change percentages', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    expect(screen.getByText(/1\.99%/)).toBeInTheDocument();
    expect(screen.getByText(/2\.23%/)).toBeInTheDocument();
  });

  it('hides an index gracefully when its data is missing', () => {
    const stocks: Record<string, StockData> = {
      '^NSEI': { regularMarketPrice: 23622.5, regularMarketChangePercent: 1.99 },
      // ^BSESN is intentionally absent
    };
    render(
      <IndexStrip
        stocks={stocks}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    expect(screen.getByText('NIFTY 50')).toBeInTheDocument();
    expect(screen.queryByText('SENSEX')).not.toBeInTheDocument();
  });

  it('shows loading text when no index data is available at all', () => {
    render(
      <IndexStrip
        stocks={{}}
        onSetActive={mockOnSetActive}
        connected={false}
        isPolling={false}
      />
    );
    expect(screen.getByText(/Loading indices/i)).toBeInTheDocument();
  });

  it('calls onSetActive with the correct symbol when an index is clicked', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Select NIFTY 50/i }));
    expect(mockOnSetActive).toHaveBeenCalledWith('^NSEI');
    expect(mockOnSetActive).toHaveBeenCalledTimes(1);
  });

  it('shows green dot and Live label when connected via WebSocket', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={false}
      />
    );
    // The status text "Live" is shown on sm+ screens (hidden on xs)
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('shows Polling label when in polling mode', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={true}
        isPolling={true}
      />
    );
    expect(screen.getByText('Polling')).toBeInTheDocument();
  });

  it('shows Offline label when disconnected', () => {
    render(
      <IndexStrip
        stocks={makeStocks()}
        onSetActive={mockOnSetActive}
        connected={false}
        isPolling={false}
      />
    );
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });
});
