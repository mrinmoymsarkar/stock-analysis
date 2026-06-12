import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ALL_LESSONS } from '@/content/lessons/index';
import { lessonReadingTime } from '@/lib/readingTime';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_LESSONS.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = ALL_LESSONS.find((l) => l.slug === slug);
  if (!lesson) return {};
  return {
    title: `${lesson.title} | Learn | Indian Stock Market Dashboard`,
    description: lesson.summary,
  };
}

const LEVEL_CONFIG = {
  beginner: {
    label: 'Beginner',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
  },
  intermediate: {
    label: 'Intermediate',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25',
  },
  advanced: {
    label: 'Advanced',
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/25',
  },
} as const;

export default async function LessonPage({ params }: PageProps) {
  const { slug } = await params;
  const lesson = ALL_LESSONS.find((l) => l.slug === slug);

  if (!lesson) {
    notFound();
  }

  const currentIndex = ALL_LESSONS.indexOf(lesson);
  const prevLesson = currentIndex > 0 ? ALL_LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentIndex + 1] : null;

  const config = LEVEL_CONFIG[lesson.level];
  const minutes = lessonReadingTime(lesson.sections);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10 7H4M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All lessons
        </Link>

        {/* Header */}
        <header className="mb-10 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-xs text-muted-foreground">{minutes} min read</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl leading-tight mb-3">
            {lesson.title}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {lesson.summary}
          </p>
        </header>

        {/* Sections */}
        <article className="space-y-10">
          {lesson.sections.map((section, idx) => (
            <section key={idx} aria-labelledby={`section-${idx}`}>
              <h2
                id={`section-${idx}`}
                className="text-lg font-semibold text-foreground mb-4 scroll-mt-6"
              >
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.body
                  .split(/\n\n+/)
                  .filter((p) => p.trim().length > 0)
                  .map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-sm leading-7 text-foreground/90"
                    >
                      {paragraph.trim()}
                    </p>
                  ))}
              </div>
            </section>
          ))}
        </article>

        {/* Footer nav */}
        <footer className="mt-14 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {prevLesson ? (
              <Link
                href={`/learn/${prevLesson.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 sm:max-w-[48%] hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M8 6H4M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Previous
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {prevLesson.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/learn/${nextLesson.slug}`}
                className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 sm:max-w-[48%] text-right hover:border-primary/40 hover:shadow-sm transition-all sm:ml-auto"
              >
                <span className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  Next
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M4 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {nextLesson.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all lessons →
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
