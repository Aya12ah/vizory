// Structured data (schema.org) for Vizory and its people, shared by the pages that use it.
import { SITE_URL, type Lang, localPath } from '@/i18n/lang';
import { dictionary } from '@/i18n/dictionary';

export const ORG_ID = `${SITE_URL}/#org`;
export const DANNY_ID = `${SITE_URL}/people#danny-dehghani`;

const ORG_DESCRIPTION = {
  en: 'Compliance advisory for financial firms: applications, compliance frameworks, compliance operations, mock-inspections and dialogue with national competent authorities.',
  da: 'Compliance-rådgivning til finansielle virksomheder: ansøgninger, compliance frameworks, drift af compliance, mock-inspektioner og dialog med nationale kompetente myndigheder.',
};

export const organisation = (lang: Lang) => ({
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'Vizory',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  image: `${SITE_URL}/og/home-en.png`,
  description: ORG_DESCRIPTION[lang],
  address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' },
  areaServed: ['DK', 'EU'],
  knowsAbout: ['MiCA', 'PSD3', 'PSR', 'MiFID II', 'MiFIR', 'DLT Pilot Regime', 'CSDR', 'AMLR', 'AMLD', 'Crypto-asset regulation', 'Payment services regulation', 'Anti-money laundering'],
});

export const danny = {
  '@type': 'Person',
  '@id': DANNY_ID,
  name: 'Danny Dehghani',
  url: `${SITE_URL}/people`,
  sameAs: ['https://www.linkedin.com/in/danny-dehghani-84559436'],
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['MiCA', 'Crypto-assets', 'Payments', 'Fintech', 'DLT-based capital markets', 'Supervisory inspections'],
  alumniOf: { '@type': 'GovernmentOrganization', name: 'Finanstilsynet (Danish Financial Supervisory Authority)' },
};

/** A WebPage node for a page, published by Vizory. */
export function webPage(path: string, lang: Lang, name: string, extra: object = {}) {
  const url = SITE_URL + localPath(path, lang);
  return { '@type': 'WebPage', '@id': `${url}#page`, url, name, inLanguage: lang, isPartOf: { '@id': `${SITE_URL}/#site` }, publisher: { '@id': ORG_ID }, ...extra };
}

/** Front page › Regulation › the page, for the pages under Regulation. */
export function regBreadcrumb(path: string, lang: Lang, name: string) {
  const item = (position: number, n: string, p: string) => ({ '@type': 'ListItem', position, name: n, item: SITE_URL + localPath(p, lang) });
  return {
    '@type': 'BreadcrumbList',
    '@id': `${SITE_URL + localPath(path, lang)}#breadcrumb`,
    itemListElement: [item(1, 'Vizory', '/'), item(2, dictionary[lang].regulation, '/regulation'), item(3, name, path)],
  };
}

export const website = { '@type': 'WebSite', '@id': `${SITE_URL}/#site`, url: `${SITE_URL}/`, name: 'Vizory', publisher: { '@id': ORG_ID } };

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
