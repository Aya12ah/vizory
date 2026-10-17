import { LeadForm } from '@/components/LeadForm';
import { Mail } from '@/components/Mail';
import type { Lang } from '@/i18n/lang';
import { vizoryFlow } from '@/lead/flows/vizory';

const T = {
  en: {
    title: 'Describe your needs',
    lede: 'A few questions about your firm and what you need help with take about three minutes. Vizory gets your answers as one request and comes prepared to the first conversation.',
    privacy: 'Your answers are used only to reply to your request. They are not stored on this website: they are sent by email from your own email program to Vizory. To have them deleted, write to',
  },
  da: {
    title: 'Beskriv jeres behov',
    lede: 'Et par spørgsmål om jeres virksomhed og den hjælp, I har brug for, tager omkring tre minutter. Vizory får jeres svar samlet i én henvendelse og møder forberedt op til den første samtale.',
    privacy: 'Jeres svar bruges kun til at besvare jeres henvendelse. De gemmes ikke på hjemmesiden, men sendes som mail fra jeres eget mailprogram til Vizory. Skriv til os for at få dem slettet:',
  },
};

export function LeadPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <section className="pt-14 pb-20 phone:py-6">
      <h1 className="page-title">{t.title}</h1>
      <p className="lede">{t.lede}</p>
      <LeadForm flow={vizoryFlow} lang={lang} />
      <p className="mt-14 max-w-[56ch] text-[13px] leading-[1.55] text-ink-soft">{t.privacy} <Mail />.</p>
    </section>
  );
}
