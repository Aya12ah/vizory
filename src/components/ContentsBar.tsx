'use client';
import { useEffect, useRef, useState } from 'react';
import { useCurrentSection } from './useCurrentSection';

// A long page's contents as a bar that sticks to the top of the screen once the reader has
// scrolled past the place it is put (usually right after the table of contents). It names the
// section being read and opens a menu of all sections. It works on any page whose sections are
// headings with an id. The bar takes no space in the page flow and is hidden until it sticks,
// so it never moves the text. From 900px the sections are in the left menu instead (SideSections).

/** A section of the page: the id of its heading, its name, and optionally its level (0 = top),
 *  a count shown next to it, and its language when that differs from the page's. */
export type Section = { id: string; label: string; depth?: number; count?: number; lang?: string };

export function ContentsBar({ title, sections }: { title: string; sections: Section[] }) {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = useCurrentSection(sections.map((s) => s.id));

  // Stuck once the bar's place in the page has scrolled to the top.
  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; setStuck((ref.current?.getBoundingClientRect().top ?? 1) <= 0); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close on Escape, on a click outside, and when the bar is no longer stuck.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); button.current?.focus(); } };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- the menu belongs to the stuck bar only
  useEffect(() => { if (!stuck) setOpen(false); }, [stuck]);

  const now = sections.find((s) => s.id === current);
  return (
    <div ref={ref} className="sticky top-0 z-1 h-0 wide:hidden" data-contents-bar>
      <div className={`-mx-2 px-2 bg-bg shadow-[0_1px_0_var(--line)] text-[14px] leading-[1.4] ${stuck ? 'visible' : 'invisible'}`}>
        <button ref={button} type="button" aria-expanded={open} aria-controls="contents-menu" tabIndex={stuck ? 0 : -1}
          className="group flex items-center gap-2 w-full py-3 px-0 border-0 [background:none] [font:inherit] text-inherit text-left cursor-pointer"
          onClick={() => setOpen(!open)}>
          <span className="shrink-0 font-medium text-ink">{title}</span>
          {now && <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-ink-soft" lang={now.lang}>{now.label}</span>}
          <svg className="shrink-0 ml-auto size-[14px] text-ink-soft transition-[transform] duration-180 ease-[ease] group-aria-expanded:[transform:rotate(180deg)]" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
      <nav id="contents-menu" hidden={!open} aria-label={title}
        className="-mx-2 max-h-[calc(100vh-120px)] overflow-y-auto py-[6px] bg-panel border border-line rounded-t-none rounded-b-md shadow-[0_8px_24px_rgba(0,0,0,.18)] text-[14px] leading-[1.4]">
        <ol className="list-none m-0 p-0">
          {sections.map((s) => (
            <li key={s.id} className="m-0 flex items-baseline justify-between gap-4">
              <a href={`#${s.id}`} lang={s.lang} aria-current={s.id === current ? 'true' : undefined} onClick={() => setOpen(false)}
                className={`flex-1 py-[9px] pr-3 no-underline aria-[current]:text-signal-text pointer-fine:hover:text-signal-text ${s.depth ? 'pl-7 text-ink-soft' : 'pl-3 text-ink'}`}>{s.label}</a>
              {s.count !== undefined && <span className="text-[12px] text-ink-soft pr-3">{s.count}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
