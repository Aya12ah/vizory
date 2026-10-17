import PaymentsDa, { toc as tocDa } from '@/content/payments.da.mdx';
import PaymentsEn, { toc as tocEn } from '@/content/payments.en.mdx';
import type { Lang } from '@/i18n/lang';
import { type Faq, GuidePage } from './GuidePage';

// The guide itself is Markdown: src/content/payments.en.mdx and src/content/payments.da.mdx.
const CONTENT = { en: PaymentsEn, da: PaymentsDa };
const TOC = { en: tocEn, da: tocDa };
const NAME = { en: 'Payment and e-money institution authorisation', da: 'Tilladelse som betalingsinstitut og e-pengeinstitut' };
const FAQ: Faq = {
  en: [
    ['How long does it take to get a payment institution licence?', 'The Danish FSA must decide within three months of the application being complete. In practice it takes longer, because the FSA often requests more information before the application is considered complete.'],
    ['What is the difference between a payment institution and an e-money institution?', 'A payment institution provides payment services, such as credit transfers or acquiring card payments. An e-money institution also issues electronic money that the client holds a balance of, and may also provide payment services. The initial capital requirement is higher for an e-money institution.'],
  ],
  da: [
    ['Hvor lang tid tager det at få tilladelse som betalingsinstitut?', 'Finanstilsynet skal træffe afgørelse senest tre måneder efter, at ansøgningen er fuldstændig. I praksis tager det længere, fordi tilsynet ofte beder om flere oplysninger, før ansøgningen anses for fuldstændig.'],
    ['Hvad er forskellen på et betalingsinstitut og et e-pengeinstitut?', 'Et betalingsinstitut udbyder betalingstjenester, fx overførsler eller indløsning af kortbetalinger. Et e-pengeinstitut udsteder desuden elektroniske penge, som kunden har en saldo af, og må også udbyde betalingstjenester. Kravene til startkapital er højere for et e-pengeinstitut.'],
  ],
};

export function PaymentsPage({ lang }: { lang: Lang }) {
  return <GuidePage lang={lang} page="payments" content={CONTENT} toc={TOC} name={NAME} faq={FAQ}
    about={['PSD2', 'PSD3', 'PSR', 'Payment institution authorisation', 'E-money institution authorisation']} />;
}
