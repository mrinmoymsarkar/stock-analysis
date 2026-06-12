import React, { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function LoginContent({ searchParams }: { searchParams: Record<string, string | string[]> }) {
  const next = typeof searchParams.next === 'string' ? searchParams.next : undefined;

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Authentication not configured</h2>
        <p className="text-sm text-muted-foreground">
          Supabase environment variables are not set. The app works in guest mode.
          See <code className="font-mono text-xs">.env.local.example</code> to enable authentication.
        </p>
      </div>
    );
  }

  return <LoginForm next={next} />;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
            <p className="text-sm text-muted-foreground">Indian Stock Market Dashboard</p>
          </div>
          <Suspense fallback={null}>
            <LoginContent searchParams={params} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
