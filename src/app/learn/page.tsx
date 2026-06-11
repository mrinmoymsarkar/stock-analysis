import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learn | Indian Stock Market Dashboard',
  description: 'Learn about Indian stock market investing concepts, terminology, and strategies.',
};

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="text-2xl font-bold text-foreground mb-4">Learn</h1>
      <p className="text-muted-foreground">
        Educational content and glossary coming soon.
      </p>
    </div>
  );
}
