// Structured data (schema.org) for Vizory and its people, shared by the pages that use it.
import { SITE_URL } from '@/i18n/lang';

export const ORG_ID = `${SITE_URL}/#org`;

export const organisation = {
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: 'Vizory',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon.svg`,
  image: `${SITE_URL}/og.png`,
  description: 'Compliance advisory for financial firms: applications, compliance frameworks, compliance operations, mock-inspections and dialogue with national competent authorities.',
  address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' },
  areaServed: ['DK', 'EU'],
  knowsAbout: ['MiCAR', 'PSD3', 'PSR', 'MiFID II', 'MiFIR', 'DLT Pilot Regime', 'CSDR', 'AMLR', 'AMLD', 'Crypto-asset regulation', 'Payment services regulation', 'Anti-money laundering'],
};

export const danny = {
  '@type': 'Person',
  '@id': `${SITE_URL}/people#danny-dehghani`,
  name: 'Danny Dehghani',
  url: `${SITE_URL}/people`,
  sameAs: ['https://www.linkedin.com/in/danny-dehghani-84559436'],
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['MiCA', 'Crypto-assets', 'Payments', 'Fintech', 'DLT-based capital markets', 'Supervisory inspections'],
  alumniOf: { '@type': 'GovernmentOrganization', name: 'Finanstilsynet (Danish Financial Supervisory Authority)' },
};

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
