import { Entry, EntryList } from '@/components/EntryList';
import { RegNav, RegSection } from '@/components/RegNav';
import { dictionary } from '@/i18n/dictionary';
import Link from 'next/link';
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
  {
    href: '/stablecoins',
    title: { en: 'Stablecoins under MiCA: e-money tokens and asset-referenced tokens', da: 'Stablecoins efter MiCA: e-pengetokens og tokens med aktivreference' },
    summary: {
      en: 'Who may issue an EMT or an ART, what the white paper and the reserve require, and which stablecoins a CASP may offer.',
      da: 'Hvem der må udstede en EMT eller en ART, hvad whitepaper og reserve kræver, og hvilke stablecoins en CASP må tilbyde.',
    },
  },
  {
    href: '/payments',
    title: { en: 'Payment and e-money institution authorisation', da: 'Tilladelse som betalingsinstitut og e-pengeinstitut' },
    summary: {
      en: 'Which authorisation a payment or e-money firm needs, what the application must contain, and what PSD3 and the PSR change.',
      da: 'Hvilken tilladelse en betalings- eller e-pengevirksomhed skal have, hvad ansøgningen skal indeholde, og hvad PSD3 og PSR ændrer.',
    },
  },
  {
    href: '/aml',
    title: { en: 'Anti-money laundering: the AMLR and the new EU rules', da: 'Hvidvask: AMLR og de nye EU-regler' },
    summary: {
      en: 'Who is covered, what the AML Regulation changes from July 2027, and what the Danish FSA expects of AML in an application for authorisation.',
      da: 'Hvem der er omfattet, hvad hvidvaskforordningen ændrer fra juli 2027, og hvad Finanstilsynet forventer af hvidvaskdelen i en ansøgning om tilladelse.',
    },
  },
];

export function RegulationPage({ lang }: { lang: Lang }) {
  return (
    <>
        <RegSection>
          <RegNav lang={lang} current="/regulation" />
          <div>
            <h1 className="page-title">{dictionary[lang].regulation}</h1>
            <EntryList>
              {GUIDES.map((g) => (
                <Entry key={g.href} text={g.summary[lang]}
                  title={<Link className="text-inherit no-underline hover:text-signal-text hover:underline hover:underline-offset-3" href={localPath(g.href, lang)}>{g.title[lang]}</Link>} />
              ))}
            </EntryList>
          </div>
        </RegSection>
    </>
  );
}
