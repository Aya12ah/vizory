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

export function Toc({ title, items }: { title: string; items: TocItem[] }) {
  return (
    <nav className="toc" aria-label={title}>
      <p className="toc-title">{title}</p>
      <List items={items} />
    </nav>
  );
}
