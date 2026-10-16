import MicaDa from '@/content/mica.da.mdx';
import MicaEn from '@/content/mica.en.mdx';
import type { Lang } from '@/i18n/lang';
import { type Faq, GuidePage } from './GuidePage';

// The guide itself is Markdown: src/content/mica.en.mdx and src/content/mica.da.mdx.
const CONTENT = { en: MicaEn, da: MicaDa };
const NAME = { en: 'MiCA licence and CASP authorisation', da: 'MiCA og CASP-tilladelse' };
const FAQ: Faq = {
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
  return <GuidePage lang={lang} page="mica" content={CONTENT} name={NAME} faq={FAQ}
    about={['MiCA', 'CASP authorisation', 'Crypto-asset service providers']} />;
}
