/**
 * Tests for FinancialsCard — annual revenue & net-income trend charts.
 * Mocks recharts to avoid SVG rendering issues in jsdom.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Recharts mock — same pattern as portfolio page test
jest.mock('recharts', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    Bar: ({ dataKey }: { dataKey: string }) => <div data-testid={`bar-${dataKey}`} />,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

import FinancialsCard from '@/components/detail/FinancialsCard';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const FULL_SUMMARY = {
  earnings: {
    financialCurrency: 'INR',
    financialsChart: {
      yearly: [
        { date: 2022, revenue: 4500000000000, earnings: 380000000000, profitMargin: 0.0844 },
        { date: 2023, revenue: 5297730000000, earnings: 442050000000, profitMargin: 0.0834 },
        { date: 2024, revenue: 5345340000000, earnings: 420420000000, profitMargin: 0.0787 },
        { date: 2025, revenue: 5173490000000, earnings: 352620000000, profitMargin: 0.0682 },
      ],
    },
  },
};

const SPARSE_SUMMARY_EMPTY_YEARLY: Record<string, unknown> = {
  earnings: {
    financialsChart: {
      yearly: [],
    },
  },
};

const SPARSE_SUMMARY_NO_EARNINGS = {};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('FinancialsCard', () => {
  describe('with full data', () => {
    it('renders the Financial Trends heading', () => {
      render(<FinancialsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Financial Trends')).toBeInTheDocument();
    });

    it('renders Annual Revenue and Annual Net Income labels', () => {
      render(<FinancialsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Annual Revenue')).toBeInTheDocument();
      expect(screen.getByText('Annual Net Income')).toBeInTheDocument();
    });

    it('renders bar charts for revenue and net income', () => {
      render(<FinancialsCard summary={FULL_SUMMARY} />);
      const barCharts = screen.getAllByTestId('bar-chart');
      expect(barCharts.length).toBeGreaterThanOrEqual(2);
    });

    it('does not show currency annotation for INR', () => {
      render(<FinancialsCard summary={FULL_SUMMARY} />);
      // INR annotation should be absent
      expect(screen.queryByText(/\(INR\)/)).not.toBeInTheDocument();
    });

    it('shows non-INR currency annotation', () => {
      const usdSummary = {
        ...FULL_SUMMARY,
        earnings: { ...FULL_SUMMARY.earnings, financialCurrency: 'USD' },
      };
      render(<FinancialsCard summary={usdSummary} />);
      expect(screen.getByText('(USD)')).toBeInTheDocument();
    });
  });

  describe('with empty yearly array', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(
        <FinancialsCard summary={SPARSE_SUMMARY_EMPTY_YEARLY} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with no earnings key', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(
        <FinancialsCard summary={SPARSE_SUMMARY_NO_EARNINGS} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with null summary', () => {
    it('renders nothing gracefully', () => {
      const { container } = render(<FinancialsCard summary={null} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
