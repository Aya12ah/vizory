import { ActScope } from '@/components/ActScope';
import { Header } from '@/components/Header';
import { JsonLd } from '@/components/JsonLd';
import { Wordmark } from '@/components/Wordmark';
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
      <Header lang={lang} wordmark={false} />
      <main>
        <section>
          <div className="hero">
            <h1 className="wm wm-lg"><Wordmark /></h1>
            <p className="lede">{LEDE[lang]}</p>
            <ActScope lang={lang} />
          </div>
        </section>
      </main>
    </>
  );
}
