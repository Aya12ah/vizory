import { Header } from '@/components/Header';
import { QaTopics, TopicButton } from '@/components/QaTopics';
import { QaText } from '@/components/QaText';
import { RegNav } from '@/components/RegNav';
import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { type QA, downloaded, qaCount, splitDate, topics } from '@/lib/esma-qa';

const T = {
  en: {
    title: 'ESMA Q&As on MiCA',
    lede: 'The questions and answers on MiCA that ESMA has published, grouped by topic with the newest first. ESMA publishes its Q&As in English only.',
    source: (n: number, date: string) => `Source: ESMA. This page was drafted using material downloaded from ESMA's website (ESMA's Q&A tool, ${n} Q&As as of ${date}). The layout has been rebuilt from ESMA's PDF export; each Q&A links to ESMA's own version, which is the authoritative text.`,
    question: 'Question',
    answer: 'ESMA answer',
    status: { 'Published Answer Updated': 'Updated', 'Question Published': 'Not answered yet' } as Record<string, string>,
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    date: (d: number, m: string, y: string) => `${d} ${m} ${y}`,
  },
  da: {
    title: "ESMA's spørgsmål og svar om MiCA",
    lede: 'De spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne med de nyeste først. ESMA offentliggør kun spørgsmål og svar på engelsk.',
    source: (n: number, date: string) => `Kilde: ESMA. Siden er udarbejdet med materiale hentet fra ESMA's hjemmeside (ESMA's Q&A-værktøj, ${n} spørgsmål og svar pr. ${date}). Opsætningen er genskabt fra ESMA's PDF-udtræk; hvert spørgsmål linker til ESMA's egen version, som er den gældende tekst.`,
    question: 'Spørgsmål',
    answer: "ESMA's svar",
    status: { 'Published Answer Updated': 'Opdateret', 'Question Published': 'Ej besvaret' } as Record<string, string>,
    months: ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
    date: (d: number, m: string, y: string) => `${d}. ${m} ${y}`,
  },
};
const STATUS_KIND: Record<string, string> = { 'Published Answer Updated': 'updated', 'Question Published': 'pending' };

function QaDate({ d, lang }: { d: string; lang: Lang }) {
  const parts = splitDate(d);
  if (!parts) return null;
  const [yy, mm, dd] = parts;
  return <time dateTime={`${yy}-${mm}-${dd}`}>{T[lang].date(Number(dd), T[lang].months[Number(mm) - 1], yy)}</time>;
}

/** The answer's paragraphs; paragraphs starting with "• " form a bulleted list. */
function Answer({ paras }: { paras: string[] }) {
  const blocks: (string | string[])[] = [];
  for (const p of paras) {
    if (p.startsWith('• ')) {
      const last = blocks[blocks.length - 1];
      if (Array.isArray(last)) last.push(p.slice(2)); else blocks.push([p.slice(2)]);
    } else if (p) blocks.push(p);
  }
  return blocks.map((b, i) => Array.isArray(b)
    ? <ul key={i}>{b.map((li, j) => <li key={j}><QaText text={li} /></li>)}</ul>
    : <p key={i}><QaText text={b} /></p>);
}

// One closed block per Q&A. Top row: the date, the status if any (mint: answer updated, amber: not
// answered yet), and the ID as a link to ESMA's own version. Unanswered Q&As show the submission
// date. Then the subject, and the legal reference, cut short until the Q&A is opened.
function QaItem({ q, lang }: { q: QA; lang: Lang }) {
  const t = T[lang];
  const status = t.status[q.status];
  return (
    <details className="qa" name="qa" id={q.id.toLowerCase().replace(/_/g, '-')} lang="en">
      <summary>
        <span className="qa-top">
          <span className="qa-date"><QaDate d={q.answered || q.submitted} lang={lang} /></span>
          {status && <span className={`qa-status qa-status-${STATUS_KIND[q.status]}`}>(<span lang={lang}>{status}</span>)</span>}
          <a className="qa-id" href={q.url} target="_blank" rel="noopener">{q.id}<span aria-hidden="true"> ↗</span></a>
        </span>
        <span className="qa-subject">{q.subject}</span>
        {q.legal_reference && <span className="qa-meta"><span className="qa-ref" title={q.legal_reference}>{q.legal_reference}</span></span>}
      </summary>
      <div className="qa-body">
        <p className="qa-label" lang={lang}>{t.question}</p>
        {q.question.map((p, i) => <p key={i}><QaText text={p} /></p>)}
        {q.answer.length > 0 && <>
          <p className="qa-label" lang={lang}>{t.answer}</p>
          <Answer paras={q.answer} />
        </>}
        {q.footnotes.length > 0 && <ol className="qa-notes">{q.footnotes.map((n, i) => <li key={i}><QaText text={n} /></li>)}</ol>}
        {q.disclaimer.map((p, i) => <p className="qa-disclaimer" key={i}><QaText text={p} /></p>)}
      </div>
    </details>
  );
}

export function MicaQaPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const all = topics();
  const toc = (
    <ol>
      {all.map((topic) => (
        <li key={topic.id}><a href={`#${topic.id}`} lang="en">{topic.title}</a> <span className="qa-count">{topic.items.length}</span></li>
      ))}
    </ol>
  );
  return (
    <>
      <Header lang={lang} current="regulation" />
      <main>
        <section className="reg">
          <RegNav lang={lang} current="/mica-qa" />
          <div className="reg-main">
            <article className="doc qa-page">
              <h1 className="page-title">{t.title}</h1>
              <p className="lede">{t.lede}</p>
              <p className="qa-source">{t.source(qaCount, downloaded(lang))}</p>
              <nav className="toc" aria-label={dictionary[lang].topics}>
                <p className="toc-title">{dictionary[lang].topics}</p>
                {toc}
              </nav>
              <QaTopics menu={toc} label={dictionary[lang].topics}>
                {all.map((topic) => (
                  // Each topic is its own section, so its sticky heading is pushed away when the next topic arrives.
                  <section className="qa-topic" key={topic.id}>
                    <h2 id={topic.id} lang="en"><TopicButton id={topic.id}>{topic.title}</TopicButton></h2>
                    {topic.items.map((q) => <QaItem key={q.id} q={q} lang={lang} />)}
                  </section>
                ))}
              </QaTopics>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
