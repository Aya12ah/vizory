// Every page of the site with its title and description in both languages. The page metadata
// (title, canonical, hreflang, Open Graph) and the sitemap are built from this list, so a new page
// is added here once and gets all of them.
import type { Metadata } from 'next';
import { IS_PREVIEW, type Lang, LANGS, SITE_URL, localPath } from '@/i18n/lang';

// Previews are kept out of search engines so they never compete with the real pages.
export { IS_PREVIEW };

type Text = Record<Lang, string>;
/** `og` is the file name stem of the page's sharing image in public/og/ (one per language: <og>-en.png, <og>-da.png). */
export type PageInfo = { path: string; og: string; title: Text; description: Text; lastModified: string };

export const PAGES = {
  home: {
    path: '/',
    og: 'home',
    title: {
      en: 'MiCA, payments and AML compliance advisory · Vizory',
      da: 'Compliance-rådgivning om MiCA, betalinger og hvidvask · Vizory',
    },
    description: {
      en: 'Compliance advisory in Copenhagen for financial firms: MiCA licences, payments, AML and DLT. Applications, mock-inspections and Danish FSA dialogue.',
      da: 'Compliance-rådgivning i København: MiCA-tilladelse, betalinger, hvidvask og DLT. Ansøgninger, mock-inspektioner og dialog med Finanstilsynet.',
    },
    lastModified: '2026-10-16',
  },
  people: {
    path: '/people',
    og: 'people',
    title: { en: 'Danny Dehghani, former Danish FSA · Vizory', da: 'Danny Dehghani, tidligere Finanstilsynet · Vizory' },
    description: {
      en: "Danny Dehghani spent nine years at the Danish FSA working on fintech, crypto-assets, payments and DLT, and negotiated MiCA on Denmark's behalf.",
      da: 'Danny Dehghani har ni års erfaring fra Finanstilsynet med fintech, kryptoaktiver, betalinger og DLT og har forhandlet MiCA på Danmarks vegne.',
    },
    lastModified: '2026-10-16',
  },
  mica: {
    path: '/mica',
    og: 'mica',
    title: {
      en: 'MiCA licence (CASP authorisation): how to apply · Vizory',
      da: 'CASP-tilladelse efter MiCA: ansøgning og krav · Vizory',
    },
    description: {
      en: 'What an application for a MiCA licence (CASP authorisation) must contain, how the Danish FSA assesses it, and the compliance rules that follow.',
      da: 'Hvad en ansøgning om CASP-tilladelse efter MiCA skal indeholde, hvordan Finanstilsynet behandler den, og hvilke compliance-krav der gælder bagefter.',
    },
    lastModified: '2026-10-16',
  },
  payments: {
    path: '/payments',
    og: 'payments',
    title: {
      en: 'Payment institution licence in Denmark: PSD2 to PSD3 · Vizory',
      da: 'Tilladelse som betalingsinstitut og e-pengeinstitut · Vizory',
    },
    description: {
      en: 'Payment and e-money institution licences from the Danish FSA: which authorisation you need, what the application must contain, and what PSD3 changes.',
      da: 'Tilladelse som betalingsinstitut eller e-pengeinstitut fra Finanstilsynet: hvilken tilladelse I skal have, hvad ansøgningen kræver, og hvad PSD3 ændrer.',
    },
    lastModified: '2026-10-16',
  },
  aml: {
    path: '/aml',
    og: 'aml',
    title: {
      en: 'AMLR: the new EU anti-money laundering rules · Vizory',
      da: 'Hvidvask: AMLR og de nye EU-regler · Vizory',
    },
    description: {
      en: 'What the EU AML Regulation (AMLR) changes from July 2027, what the Danish FSA expects of AML in an application, and how firms prepare.',
      da: 'Hvad EU\'s hvidvaskforordning (AMLR) ændrer fra juli 2027, hvad Finanstilsynet forventer af hvidvaskdelen i en ansøgning, og hvordan I forbereder jer.',
    },
    lastModified: '2026-10-17',
  },
  stablecoins: {
    path: '/stablecoins',
    og: 'stablecoins',
    title: {
      en: 'Stablecoins under MiCA: EMT and ART rules · Vizory',
      da: 'Stablecoins efter MiCA: regler for EMT og ART · Vizory',
    },
    description: {
      en: 'E-money tokens and asset-referenced tokens under MiCA: who may issue them, the white paper, reserves and redemption, and what CASPs may offer.',
      da: 'E-pengetokens og tokens med aktivreference efter MiCA: hvem der må udstede dem, whitepaper, reserver og indløsning, og hvad CASP\'er må tilbyde.',
    },
    lastModified: '2026-10-17',
  },
  regulation: {
    path: '/regulation',
    og: 'regulation',
    title: { en: 'Guides to EU financial regulation · Vizory', da: 'Vejledninger om finansiel regulering · Vizory' },
    description: {
      en: 'Practical guides to EU financial regulation from Vizory, starting with MiCA and CASP authorisation.',
      da: "Vejledninger om EU's finansielle regulering fra Vizory, begyndende med MiCA og CASP-tilladelse.",
    },
    lastModified: '2026-10-16',
  },
  micaQa: {
    path: '/mica-qa',
    og: 'mica-qa',
    title: { en: 'ESMA MiCA Q&A: every answer by topic · Vizory', da: "ESMA's Q&A om MiCA: alle svar efter emne · Vizory" },
    description: {
      en: "All questions and answers on MiCA published by ESMA, grouped by topic, with links to ESMA's own versions.",
      da: "Alle spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne og med links til ESMA's egne versioner.",
    },
    lastModified: '2026-10-16',
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
    // Author and date of the page, read by LinkedIn's link preview.
    authors: [{ name: 'Danny Dehghani', url: `${SITE_URL}/people` }],
    other: { date: p.lastModified },
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
      images: [{ url: `${SITE_URL}/og/${p.og}-${lang}.png`, width: 1200, height: 630, alt: p.title[lang] }],
      locale: lang === 'da' ? 'da_DK' : 'en_GB',
      alternateLocale: lang === 'da' ? 'en_GB' : 'da_DK',
    },
    twitter: { card: 'summary_large_image' },
    ...(IS_PREVIEW ? { robots: { index: false, follow: false } } : {}),
  };
}

/** Every page in every language, for the sitemap. */
export const allPages = () => Object.values(PAGES as Record<string, PageInfo>).flatMap((p) => LANGS.map((lang) => ({ ...p, lang })));
