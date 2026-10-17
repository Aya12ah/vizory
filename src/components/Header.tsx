'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import { iconButton } from './styles';
import { Wordmark, wordmarkClass } from './Wordmark';

/** The section a path belongs to, for marking the header button: '/da/mica' -> 'regulation'. */
function sectionOf(pathname: string) {
  const path = pathname.replace(/^\/da(?=\/|$)/, '') || '/';
  if (path === '/people') return 'people';
  if (['/regulation', '/mica', '/mica-qa', '/payments'].includes(path)) return 'regulation';
  return path === '/' ? 'home' : null;
}

/** Top bar: the small wordmark (except on the front page, which has the large one) and the links
 *  to the sections. It lives in the layout, so it stays in place while the page below it changes.
 *  From 900px the regulation pages carry the wordmark in their left menu, which reaches up beside
 *  the header, so the header leaves its own out and lets clicks through except on its own links. */
export function Header({ lang }: { lang: Lang }) {
  const t = dictionary[lang];
  const section = sectionOf(usePathname());
  const current = (s: string) => (section === s ? ('page' as const) : undefined);
  return (
    <header className="relative z-2 flex items-center gap-4 py-6 phone:py-2 pointer-events-none [&>*]:pointer-events-auto">
      {section !== 'home' && (
        <Link className={`${wordmarkClass} text-[20px] no-underline ${section === 'regulation' ? 'wide:hidden' : ''}`} href={localPath('/', lang)} aria-label={t.frontPage}><Wordmark /></Link>
      )}
      <div className="flex gap-1 ml-auto">
        <Link className={iconButton} id="regBtn" href={localPath('/regulation', lang)} aria-current={current('regulation')} aria-label={t.regulation}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 6.5C14.9 5 13.5 4 11.9 4 10 4 8.5 5.2 8.5 6.8c0 3.7 7 3 7 7 0 1.2-.8 2.2-2 2.7" /><path d="M8.5 17.5c.6 1.5 2 2.5 3.6 2.5 1.9 0 3.4-1.2 3.4-2.8 0-3.7-7-3-7-7 0-1.2.8-2.2 2-2.7" /></svg>
        </Link>
        <Link className={iconButton} id="peopleBtn" href={localPath('/people', lang)} aria-current={current('people')} aria-label={t.people}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.86" cy="7.43" r="3.43" /><path d="M2 20c0-3.77 3.09-6.86 6.86-6.86s6.86 3.09 6.86 6.86" /><circle cx="18" cy="6.86" r="2.86" /><path d="M16.29 13.37c3.2.46 5.71 3.2 5.71 6.63" /></svg>
        </Link>
      </div>
    </header>
  );
}
