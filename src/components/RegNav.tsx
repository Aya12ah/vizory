import Link from 'next/link';
import type { ReactNode } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';

/** Layout of the regulation pages: topic menu on the left, content on the right; menu on top on phones. */
export function RegSection({ children }: { children: ReactNode }) {
  return (
    <section className="w-full grid grid-cols-[minmax(0,1fr)] gap-10 self-start pt-14 pb-20 wide:grid-cols-[200px_minmax(0,1fr)] wide:gap-14 phone:py-6">
      {children}
    </section>
  );
}

const link = 'text-ink-soft no-underline hover:text-signal-text aria-[current=page]:text-signal-text';

/** The topic menu of the regulation pages. */
export function RegNav({ lang, current }: { lang: Lang; current: string }) {
  const t = dictionary[lang];
  const href = (path: string) => ({ href: localPath(path, lang), 'aria-current': current === path ? ('page' as const) : undefined });
  return (
    <nav className="text-[14px] grid gap-2 content-start wide:sticky wide:top-6 phone:pb-6 phone:border-b phone:border-line" aria-label={t.regulation}>
      <p><Link className="text-ink font-medium no-underline hover:text-signal-text aria-[current=page]:text-signal-text" {...href('/regulation')}>{t.regulation}</Link></p>
      <p className="mt-2 text-ink font-medium">{t.regNav.topic}</p>
      <ul className="list-none m-0 py-0 pr-0 pl-4 border-l border-line grid gap-[6px]">
        <li><Link className={link} {...href('/mica')}>{t.regNav.authorisation}</Link></li>
        <li><Link className={link} {...href('/mica-qa')}>{t.regNav.qa}</Link></li>
      </ul>
      <p className="mt-2 text-ink font-medium">{t.regNav.payments}</p>
      <ul className="list-none m-0 py-0 pr-0 pl-4 border-l border-line grid gap-[6px]">
        <li><Link className={link} {...href('/payments')}>{t.regNav.authorisation}</Link></li>
      </ul>
    </nav>
  );
}
