import type { MetadataRoute } from 'next';
import { absUrl, allPages } from '@/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages().map((p) => ({
    url: absUrl(p.path, p.lang),
    lastModified: p.lastModified,
    alternates: { languages: { en: absUrl(p.path, 'en'), da: absUrl(p.path, 'da') } },
  }));
}
