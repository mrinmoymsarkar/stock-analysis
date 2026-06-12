export interface GlossaryTerm {
  term: string;
  short: string;
  full?: string;
}

export interface LessonSection {
  heading: string;
  body: string;
}

export interface Lesson {
  slug: string;
  title: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  summary: string;
  sections: LessonSection[];
}
