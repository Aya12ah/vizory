import AmlDa, { toc as tocDa } from '@/content/aml.da.mdx';
import AmlEn, { toc as tocEn } from '@/content/aml.en.mdx';
import type { Lang } from '@/i18n/lang';
import { type Faq, GuidePage } from './GuidePage';

// The guide itself is Markdown: src/content/aml.en.mdx and src/content/aml.da.mdx.
const CONTENT = { en: AmlEn, da: AmlDa };
const TOC = { en: tocEn, da: tocDa };
const NAME = { en: 'Anti-money laundering: the AMLR and the new EU rules', da: 'Hvidvask: AMLR og de nye EU-regler' };
const FAQ: Faq = {
  en: [
    ['When does the AMLR apply?', 'The AMLR applies from 10 July 2027. Until then the Danish AML Act applies. A few rules, for example for professional football clubs and agents, apply later.'],
    ['Will AMLA supervise our firm?', 'Probably not. AMLA will directly supervise a limited number of large financial groups that operate in several member states and carry a high risk, starting in 2028. Other firms remain under the supervision of the Danish FSA, which AMLA coordinates.'],
  ],
  da: [
    ['Hvornår gælder AMLR?', 'AMLR gælder fra 10. juli 2027. Indtil da gælder hvidvaskloven. Enkelte regler, fx for professionelle fodboldklubber og -agenter, gælder senere.'],
    ['Kommer AMLA til at føre tilsyn med vores virksomhed?', 'Sandsynligvis ikke. AMLA vil fra 2028 føre direkte tilsyn med et begrænset antal store finansielle koncerner, der er aktive i flere medlemslande og har en høj risiko. Andre virksomheder forbliver under Finanstilsynets tilsyn, som AMLA koordinerer.'],
  ],
};

export function AmlPage({ lang }: { lang: Lang }) {
  return <GuidePage lang={lang} page="aml" content={CONTENT} toc={TOC} name={NAME} faq={FAQ}
    about={['AMLR', 'AMLD6', 'AMLA', 'Anti-money laundering', 'Counter-terrorist financing']} />;
}
