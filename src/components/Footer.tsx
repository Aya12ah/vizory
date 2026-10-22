import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { Mail } from './Mail';

/** City and email address: in the footer, and from 900px in the regulation pages' left menu. */
export function Address({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-[6px] text-[14px] leading-none text-ink-soft">
      <p>{dictionary[lang].copenhagen}</p>
      <p><Mail /><noscript>hello [at] vizory.dk</noscript></p>
    </div>
  );
}

// From 900px the regulation pages show the address in a bar of their own (RegNav),
// and the get-started page at the foot of its left column (LeadForm), so the footer is left out there.
// Below that, on the get-started page the footer keeps the height of its bar (--lead-bar) free below
// it, so the bar fixed to the bottom of the screen does not cover it.
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="flex items-end gap-6 pt-10 pb-6 phone:pt-6 [body:has([data-lead-bar])_&]:pb-[calc(var(--lead-bar,80px)+24px)] wide:[body:has([data-reg-nav],[data-lead-address])_&]:hidden">
      <Address lang={lang} />
    </footer>
  );
}
