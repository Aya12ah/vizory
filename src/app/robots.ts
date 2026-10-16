import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/i18n/lang';
import { IS_PREVIEW } from '@/site';

export default function robots(): MetadataRoute.Robots {
  // Preview builds (preview.vizory.dk and other branch addresses) must not be crawled by search
  // engines. The link-preview bots of Facebook, LinkedIn, X and Slack may read them, so sharing can
  // be tested; the pages still carry noindex.
  if (IS_PREVIEW) return {
    rules: [
      { userAgent: ['facebookexternalhit', 'Facebot', 'LinkedInBot', 'Twitterbot', 'Slackbot-LinkExpanding'], allow: '/' },
      { userAgent: '*', disallow: '/' },
    ],
  };
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
