'use client';
import { useEffect, useRef, useState } from 'react';
import { pop } from './pop';
import { iconButton } from './styles';

// Fresh light and Fresh dark. The script in <head> picks the theme before the page paints;
// this button, in the header, switches it and remembers the choice.
export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setDark(html.getAttribute('data-theme') === 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    // Turn on the icon transition only after the first paint, so the icon does not animate on load.
    let inner = 0;
    const outer = requestAnimationFrame(() => { inner = requestAnimationFrame(() => setReady(true)); });
    return () => { cancelAnimationFrame(outer); cancelAnimationFrame(inner); observer.disconnect(); };
  }, []);

  const icon = 'absolute top-3 left-3' + (ready ? ' [transition:transform_.5s_cubic-bezier(.4,0,.2,1),opacity_.3s_ease]' : '');

  function toggle() {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('vz-theme', next); } catch {}
    setDark(!dark);
    if (ref.current) pop(ref.current);
  }

  return (
    <button ref={ref} className={`${iconButton} relative`} id="themeBtn" type="button"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} aria-pressed={dark} onClick={toggle}>
      {/* Moon in day mode, sun in night mode, turning into each other. */}
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${icon} ${dark ? 'opacity-0 [transform:rotate(90deg)_scale(.4)]' : ''}`}><path d="M20 14.07A8.15 8.15 0 1 1 9.93 4a6.52 6.52 0 0 0 10.07 10.07Z" /></svg>
      <svg viewBox="0 0 24 24" aria-hidden="true" className={`${icon} ${dark ? 'opacity-100 [transform:rotate(0)_scale(1)]' : 'opacity-0 [transform:rotate(-90deg)_scale(.4)]'}`}><circle cx="12" cy="12" r="3.6" /><path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20M6.34 6.34l1.7 1.7M15.96 15.96l1.7 1.7M17.66 6.34l-1.7 1.7M8.04 15.96l-1.7 1.7" /></svg>
    </button>
  );
}
