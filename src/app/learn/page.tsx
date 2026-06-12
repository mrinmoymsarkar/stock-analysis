import type { Metadata } from 'next';
import Link from 'next/link';
import { ALL_LESSONS } from '@/content/lessons/index';
import { GLOSSARY } from '@/content/glossary';
import { lessonReadingTime } from '@/lib/readingTime';
import type { Lesson } from '@/content/types';

export const metadata: Metadata = {
  title: 'Learn to Invest | Indian Stock Market Dashboard',
  description:
    'Beginner to advanced lessons on Indian stock market investing, mutual funds, SIPs, taxes, and more — plus a glossary of key financial terms.',
};

const LEVEL_CONFIG = {
  beginner: {
    label: 'Beginner',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
    heading: 'text-emerald-700 dark:text-emerald-400',
  },
  intermediate: {
    label: 'Intermediate',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25',
    heading: 'text-amber-700 dark:text-amber-400',
  },
  advanced: {
    label: 'Advanced',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25',
    heading: 'text-rose-700 dark:text-rose-400',
  },
} as const;

function LessonCard({ lesson }: { lesson: Lesson }) {
  const config = LEVEL_CONFIG[lesson.level];
  const minutes = lessonReadingTime(lesson.sections);

  return (
    <Link
      href={`/learn/${lesson.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badge}`}>
          {config.label}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">{minutes} min read</span>
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {lesson.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{lesson.summary}</p>
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Read lesson
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}

export default function LearnPage() {
  const byLevel = {
    beginner: ALL_LESSONS.filter((l) => l.level === 'beginner'),
    intermediate: ALL_LESSONS.filter((l) => l.level === 'intermediate'),
    advanced: ALL_LESSONS.filter((l) => l.level === 'advanced'),
  };

  const levels = (['beginner', 'intermediate', 'advanced'] as const).filter(
    (lv) => byLevel[lv].length > 0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-card/60 py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Education Hub
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Learn to invest
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Practical guides to the Indian stock market, mutual funds, SIPs, and taxes — written clearly, with zero jargon, for every level of investor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Lessons by level */}
        {levels.map((lv) => {
          const config = LEVEL_CONFIG[lv];
          return (
            <section key={lv} aria-labelledby={`section-${lv}`}>
              <h2
                id={`section-${lv}`}
                className={`text-lg font-bold uppercase tracking-wide mb-5 ${config.heading}`}
              >
                {config.label}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {byLevel[lv].map((lesson) => (
                  <LessonCard key={lesson.slug} lesson={lesson} />
                ))}
              </div>
            </section>
          );
        })}

        {/* Glossary */}
        <section aria-labelledby="glossary-heading">
          <div className="mb-6">
            <h2
              id="glossary-heading"
              className="text-xl font-bold text-foreground"
            >
              Glossary
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Quick definitions of key financial terms used across the dashboard and lessons.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
            {GLOSSARY.map((entry) => (
              <div
                key={entry.term}
                id={`glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="group border-b border-border py-4 last:border-b-0 sm:last:border-b-0"
              >
                <dt className="text-sm font-semibold text-foreground mb-0.5">
                  {entry.term}
                </dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {entry.short}
                  {entry.full && (
                    <span className="block mt-1 text-xs text-muted-foreground/80 leading-relaxed">
                      {entry.full}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
