import { render, screen, fireEvent } from '@testing-library/react';
import WatchlistPanel from '../WatchlistPanel';
import { StockData } from '@/types';

// Stub out StockSearch so tests don't depend on fetch/debounce
jest.mock('@/components/controls/StockSearch', () => {
  const MockSearch = ({ onSymbolSelect, className }: { onSymbolSelect: (s: string) => void; className?: string }) => (
    <input
      data-testid="stock-search"
      className={className}
      placeholder="Search"
      onChange={(e) => {
        if (e.target.value) onSymbolSelect(e.target.value);
      }}
    />
  );
  MockSearch.displayName = 'MockStockSearch';
  return MockSearch;
});

const mockStocks: Record<string, StockData> = {
  'TCS.NS': { regularMarketPrice: 2161.6, regularMarketChangePercent: 1.22 },
  'INFY.NS': { regularMarketPrice: 1116.0, regularMarketChangePercent: 0.2 },
  'WIPRO.NS': { regularMarketPrice: 180.5, regularMarketChangePercent: -1.5 },
  '^NSEI': { regularMarketPrice: 23622.5, regularMarketChangePercent: 1.99 },
  '^BSESN': { regularMarketPrice: 75477.0, regularMarketChangePercent: 2.23 },
};

const baseSymbols = ['TCS.NS', 'INFY.NS', 'WIPRO.NS', '^NSEI', '^BSESN'];

const defaultProps = {
  symbols: baseSymbols,
  stocks: mockStocks,
  activeSymbol: 'TCS.NS',
  onSetActive: jest.fn(),
  onRemove: jest.fn(),
  onSymbolSelect: jest.fn(),
};

describe('WatchlistPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders watchlist rows for non-index symbols', () => {
    render(<WatchlistPanel {...defaultProps} />);
    expect(screen.getByText('TCS.NS')).toBeInTheDocument();
    expect(screen.getByText('INFY.NS')).toBeInTheDocument();
    expect(screen.getByText('WIPRO.NS')).toBeInTheDocument();
  });

  it('excludes ^NSEI and ^BSESN from the list', () => {
    render(<WatchlistPanel {...defaultProps} />);
    expect(screen.queryByText('^NSEI')).not.toBeInTheDocument();
    expect(screen.queryByText('^BSESN')).not.toBeInTheDocument();
  });

  it('highlights the active symbol row', () => {
    render(<WatchlistPanel {...defaultProps} activeSymbol="TCS.NS" />);
    const activeRow = screen.getByRole('button', { name: /Select TCS\.NS/i });
    expect(activeRow).toHaveClass('bg-muted');
  });

  it('calls onSetActive when a row is clicked', () => {
    render(<WatchlistPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Select INFY\.NS/i }));
    expect(defaultProps.onSetActive).toHaveBeenCalledWith('INFY.NS');
    expect(defaultProps.onSetActive).toHaveBeenCalledTimes(1);
  });

  it('calls onRemove with correct symbol when remove button is clicked', () => {
    render(<WatchlistPanel {...defaultProps} />);
    const removeBtn = screen.getByRole('button', { name: /Remove TCS\.NS/i });
    fireEvent.click(removeBtn);
    expect(defaultProps.onRemove).toHaveBeenCalledWith('TCS.NS');
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
    // Should not also trigger onSetActive
    expect(defaultProps.onSetActive).not.toHaveBeenCalled();
  });

  it('shows empty state when no non-index symbols are present', () => {
    render(
      <WatchlistPanel
        {...defaultProps}
        symbols={['^NSEI', '^BSESN']}
        activeSymbol=""
      />
    );
    expect(screen.getByText(/watchlist is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/use the search box/i)).toBeInTheDocument();
  });

  it('shows empty state when symbols array is empty', () => {
    render(<WatchlistPanel {...defaultProps} symbols={[]} activeSymbol="" />);
    expect(screen.getByText(/watchlist is empty/i)).toBeInTheDocument();
  });

  it('renders price and change% for symbols that have data', () => {
    render(<WatchlistPanel {...defaultProps} />);
    // TCS should show its price
    expect(screen.getByText(/2,161\.60/)).toBeInTheDocument();
    // WIPRO should show red negative change
    const wiproChange = screen.getByText(/1\.50%/);
    expect(wiproChange).toHaveClass('text-red-600');
  });

  it('renders loading placeholder for symbols without data', () => {
    render(
      <WatchlistPanel
        {...defaultProps}
        stocks={{}} // No data yet
      />
    );
    // Rows should still be listed but show skeleton
    expect(screen.getByText('TCS.NS')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders the search input inside the panel', () => {
    render(<WatchlistPanel {...defaultProps} />);
    expect(screen.getByTestId('stock-search')).toBeInTheDocument();
  });
});
