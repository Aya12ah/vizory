import { ContentsBar, type Section } from './ContentsBar';

/** Table of contents of a guide: [id, label] per heading, with an optional list of subheadings. */
export type TocItem = [id: string, label: string, children?: TocItem[]];

function List({ items }: { items: TocItem[] }) {
  return (
    <ol>
      {items.map(([id, label, children]) => (
        <li key={id}><a href={`#${id}`}>{label}</a>{children && <List items={children} />}</li>
      ))}
    </ol>
  );
}

/** The table of contents as a flat list of sections, for ContentsBar and SideSections. */
export const tocSections = (items: TocItem[], depth = 0): Section[] =>
  items.flatMap(([id, label, children]) => [{ id, label, depth }, ...(children ? tocSections(children, depth + 1) : [])]);

/** The table of contents, followed by the bar that keeps it at hand further down (ContentsBar). */
export function Toc({ title, items }: { title: string; items: TocItem[] }) {
  return (
    <>
      <nav className="toc" aria-label={title}>
        <p className="toc-title">{title}</p>
        <List items={items} />
      </nav>
      <ContentsBar title={title} sections={tocSections(items)} />
    </>
  );
}
