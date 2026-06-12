import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddHoldingDialog from '../AddHoldingDialog';

jest.mock('@/components/controls/StockSearch', () => {
  return function MockStockSearch({ onSymbolSelect }: { onSymbolSelect: (s: string) => void }) {
    return (
      <button type="button" onClick={() => onSymbolSelect('TCS.NS')}>
        pick-symbol
      </button>
    );
  };
});

describe('AddHoldingDialog', () => {
  const setup = (props: Partial<React.ComponentProps<typeof AddHoldingDialog>> = {}) => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(<AddHoldingDialog open onClose={onClose} onSubmit={onSubmit} {...props} />);
    return { onSubmit, onClose };
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <AddHoldingDialog open={false} onClose={jest.fn()} onSubmit={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('rejects missing symbol and non-positive quantity', async () => {
    const { onSubmit } = setup();
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '-5' } });
    fireEvent.change(screen.getByLabelText('Buy Price (₹)'), { target: { value: '100' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Holding' }));

    expect(await screen.findByText('Symbol is required.')).toBeInTheDocument();
    expect(screen.getByText('Quantity must be a positive number.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects a future buy date', async () => {
    const { onSubmit } = setup({ prefillSymbol: 'TCS.NS' });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Buy Price (₹)'), { target: { value: '2000' } });
    const future = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
    fireEvent.change(screen.getByLabelText('Buy Date'), { target: { value: future } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Holding' }));

    expect(await screen.findByText('Buy date cannot be in the future.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid holding and closes', async () => {
    const { onSubmit, onClose } = setup();
    fireEvent.click(screen.getByText('pick-symbol'));
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Buy Price (₹)'), { target: { value: '2000.5' } });
    fireEvent.change(screen.getByLabelText('Buy Date'), { target: { value: '2025-01-10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Holding' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      symbol: 'TCS.NS',
      name: undefined,
      quantity: 10,
      buyPrice: 2000.5,
      buyDate: '2025-01-10',
    }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('closes on Escape', () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
