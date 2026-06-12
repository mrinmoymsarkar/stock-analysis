'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { GLOSSARY } from '@/content/glossary';

interface MetricTooltipProps {
  term: string;
  children: React.ReactNode;
}

export default function MetricTooltip({ term, children }: MetricTooltipProps) {
  const entry = GLOSSARY.find(
    (g) => g.term.toLowerCase() === term.toLowerCase()
  );

  if (!entry) {
    return <>{children}</>;
  }

  return (
    <span className="group relative inline-flex items-center gap-0.5">
      {children}
      <span
        className="inline-flex items-center"
        tabIndex={0}
        role="button"
        aria-label={`Definition of ${term}`}
      >
        <Info
          size={12}
          className="text-muted-foreground shrink-0 cursor-help"
          aria-hidden="true"
        />
      </span>
      <span
        role="tooltip"
        className="
          pointer-events-none
          absolute bottom-full left-1/2 z-50
          mb-1 -translate-x-1/2
          w-max max-w-[240px]
          rounded-md border border-border bg-card shadow-md
          px-2 py-1.5 text-xs text-foreground
          opacity-0 transition-opacity duration-150
          group-hover:opacity-100
          group-focus-within:opacity-100
        "
      >
        {entry.short}
      </span>
    </span>
  );
}
