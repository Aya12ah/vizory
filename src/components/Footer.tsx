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

/** The theme and language buttons, at the right edge in line with the email address: shifted down
 *  so their centre meets the middle of the address's last line (44px buttons, 14px line). */
export function FootButtons({ lang, copy = false }: { lang: Lang; copy?: boolean }) {
  return (
    <div className="flex gap-1 translate-y-[15px]">
      <ThemeToggle copy={copy} /><LangButton lang={lang} copy={copy} />
    </div>
  );
}

// From 900px the regulation pages show the address and the buttons in a bar of their own (RegNav),
// and the get-started page at the foot of its left column (LeadForm), so the footer is left out there.
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="flex justify-between items-end gap-6 pt-10 pb-6 phone:pt-6 wide:[body:has([data-reg-nav],[data-lead-address])_&]:hidden">
      <Address lang={lang} />
      <FootButtons lang={lang} />
    </footer>
  );
}
