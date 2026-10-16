import type { ReactNode } from 'react';

// A plain list of entries with a title and a short text: the people on the People page and the
// guides on the Regulation page.
export function EntryList({ children }: { children: ReactNode }) {
  return <ul className="list-none mt-10 mx-0 mb-0 p-0 grid gap-10">{children}</ul>;
}

export function Entry({ title, text, children }: { title: ReactNode; text: string; children?: ReactNode }) {
  return (
    <li className="grid gap-2 max-w-[56ch]">
      <h2 className="text-[17px] leading-[1.35]">{title}</h2>
      <p className="text-[14px] leading-[1.55] text-ink-soft">{text}</p>
      {children}
    </li>
  );
}

