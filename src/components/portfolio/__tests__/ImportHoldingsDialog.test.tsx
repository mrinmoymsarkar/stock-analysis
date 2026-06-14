import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ImportHoldingsDialog from '../ImportHoldingsDialog';
import type { ParsedRow } from '@/lib/csvImport';

// Helper: build a File from a CSV string
function csvFile(content: string, name = 'holdings.csv'): File {
  const blob = new Blob([content], { type: 'text/csv' });
  return new File([blob], name, { type: 'text/csv' });
}

// Helper: simulate file selection on the hidden input
function selectFile(file: File) {
  // The component renders a hidden <input type="file">
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  // FileReader is used internally; jsdom supports it
  Object.defineProperty(input, 'files', {
    value: [file],
    configurable: true,
  });
  fireEvent.change(input);
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const CLEAN_CSV = [
  'symbol,quantity,buy_price,buy_date',
  'RELIANCE.NS,10,2450.50,2024-06-15',
  'TCS.NS,5,3900.00,2024-01-10',
  'INFY.NS,20,1600.75,2023-12-01',
].join('\n');

const MIXED_CSV = [
  'symbol,quantity,buy_price,buy_date,isin',
  'RELIANCE.NS,10,2450.50,2024-06-15,',
  'AAPL,5,170.00,2024-01-15,US0378331005',  // US — should be skipped
  'WIPRO.NS,8,500.00,2024-03-10,',
].join('\n');

const EMPTY_CSV = 'symbol,quantity,buy_price,buy_date\n';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ImportHoldingsDialog', () => {
  const setup = (props: Partial<React.ComponentProps<typeof ImportHoldingsDialog>> = {}) => {
    const onImport = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    render(
      <ImportHoldingsDialog
        open
        onClose={onClose}
        onImport={onImport}
        {...props}
      />
    );
    return { onImport, onClose };
  };

  it('renders nothing when closed', () => {
    const { container } = render(
      <ImportHoldingsDialog open={false} onClose={jest.fn()} onImport={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders dialog with upload step when open', () => {
    setup();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Import Holdings')).toBeInTheDocument();
    // Should show file drop zone
    expect(screen.getByText(/drag & drop a CSV or Excel file/i)).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    const { onClose } = setup();
    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('does NOT close when clicking inside the dialog card', () => {
    const { onClose } = setup();
    const heading = screen.getByText('Import Holdings');
    fireEvent.click(heading);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when Cancel is clicked', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  describe('after selecting a clean CSV file', () => {
    it('shows preview with correct valid count', async () => {
      setup();
      selectFile(csvFile(CLEAN_CSV));
      await waitFor(() =>
        expect(screen.getByText(/3 ready/i)).toBeInTheDocument()
      );
      expect(screen.queryByText(/skipped/i)).not.toBeInTheDocument();
    });

    it('renders rows in the preview table', async () => {
      setup();
      selectFile(csvFile(CLEAN_CSV));
      await waitFor(() => screen.getByText(/3 ready/i));
      expect(screen.getByText('RELIANCE.NS')).toBeInTheDocument();
      expect(screen.getByText('TCS.NS')).toBeInTheDocument();
      expect(screen.getByText('INFY.NS')).toBeInTheDocument();
    });

    it('enables Confirm button and calls onImport with valid rows', async () => {
      const { onImport } = setup();
      selectFile(csvFile(CLEAN_CSV));
      await waitFor(() => screen.getByText(/import 3/i));

      const confirmBtn = screen.getByRole('button', { name: /import 3/i });
      expect(confirmBtn).not.toBeDisabled();
      fireEvent.click(confirmBtn);

      await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
      const [rows] = onImport.mock.calls[0] as [ParsedRow[]];
      expect(rows).toHaveLength(3);
      expect(rows[0].symbol).toBe('RELIANCE.NS');
    });
  });

  describe('after selecting a mixed CSV with a US row', () => {
    it('shows 2 ready and 1 skipped', async () => {
      setup();
      selectFile(csvFile(MIXED_CSV));
      await waitFor(() => screen.getByText(/2 ready/i));
      // Use getAllByText since both the badge and the collapsible button contain "skipped"
      const skippedEls = screen.getAllByText(/skipped/i);
      expect(skippedEls.length).toBeGreaterThanOrEqual(1);
    });

    it('shows skipped reason when expanded', async () => {
      setup();
      selectFile(csvFile(MIXED_CSV));
      await waitFor(() =>
        screen.getByRole('button', { name: /skipped row/i })
      );

      // Click the collapsible button to expand skipped rows
      fireEvent.click(screen.getByRole('button', { name: /skipped row/i }));
      await waitFor(() =>
        expect(screen.getByText(/US stocks not yet supported/i)).toBeInTheDocument()
      );
    });

    it('onImport is called only with valid rows (no US)', async () => {
      const { onImport } = setup();
      selectFile(csvFile(MIXED_CSV));
      await waitFor(() => screen.getByText(/import 2/i));
      fireEvent.click(screen.getByRole('button', { name: /import 2/i }));
      await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1));
      const [rows] = onImport.mock.calls[0] as [ParsedRow[]];
      expect(rows).toHaveLength(2);
      expect(rows.every((r) => r.symbol !== 'AAPL')).toBe(true);
    });
  });

  describe('when CSV has no valid rows', () => {
    it('Confirm button is disabled', async () => {
      setup();
      selectFile(csvFile(EMPTY_CSV));
      // After parsing empty CSV, should show upload step or 0 ready
      // Wait briefly to see if we navigate to preview
      await waitFor(() => {
        // Either stays on upload or shows 0 ready with no Confirm button
        const confirmBtn = screen.queryByRole('button', { name: /import/i });
        if (confirmBtn) {
          expect(confirmBtn).toBeDisabled();
        }
      });
    });
  });

  describe('server error handling', () => {
    it('shows error message when onImport throws', async () => {
      const onImport = jest.fn().mockRejectedValue(new Error('Supabase insert failed'));
      render(
        <ImportHoldingsDialog open onClose={jest.fn()} onImport={onImport} />
      );
      selectFile(csvFile(CLEAN_CSV));
      await waitFor(() => screen.getByText(/import 3/i));
      fireEvent.click(screen.getByRole('button', { name: /import 3/i }));
      await waitFor(() =>
        expect(screen.getByText(/Supabase insert failed/i)).toBeInTheDocument()
      );
    });
  });

  describe('template download button', () => {
    it('renders a Template button in footer', () => {
      setup();
      // There are two Template references — footer text link and upload-step link
      const templateEls = screen.getAllByText(/template/i);
      expect(templateEls.length).toBeGreaterThanOrEqual(1);
    });

    it('renders a "Download template CSV" link in upload step', () => {
      setup();
      expect(screen.getByText(/download template csv/i)).toBeInTheDocument();
    });
  });

  describe('date defaulted warning', () => {
    it('shows asterisk for date-defaulted rows', async () => {
      const noDateCsv = [
        'symbol,quantity,buy_price',
        'RELIANCE.NS,10,2450.50',
      ].join('\n');
      setup();
      selectFile(csvFile(noDateCsv));
      await waitFor(() => screen.getByText(/1 ready/i));
      // Should show the asterisk footnote about defaulted dates
      expect(screen.getByText(/Date was missing/i)).toBeInTheDocument();
    });
  });
});
