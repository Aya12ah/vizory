import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/i18n/lang';
import { IS_PREVIEW } from '@/site';

export default function robots(): MetadataRoute.Robots {
  // Preview builds (preview.vizory.dk and other branch addresses) must not be crawled.
  if (IS_PREVIEW) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
