import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';

/** Topic menu of the regulation pages: on the left on wide screens, on top on phones. */
export function RegNav({ lang, current }: { lang: Lang; current: '/regulation' | '/mica' | '/mica-qa' }) {
  const t = dictionary[lang];
  const link = (path: typeof current) => ({ href: localPath(path, lang), 'aria-current': current === path ? ('page' as const) : undefined });
  return (
    <nav className="reg-nav" aria-label={t.regulation}>
      <p className="reg-nav-title"><a {...link('/regulation')}>{t.regulation}</a></p>
      <p className="reg-topic">{t.regNav.topic}</p>
      <ul>
        <li><a {...link('/mica')}>{t.regNav.mica}</a></li>
        <li><a {...link('/mica-qa')}>{t.regNav.qa}</a></li>
      </ul>
    </nav>
  );
}
