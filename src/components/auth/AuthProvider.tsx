'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User } from '@supabase/supabase-js';
import { createBrowserSupabase } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  supabaseEnabled: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  supabaseEnabled: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseEnabled = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseEnabled) {
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabaseEnabled]);

  return (
    <AuthContext.Provider value={{ user, loading, supabaseEnabled }}>
      {children}
    </AuthContext.Provider>
  );
}
