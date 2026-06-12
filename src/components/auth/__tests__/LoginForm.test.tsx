import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/lib/supabase/client', () => ({
  createBrowserSupabase: jest.fn(),
}));

import { createBrowserSupabase } from '@/lib/supabase/client';

describe('LoginForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows error when supabase not configured', async () => {
    (createBrowserSupabase as jest.Mock).mockReturnValue(null);
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password' } });
    // Use the submit button (type="submit"), not the tab button
    const submitBtn = screen.getAllByRole('button', { name: /sign in/i }).find(
      (btn) => (btn as HTMLButtonElement).type === 'submit'
    )!;
    fireEvent.submit(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Authentication is not configured');
    });
  });

  it('shows error on failed sign in', async () => {
    const mockClient = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          error: { message: 'Invalid login credentials' },
        }),
      },
    };
    (createBrowserSupabase as jest.Mock).mockReturnValue(mockClient);
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'badpassword' } });
    // Use the submit button (type="submit"), not the tab button
    const submitBtn = screen.getAllByRole('button', { name: /sign in/i }).find(
      (btn) => (btn as HTMLButtonElement).type === 'submit'
    )!;
    fireEvent.submit(submitBtn);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect email or password');
    });
  });
});
