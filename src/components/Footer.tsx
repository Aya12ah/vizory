import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { LangButton } from './LangButton';
import { Mail } from './Mail';
import { ThemeToggle } from './ThemeToggle';

/** City and email address: in the footer, and from 900px in the regulation pages' left menu. */
export function Address({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-[6px] text-[14px] leading-none text-ink-soft">
      <p>{dictionary[lang].copenhagen}</p>
      <p><Mail /><noscript>hello [at] vizory.dk</noscript></p>
    </div>
  );
}

// From 900px the regulation pages show the address in their left menu column (RegNav), so the
// footer is left out there. The language and theme buttons sit above the address.
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="flex flex-wrap justify-between gap-6 pt-10 pb-6 phone:pt-6 wide:[body:has([data-reg-nav])_&]:hidden">
      <div>
        {/* -ml-3 lines the theme icon up with the address below. */}
        <div className="flex gap-1 -ml-3 mb-3"><ThemeToggle /><LangButton lang={lang} /></div>
        <Address lang={lang} />
      </div>
    </footer>
  );
}
