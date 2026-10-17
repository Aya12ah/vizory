'use client';
import type { Section } from './ContentsBar';
import { useCurrentSection } from './useCurrentSection';

// The sections of the page being read, under its link in the left menu, from 900px (below that
// the ContentsBar has them). The section being read is marked; the subsections of the top-level
// section being read are shown.
export function SideSections({ sections }: { sections: Section[] }) {
  const current = useCurrentSection(sections.map((s) => s.id));
  // The top-level section each section belongs to.
  const parent = new Map<string, string>();
  let top = '';
  for (const s of sections) {
    if (!s.depth) top = s.id;
    parent.set(s.id, top);
  }
  const open = current ? parent.get(current) : undefined;
  return (
    <ul className="hidden wide:grid list-none mt-[6px] mb-1 mx-0 py-0 pr-0 pl-3 border-l border-line gap-[5px] text-[13px] leading-[1.4]" data-side-sections>
      {sections.filter((s) => !s.depth || parent.get(s.id) === open).map((s) => (
        <li key={s.id} className={`m-0 flex items-baseline justify-between gap-3 ${s.depth ? 'pl-3' : ''}`}>
          <a href={`#${s.id}`} lang={s.lang} aria-current={s.id === current ? 'true' : undefined}
            className="text-ink-soft no-underline hover:text-signal-text aria-[current]:text-signal-text">{s.label}</a>
          {s.count !== undefined && <span className="text-[12px] text-ink-soft">{s.count}</span>}
        </li>
      ))}
    </ul>
  );
}
