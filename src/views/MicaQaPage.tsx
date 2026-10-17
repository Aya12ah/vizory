import { JsonLd } from '@/components/JsonLd';
import { ContentsBar } from '@/components/ContentsBar';
import { QaList } from '@/components/QaList';
import { QaText } from '@/components/QaText';
import { RegNav, RegSection } from '@/components/RegNav';
import { dictionary } from '@/i18n/dictionary';
import type { Lang } from '@/i18n/lang';
import { type QA, downloaded, qaCount, splitDate, topics } from '@/lib/esma-qa';
import { graph, regBreadcrumb, webPage } from '@/lib/schema';

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
const STATUS_COLOUR: Record<string, string> = { 'Published Answer Updated': 'text-signal-text', 'Question Published': 'text-amber' };
// Text styles of a Q&A block. Rows of small grey text: the date and status row, the legal reference row.
const row = 'flex flex-wrap items-center gap-x-[10px] gap-y-1 text-[12px] leading-[1.4] text-ink-soft tabular-nums';
const label = 'text-[13px] leading-[1.45] font-medium text-ink';
const small = 'text-[13px] leading-[1.55]';

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
function QaItem({ q, lang, first }: { q: QA; lang: Lang; first: boolean }) {
  const t = T[lang];
  const status = t.status[q.status];
  return (
    <details className={`group/qa border-b border-line scroll-mt-[72px] ${first ? 'mt-2' : ''}`} name="qa" id={q.id.toLowerCase().replace(/_/g, '-')} lang="en">
      <summary className="group/sum cursor-pointer py-4 grid grid-cols-[minmax(0,1fr)] gap-2 list-none [&::-webkit-details-marker]:hidden">
        <span className={row}>
          <span><QaDate d={q.answered || q.submitted} lang={lang} /></span>
          {status && (
            <span className={`text-[11px] whitespace-nowrap before:content-[''] before:inline-block before:align-middle before:size-[5px] before:mr-[10px] before:rounded-full before:bg-current ${STATUS_COLOUR[q.status]}`}>
              (<span lang={lang}>{status}</span>)
            </span>
          )}
          <a className="shrink-0 ml-auto -mr-[7px] text-[11px] font-medium text-ink-soft shadow-[inset_0_0_0_1px_var(--outline)] px-[7px] py-[2px] rounded-[5px] whitespace-nowrap"
            href={q.url} target="_blank" rel="noopener">{q.id}<span aria-hidden="true"> ↗</span></a>
        </span>
        <span className="mt-[3px] mb-1 text-ink font-medium leading-[1.4] group-open/qa:text-signal-text pointer-fine:group-hover/sum:text-signal-text">{q.subject}</span>
        {q.legal_reference && (
          <span className={`${row} leading-[1.45]`}>
            {/* Cut short with an ellipsis until the Q&A is opened. */}
            <span className="-ml-[7px] min-w-0 max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium text-ref-text bg-ref-bg px-[7px] py-[2px] rounded-[5px] group-open/qa:max-w-none group-open/qa:whitespace-normal"
              title={q.legal_reference}>{q.legal_reference}</span>
          </span>
        )}
      </summary>
      <div className="pb-6">
        <p className={`${label} mt-0`} lang={lang}>{t.question}</p>
        {q.question.map((p, i) => <p key={i}><QaText text={p} /></p>)}
        {q.answer.length > 0 && <>
          <p className={`${label} mt-4`} lang={lang}>{t.answer}</p>
          <Answer paras={q.answer} />
        </>}
        {q.footnotes.length > 0 && <ol className={`${small} text-ink-soft pl-[1.4em] mt-4`}>{q.footnotes.map((n, i) => <li key={i}><QaText text={n} /></li>)}</ol>}
        {q.disclaimer.map((p, i) => <p className={`${small} italic`} key={i}><QaText text={p} /></p>)}
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
        <li key={topic.id}><a href={`#${topic.id}`} lang="en">{topic.title}</a></li>
      ))}
    </ol>
  );
  const page = webPage('/mica-qa', lang, t.title, { about: ['MiCA', 'ESMA Q&A'] });
  const sections = all.map((tp) => ({ id: tp.id, label: tp.title, lang: 'en' }));
  return (
    <>
      <JsonLd data={graph({ ...page, breadcrumb: { '@id': `${page.url}#breadcrumb` } }, regBreadcrumb('/mica-qa', lang, t.title))} />
        <RegSection>
          <RegNav lang={lang} current="/mica-qa" sections={sections} />
          <div>
            <article className="doc">
              <h1 className="page-title">{t.title}</h1>
              <p className="lede">{t.lede}</p>
              <p className="mt-6 text-[13px] leading-[1.55]">{t.source(qaCount, downloaded(lang))}</p>
              <nav className="toc" aria-label={dictionary[lang].contents}>
                <p className="toc-title">{dictionary[lang].contents}</p>
                {toc}
              </nav>
              <ContentsBar title={dictionary[lang].contents} sections={sections} />
              <QaList>
                {all.map((topic) => (
                  <section key={topic.id}>
                    <h2 id={topic.id} lang="en">{topic.title}</h2>
                    {topic.items.map((q, i) => <QaItem key={q.id} q={q} lang={lang} first={i === 0} />)}
                  </section>
                ))}
              </QaList>
            </article>
          </div>
        </RegSection>
    </>
  );
}
