import { Header } from '@/components/Header';
import { RegNav } from '@/components/RegNav';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';

const GUIDES = [
  {
    href: '/mica',
    title: { en: 'MiCA and CASP authorisation', da: 'MiCA og CASP-tilladelse' },
    summary: {
      en: 'What an application for CASP authorisation must contain, the difference between authorisation and notification, and the requirements that apply after authorisation.',
      da: 'Hvad en ansøgning om CASP-tilladelse skal indeholde, forskellen på tilladelse og meddelelse, og de krav der gælder efter tilladelsen.',
    },
  },
  {
    href: '/mica-qa',
    title: { en: 'ESMA Q&As on MiCA', da: "ESMA's spørgsmål og svar om MiCA" },
    summary: {
      en: "All the questions and answers on MiCA that ESMA has published, grouped by topic, with links to ESMA's own versions.",
      da: "Alle de spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne og med links til ESMA's egne versioner.",
    },
  },
];

export function RegulationPage({ lang }: { lang: Lang }) {
  return (
    <>
      <Header lang={lang} current="regulation" />
      <main>
        <section className="reg">
          <RegNav lang={lang} current="/regulation" />
          <div className="reg-main">
            <h1 className="page-title">{dictionary[lang].regulation}</h1>
            <ul className="people-list">
              {GUIDES.map((g) => (
                <li className="person" key={g.href}>
                  <h2 className="person-name"><a className="guide-link" href={localPath(g.href, lang)}>{g.title[lang]}</a></h2>
                  <p className="person-bio">{g.summary[lang]}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
