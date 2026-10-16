import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { Mail } from './Mail';

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="foot">
      <div className="cta-mail">
        <p>{dictionary[lang].copenhagen}</p>
        <p><Mail /><noscript>hello [at] vizory.dk</noscript></p>
      </div>
    </footer>
  );
}
