import React from 'react';
import { render, screen } from '@testing-library/react';
import { UserMenu } from '../UserMenu';

jest.mock('../AuthProvider', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: jest.fn(),
}));

import { useAuth } from '../AuthProvider';

describe('UserMenu', () => {
  it('renders null when supabaseEnabled is false', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, supabaseEnabled: false });
    const { container } = render(<UserMenu />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Sign in link when enabled but no user', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, supabaseEnabled: true });
    render(<UserMenu />);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('renders user initial when logged in', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'alice@example.com' },
      loading: false,
      supabaseEnabled: true,
    });
    render(<UserMenu />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
