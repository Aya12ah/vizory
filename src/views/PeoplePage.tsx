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
      en: [
        'Most advisers know the rules. Danny helped shape them and enforce them.',
        "As Denmark's negotiator on the EU's regulation of crypto-assets, MiCA, Danny was at the table when the rules were written. He has represented Denmark in international forums in the EU, and so knows not only the wording of the rules but also the considerations and compromises behind them. That gives a rare insight into how the rules are meant to be interpreted and applied in practice.",
        'He also has extensive experience of inspecting crypto firms, including with a focus on anti-money laundering and countering the financing of terrorism (AML/CFT). He has seen from the inside how the supervisor assesses a firm\'s risk assessment, customer due diligence procedures, transaction monitoring and internal controls, and where firms typically fall short. In AML/CFT in particular, the requirements for crypto firms are stricter, and the supervisor pays close attention to whether a firm\'s procedures work in practice and not only on paper.',
        'That knowledge is particularly valuable for firms that are applying for authorisation, preparing for a supervisory inspection or strengthening their compliance before the supervisor asks the questions.',
        "Danny's professional foundation is broad. Besides crypto-assets and AML/CFT, he has worked on fintech, payments and DLT-based capital markets, and so knows the regulation across the areas where new financial technology meets established rules. This allows him to advise firms whose business models do not fit neatly into a single category.",
        'The experience comes from nine years at the Danish Financial Supervisory Authority, where Danny worked where innovation and regulation meet, both on developing new rules and on supervising the firms that must comply with them.',
        'Today Danny uses that experience to help firms navigate the regulation, from the first assessment of whether an activity requires authorisation, through the application process, to building robust AML/CFT frameworks, ongoing compliance and dialogue with the supervisor. His advice rests on a thorough understanding of how the authorities think and what it takes to earn their trust.',
      ],
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
