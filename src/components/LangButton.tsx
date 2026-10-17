'use client';
import { useEffect, useRef } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, otherLangPath } from '@/i18n/lang';
import { pop } from './pop';
import { iconButton } from './styles';

// The visitor's own choice of language wins and is remembered. Otherwise visitors in Denmark,
// Greenland and the Faroe Islands who land on an English page are sent to the Danish one (country
// from Vercel). Without the location lookup the browser language decides.
const DA_COUNTRIES = ['DK', 'GL', 'FO'];

function get(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function set(k: string, v: string) { try { localStorage.setItem(k, v); } catch {} }

function browserLang(): Lang {
  const langs = navigator.languages || [navigator.language || ''];
  for (const l of langs) if (/^(da|kl|fo)\b/i.test(l)) return 'da';
  try { if (Intl.DateTimeFormat().resolvedOptions().timeZone === 'Europe/Copenhagen') return 'da'; } catch {}
  return 'en';
}

/** `copy`: a second button on the same page (the regulation menu's), without the id, which leaves
 *  the redirect above to the header's. */
export function LangButton({ lang, copy = false }: { lang: Lang; copy?: boolean }) {
  const t = dictionary[lang].langButton;
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (copy) return;
    const goTo = (l: Lang) => { if (l !== lang) location.replace(otherLangPath(location.pathname) + location.search + location.hash); };
    const chosen = get('vz-lang');
    if (chosen === 'en' || chosen === 'da') { goTo(chosen); return; }
    if (lang !== 'en') return;
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { country: string | null } | null) => {
        if (get('vz-lang')) return;
        goTo(d && d.country ? (DA_COUNTRIES.includes(d.country) ? 'da' : 'en') : browserLang());
      })
      .catch(() => { if (!get('vz-lang')) goTo(browserLang()); });
  }, [lang, copy]);

  function onClick() {
    set('vz-lang', lang === 'en' ? 'da' : 'en');
    if (ref.current) pop(ref.current);
    location.href = otherLangPath(location.pathname) + location.hash;
  }

  return <button ref={ref} className={iconButton} id={copy ? undefined : 'langBtn'} type="button" aria-label={t.label} onClick={onClick}>{t.text}</button>;
}
