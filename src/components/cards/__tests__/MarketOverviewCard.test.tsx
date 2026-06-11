import { render, screen, fireEvent } from '@testing-library/react';
import MarketOverviewCard from '../MarketOverviewCard';

describe('MarketOverviewCard', () => {
  const mockProps = {
    symbol: 'TCS.NS',
    price: 3500.75,
    change: 1.25,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    mockProps.onClick.mockClear();
  });

  it('renders the stock information correctly', () => {
    render(<MarketOverviewCard {...mockProps} />);

    expect(screen.getByText('TCS.NS')).toBeInTheDocument();
    expect(screen.getByText(/3500.75/)).toBeInTheDocument();
    expect(screen.getByText(/1.25%/)).toBeInTheDocument();
  });

  it('calls the onClick handler with the correct symbol when clicked', () => {
    render(<MarketOverviewCard {...mockProps} />);

    fireEvent.click(screen.getByText('TCS.NS'));

    expect(mockProps.onClick).toHaveBeenCalledWith('TCS.NS');
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('displays a negative change with the correct color and format', () => {
    const negativeChangeProps = { ...mockProps, change: -0.5 };
    render(<MarketOverviewCard {...negativeChangeProps} />);

    const changeElement = screen.getByText(/-0.50%/);
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('text-red-600');
  });

  it('displays a positive change with the correct color and format', () => {
    render(<MarketOverviewCard {...mockProps} />);

    const changeElement = screen.getByText(/1.25%/);
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('text-green-600');
  });

  it('renders loading placeholders when price is undefined', () => {
    render(<MarketOverviewCard symbol="TCS.NS" />);

    // Symbol still shown
    expect(screen.getByText('TCS.NS')).toBeInTheDocument();
    // No price text
    expect(screen.queryByText(/₹/)).not.toBeInTheDocument();
    // Animated placeholders present
    const placeholders = document.querySelectorAll('.animate-pulse');
    expect(placeholders.length).toBeGreaterThan(0);
  });

  it('calls onRemove when the X button is clicked without triggering onClick', () => {
    const onRemove = jest.fn();
    render(<MarketOverviewCard {...mockProps} onRemove={onRemove} />);

    const removeBtn = screen.getByRole('button', { name: /remove TCS.NS/i });
    fireEvent.click(removeBtn);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });
});
