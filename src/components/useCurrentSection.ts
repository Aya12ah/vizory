'use client';
import { useEffect, useState } from 'react';

/** Where the current section is decided: a heading counts as passed once its top is above this line. */
const LINE = 80;

/** The line for the current scroll position. The last sections of a page are often too short for
 *  their headings ever to reach the top, so over the last screenful of scrolling the line moves
 *  down to the bottom of the screen: the remaining sections are reached one by one, and at the
 *  very end the last heading in view is the current one. */
function line() {
  const remaining = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
  if (window.scrollY <= 0 || remaining >= window.innerHeight) return LINE;
  return LINE + (window.innerHeight - LINE) * (1 - Math.max(remaining, 0) / window.innerHeight);
}

/** The id of the section being read: the last of these headings that has passed the line. */
export function useCurrentSection(ids: string[]): string | null {
  const [current, setCurrent] = useState<string | null>(null);
  const key = ids.join(' ');
  useEffect(() => {
    const headings = key.split(' ').map((id) => document.getElementById(id)).filter((h) => h !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = line();
      let id: string | null = null;
      for (const h of headings) if (h.getBoundingClientRect().top < y) id = h.id;
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
