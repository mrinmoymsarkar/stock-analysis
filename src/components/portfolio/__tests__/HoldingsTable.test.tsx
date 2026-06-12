import { render, screen, fireEvent } from '@testing-library/react';
import HoldingsTable from '../HoldingsTable';
import type { Holding, Quote } from '@/lib/portfolio';

const holdings: Holding[] = [
  { id: 'l1', symbol: 'TCS.NS', quoteType: 'EQUITY', quantity: 10, buyPrice: 2000, buyDate: '2025-01-10' },
  { id: 'l2', symbol: 'TCS.NS', quoteType: 'EQUITY', quantity: 10, buyPrice: 2200, buyDate: '2025-06-10' },
  { id: 'l3', symbol: 'INFY.NS', quoteType: 'EQUITY', quantity: 5, buyPrice: 1000, buyDate: '2025-03-01' },
];

const quotes: Record<string, Quote> = {
  'TCS.NS': { price: 2400, changePercent: 1.5 },
  'INFY.NS': { price: 1100, changePercent: -0.5 },
};

describe('HoldingsTable', () => {
  it('renders one aggregated row per symbol with lot count badge', () => {
    render(<HoldingsTable holdings={holdings} quotes={quotes} onAddLot={jest.fn()} onRemoveLot={jest.fn()} />);
    // Symbol links render in both desktop and mobile layouts
    expect(screen.getAllByRole('link', { name: 'TCS.NS' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'INFY.NS' }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('2 lots').length).toBeGreaterThan(0);
  });

  it('expands lots and calls onRemoveLot for a specific lot', () => {
    const onRemoveLot = jest.fn();
    render(<HoldingsTable holdings={holdings} quotes={quotes} onAddLot={jest.fn()} onRemoveLot={onRemoveLot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand lots' }));
    const deleteButtons = screen.getAllByTitle('Delete lot');
    fireEvent.click(deleteButtons[0]);
    expect(onRemoveLot).toHaveBeenCalledWith('l1');
  });

  it('calls onAddLot with the symbol', () => {
    const onAddLot = jest.fn();
    render(<HoldingsTable holdings={holdings} quotes={quotes} onAddLot={onAddLot} onRemoveLot={jest.fn()} />);

    fireEvent.click(screen.getAllByTitle('Add lot')[0]);
    expect(onAddLot).toHaveBeenCalledWith(expect.any(String), undefined);
  });

  it('shows placeholders when a quote is missing', () => {
    render(
      <HoldingsTable
        holdings={[holdings[2]]}
        quotes={{}}
        onAddLot={jest.fn()}
        onRemoveLot={jest.fn()}
      />
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders empty state with no holdings', () => {
    render(<HoldingsTable holdings={[]} quotes={{}} onAddLot={jest.fn()} onRemoveLot={jest.fn()} />);
    expect(screen.getByText('No holdings yet.')).toBeInTheDocument();
  });
});
