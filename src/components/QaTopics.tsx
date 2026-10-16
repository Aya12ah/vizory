'use client';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// ESMA Q&A page behaviour.
// - Only one Q&A is open at a time (name="qa" on <details>). When a long answer above closes, the
//   page shifts up, so the opened question is brought back into view below the sticky topic heading.
// - Each sticky topic heading opens a dropdown with all topics, so a reader deep in one topic can
//   jump to another.
type Open = { id: string; button: HTMLButtonElement } | null;
const Ctx = createContext<{ open: Open; toggle: (id: string, button: HTMLButtonElement) => void }>({ open: null, toggle: () => {} });

export function QaTopics({ menu, label, children }: { menu: ReactNode; label: string; children: ReactNode }) {
  const [open, setOpen] = useState<Open>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- the menu is portalled to <body>, which exists only in the browser
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onToggle(e: Event) {
      const d = e.target as HTMLElement;
      if (!(d instanceof HTMLDetailsElement) || !d.classList.contains('qa') || !d.open) return;
      let h = d.previousElementSibling;
      while (h && h.tagName !== 'H2') h = h.previousElementSibling;
      const offset = h ? (h as HTMLElement).offsetHeight : 0;
      if (d.getBoundingClientRect().top < offset) window.scrollBy(0, d.getBoundingClientRect().top - offset - 8);
    }
    document.addEventListener('toggle', onToggle, true);
    return () => document.removeEventListener('toggle', onToggle, true);
  }, []);

  const close = useCallback((focus: boolean) => {
    if (open && focus) open.button.focus();
    setOpen(null);
  }, [open]);

  const toggle = useCallback((id: string, button: HTMLButtonElement) => {
    if (open?.id === id) { setOpen(null); return; }
    const r = button.parentElement!.getBoundingClientRect();
    setPos({ top: Math.max(r.bottom, 0), left: r.left, width: r.width });
    setOpen({ id, button });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !open.button.contains(t)) close(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(true); };
    const onMove = () => close(false);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('resize', onMove);
    };
  }, [open, close]);

  // Mark the topic whose heading opened the menu.
  useEffect(() => {
    menuRef.current?.querySelectorAll('a').forEach((a) => {
      if (open && a.getAttribute('href') === '#' + open.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }, [open]);

  return (
    <Ctx.Provider value={{ open, toggle }}>
      {children}
      {mounted && createPortal(
        <nav ref={menuRef} className="qa-topic-menu" id="qa-topic-menu" hidden={!open} aria-label={label}
          style={{ top: pos.top + 'px', left: pos.left + 'px', width: pos.width + 'px' }}
          onClick={(e) => { if ((e.target as HTMLElement).closest('a')) close(false); }}>
          {menu}
        </nav>,
        document.body,
      )}
    </Ctx.Provider>
  );
}

export function TopicButton({ id, children }: { id: string; children: ReactNode }) {
  const { open, toggle } = useContext(Ctx);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button ref={ref} type="button" className="qa-topic-btn" aria-expanded={open?.id === id} aria-controls="qa-topic-menu"
      onClick={() => ref.current && toggle(id, ref.current)}>
      {children}
      <svg className="qa-chevron" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}
