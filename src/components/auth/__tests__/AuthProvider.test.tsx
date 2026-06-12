import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthProvider';

jest.mock('@/lib/supabase/config', () => ({
  isSupabaseConfigured: jest.fn(),
}));
jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: jest.fn(),
}));

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createBrowserSupabase } from '@/lib/supabase/client';

function Consumer() {
  const { user, loading, supabaseEnabled } = useAuth();
  return (
    <div>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="enabled">{String(supabaseEnabled)}</span>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('not configured: user null, loading false, supabaseEnabled false', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(false);
    await act(async () => {
      render(<AuthProvider><Consumer /></AuthProvider>);
    });
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('enabled').textContent).toBe('false');
  });

  it('configured with user', async () => {
    (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
    const mockUser = { email: 'test@example.com' };
    const unsubscribe = jest.fn();
    const mockClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
        onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe } } }),
      },
    };
    (createBrowserSupabase as jest.Mock).mockReturnValue(mockClient);

    await act(async () => {
      render(<AuthProvider><Consumer /></AuthProvider>);
    });

    expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    expect(screen.getByTestId('loading').textContent).toBe('false');
    expect(screen.getByTestId('enabled').textContent).toBe('true');
  });
});
