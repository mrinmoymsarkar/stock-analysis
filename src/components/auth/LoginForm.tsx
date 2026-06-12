'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { safeNextPath } from '@/lib/safeNext';

const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password.',
  'Email not confirmed': 'Please confirm your email before signing in.',
  'User already registered': 'An account with this email already exists.',
};

function mapError(msg: string): string {
  return ERROR_MAP[msg] ?? msg;
}

interface LoginFormProps {
  next?: string;
}

export function LoginForm({ next }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const turnstileKey =
    typeof process !== 'undefined'
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      : undefined;

  const [captchaToken, setCaptchaToken] = useState('');

  let TurnstileComponent: React.ComponentType<{
    siteKey: string;
    onSuccess: (token: string) => void;
  }> | null = null;

  if (turnstileKey) {
    try {
      // Dynamic require to avoid SSR issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      TurnstileComponent = require('@marsidev/react-turnstile').Turnstile;
    } catch {
      // ignore
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setError('Authentication is not configured.');
      setLoading(false);
      return;
    }

    const captchaOptions =
      turnstileKey && captchaToken ? { captchaToken } : {};

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: captchaOptions,
      });
      if (error) {
        setError(mapError(error.message));
      } else {
        setSuccess('Account created! Check your email to confirm your address.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: captchaOptions,
      });
      if (error) {
        setError(mapError(error.message));
      } else {
        router.push(safeNextPath(next));
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    const supabase = createBrowserSupabase();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`,
      },
    });
  }

  if (success) {
    return (
      <div className="rounded-md bg-card border border-border p-4 text-sm text-foreground">
        {success}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border">
        <button
          className={`pb-2 text-sm font-medium ${mode === 'signin' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setMode('signin')}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`pb-2 text-sm font-medium ${mode === 'signup' ? 'border-b-2 border-foreground text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setMode('signup')}
          type="button"
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={mode === 'signup' ? 8 : 1}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
          />
          {mode === 'signup' && (
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          )}
        </div>

        {TurnstileComponent && turnstileKey && (
          <TurnstileComponent siteKey={turnstileKey} onSuccess={setCaptchaToken} />
        )}

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Loading…' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
      >
        Continue with Google
      </button>
    </div>
  );
}
