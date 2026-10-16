import { Fragment, type ReactNode } from 'react';

// A paragraph of ESMA's text: [title](url) shows the title as a link, a bare URL links itself,
// and [[fn1]] marks footnote 1.
const TOKEN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|https?:\/\/[^\s<"]+[^\s<".,;:)]|\[\[fn(\d+)\]\]/g;

export function QaText({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    out.push(text.slice(last, m.index));
    if (m[3]) out.push(<sup>{m[3]}</sup>);
    else if (m[2]) out.push(<a href={m[2]} rel="noopener">{m[1]}</a>);
    else out.push(<a href={m[0]} rel="noopener">{m[0]}</a>);
    last = m.index + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out.map((n, i) => <Fragment key={i}>{n}</Fragment>)}</>;
}
