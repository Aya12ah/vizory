import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { Mail } from './Mail';

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="flex flex-wrap justify-between gap-6 pt-10 pb-14 text-[14px] leading-none text-ink-soft phone:py-6">
      <div className="flex flex-col gap-[6px]">
        <p>{dictionary[lang].copenhagen}</p>
        <p><Mail /><noscript>hello [at] vizory.dk</noscript></p>
      </div>
    </footer>
  );
}
