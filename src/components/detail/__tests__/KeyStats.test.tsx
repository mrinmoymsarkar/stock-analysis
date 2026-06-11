import React from 'react';
import { render, screen } from '@testing-library/react';
import KeyStats from '@/components/detail/KeyStats';

const fullSummary = {
  summaryDetail: {
    trailingPE: 28.5,
    marketCap: 1800000000000,
    fiftyTwoWeekHigh: 3100,
    fiftyTwoWeekLow: 2200,
    dividendYield: 0.005,
    beta: 1.2,
    volume: 5000000,
    averageVolume: 4500000,
  },
  defaultKeyStatistics: {
    forwardPE: 22.1,
    trailingEps: 95.5,
  },
};

const fullQuote = {
  regularMarketVolume: 5000000,
};

describe('KeyStats', () => {
  it('renders P/E (Trailing) from summaryDetail', () => {
    render(<KeyStats summary={fullSummary} quote={fullQuote} />);
    expect(screen.getByText('P/E (Trailing)')).toBeInTheDocument();
    expect(screen.getByText('28.50')).toBeInTheDocument();
  });

  it('renders market cap in compact INR format', () => {
    render(<KeyStats summary={fullSummary} quote={fullQuote} />);
    expect(screen.getByText('Market Cap')).toBeInTheDocument();
    // compact INR for 1.8T — at least one value should be present
    const els = screen.getAllByText(/₹/);
    expect(els.length).toBeGreaterThan(0);
  });

  it('renders 52-week high and low', () => {
    render(<KeyStats summary={fullSummary} quote={fullQuote} />);
    expect(screen.getByText('52W High')).toBeInTheDocument();
    expect(screen.getByText('52W Low')).toBeInTheDocument();
  });

  it('omits stats that are null or undefined', () => {
    const sparseSummary = {
      summaryDetail: {
        trailingPE: null,
        marketCap: undefined,
        fiftyTwoWeekHigh: 3100,
        fiftyTwoWeekLow: 2200,
      },
      defaultKeyStatistics: {},
    };
    render(<KeyStats summary={sparseSummary} quote={{}} />);
    expect(screen.queryByText('P/E (Trailing)')).not.toBeInTheDocument();
    expect(screen.queryByText('Market Cap')).not.toBeInTheDocument();
    // These should still be present
    expect(screen.getByText('52W High')).toBeInTheDocument();
    expect(screen.getByText('52W Low')).toBeInTheDocument();
  });

  it('returns null when all stats are absent', () => {
    const { container } = render(<KeyStats summary={{}} quote={{}} />);
    expect(container.firstChild).toBeNull();
  });
});
