import { Entry, EntryList } from '@/components/EntryList';
import { signalLink } from '@/components/styles';
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
      da: [
        'De fleste rådgivere kender reglerne. Danny har været med til at forme dem og til at håndhæve dem.',
        'Som Danmarks forhandler af EU’s regulering af kryptoaktiver, MiCA, sad Danny med ved bordet, da reglerne blev til. Han har repræsenteret Danmark i internationale fora i EU og kender derfor ikke kun ordlyden af reglerne, men også de hensyn og kompromiser, der ligger bag. Det giver et sjældent indblik i, hvordan reglerne er tænkt at skulle fortolkes og anvendes i praksis.',
        'Han har desuden stor erfaring med inspektioner af kryptovirksomheder, herunder med fokus på forebyggelse af hvidvask og terrorfinansiering (AML/CFT). Han har set indefra, hvordan tilsynet vurderer en virksomheds risikovurdering, kundekendskabsprocedurer, transaktionsovervågning og interne kontroller, og hvor virksomheder typisk kommer til kort. Netop på AML/CFT-området er kravene til kryptovirksomheder skærpede, og tilsynet har stor opmærksomhed på, om virksomhedernes procedurer også virker i praksis og ikke kun på papiret.',
        'Den viden er særlig værdifuld for virksomheder, der skal søge tilladelse, forberede sig på et tilsynsbesøg eller styrke deres compliance, før tilsynet stiller spørgsmålene.',
        'Dannys faglige fundament er bredt. Ud over kryptoaktiver og AML/CFT har han arbejdet med fintech, betalinger og DLT-baserede kapitalmarkeder, og han kender dermed reguleringen på tværs af de områder, hvor ny finansiel teknologi møder etablerede regler. Det gør ham i stand til at rådgive virksomheder, hvis forretningsmodeller ikke passer pænt ind i én kategori.',
        'Erfaringen stammer fra ni år i Finanstilsynet, hvor Danny arbejdede i krydsfeltet mellem innovation og regulering, både med udviklingen af nye regler og med tilsynet med de virksomheder, der skal leve op til dem.',
        'I dag bruger Danny den erfaring til at hjælpe virksomheder med at navigere i reguleringen, fra den første vurdering af, om en aktivitet kræver tilladelse, over ansøgningsprocessen til opbygning af robuste AML/CFT-rammer, løbende compliance og dialog med tilsynet. Hans rådgivning bygger på en indgående forståelse af, hvordan myndighederne tænker, og hvad der skal til for at skabe tillid hos dem.',
      ],
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
                <p><a className={signalLink} href={p.linkedin} rel="noopener">LinkedIn</a></p>
              </Entry>
            ))}
          </EntryList>
        </section>
    </>
  );
}
