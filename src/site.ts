// Every page of the site with its title and description in both languages. The page metadata
// (title, canonical, hreflang, Open Graph) and the sitemap are built from this list, so a new page
// is added here once and gets all of them.
import type { Metadata } from 'next';
import { type Lang, LANGS, SITE_URL, localPath } from '@/i18n/lang';

type Text = Record<Lang, string>;
export type PageInfo = { path: string; title: Text; description: Text; lastModified: string };

export const PAGES = {
  home: {
    path: '/',
    title: {
      en: 'Vizory · Financial compliance advisory in Copenhagen',
      da: 'Vizory · Compliance-rådgivning til finansielle virksomheder i København',
    },
    description: {
      en: 'Compliance advisory for financial firms in payments, crypto-assets (MiCAR), DLT-based capital markets and AML: applications, frameworks, mock-inspections and dialogue with national competent authorities.',
      da: 'Rådgivning til finansielle virksomheder inden for betalinger, kryptoaktiver (MiCAR), DLT-baserede kapitalmarkeder og hvidvask: ansøgninger, compliance frameworks, mock-inspektioner og dialog med nationale kompetente myndigheder.',
    },
    lastModified: '2026-10-12',
  },
  people: {
    path: '/people',
    title: { en: 'People · Vizory', da: 'Mennesker · Vizory' },
    description: {
      en: "Danny Dehghani spent nine years at the Danish FSA working on fintech, crypto-assets, payments and DLT, and negotiated MiCA on Denmark's behalf.",
      da: 'Danny Dehghani har ni års erfaring fra Finanstilsynet med fintech, kryptoaktiver, betalinger og DLT og har forhandlet MiCA på Danmarks vegne.',
    },
    lastModified: '2026-10-12',
  },
  mica: {
    path: '/mica',
    title: {
      en: 'MiCA and CASP authorisation: application, compliance and governance · Vizory',
      da: 'MiCA og CASP-tilladelse: ansøgning, compliance og governance · Vizory',
    },
    description: {
      en: 'What an application for CASP authorisation under MiCA must contain, how the Danish FSA assesses it, and the compliance and governance requirements that apply afterwards.',
      da: 'Hvad en ansøgning om CASP-tilladelse efter MiCA skal indeholde, hvordan Finanstilsynet behandler den, og hvilke krav til compliance og governance der gælder bagefter.',
    },
    lastModified: '2026-10-12',
  },
  regulation: {
    path: '/regulation',
    title: { en: 'Regulation · Vizory', da: 'Regulering · Vizory' },
    description: {
      en: 'Guides to EU financial regulation from Vizory, starting with MiCA and CASP authorisation.',
      da: "Vejledninger om EU's finansielle regulering fra Vizory, begyndende med MiCA og CASP-tilladelse.",
    },
    lastModified: '2026-10-12',
  },
  micaQa: {
    path: '/mica-qa',
    title: { en: 'ESMA Q&As on MiCA · Vizory', da: "ESMA's spørgsmål og svar om MiCA · Vizory" },
    description: {
      en: "All questions and answers on MiCA published by ESMA, grouped by topic, with links to ESMA's own versions.",
      da: "Alle spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne og med links til ESMA's egne versioner.",
    },
    lastModified: '2026-10-12',
  },
} satisfies Record<string, PageInfo>;

export type PageKey = keyof typeof PAGES;

export const absUrl = (path: string, lang: Lang) => SITE_URL + localPath(path, lang);

/** Head tags for a page: title, description, canonical, hreflang alternates and Open Graph. */
export function pageMetadata(key: PageKey, lang: Lang): Metadata {
  const p: PageInfo = PAGES[key];
  const url = absUrl(p.path, lang);
  return {
    title: p.title[lang],
    description: p.description[lang],
    alternates: {
      canonical: url,
      languages: { en: absUrl(p.path, 'en'), da: absUrl(p.path, 'da'), 'x-default': absUrl(p.path, 'en') },
    },
    openGraph: {
      type: 'website',
      siteName: 'Vizory',
      url,
      title: p.title[lang],
      description: p.description[lang],
      images: [{ url: `${SITE_URL}/${lang === 'da' ? 'og-da' : 'og'}.png`, width: 1200, height: 630 }],
      locale: lang === 'da' ? 'da_DK' : 'en_GB',
      alternateLocale: lang === 'da' ? 'en_GB' : 'da_DK',
    },
    twitter: { card: 'summary_large_image' },
  };
}

/** Every page in every language, for the sitemap. */
export const allPages = () => Object.values(PAGES as Record<string, PageInfo>).flatMap((p) => LANGS.map((lang) => ({ ...p, lang })));
