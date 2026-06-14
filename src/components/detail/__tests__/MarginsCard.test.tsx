/**
 * Tests for MarginsCard — profitability ratios from financialData.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MarginsCard from '@/components/detail/MarginsCard';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const FULL_SUMMARY = {
  financialData: {
    profitMargins: 0.0847,       // 8.47%
    operatingMargins: 0.1123,    // 11.23%
    returnOnEquity: 0.1482,      // 14.82%
    returnOnAssets: 0.0612,      // 6.12%
    grossMargins: 0.3215,        // 32.15%
  },
  defaultKeyStatistics: {},
};

const NEGATIVE_MARGINS_SUMMARY = {
  financialData: {
    profitMargins: -0.05,
    operatingMargins: -0.03,
    returnOnEquity: -0.12,
    returnOnAssets: -0.04,
    grossMargins: null,
  },
  defaultKeyStatistics: {},
};

const SPARSE_SUMMARY_EMPTY_FD = {
  financialData: {},
  defaultKeyStatistics: {},
};

const SPARSE_SUMMARY_NO_FD: Record<string, unknown> = {};

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('MarginsCard', () => {
  describe('with full data', () => {
    it('renders the Profitability heading', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Profitability')).toBeInTheDocument();
    });

    it('renders Profit Margin label', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Profit Margin')).toBeInTheDocument();
    });

    it('renders Operating Margin label', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Operating Margin')).toBeInTheDocument();
    });

    it('renders ROE and ROA labels', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('ROE')).toBeInTheDocument();
      expect(screen.getByText('ROA')).toBeInTheDocument();
    });

    it('renders Gross Margin label', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      expect(screen.getByText('Gross Margin')).toBeInTheDocument();
    });

    it('formats margin values as percentages', () => {
      render(<MarginsCard summary={FULL_SUMMARY} />);
      // 0.0847 → 8.47%
      expect(screen.getByText('8.47%')).toBeInTheDocument();
      // 0.1123 → 11.23%
      expect(screen.getByText('11.23%')).toBeInTheDocument();
    });

    it('applies green colour for positive margins', () => {
      const { container } = render(<MarginsCard summary={FULL_SUMMARY} />);
      const greenEls = container.querySelectorAll('.text-green-600');
      expect(greenEls.length).toBeGreaterThan(0);
    });
  });

  describe('with negative margins', () => {
    it('applies red colour for negative margins', () => {
      const { container } = render(<MarginsCard summary={NEGATIVE_MARGINS_SUMMARY} />);
      const redEls = container.querySelectorAll('.text-red-600');
      expect(redEls.length).toBeGreaterThan(0);
    });

    it('still renders the Profitability heading when some data is present', () => {
      render(<MarginsCard summary={NEGATIVE_MARGINS_SUMMARY} />);
      expect(screen.getByText('Profitability')).toBeInTheDocument();
    });
  });

  describe('with empty financialData', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(
        <MarginsCard summary={SPARSE_SUMMARY_EMPTY_FD} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with no financialData key', () => {
    it('renders nothing (returns null)', () => {
      const { container } = render(
        <MarginsCard summary={SPARSE_SUMMARY_NO_FD} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('with null summary', () => {
    it('renders nothing gracefully', () => {
      const { container } = render(<MarginsCard summary={null} />);
      expect(container.firstChild).toBeNull();
    });
  });
});
