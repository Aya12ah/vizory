// Short texts used across the site, in both languages. Longer page texts live with their page
// (src/views) or in MDX (src/content). The Danish dictionary must have every key the English one has.
import type { Lang } from './lang';

const en = {
  people: 'People',
  regulation: 'Regulation',
  copenhagen: 'Copenhagen',
  frontPage: 'vizory, front page',
  langButton: { label: 'Skift til dansk', text: 'DA' },
  regNav: {
    topic: 'MiCA and CASP',
    authorisation: 'Authorisation and compliance',
    qa: 'ESMA Q&As',
    payments: 'Payments',
    aml: 'AML/CFT',
    amlr: 'AMLR and the new rules',
  },
  contents: 'Contents',
};

const da: typeof en = {
  people: 'Mennesker',
  regulation: 'Regulering',
  copenhagen: 'København',
  frontPage: 'vizory, forside',
  langButton: { label: 'Switch to English', text: 'EN' },
  regNav: {
    topic: 'MiCA og CASP',
    authorisation: 'Tilladelse og compliance',
    qa: 'ESMA\'s spørgsmål og svar',
    payments: 'Betalinger',
    aml: 'Hvidvask',
    amlr: 'AMLR og de nye regler',
  },
  contents: 'Indhold',
};

export const dictionary = { en, da } satisfies Record<Lang, typeof en>;
