import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { danny, graph, organisation } from '@/lib/schema';

const PEOPLE = [
  {
    name: 'Danny Dehghani',
    linkedin: 'https://www.linkedin.com/in/danny-dehghani-84559436',
    bio: {
      en: "Danny spent nine years at the Danish Financial Supervisory Authority, working on fintech, crypto-assets, payments and DLT-based capital markets. He has extensive experience inspecting crypto firms. He has represented Denmark in EU forums on crypto-asset regulation and negotiated MiCA on Denmark's behalf.",
      da: 'Danny har ni års erfaring fra Finanstilsynet, hvor han arbejdede med fintech, kryptoaktiver, betalinger og DLT-baserede kapitalmarkeder. Han har stor erfaring med inspektioner af kryptovirksomheder. Han har siddet i internationale fora i EU om regulering af kryptoaktiver og har blandt andet forhandlet MiCA på Danmarks vegne.',
    },
  },
];

export function PeoplePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd data={graph(danny, organisation)} />
      <Header lang={lang} current="people" />
      <main>
        <section className="people">
          <h1 className="page-title">{dictionary[lang].people}</h1>
          <ul className="people-list">
            {PEOPLE.map((p) => (
              <li className="person" key={p.name}>
                <h2 className="person-name">{p.name}</h2>
                <p className="person-bio">{p.bio[lang]}</p>
                <p><a className="person-link" href={p.linkedin} rel="noopener">LinkedIn</a></p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
