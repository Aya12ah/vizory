import { ActScope } from '@/components/ActScope';
import { JsonLd } from '@/components/JsonLd';
import { Wordmark, wordmarkClass } from '@/components/Wordmark';
import type { Lang } from '@/i18n/lang';
import { danny, graph, organisation } from '@/lib/schema';

const LEDE = {
  en: 'We help financial firms with everything from applications, compliance frameworks, compliance operations, mock-inspections and dialogue with national competent authorities.',
  da: 'Vi hjælper finansielle virksomheder med alt fra ansøgninger, compliance frameworks, drift af compliance, mock-inspektioner og dialog med nationale kompetente myndigheder.',
};

export function HomePage({ lang }: { lang: Lang }) {
  return (
    <>
      <JsonLd data={graph(organisation, danny)} />
        <section>
          <div className="pt-14 pb-20 phone:py-0">
            <h1 className={`${wordmarkClass} text-[44px] phone:text-[38px]`}><Wordmark /></h1>
            <p className="lede">{LEDE[lang]}</p>
            <ActScope lang={lang} />
          </div>
        </section>
    </>
  );
}
