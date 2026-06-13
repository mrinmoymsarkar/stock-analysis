/**
 * Portfolio page state tests.
 * Mocks useAuth and useHoldings to exercise the three auth states
 * and the populated/empty states.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/hooks/useHoldings', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@/hooks/useWebSocket', () => ({
  __esModule: true,
  default: jest.fn(() => ({ connected: false, isPolling: false, error: null })),
}));

// Mock recharts to avoid SVG rendering issues in jsdom
jest.mock('recharts', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  return {
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Mock StockSearch to avoid fetch issues
jest.mock('@/components/controls/StockSearch', () => ({
  __esModule: true,
  default: ({ onSymbolSelect }: { onSymbolSelect: (s: string) => void }) => (
    <input
      data-testid="stock-search"
      placeholder="Search for a stock"
      onChange={(e) => onSymbolSelect(e.target.value)}
    />
  ),
}));

import { useAuth } from '@/components/auth/AuthProvider';
import useHoldings from '@/hooks/useHoldings';
import PortfolioPage from '../page';

const mockUseAuth = useAuth as jest.Mock;
const mockUseHoldings = useHoldings as jest.Mock;

const defaultHoldings = {
  holdings: [],
  add: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  loading: false,
  error: null,
  enabled: false,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Portfolio page', () => {
  beforeEach(() => jest.clearAllMocks());

  test('state (a): Supabase not configured → shows setup notice', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, supabaseEnabled: false });
    mockUseHoldings.mockReturnValue({ ...defaultHoldings, enabled: false });

    render(<PortfolioPage />);

    expect(screen.getByText(/Authentication Not Configured/i)).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_SUPABASE_URL/i)).toBeInTheDocument();
  });

  test('state (b): configured but not signed in → shows sign-in prompt', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, supabaseEnabled: true });
    mockUseHoldings.mockReturnValue({ ...defaultHoldings, enabled: false });

    render(<PortfolioPage />);

    expect(screen.getByText(/Sign in to view your Portfolio/i)).toBeInTheDocument();
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toHaveAttribute('href', '/login?next=/portfolio');
  });

  test('state (c) empty: signed in, no holdings → empty state CTA', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      supabaseEnabled: true,
    });
    mockUseHoldings.mockReturnValue({ ...defaultHoldings, enabled: true, holdings: [] });

    render(<PortfolioPage />);

    expect(screen.getByText(/No holdings yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Your First Holding/i)).toBeInTheDocument();
  });

  test('state (c) populated: shows Portfolio heading and summary section', () => {
    const holdings = [
      {
        id: '1',
        symbol: 'RELIANCE.NS',
        name: 'Reliance',
        quoteType: 'EQUITY',
        quantity: 10,
        buyPrice: 2000,
        buyDate: '2024-01-01',
      },
    ];
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
      supabaseEnabled: true,
    });
    mockUseHoldings.mockReturnValue({
      ...defaultHoldings,
      enabled: true,
      holdings,
    });

    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByText(/Add Holding/i)).toBeInTheDocument();
    // Summary cards should show "Invested" label
    expect(screen.getAllByText(/Invested/i).length).toBeGreaterThan(0);
  });

  test('loading state: shows loading text', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, supabaseEnabled: false });
    mockUseHoldings.mockReturnValue({ ...defaultHoldings });

    render(<PortfolioPage />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
});
