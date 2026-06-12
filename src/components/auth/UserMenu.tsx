'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { createBrowserSupabase } from '@/lib/supabase/client';

export function UserMenu() {
  const { user, supabaseEnabled } = useAuth();
  const [open, setOpen] = useState(false);

  if (!supabaseEnabled) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? '?').toUpperCase();

  async function handleSignOut() {
    const supabase = createBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center text-sm font-semibold border border-border"
        aria-label="User menu"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-md bg-card border border-border shadow-lg z-50">
          <div className="px-4 py-2 text-xs text-muted-foreground truncate border-b border-border">
            {user.email}
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
