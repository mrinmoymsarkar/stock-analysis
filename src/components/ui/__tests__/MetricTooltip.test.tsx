import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricTooltip from '../MetricTooltip';

// The glossary mock is defined inline to avoid module resolution issues.
// We mock the glossary module to control exactly what terms exist in tests.
jest.mock('@/content/glossary', () => ({
  GLOSSARY: [
    {
      term: 'P/E Ratio',
      short: 'Price-to-Earnings ratio — how much investors pay per rupee of earnings.',
      full: 'Full definition of P/E Ratio.',
    },
    {
      term: 'Market Cap',
      short: 'Total market value of a company.',
    },
  ],
}));

describe('MetricTooltip', () => {
  it('renders children for a known term', () => {
    render(
      <MetricTooltip term="P/E Ratio">
        <span>P/E Ratio</span>
      </MetricTooltip>
    );
    expect(screen.getByText('P/E Ratio')).toBeInTheDocument();
  });

  it('renders info icon for a known term', () => {
    render(
      <MetricTooltip term="P/E Ratio">
        P/E Ratio
      </MetricTooltip>
    );
    // lucide Info icon renders an svg; check by aria-label on the wrapper span
    expect(screen.getByRole('button', { name: /definition of p\/e ratio/i })).toBeInTheDocument();
  });

  it('renders tooltip text in the DOM for a known term', () => {
    render(
      <MetricTooltip term="P/E Ratio">
        P/E Ratio
      </MetricTooltip>
    );
    expect(
      screen.getByRole('tooltip')
    ).toHaveTextContent('Price-to-Earnings ratio');
  });

  it('performs case-insensitive lookup', () => {
    render(
      <MetricTooltip term="p/e ratio">
        p/e ratio
      </MetricTooltip>
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Price-to-Earnings ratio');
  });

  it('renders children only (no icon, no tooltip) for an unknown term', () => {
    render(
      <MetricTooltip term="Completely Unknown Term XYZ">
        Unknown
      </MetricTooltip>
    );
    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not crash on empty string term', () => {
    expect(() =>
      render(
        <MetricTooltip term="">
          child
        </MetricTooltip>
      )
    ).not.toThrow();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders children as-is for unknown terms without modification', () => {
    const { container } = render(
      <MetricTooltip term="not-in-glossary">
        <span data-testid="my-child">label text</span>
      </MetricTooltip>
    );
    expect(screen.getByTestId('my-child')).toBeInTheDocument();
    // No extra wrapper element for unknown terms
    expect(container.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('works with Market Cap term', () => {
    render(
      <MetricTooltip term="Market Cap">
        Market Cap
      </MetricTooltip>
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Total market value of a company.');
  });
});
