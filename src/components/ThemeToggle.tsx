'use client';
import { useEffect, useRef, useState } from 'react';
import { pop } from './pop';

// Fresh light and Fresh dark. The script in <head> picks the theme before the page paints;
// this button switches it and remembers the choice.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the theme is only known in the browser
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    // Turn on the icon transition only after the first paint, so the icon does not animate on load.
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setReady(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); };
  }, []);

  function toggle() {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('vz-theme', next); } catch {}
    setDark(!dark);
    if (ref.current) pop(ref.current);
  }

  return (
    <button ref={ref} className={'ib toggle' + (ready ? ' ready' : '')} id="themeBtn" type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} onClick={toggle}>
      <svg viewBox="0 0 24 24" aria-hidden="true" id="iconMoon"><path d="M20 14.07A8.15 8.15 0 1 1 9.93 4a6.52 6.52 0 0 0 10.07 10.07Z" /></svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" id="iconSun"><circle cx="12" cy="12" r="3.6" /><path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20M6.34 6.34l1.7 1.7M15.96 15.96l1.7 1.7M17.66 6.34l-1.7 1.7M8.04 15.96l-1.7 1.7" /></svg>
    </button>
  );
}
