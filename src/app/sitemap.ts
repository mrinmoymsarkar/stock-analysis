import type { MetadataRoute } from 'next';
import { ALL_LESSONS } from '@/content/lessons';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/markets',
    '/news',
    '/planner',
    '/learn',
    '/portfolio',
    '/login',
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: path === '/' ? 1 : 0.8,
  }));

  const lessonRoutes: MetadataRoute.Sitemap = ALL_LESSONS.map((lesson) => ({
    url: `${BASE_URL}/learn/${lesson.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...lessonRoutes];
}
