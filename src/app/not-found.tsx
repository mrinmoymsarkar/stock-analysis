import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-5xl font-bold text-muted-foreground mb-4">404</p>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Page not found
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-md bg-card border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
