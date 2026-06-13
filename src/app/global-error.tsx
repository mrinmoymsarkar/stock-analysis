'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // global-error must render its own <html> and <body>
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#ffffff', color: '#0f172a' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', maxWidth: '28rem' }}>
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: '0.375rem',
              border: '1px solid #e2e8f0',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              background: '#ffffff',
              color: '#0f172a',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
