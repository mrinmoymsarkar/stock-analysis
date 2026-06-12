import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, getSupabaseEnv } from './config';

let instance: SupabaseClient | null = null;

export function createBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (instance) return instance;
  const { url, anonKey } = getSupabaseEnv();
  instance = createBrowserClient(url, anonKey);
  return instance;
}
