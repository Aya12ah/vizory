'use client';
import { type ReactNode, useEffect } from 'react';

// ESMA Q&A page behaviour. Only one Q&A is open at a time (name="qa" on <details>). When a long
// answer above closes, the page shifts up, so the opened question is brought back into view
// below the sticky contents bar.
const BAR = 56;

export function QaList({ children }: { children: ReactNode }) {
  useEffect(() => {
    function onToggle(e: Event) {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || d.name !== 'qa' || !d.open) return;
      const top = d.getBoundingClientRect().top;
      if (top < BAR) window.scrollBy(0, top - BAR);
    }
    document.addEventListener('toggle', onToggle, true);
    return () => document.removeEventListener('toggle', onToggle, true);
  }, []);
  return children;
}
