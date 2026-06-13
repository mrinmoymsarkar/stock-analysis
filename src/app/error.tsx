'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Something went wrong
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        An unexpected error occurred. Please try again, or come back later if
        the issue persists.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-card border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
