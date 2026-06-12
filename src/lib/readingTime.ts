export function readingTimeMinutes(text: string, wpm = 200): number {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / wpm));
}

export function lessonReadingTime(sections: Array<{ heading: string; body: string }>, wpm = 200): number {
  const totalText = sections.map((s) => `${s.heading} ${s.body}`).join(' ');
  return readingTimeMinutes(totalText, wpm);
}
