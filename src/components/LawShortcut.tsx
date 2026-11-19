'use client';
import { useEffect, useRef, useState } from 'react';

// Typing the letters l-o-v on the front page opens Danny's law lookup app (public/lov/) in a window
// on top of the page. There is deliberately no link to it anywhere on the site. Keys typed into a
// field, keys pressed with a modifier and every other key are left alone, so keyboard navigation
// works as before. The app is its own static page with its own look, shown in a frame; it is only
// loaded the first time the window opens, and kept for the next time.
const WORD = 'lov';
const PAUSE_MS = 1500;
const APP = '/lov/index.html';
const LABEL = 'Lovopslag';

export function LawShortcut() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [shown, setShown] = useState(false);

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
    let typed = '', last = 0;
    function onKey(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (dialog.current?.open) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key.length !== 1) return;
      const now = Date.now();
      if (now - last > PAUSE_MS) typed = '';
      last = now;
      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed === WORD) { typed = ''; open(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Esc pressed inside the app reaches only the frame's own document, so it is passed on from there.
  function onFrameLoad(e: React.SyntheticEvent<HTMLIFrameElement>) {
    try {
      e.currentTarget.contentWindow?.addEventListener('keydown', (k) => { if (k.key === 'Escape') close(); });
    } catch {}
  }

  const fade = 'transition-opacity duration-200 motion-reduce:transition-none';
  return (
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
  );
}
