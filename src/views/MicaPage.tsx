import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { RegNav } from '@/components/RegNav';
import MicaDa from '@/content/mica.da.mdx';
import MicaEn from '@/content/mica.en.mdx';
import { SITE_URL, type Lang, localPath } from '@/i18n/lang';
import { graph, ORG_ID } from '@/lib/schema';

// The guide itself is Markdown: src/content/mica.en.mdx and src/content/mica.da.mdx.
const CONTENT = { en: MicaEn, da: MicaDa };
const NAME = { en: 'MiCA and CASP authorisation', da: 'MiCA og CASP-tilladelse' };

export function MicaPage({ lang }: { lang: Lang }) {
  const Content = CONTENT[lang];
  const url = SITE_URL + localPath('/mica', lang);
  return (
    <>
      <JsonLd data={graph(
        { '@type': 'WebPage', '@id': `${url}#page`, url, name: NAME[lang], ...(lang === 'da' ? { inLanguage: 'da' } : {}), about: ['MiCA', 'CASP authorisation', 'Crypto-asset service providers'], publisher: { '@id': ORG_ID } },
        { '@type': 'ProfessionalService', '@id': ORG_ID, name: 'Vizory', url: `${SITE_URL}/`, logo: `${SITE_URL}/favicon.svg`, address: { '@type': 'PostalAddress', addressLocality: 'Copenhagen', addressCountry: 'DK' }, areaServed: ['DK', 'EU'] },
      )} />
      <Header lang={lang} current="regulation" />
      <main>
        <section className="reg">
          <RegNav lang={lang} current="/mica" />
          <div className="reg-main">
            <article className="doc">
              <Content />
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
