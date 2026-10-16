// The site exists in English (no prefix: /people) and Danish (/da/people), so search engines index both.
export const LANGS = ['en', 'da'] as const;
export type Lang = (typeof LANGS)[number];

/** True on Vercel's preview builds (preview.vizory.dk and other branches), never on vizory.dk or locally. */
export const IS_PREVIEW = process.env.VERCEL_ENV === 'preview';

/** The site's address. Preview builds point their links, sharing images and canonical tags at
 *  preview.vizory.dk, so the sharing preview can be tested there before a change goes live. */
export const SITE_URL = IS_PREVIEW ? 'https://preview.vizory.dk' : 'https://vizory.dk';

/** Path of a page in a language: localPath('/people', 'da') === '/da/people'. */
export function localPath(path: string, lang: Lang): string {
  if (lang === 'en') return path;
  return path === '/' ? '/da' : '/da' + path;
}

/** The same page in the other language, from the address the visitor is on. */
export function otherLangPath(pathname: string): string {
  const path = pathname.replace(/\/index\.html$/, '/');
  if (/^\/da(\/|$)/.test(path)) return path.replace(/^\/da\/?/, '/');
  return '/da' + (path === '/' ? '' : path.replace(/\/$/, ''));
}

