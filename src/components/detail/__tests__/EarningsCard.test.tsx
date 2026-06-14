/**
 * Tests for EarningsCard — next earnings date and quarterly EPS actual vs estimate.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EarningsCard from '@/components/detail/EarningsCard';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

// Use a date guaranteed to be in the future relative to the fixed test "now".
// The component picks the soonest valid date without filtering by "now", so any
// parseable date will appear — we just need a recognisable value.
const NEXT_EARNINGS_DATE = '2035-07-17T10:00:00.000Z';

const FULL_SUMMARY = {
  calendarEvents: {
    earnings: {
      earningsDate: [NEXT_EARNINGS_DATE],
      isEarningsDateEstimate: true,
    },
  },
  earnings: {
    financialCurrency: 'INR',
    earningsChart: {
      earningsDate: [NEXT_EARNINGS_DATE],
      quarterly: [],
    },
  },
  earningsHistory: {
    history: [
      {
        period: '-4q',
        epsActual: 19.95,
        epsEstimate: 15.45,
        surprisePercent: 0.2912,
        currency: 'INR',
      },
      {
        period: '-3q',
        epsActual: 13.42,
        epsEstimate: 14.35,
        surprisePercent: -0.0645,
        currency: 'INR',
      },
      {
        period: '-2q',
        epsActual: 18.51,
        epsEstimate: 17.0,
        surprisePercent: 0.0888,
        currency: 'INR',
      },
      {
        period: '-1q',
        epsActual: 22.1,
        epsEstimate: 21.5,
        surprisePercent: 0.0279,
        currency: 'INR',
      },
    ],
  },
};

const SPARSE_ONLY_DATE: Record<string, unknown> = {
  calendarEvents: {
    earnings: {
      earningsDate: [NEXT_EARNINGS_DATE],
      isEarningsDateEstimate: false,
    },
  },
  earnings: null,
  earningsHistory: null,
};

const SPARSE_EMPTY: Record<string, unknown> = {};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('EarningsCard', () => {
  describe('with full data', () => {
    it('renders the Earnings heading', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Earnings')).toBeInTheDocument();
    });

    it('renders the Next Earnings Date label', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Next Earnings Date')).toBeInTheDocument();
    });

    it('shows (estimated) when isEarningsDateEstimate is true', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('(estimated)')).toBeInTheDocument();
    });

    it('renders the quarterly EPS table headers', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Actual')).toBeInTheDocument();
      expect(screen.getByText('Estimate')).toBeInTheDocument();
      expect(screen.getByText('Surprise')).toBeInTheDocument();
    });

    it('renders 4 quarter rows', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      // The 4 period labels from earningsHistory reversed: -1q, -2q, -3q, -4q
      expect(screen.getByText('-1q')).toBeInTheDocument();
      expect(screen.getByText('-4q')).toBeInTheDocument();
    });

    it('shows green colour class for a beat quarter', () => {
      const { container } = render(<EarningsCard summary={FULL_SUMMARY} />);
      // -1q: actual=22.1 > estimate=21.5 — should have green text
      const greenCells = container.querySelectorAll('.text-green-600');
      expect(greenCells.length).toBeGreaterThan(0);
    });

    it('shows red colour class for a miss quarter', () => {
      const { container } = render(<EarningsCard summary={FULL_SUMMARY} />);
      // -3q: actual=13.42 < estimate=14.35 — should have red text
      const redCells = container.querySelectorAll('.text-red-600');
      expect(redCells.length).toBeGreaterThan(0);
    });

    it('formats surprise as percentage', () => {
      render(<EarningsCard summary={FULL_SUMMARY} />);
      // surprisePercent 0.2912 → 29.1% (displayed as +29.1%)
      expect(screen.getByText('+29.1%')).toBeInTheDocument();
      // surprisePercent -0.0645 → -6.5%
      expect(screen.getByText('-6.5%')).toBeInTheDocument();
    });
  });

  describe('with only a date (no history)', () => {
    it('renders the next earnings date without estimated annotation', () => {
      render(<EarningsCard summary={SPARSE_ONLY_DATE} />);
      expect(screen.getByText('Next Earnings Date')).toBeInTheDocument();
      expect(screen.queryByText('(estimated)')).not.toBeInTheDocument();
    });

    it('does not render the quarterly EPS table', () => {
      render(<EarningsCard summary={SPARSE_ONLY_DATE} />);
      expect(screen.queryByText('Actual')).not.toBeInTheDocument();
    });
  });

  describe('with empty summary', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(<EarningsCard summary={SPARSE_EMPTY} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with null summary', () => {
    it('renders nothing gracefully', () => {
      const { container } = render(<EarningsCard summary={null} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
