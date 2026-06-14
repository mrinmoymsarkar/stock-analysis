import { ALL_LESSONS } from '../lessons/index';
import { GLOSSARY } from '../glossary';

// The exact label strings used with MetricTooltip in KeyStats, FundProfile, and AnalystRecs
const METRIC_TOOLTIP_LABELS = [
  // KeyStats
  'P/E (Trailing)',
  'P/E (Forward)',
  'Market Cap',
  '52W High',
  '52W Low',
  'Dividend Yield',
  'EPS (TTM)',
  'Beta',
  'Volume',
  // FundProfile
  'NAV',
  'Fund Family',
  'Category',
  'Expense Ratio',
  'YTD',
  '1Y',
  '3Y',
  '5Y',
  // AnalystRecs
  'Analyst Target Price',
  'Upside/Downside',
  'Strong Buy',
  'Buy',
  'Hold',
  'Sell',
  'Strong Sell',
  // FinancialsCard
  'Revenue Trend',
  'Net Income Trend',
  // EarningsCard
  'Next Earnings Date',
  'EPS Actual',
  'EPS Estimate',
  'EPS Surprise',
  // MarginsCard
  'Profit Margin',
  'Operating Margin',
  'ROE',
  'ROA',
];

describe('Lessons content integrity', () => {
  test('ALL_LESSONS has 6 lessons', () => {
    expect(ALL_LESSONS).toHaveLength(6);
  });

  test('all slugs are unique', () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  test('slugs are non-empty kebab-case strings', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.slug).toMatch(/^[a-z][a-z0-9-]+$/);
    }
  });

  test('each lesson has at least 5 sections', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.sections.length).toBeGreaterThanOrEqual(5);
    }
  });

  test('each section has a non-empty heading', () => {
    for (const lesson of ALL_LESSONS) {
      for (const section of lesson.sections) {
        expect(section.heading.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('each section has a non-empty body', () => {
    for (const lesson of ALL_LESSONS) {
      for (const section of lesson.sections) {
        expect(section.body.trim().length).toBeGreaterThan(0);
      }
    }
  });

  test('all lessons have valid level values', () => {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    for (const lesson of ALL_LESSONS) {
      expect(validLevels).toContain(lesson.level);
    }
  });

  test('lessons are ordered beginner then intermediate then advanced', () => {
    const levelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    for (let i = 1; i < ALL_LESSONS.length; i++) {
      const prev = levelOrder[ALL_LESSONS[i - 1].level];
      const curr = levelOrder[ALL_LESSONS[i].level];
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });

  test('each lesson has a non-empty title and summary', () => {
    for (const lesson of ALL_LESSONS) {
      expect(lesson.title.trim().length).toBeGreaterThan(0);
      expect(lesson.summary.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('Glossary content integrity', () => {
  test('GLOSSARY has entries', () => {
    expect(GLOSSARY.length).toBeGreaterThan(0);
  });

  test('all glossary term names are unique (case-insensitive)', () => {
    const terms = GLOSSARY.map((g) => g.term.toLowerCase());
    const unique = new Set(terms);
    expect(unique.size).toBe(terms.length);
  });

  test('all glossary entries have non-empty short descriptions', () => {
    for (const entry of GLOSSARY) {
      expect(entry.short.trim().length).toBeGreaterThan(0);
    }
  });

  test('all glossary short descriptions are at most 140 characters', () => {
    for (const entry of GLOSSARY) {
      expect(entry.short.length).toBeLessThanOrEqual(140);
    }
  });

  test('all glossary term strings are non-empty', () => {
    for (const entry of GLOSSARY) {
      expect(entry.term.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('MetricTooltip label coverage', () => {
  const glossaryTermsLower = new Set(GLOSSARY.map((g) => g.term.toLowerCase()));

  test.each(METRIC_TOOLTIP_LABELS)(
    'glossary contains an entry for MetricTooltip label "%s"',
    (label) => {
      expect(glossaryTermsLower.has(label.toLowerCase())).toBe(true);
    }
  );
});
