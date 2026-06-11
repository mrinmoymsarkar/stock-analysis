import React from 'react';
import { render, screen } from '@testing-library/react';
import FundProfile from '@/components/detail/FundProfile';

describe('FundProfile', () => {
  it('renders without crashing with completely empty summary', () => {
    const { container } = render(<FundProfile summary={{}} />);
    // Should render null (nothing) gracefully
    expect(container.firstChild).toBeNull();
  });

  it('renders without crashing with missing fundProfile', () => {
    const sparseSummary = {
      summaryDetail: {},
      fundProfile: undefined,
      fundPerformance: undefined,
      topHoldings: undefined,
    };
    expect(() => render(<FundProfile summary={sparseSummary} />)).not.toThrow();
  });

  it('does not render empty sections when data is absent', () => {
    render(<FundProfile summary={{ fundProfile: {}, fundPerformance: {}, topHoldings: {} }} />);
    // No visible sections should appear — headings only show when there's actual data
    expect(screen.queryByText('Top Holdings')).not.toBeInTheDocument();
  });

  it('renders NAV when available from summaryDetail', () => {
    const summary = {
      summaryDetail: { navPrice: 45.678 },
      price: {},
    };
    render(<FundProfile summary={summary} />);
    expect(screen.getByText('NAV')).toBeInTheDocument();
    expect(screen.getByText('₹45.6780')).toBeInTheDocument();
  });

  it('renders NAV from price.regularMarketPrice when navPrice absent', () => {
    const summary = {
      summaryDetail: {},
      price: { regularMarketPrice: 123.45 },
    };
    render(<FundProfile summary={summary} />);
    expect(screen.getByText('NAV')).toBeInTheDocument();
    expect(screen.getByText('₹123.4500')).toBeInTheDocument();
  });

  it('renders fund family and category when present', () => {
    const summary = {
      summaryDetail: { navPrice: 10 },
      fundProfile: { familyName: 'SBI Mutual Fund', categoryName: 'Large Cap' },
    };
    render(<FundProfile summary={summary} />);
    expect(screen.getByText('Fund Family')).toBeInTheDocument();
    expect(screen.getByText('SBI Mutual Fund')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Large Cap')).toBeInTheDocument();
  });

  it('renders top holdings when present', () => {
    const summary = {
      topHoldings: {
        holdings: [
          { holdingName: 'Reliance Industries', holdingPercent: 0.08 },
          { holdingName: 'HDFC Bank', holdingPercent: 0.07 },
        ],
      },
    };
    render(<FundProfile summary={summary} />);
    expect(screen.getByText('Top Holdings')).toBeInTheDocument();
    expect(screen.getByText('Reliance Industries')).toBeInTheDocument();
    expect(screen.getByText('HDFC Bank')).toBeInTheDocument();
  });

  it('renders without crashing with missing topHoldings array', () => {
    const summary = {
      topHoldings: { holdings: undefined },
    };
    expect(() => render(<FundProfile summary={summary} />)).not.toThrow();
    expect(screen.queryByText('Top Holdings')).not.toBeInTheDocument();
  });
});
