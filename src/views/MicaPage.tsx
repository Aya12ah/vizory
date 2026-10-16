import { JsonLd } from '@/components/JsonLd';
import { RegNav, RegSection } from '@/components/RegNav';
import MicaDa from '@/content/mica.da.mdx';
import MicaEn from '@/content/mica.en.mdx';
import type { Lang } from '@/i18n/lang';
import { DANNY_ID, graph, ORG_ID, regBreadcrumb, webPage } from '@/lib/schema';
import { PAGES } from '@/site';

// The guide itself is Markdown: src/content/mica.en.mdx and src/content/mica.da.mdx.
const CONTENT = { en: MicaEn, da: MicaDa };
const NAME = { en: 'MiCA licence and CASP authorisation', da: 'MiCA og CASP-tilladelse' };
// The questions under "Questions and answers" in the guide, for search engines. Keep in step with the MDX.
const FAQ = {
  en: [
    ['Who needs CASP authorisation?', 'Firms that provide crypto-asset services in the EU on a professional basis, such as custody, operating a trading platform, exchange, execution of orders, advice or transfers.'],
    ['How long does CASP authorisation take?', 'The FSA has up to 25 working days to assess whether the application is complete, and 40 working days after that to decide. The deadline can be extended by up to 20 working days if the FSA requests more information.'],
  ],
  da: [
    ['Hvem skal have en CASP-tilladelse?', 'Virksomheder, der erhvervsmæssigt udbyder kryptoaktivtjenester i EU, fx opbevaring, drift af handelsplatform, veksling, ordreudførelse, rådgivning eller overførsler.'],
    ['Hvor lang tid tager det at få en CASP-tilladelse?', 'Finanstilsynet har op til 25 arbejdsdage til at vurdere, om ansøgningen er fuldstændig, og 40 arbejdsdage derefter til at træffe afgørelse. Fristen kan forlænges med op til 20 arbejdsdage, hvis tilsynet beder om flere oplysninger.'],
  ],
};

export function MicaPage({ lang }: { lang: Lang }) {
  const Content = CONTENT[lang];
  const page = webPage('/mica', lang, NAME[lang]);
  const { lastModified } = PAGES.mica;
  return (
    <>
      <JsonLd data={graph(
        // The page is a FAQPage (a kind of WebPage) because it ends with questions and answers.
        {
          ...page, '@type': 'FAQPage', breadcrumb: { '@id': `${page.url}#breadcrumb` }, about: ['MiCA', 'CASP authorisation', 'Crypto-asset service providers'],
          mainEntity: FAQ[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
        { '@type': 'Article', '@id': `${page.url}#article`, headline: NAME[lang], inLanguage: lang, mainEntityOfPage: { '@id': page['@id'] }, dateModified: lastModified, author: { '@id': DANNY_ID }, publisher: { '@id': ORG_ID } },
        regBreadcrumb('/mica', lang, NAME[lang]),
      )} />
        <RegSection>
          <RegNav lang={lang} current="/mica" />
          <div>
            <article className="doc">
              <Content />
            </article>
          </div>
        </RegSection>
    </>
  );
}
