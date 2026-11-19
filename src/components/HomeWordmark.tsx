'use client';
import { useEffect, useRef, useState } from 'react';
import { Wordmark, wordmarkClass } from '@/components/Wordmark';

// The front page's large wordmark doubles as a hidden prompt. Typing on the front page replaces
// "vizory" with what is typed, and the wordmark's cursor becomes a thin text cursor after it.
// Enter on the word "lov" opens Danny's law lookup app (public/lov/) in a window on top of the page;
// there is deliberately no link to it anywhere on the site. Backspace deletes, Esc or a pause
// brings "vizory" back. Keys typed into a field, keys pressed with a modifier and, until a letter
// has been typed, every key that is not a letter or digit are left alone, so keyboard navigation
// and scrolling work as before. The app is its own static page with its own look, shown in a frame;
// it is only loaded the first time the window opens, and kept for the next time.
const WORD = 'lov';
const MAX = 16;
const IDLE_MS = 8000;
const APP = '/lov/index.html';
const LABEL = 'Lovopslag';

export function HomeWordmark({ className }: { className: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [shown, setShown] = useState(false);
  const [typed, setTyped] = useState('');

  function open() {
    const d = dialog.current;
    if (!d || d.open) return;
    setLoaded(true);
    d.showModal();
    // Let the closed state paint first, so the window grows into place.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  }

  function close() {
    const d = dialog.current;
    if (!d?.open) return;
    setShown(false);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => d.close(), reduce ? 0 : 220);
  }

  useEffect(() => {
    let text = '', idle: ReturnType<typeof setTimeout> | undefined;
    const set = (t: string) => {
      text = t; setTyped(t);
      clearTimeout(idle);
      if (t) idle = setTimeout(() => set(''), IDLE_MS);
    };
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (dialog.current?.open) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!text) {
        // Only a letter or digit starts typing; Space, Enter and the rest keep their usual job.
        if (e.key.length === 1 && /[\p{L}\p{N}]/u.test(e.key)) { e.preventDefault(); set(e.key.toLowerCase()); }
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (text.trim() === WORD) { set(''); open(); }
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); set(''); return; }
      if (e.key === 'Backspace') { e.preventDefault(); set(text.slice(0, -1)); return; }
      if (e.key.length === 1) { e.preventDefault(); set((text + e.key.toLowerCase()).slice(0, MAX)); }
    }
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); clearTimeout(idle); };
  }, []);

  // Esc pressed inside the app reaches only the frame's own document, so it is passed on from there.
  function onFrameLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    try {
      e.currentTarget.contentWindow?.addEventListener('keydown', (k) => { if (k.key === 'Escape') close(); });
    } catch {}
  }

  const fade = 'transition-opacity duration-200 motion-reduce:transition-none';
  return (
    <>
      <p className={`${wordmarkClass} ${className}`}>
        {typed ? (
          <>
            <span className="whitespace-pre">{typed}</span>
            {/* Restarted on every key, so the cursor shows while typing and blinks once typing stops. */}
            <span key={typed.length} className="inline-block w-[.05em] min-w-[2px] h-[.9em] ml-[.04em] bg-signal animate-blink" aria-hidden="true"></span>
          </>
        ) : <Wordmark />}
      </p>
      <dialog
        ref={dialog}
        aria-label={LABEL}
        onCancel={(e) => { e.preventDefault(); close(); }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        className={`fixed inset-0 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-10 phone:p-2 backdrop:bg-transparent ${fade} ${shown ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className={`fixed inset-0 -z-10 bg-bg/80 ${fade}`} aria-hidden="true" />
        <div
          className={`mx-auto flex h-full max-w-[1280px] flex-col overflow-hidden rounded-[6px] border border-line bg-panel transition-transform duration-200 ease-out motion-reduce:transition-none ${shown ? 'scale-100 translate-y-0' : 'scale-[0.97] translate-y-2'}`}
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <span className="text-[13px] text-ink-soft">{LABEL}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Luk"
              className="cursor-pointer rounded-[4px] border-0 bg-transparent px-2 py-1 text-[18px] leading-none text-ink-soft hover:text-ink"
            >
              ×
            </button>
          </div>
          {loaded && <iframe src={APP} title={LABEL} onLoad={onFrameLoad} className="block w-full flex-1 border-0 bg-white" />}
        </div>
      </dialog>
    </>
  );
}
