import Link from 'next/link';
import type { ReactNode } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import type { Section } from './ContentsBar';
import { Address } from './Footer';
import { LangButton } from './LangButton';
import { SideSections } from './SideSections';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark, wordmarkClass } from './Wordmark';

/** Layout of the regulation pages: topic menu on the left, content on the right; menu on top on phones.
 *  From 900px the menu column starts level with the header (92px: py-6 around the 44px buttons), so
 *  the menu can carry the wordmark, and the content (the second child) starts where it did below it.
 *  The section then fills at least the screen, so the address at the foot of the menu column sits at
 *  the bottom of the screen on short pages too. */
export function RegSection({ children }: { children: ReactNode }) {
  return (
    <section className="w-full grid grid-cols-[minmax(0,1fr)] gap-10 self-start pt-14 pb-20 wide:grid-cols-[200px_minmax(0,1fr)] wide:gap-14 wide:self-stretch wide:-mt-[92px] wide:pt-6 wide:pb-6 wide:[&>:nth-child(2)]:pt-[124px] wide:[&>:nth-child(2)]:pb-14 phone:py-6">
      {children}
    </section>
  );
}

const link = 'text-ink-soft no-underline hover:text-signal-text aria-[current=page]:text-signal-text';

/** The topic menu of the regulation pages. From 900px the column also carries the wordmark, the
 *  language and theme buttons and the address (instead of the header and the footer) and lists the sections of the current page. Three
 *  sticky siblings in a full-height column: at the top of the page the wordmark is level with the
 *  header buttons and the menu level with the content; on scrolling the wordmark stops 12px from
 *  the top and the menu rises to just below it (64px), as the gap between them scrolls away; the
 *  address keeps to the bottom of the screen. Siblings rather than nested sticky elements, which
 *  jitter in some browsers when scrolling back up. */
export function RegNav({ lang, current, sections }: { lang: Lang; current: string; sections?: Section[] }) {
  const t = dictionary[lang];
  const href = (path: string) => ({ href: localPath(path, lang), 'aria-current': current === path ? ('page' as const) : undefined });
  // A page link; the current page's sections follow it.
  const item = (path: string, label: string) => (
    <li><Link className={link} {...href(path)}>{label}</Link>{current === path && sections && <SideSections sections={sections} />}</li>
  );
  return (
    <div className="wide:flex wide:flex-col">
      <p className="hidden wide:flex wide:sticky wide:top-3 items-center h-11 mb-20" data-reg-mark>
        <Link className={`${wordmarkClass} text-[20px] no-underline`} href={localPath('/', lang)} aria-label={t.frontPage}><Wordmark /></Link>
      </p>
      <nav className="text-[14px] grid gap-2 content-start wide:sticky wide:top-16 phone:pb-6 phone:border-b phone:border-line" aria-label={t.regulation} data-reg-nav>
        <p><Link className="text-ink font-medium no-underline hover:text-signal-text aria-[current=page]:text-signal-text" {...href('/regulation')}>{t.regulation}</Link></p>
        <p className="mt-2 text-ink font-medium">{t.regNav.topic}</p>
        <ul className="list-none m-0 py-0 pr-0 pl-4 border-l border-line grid gap-[6px]">
          {item('/mica', t.regNav.authorisation)}
          {item('/mica-qa', t.regNav.qa)}
        </ul>
        <p className="mt-2 text-ink font-medium">{t.regNav.payments}</p>
        <ul className="list-none m-0 py-0 pr-0 pl-4 border-l border-line grid gap-[6px]">
          {item('/payments', t.regNav.authorisation)}
        </ul>
      </nav>
      <div className="hidden wide:block wide:sticky wide:bottom-6 mt-auto pt-10" data-reg-address>
        {/* -ml-3 lines the button labels up with the address below. */}
        <div className="flex gap-1 -ml-3 mb-3"><LangButton lang={lang} copy /><ThemeToggle copy /></div>
        <Address lang={lang} />
      </div>
    </div>
  );
}
