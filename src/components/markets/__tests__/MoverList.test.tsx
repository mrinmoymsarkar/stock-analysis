/**
 * Component tests for MoverList.
 * Verifies: row rendering, link hrefs, green/red coloring, empty state.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import MoverList from '../MoverList';
import type { MarketMover } from '@/services/markets';

const ITEMS: MarketMover[] = [
  { symbol: 'RELIANCE.NS', shortName: 'Reliance Industries', price: 2800.5, changePercent: 2.35, volume: 1_500_000 },
  { symbol: 'INFY.NS', shortName: 'Infosys Limited', price: 1450.75, changePercent: -1.8, volume: 2_000_000 },
  { symbol: 'TCS.NS', shortName: 'Tata Consultancy Services', price: 3600.0, changePercent: 0.5, volume: 800_000 },
];

describe('MoverList', () => {
  it('renders the card title', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    expect(screen.getByText('Top Gainers')).toBeInTheDocument();
  });

  it('renders a row for each item', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    // Each item shows the stripped symbol (no .NS suffix)
    expect(screen.getByText('RELIANCE')).toBeInTheDocument();
    expect(screen.getByText('INFY')).toBeInTheDocument();
    expect(screen.getByText('TCS')).toBeInTheDocument();
  });

  it('renders short names truncated', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    expect(screen.getByText('Reliance Industries')).toBeInTheDocument();
    expect(screen.getByText('Infosys Limited')).toBeInTheDocument();
  });

  it('links each row to /stock/[encodedSymbol]', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    const relianceLink = screen.getByRole('link', { name: /RELIANCE/i });
    expect(relianceLink).toHaveAttribute('href', `/stock/${encodeURIComponent('RELIANCE.NS')}`);
    const infyLink = screen.getByRole('link', { name: /INFY/i });
    expect(infyLink).toHaveAttribute('href', `/stock/${encodeURIComponent('INFY.NS')}`);
  });

  it('applies green class for positive changePercent', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    // RELIANCE.NS is +2.35%
    const changeEl = screen.getByText(/2\.35%/);
    expect(changeEl).toHaveClass('text-green-600');
  });

  it('applies red class for negative changePercent', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    // INFY.NS is -1.80%
    const changeEl = screen.getByText(/1\.80%/);
    expect(changeEl).toHaveClass('text-red-600');
  });

  it('shows ▲ for positive change and ▼ for negative change', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    expect(screen.getAllByText(/▲/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/▼/).length).toBeGreaterThan(0);
  });

  it('shows "No data available" when items is empty', () => {
    render(<MoverList title="Top Gainers" items={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('does not render volume column when showVolume is false (default)', () => {
    render(<MoverList title="Top Gainers" items={ITEMS} />);
    // Volume values like "1.5M" should not appear since showVolume defaults to false
    expect(screen.queryByText('1.5M')).not.toBeInTheDocument();
  });

  it('renders volume when showVolume is true', () => {
    render(<MoverList title="Most Active" items={[ITEMS[0]]} showVolume />);
    // en-IN compact: 1,500,000 → "15L" (lakh notation)
    expect(screen.getByText('15L')).toBeInTheDocument();
  });
});
