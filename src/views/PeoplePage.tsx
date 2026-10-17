import { Entry, EntryList } from '@/components/EntryList';
import { signalLink } from '@/components/styles';
import { JsonLd } from '@/components/JsonLd';
import { dictionary } from '@/i18n/dictionary';
import Link from 'next/link';
import { type Lang, localPath } from '@/i18n/lang';
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
      <JsonLd data={graph(danny, organisation(lang))} />
        <section className="pt-14 pb-20 phone:py-6">
          <h1 className="page-title">{dictionary[lang].people}</h1>
          <EntryList>
            {PEOPLE.map((p) => (
              <Entry key={p.name} title={p.name} text={p.bio[lang]}>
                <p className="flex flex-wrap gap-x-5 gap-y-2"><a className={signalLink} href={p.linkedin} rel="noopener">LinkedIn</a><Link className={signalLink} href={localPath('/get-started', lang)}>{dictionary[lang].getStarted}</Link></p>
              </Entry>
            ))}
          </EntryList>
        </section>
    </>
  );
}
