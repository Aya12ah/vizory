import DltDa, { toc as tocDa } from '@/content/dlt.da.mdx';
import DltEn, { toc as tocEn } from '@/content/dlt.en.mdx';
import type { Lang } from '@/i18n/lang';
import { type Faq, GuidePage } from './GuidePage';

// The guide itself is Markdown: src/content/dlt.en.mdx and src/content/dlt.da.mdx.
const CONTENT = { en: DltEn, da: DltDa };
const TOC = { en: tocEn, da: tocDa };
const NAME = { en: 'Tokenisation and the DLT Pilot Regime', da: 'Tokenisering og DLT-pilotordningen' };
const FAQ: Faq = {
  en: [
    ['Is a tokenised share covered by MiCA?', 'No. A tokenised share is a financial instrument and is covered by the financial markets rules, such as MiFID II, the Prospectus Regulation and the CSDR. MiCA only covers crypto-assets that are not financial instruments.'],
    ['Do we need the pilot regime to trade tokenised securities?', 'Not necessarily. Tokenised securities can be traded under the ordinary rules, provided all the requirements are met. The pilot regime is relevant when a requirement, typically on central securities depositories or intermediation, cannot be met with the technology chosen.'],
  ],
  da: [
    ['Er en tokeniseret aktie omfattet af MiCA?', 'Nej. En tokeniseret aktie er et finansielt instrument og er omfattet af reglerne for de finansielle markeder, fx MiFID II, prospektforordningen og CSDR. MiCA omfatter kun kryptoaktiver, der ikke er finansielle instrumenter.'],
    ['Skal vi bruge pilotordningen for at handle tokeniserede værdipapirer?', 'Ikke nødvendigvis. Tokeniserede værdipapirer kan handles efter de almindelige regler, hvis alle kravene er opfyldt. Pilotordningen er relevant, når et krav, typisk om værdipapircentraler eller mellemmænd, ikke kan opfyldes med den valgte teknologi.'],
  ],
};

export function DltPage({ lang }: { lang: Lang }) {
  return <GuidePage lang={lang} page="dlt" content={CONTENT} toc={TOC} name={NAME} faq={FAQ}
    about={['DLT Pilot Regime', 'Tokenisation', 'MiFID II', 'CSDR', 'Tokenised securities']} />;
}
