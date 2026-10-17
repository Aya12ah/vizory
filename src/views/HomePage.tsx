import Link from 'next/link';
import { ActScope } from '@/components/ActScope';
import { JsonLd } from '@/components/JsonLd';
import { buttonSecondary } from '@/components/styles';
import { Wordmark, wordmarkClass } from '@/components/Wordmark';
import { type Lang, localPath } from '@/i18n/lang';
import { danny, graph, organisation, website } from '@/lib/schema';

const LEDE = {
  en: 'We help financial firms with everything from applications, compliance frameworks, compliance operations, mock-inspections and dialogue with national competent authorities.',
  da: 'Vi hjælper finansielle virksomheder med alt fra ansøgninger, compliance frameworks, drift af compliance, mock-inspektioner og dialog med nationale kompetente myndigheder.',
};

// Beside the scope list: the way into the get-started flow.
const CAMPAIGN = {
  en: { title: 'Not sure where to start?', text: 'Answer a few questions about your firm and the help you need, so that we can give you the best possible advice.', cta: 'Describe your needs' },
  da: { title: 'Usikker på, hvor I skal starte?', text: 'Svar på et par spørgsmål om jeres virksomhed og den hjælp, I har brug for, så vi kan rådgive jer bedst muligt.', cta: 'Beskriv jeres behov' },
};

function Campaign({ lang }: { lang: Lang }) {
  const t = CAMPAIGN[lang];
  return (
    <aside className="flex flex-col gap-[3px] items-start text-[14px] leading-[1.6]" data-campaign>
      <h2 className="text-[14px] leading-[1.6] font-medium text-ink">{t.title}</h2>
      <p className="text-ink-soft max-w-[52ch]">{t.text}</p>
      <Link className={`${buttonSecondary} mt-4`} href={localPath('/get-started', lang)}>
        {t.cta}
        <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" /></svg>
      </Link>
    </aside>
  );
}

export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd data={graph(website, organisation(lang), danny)} />
        <section>
          <div className="pt-14 pb-20 phone:py-0">
            {/* The wordmark is the logo; the lede is the page's heading for search engines, styled as a lede. */}
            <p className={`${wordmarkClass} text-[44px] phone:text-[38px]`}><Wordmark /></p>
            <h1 className="lede font-normal text-wrap">{LEDE[lang]}</h1>
            <div className="mt-14 grid gap-10 items-start wide:grid-cols-2 phone:mt-10">
              <ActScope lang={lang} />
              <Campaign lang={lang} />
            </div>
          </div>
        </section>
    </>
  );
}
