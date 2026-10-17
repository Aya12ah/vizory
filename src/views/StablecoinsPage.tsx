import StablecoinsDa, { toc as tocDa } from '@/content/stablecoins.da.mdx';
import StablecoinsEn, { toc as tocEn } from '@/content/stablecoins.en.mdx';
import type { Lang } from '@/i18n/lang';
import { type Faq, GuidePage } from './GuidePage';

// The guide itself is Markdown: src/content/stablecoins.en.mdx and src/content/stablecoins.da.mdx.
const CONTENT = { en: StablecoinsEn, da: StablecoinsDa };
const TOC = { en: tocEn, da: tocDa };
const NAME = { en: 'Stablecoins under MiCA: e-money tokens and asset-referenced tokens', da: 'Stablecoins efter MiCA: e-pengetokens og tokens med aktivreference' };
const FAQ: Faq = {
  en: [
    ['Can a CASP offer USDT or other stablecoins issued outside the EU?', 'A CASP may only offer EMTs and ARTs to the public in the EU when the issuer is authorised under MiCA. Stablecoins whose issuer is not authorised in the EU must not be offered to clients in the EU.'],
    ['Does a company that wants to issue a euro stablecoin need a licence?', 'Yes. A euro stablecoin is an e-money token, so the issuer must be a credit institution or an authorised e-money institution, and it must notify a white paper to the Danish FSA before the token is offered.'],
  ],
  da: [
    ['Må en CASP tilbyde USDT eller andre stablecoins udstedt uden for EU?', 'En CASP må kun tilbyde EMT\'er og ART\'er til offentligheden i EU, når udstederen har tilladelse efter MiCA. Stablecoins, hvis udsteder ikke har tilladelse i EU, må ikke tilbydes kunder i EU.'],
    ['Skal en virksomhed, der vil udstede en euro-stablecoin, have tilladelse?', 'Ja. En euro-stablecoin er en e-pengetoken, så udstederen skal være et pengeinstitut eller et e-pengeinstitut med tilladelse, og den skal indgive et whitepaper til Finanstilsynet, før tokenen udbydes.'],
  ],
};

export function StablecoinsPage({ lang }: { lang: Lang }) {
  return <GuidePage lang={lang} page="stablecoins" content={CONTENT} toc={TOC} name={NAME} faq={FAQ}
    about={['MiCA', 'Stablecoins', 'E-money tokens', 'Asset-referenced tokens', 'Crypto-asset white paper']} />;
}
