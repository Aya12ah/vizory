import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import { LangButton } from './LangButton';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

type Section = 'people' | 'regulation';

/** Top bar: the small wordmark (except on the front page, which has the large one) and the icon buttons. */
export function Header({ lang, current, wordmark = true }: { lang: Lang; current?: Section; wordmark?: boolean }) {
  const t = dictionary[lang];
  return (
    <header className="top">
      {wordmark ? (
        <a className="wm wm-sm" href={localPath('/', lang)} aria-label={t.frontPage}><Wordmark /></a>
      ) : (
        <span></span>
      )}
      <div className="actions">
        <a className="ib" id="peopleBtn" href={localPath('/people', lang)} aria-current={current === 'people' ? 'page' : undefined} aria-label={t.people}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.86" cy="7.43" r="3.43" /><path d="M2 20c0-3.77 3.09-6.86 6.86-6.86s6.86 3.09 6.86 6.86" /><circle cx="18" cy="6.86" r="2.86" /><path d="M16.29 13.37c3.2.46 5.71 3.2 5.71 6.63" /></svg>
        </a>
        <a className="ib" id="regBtn" href={localPath('/regulation', lang)} aria-current={current === 'regulation' ? 'page' : undefined} aria-label={t.regulation}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 6.5C14.9 5 13.5 4 11.9 4 10 4 8.5 5.2 8.5 6.8c0 3.7 7 3 7 7 0 1.2-.8 2.2-2 2.7" /><path d="M8.5 17.5c.6 1.5 2 2.5 3.6 2.5 1.9 0 3.4-1.2 3.4-2.8 0-3.7-7-3-7-7 0-1.2.8-2.2 2-2.7" /></svg>
        </a>
        <LangButton lang={lang} />
        <ThemeToggle />
      </div>
    </header>
  );
}
