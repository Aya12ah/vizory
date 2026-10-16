// Short texts used across the site, in both languages. Longer page texts live with their page
// (src/views) or in MDX (src/content). The Danish dictionary must have every key the English one has.
import type { Lang } from './lang';

const en = {
  people: 'People',
  regulation: 'Regulation',
  copenhagen: 'Copenhagen',
  frontPage: 'vizory, front page',
  langButton: { label: 'Skift til dansk', text: 'DA' },
  theme: { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' },
  regNav: {
    topic: 'MiCA and CASP',
    mica: 'Authorisation and compliance',
    qa: 'ESMA Q&As',
  },
  topics: 'Topics',
};

const da: typeof en = {
  people: 'Mennesker',
  regulation: 'Regulering',
  copenhagen: 'København',
  frontPage: 'vizory, forside',
  langButton: { label: 'Switch to English', text: 'EN' },
  theme: { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' },
  regNav: {
    topic: 'MiCA og CASP',
    mica: 'Tilladelse og compliance',
    qa: 'ESMA\'s spørgsmål og svar',
  },
  topics: 'Emner',
};

export const dictionary = { en, da } satisfies Record<Lang, typeof en>;
export type Dictionary = typeof en;
