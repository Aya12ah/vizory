'use client';
import { useEffect, useState } from 'react';

/** Where the current section is decided: a heading counts as passed once its top is above this line. */
const LINE = 80;

/** The id of the section being read: the last of these headings that has scrolled past the top. */
export function useCurrentSection(ids: string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const key = ids.join(' ');
  useEffect(() => {
    const headings = key.split(' ').map((id) => document.getElementById(id)).filter((h) => h !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      let id: string | null = null;
      for (const h of headings) if (h.getBoundingClientRect().top < LINE) id = h.id;
      setCurrent(id);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [key]);
  return current;
}
