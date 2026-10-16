// The site exists in English (no prefix: /people) and Danish (/da/people), so search engines index both.
export const LANGS = ['en', 'da'] as const;
export type Lang = (typeof LANGS)[number];

export const SITE_URL = 'https://vizory.dk';

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

export function langOfPath(pathname: string): Lang {
  return /^\/da(\/|$)/.test(pathname) ? 'da' : 'en';
}
