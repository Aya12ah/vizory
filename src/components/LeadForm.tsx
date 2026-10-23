'use client';
import Link from 'next/link';
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import { type Answer, type Answers, type ErrorCode, type Flow, type Question, allQuestions, buildBrief, isAnswered, labelled, validate, visibleSteps } from '@/lead/engine';
import { countries, countryOfNumber, dialCodes, flag } from '@/lead/countries';
import { Address } from './Footer';
import { mailAddress } from './Mail';
import { buttonPrimary, buttonSecondary, choice, choiceBox, choiceInput, field, fieldBase, signalLink } from './styles';

// Shows any question flow (src/lead/flows) one step at a time, from its description alone: the
// engine decides which steps and questions are shown, checks the answers and builds the brief. The
// answers are kept in sessionStorage, so a reload loses nothing. Country questions marked fromGeo
// start at the visitor's country from /api/geo (as LangButton uses it), and so do phone codes. The brief is sent from the
// visitor's own email program for now (the address is assembled in the browser, see Mail).

/** The answers, the step shown and the steps seen so far (which the progress can go forward to). */
type Saved = { answers: Answers; step: string | null; seen?: string[] };
const key = (flow: Flow) => `vz-lead-${flow.id}`;
function load(flow: Flow): Saved | null { try { return JSON.parse(sessionStorage.getItem(key(flow)) || 'null'); } catch { return null; } }
function save(flow: Flow, s: Saved | null) { try { if (s) sessionStorage.setItem(key(flow), JSON.stringify(s)); else sessionStorage.removeItem(key(flow)); } catch {} }

/** `title` and `lede` stand beside the steps, `note` (on how the answers are used) under the consent; a step's own `why` takes the lede's place while
 *  that step is shown. */
export function LeadForm({ flow, lang, title, lede, note }: { flow: Flow; lang: Lang; title: string; lede: string; note: ReactNode }) {
  const t = dictionary[lang].lead;
  const [answers, setAnswers] = useState<Answers>({});
  const [stepId, setStepId] = useState<string | null>(null);
  const [seen, setSeen] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, ErrorCode>>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geo, setGeo] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(80);
  const moved = useRef(false);
  // The last move between steps, so that going back several steps empties their segments one
  // after the other, the last first.
  const [trail, setTrail] = useState({ from: 0, to: 0 });

  // The answers so far, after a reload; must run in the browser only.
  useEffect(() => {
    const s = load(flow);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser
    if (s) { setAnswers(s.answers || {}); setStepId(s.step); setSeen(s.seen || []); }
  }, [flow]);
  useEffect(() => { if (!done) save(flow, { answers, step: stepId, seen }); }, [flow, answers, stepId, seen, done]);
  // The visitor's country, for country questions marked fromGeo that are still unanswered.
  useEffect(() => {
    const fromGeo = allQuestions(flow).filter((q) => q.type === 'country' && q.fromGeo).map((q) => q.id);
    if (!fromGeo.length) return;
    let live = true;
    fetch('/api/geo')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { country: string | null } | null) => {
        const c = d?.country;
        if (!live || !c || !dialCodes[c]) return;
        setGeo(c);
        setAnswers((a) => { const n = { ...a }; for (const id of fromGeo) if (!isAnswered(n[id])) n[id] = c; return n; });
      })
      .catch(() => {});
    return () => { live = false; };
  }, [flow]);
  // The bar's height (it wraps on a phone), kept free below the step.
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [done]);
  // Below 900px the footer follows the form, and keeps the bar's height free below it (Footer).
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--lead-bar', `${barHeight}px`);
    return () => { root.removeProperty('--lead-bar'); };
  }, [barHeight]);
  // After moving to another step, the step's heading takes the focus (and the page scrolls to it).
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'nearest' });
  }, [stepId, done]);

  const steps = visibleSteps(flow, answers);
  const index = Math.max(0, steps.findIndex((s) => s.id === stepId));
  const step = steps[index];
  const last = index === steps.length - 1;
  const brief = buildBrief(flow, answers, lang);
  const addr = () => mailAddress();
  const mailText = () => `${brief.subject}\n\n${brief.text}`;

  const set = (id: string, v: Answer) => { setAnswers((a) => ({ ...a, [id]: v })); setErrors((e) => { const n = { ...e }; delete n[id]; return n; }); };
  const go = (to: number) => {
    moved.current = true; setErrors({}); setTrail({ from: index, to });
    const id = steps[to].id, here = steps[index].id;
    setSeen((s) => [...s, ...[here, id].filter((x, k, a) => !s.includes(x) && a.indexOf(x) === k)]);
    setStepId(id);
  };
  // The progress goes back to any step, and forward to a step already seen, as long as every step
  // before it is answered: a step added since (another area chosen) must be answered first.
  const open = steps.findIndex((s) => Object.keys(validate(flow, answers, s.questions)).length > 0);
  const reachable = (i: number) => i < index || (i > index && seen.includes(steps[i].id) && (open === -1 || i <= open));
  // Moving several steps at once fills or empties their segments one after the other.
  const SEGMENT_MS = 160;
  const sequenced = trail.to === index && Math.abs(trail.from - trail.to) > 1;
  const segmentTiming = (i: number) => {
    const { from, to } = trail;
    const k = !sequenced ? -1 : from > to ? (i > to && i <= from ? from - i : -1) : (i > from && i <= to ? i - from - 1 : -1);
    return k < 0 ? undefined : { transitionDuration: `${SEGMENT_MS}ms`, transitionDelay: `${k * SEGMENT_MS}ms` };
  };
  const checked = () => { const e = validate(flow, answers, step.questions); setErrors(e); return Object.keys(e).length === 0; };
  const next = () => { if (checked()) go(index + 1); };
  const send = () => {
    if (!checked()) return;
    window.location.assign(`mailto:${addr()}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.text)}`);
    moved.current = true;
    setDone(true);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(mailText()); setCopied(true); } catch {} };
  const restart = () => { save(flow, null); moved.current = true; setTrail({ from: index, to: 0 }); setAnswers({}); setSeen([]); setStepId(null); setDone(false); setCopied(false); };

  // Clearing the answers asks first, so a stray click does not lose them.
  const startAgain = () => { if (window.confirm(t.restartConfirm)) restart(); };
  const answered = Object.values(answers).some(isAnswered);

  // From 900px two columns: the title, the text on why the step matters and the help links stay
  // put on the left while the step is answered on the right. The progress and the buttons sit in a
  // bar at the bottom of the screen, so they stay in reach however long the step is.
  // On a phone the help links follow the step instead, so the question comes first. "Start again"
  // stands at the right end of the title's line; the note on the answers at the foot of the last
  // step, where they are sent.
  // The step's help links, to the guides on the site; they open in a new tab, so the step stays.
  const links = !done && step.links?.length ? (
    <nav className="grid gap-2" aria-label={t.help} data-lead-links>
      <p className="text-[14px] font-medium">{t.help}</p>
      <ul className="list-none m-0 p-0 grid gap-[6px]">
        {step.links.map((l) => (
          <li key={l.href[lang]}>
            <a className={signalLink} href={localPath(l.href[lang], lang)} target="_blank" rel="noopener">
              {l.label[lang]}<span aria-hidden="true"> ↗</span><span className="sr-only"> {t.newTab}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  ) : null;
  const intro = (why: string) => (
    <div className="grid gap-4 content-start wide:sticky wide:top-8 wide:col-start-1 wide:row-start-1">
      <div className="flex justify-between items-baseline gap-4">
        <h1 className="page-title">{title}</h1>
        {answered && !done && (
          <button type="button" className="group shrink-0 self-center flex items-center justify-center size-8 -mr-[6px] p-0 border-0 [background:none] text-ink-soft cursor-pointer hover:text-signal-text" onClick={startAgain} aria-label={t.restart} title={t.restart} data-lead-restart>
            {/* An arrow turning back, which turns back a little more on hover. */}
            <svg className="size-[18px] transition-transform duration-400 ease-[cubic-bezier(.4,0,.2,1)] group-hover:-rotate-[120deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
          </button>
        )}
      </div>
      <p className="lede mt-0" data-lead-why>{why}</p>
      {links && <div className="hidden wide:grid gap-4 mt-2">{links}</div>}
    </div>
  );
  const asideBelow = links && <div className="grid gap-4 wide:hidden">{links}</div>;
  const grid = 'grid gap-8 wide:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] wide:gap-16 items-start';
  // The step's title the same size as the page's title beside it.
  const headingClass = 'page-title outline-none scroll-mt-8';

  if (done) {
    return (
      <div className={grid}>
        {intro(lede)}
        <div className="grid gap-5 max-w-[56ch]" data-lead-done>
          <h2 ref={heading} tabIndex={-1} className={headingClass}>{t.doneTitle}</h2>
          <p className="text-ink-soft">{t.doneText}</p>
          <p className="text-[14px] text-ink-soft">{t.noMail} {addr()}.</p>
          <p className="flex flex-wrap gap-2">
            <button type="button" className={buttonSecondary} onClick={copy}>{copied ? t.copied : t.copy}</button>
            <button type="button" className={buttonSecondary} onClick={restart}>{t.restart}</button>
          </p>
          {brief.links.length > 0 && (
            <div className="grid gap-2">
              <p className="text-[14px] font-medium">{t.readMore}</p>
              <ul className="list-none m-0 p-0 grid gap-[6px]">
                {brief.links.map((l) => <li key={l.href}><Link className={signalLink} href={localPath(l.href, lang)}>{l.label}</Link></li>)}
              </ul>
            </div>
          )}
        </div>
        {asideBelow}
      </div>
    );
  }

  // Counted on the step as the flow describes it, not on the questions shown: a follow-up question
  // that appears on an answer must not make the first question's label appear too.
  const only = (flow.steps.find((s) => s.id === step.id) ?? step).questions.length === 1;
  // Every step has one line under its title: its own intro, or for a step of one choice question
  // whether to choose one or more.
  const kind = only ? step.questions[0].type : null;
  const hint = step.intro?.[lang] ?? (kind === 'multi' ? t.chooseMany : kind === 'single' ? t.chooseOne : null);
  const incomplete = Object.values(validate(flow, answers, step.questions)).includes('required');
  return (
    <form className="flex flex-col min-h-[calc(100dvh-148px)] pb-14 wide:pb-[calc(var(--bar)+56px)] phone:min-h-[calc(100dvh-90px)] phone:pb-6" style={{ '--bar': `${barHeight}px` } as CSSProperties} noValidate onSubmit={(e) => { e.preventDefault(); if (last) send(); else next(); }} data-lead-step={step.id}>
      <div className={`${grid} flex-1`}>
        {intro(step.why?.[lang] ?? lede)}
        <div className="grid gap-7 min-w-0 wide:col-start-2 wide:row-start-1">
          <div className="grid gap-2">
            <h2 ref={heading} tabIndex={-1} className={headingClass}>{step.title[lang]}</h2>
            {hint && <p className="text-[15px] text-ink-soft" data-lead-hint>{hint}</p>}
          </div>
          {step.summary && (
            <dl className="m-0 grid gap-5 text-[14px]" data-lead-summary>
              {brief.sections.map((s) => (
                <div key={s.title} className="grid gap-1">
                  <dt className="font-medium text-ink">{s.title}</dt>
                  {s.rows.map((r) => <dd key={r.label} className="m-0 text-ink-soft"><span className="text-ink">{labelled(r.label)}</span> {r.value}</dd>)}
                </div>
              ))}
            </dl>
          )}
          {step.questions.map((q) => (
            <Field key={q.id} q={q} lang={lang} answers={answers} geo={geo} error={errors[q.id] && t.errors[errors[q.id]]} hideLabel={only && q.type !== 'consent'} note={q.type === 'consent' ? note : undefined} onChange={(v) => set(q.id, v)} setAnswer={set} />
          ))}
          {/* Beside "copy", the same as Finish in the bar. */}
          {last && (
            <p className="flex flex-wrap gap-2" data-lead-actions>
              <button type="button" className={`${buttonSecondary} phone:flex-auto phone:px-3 phone:text-[14px]`} onClick={copy}>{copied ? t.copied : t.copy}</button>
              <button type="button" className={`${buttonPrimary} phone:flex-auto phone:px-3 phone:text-[14px]`} disabled={incomplete} onClick={send}>{t.send}</button>
            </p>
          )}
        </div>
        {asideBelow}
        {/* From 900px the address stands at the foot of the left column, just above the bar, instead
            of in the footer (as on the regulation pages). */}
        <div className="hidden wide:flex wide:col-start-1 wide:row-start-1 self-end sticky bottom-[calc(var(--bar)+24px)] items-end gap-6" data-lead-address>
          <Address lang={lang} />
        </div>
      </div>
      {/* The bar, fixed to the bottom of the screen; the form keeps its height free below the step.
          Its background reaches on below it: Safari on iPad can leave a strip under fixed elements
          when its toolbar shrinks, and the page should not show through there. */}
      <div ref={bar} className="fixed inset-x-0 bottom-0 z-10 bg-bg border-t border-line after:absolute after:top-full after:inset-x-0 after:h-[50vh] after:bg-bg transition-[background-color] duration-300 ease-[ease] after:transition-[background-color] duration-300 ease-[ease]" data-lead-bar>
      <div className="box-border max-w-[1120px] mx-auto px-(--gutter) flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] phone:gap-x-3 phone:pt-3">
        {/* From 721px: Back, the progress level with the buttons, Next, and "x of y" small above the
            progress, in a tab standing on the bar's top line (41px above the progress's foot). On a phone
            the progress runs across the top, with "x of y" between the buttons below it. */}
        <button type="button" className={`${buttonSecondary} phone:order-2`} disabled={index === 0} onClick={() => go(index - 1)}>{t.back}</button>
        <div className="relative flex-1 min-w-0 phone:contents">
          <p className={`absolute bottom-[41px] left-1/2 -translate-x-1/2 px-[10px] pt-[5px] pb-[3px] bg-bg transition-[background-color] duration-300 ease-[ease] border border-b-0 border-line rounded-t-md text-[11px] leading-none text-ink-soft tabular-nums whitespace-nowrap phone:static phone:translate-x-0 phone:p-0 phone:border-0 phone:rounded-none phone:order-3 phone:flex-1 phone:text-center phone:text-[13px]`} data-lead-count><span className="sr-only">{t.stepWord} </span>{t.step(index + 1, steps.length)}</p>
          {/* One segment per step: the steps done and the current one filled. A segment fills from
              the left when its step is reached and empties back to the left on going back (several
              one after the other); a step ahead that can be gone to again stays filled, dimmed. Each
              step that can be gone to is a button, 28px tall to tap, of which the 4px line shows. */}
          <div className="flex gap-[6px] phone:basis-full phone:order-1" data-lead-progress>
            {steps.map((s, i) => (
              <button key={s.id} type="button" className="group flex-1 min-w-0 mx-0 -my-3 px-0 py-3 border-0 [background:none] cursor-pointer disabled:cursor-default"
                disabled={!reachable(i)} onClick={() => go(i)} aria-label={t.goTo(i + 1, s.title[lang])} aria-current={i === index ? 'step' : undefined} data-on={i <= index || undefined} data-ahead={(i > index && reachable(i)) || undefined}>
                <span className="relative block h-[4px] rounded-sm bg-line overflow-hidden transition-opacity group-enabled:group-hover:opacity-70">
                  <span className={`absolute inset-0 bg-signal origin-left transition-[transform,opacity] duration-400 ease-[cubic-bezier(.4,0,.2,1)] motion-reduce:transition-none ${i <= index ? 'scale-x-100' : reachable(i) ? 'scale-x-100 opacity-35' : 'scale-x-0'}`} style={segmentTiming(i)} />
                </span>
              </button>
            ))}
          </div>
        </div>
        {/* Disabled until every required question of the step is answered; other mistakes (an
            email without a domain) show when it is pressed. */}
        <button type="submit" className={`${buttonPrimary} phone:order-4 phone:ml-auto`} disabled={incomplete}>
          {last ? t.finish : t.next}
          {last
            ? <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.54 21.69a.5.5 0 0 0 .94-.03l6.5-19a.5.5 0 0 0-.64-.64l-19 6.5a.5.5 0 0 0-.02.94l7.93 3.18a2 2 0 0 1 1.11 1.11z" /><path d="m21.85 2.15-10.94 10.94" /></svg>
            : <svg className="size-4" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" /></svg>}
        </button>
      </div>
      </div>
    </form>
  );
}

/** One question of any type, with its error. On a step with a single question its label is only
 *  for screen readers: the step's title says it. */
function Field({ q, lang, answers, geo, error, hideLabel, note, onChange, setAnswer }: {
  q: Question; lang: Lang; answers: Answers; geo: string; error?: string; hideLabel: boolean; note?: ReactNode; onChange: (v: Answer) => void; setAnswer: (id: string, v: Answer) => void;
}) {
  const value = answers[q.id];
  const id = `lead-${q.id}`, errId = `${id}-error`;
  const label = q.label[lang];
  const invalid = error ? { 'aria-invalid': true as const, 'aria-describedby': errId } : {};
  const err = error && <p id={errId} className="text-[13px] text-amber" role="alert">{error}</p>;
  const help = q.help && <p className="text-[13px] text-ink-soft">{q.help[lang]}</p>;

  if (q.type === 'single' || q.type === 'multi') {
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-2" {...invalid}>
        <legend className={hideLabel ? 'sr-only' : 'p-0 mb-2 text-[15px] font-medium'}>{label}</legend>
        {help}
        <div className="grid gap-3">
          {q.options.map((o) => (
            <label key={o.id} className={choice}>
              {q.type === 'single'
                ? <input className={choiceInput} type="radio" name={id} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
                : <input className={choiceInput} type="checkbox" name={id} value={o.id} checked={list.includes(o.id)} onChange={(e) => onChange(e.target.checked ? [...list, o.id] : list.filter((x) => x !== o.id))} />}
              <Box round={q.type === 'single'} />
              <span>{o.label[lang]}</span>
            </label>
          ))}
        </div>
        {err}
      </fieldset>
    );
  }
  if (q.type === 'consent') {
    return (
      <div className="grid gap-2">
        <label className={choice}>
          <input className={choiceInput} type="checkbox" id={id} checked={value === true} onChange={(e) => onChange(e.target.checked)} {...invalid} />
          <Box round={false} />
          {/* The note's email link lies above the checkbox's input, which covers the card; the
              rest of the card ticks the box. */}
          <span className="grid gap-1">
            <span>{label}</span>
            {note && <span className="text-[13px] leading-[1.55] text-ink-soft [&_a]:relative [&_a]:z-[1]" data-lead-note>{note}</span>}
          </span>
        </label>
        {err}
      </div>
    );
  }
  if (q.type === 'country') {
    return (
      <div className="grid gap-2">
        <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-[15px] font-medium'}>{label}</label>
        {help}
        <CountrySelect id={id} lang={lang} value={typeof value === 'string' ? value : ''} autoComplete={q.autocomplete ?? 'country'} onChange={onChange} invalid={invalid} />
        {err}
      </div>
    );
  }
  if (q.type === 'phone') {
    const from = q.countryFrom ? answers[q.countryFrom] : undefined;
    return (
      <fieldset className="m-0 p-0 border-0 min-w-0 grid gap-2" {...invalid}>
        <legend className={hideLabel ? 'sr-only' : 'p-0 mb-2 text-[15px] font-medium'}>{label}</legend>
        {help}
        <Phone id={id} lang={lang} value={typeof value === 'string' ? value : ''} fallback={(typeof from === 'string' && from) || geo || (lang === 'da' ? 'DK' : '')} autoComplete={q.autocomplete ?? 'tel'} onChange={onChange} />
        {err}
      </fieldset>
    );
  }
  // A field that takes only some characters drops the rest and cuts at maxLength itself, so a pasted
  // '1234 5678' keeps all eight digits (the browser's own maxLength would cut it before the space goes).
  const allow = 'allow' in q && q.allow ? new RegExp(`[^${q.allow}]`, 'g') : null;
  const typed = (v: string) => (allow ? v.replace(allow, '').slice(0, 'maxLength' in q ? q.maxLength : undefined) : v);
  const common = { id, className: field, value: typeof value === 'string' ? value : '', maxLength: allow ? undefined : q.maxLength, inputMode: 'inputMode' in q ? q.inputMode : undefined, autoComplete: q.autocomplete ?? (q.type === 'email' ? 'email' : undefined), onChange: (e: { target: { value: string } }) => onChange(typed(e.target.value)), ...invalid };
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-[15px] font-medium'}>{label}</label>
      {help}
      {q.type === 'textarea'
        ? <textarea rows={5} {...common} />
        : <input type={q.type === 'email' ? 'email' : q.type === 'date' ? 'date' : 'text'} {...common} />}
      {err}
      {'lookup' in q && q.lookup && q.pattern && <Lookup lang={lang} value={typeof value === 'string' ? value : ''} pattern={q.pattern} path={q.lookup.path}
        onFound={(name) => { const f = q.lookup?.fill; if (f && !isAnswered(answers[f])) setAnswer(f, name); }} />}
    </div>
  );
}

type Found = { state: 'idle' | 'busy' | 'not-found' | 'unavailable' } | { state: 'found'; name: string; place: string; ended: boolean };

/** Looks an answer up once it is complete (a CVR number at /api/cvr) and says what it found under
 *  the field; `onFound` gets the name, e.g. to fill in the company name. */
function Lookup({ lang, value, pattern, path, onFound }: { lang: Lang; value: string; pattern: string; path: string; onFound: (name: string) => void }) {
  const t = dictionary[lang].lead.lookup;
  const [found, setFound] = useState<Found>({ state: 'idle' });
  const q = value.replace(/\s/g, '');
  const complete = new RegExp(`^(?:${pattern})$`).test(q);
  const report = useRef(onFound);
  useEffect(() => { report.current = onFound; });
  useEffect(() => {
    if (!complete) return;
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the lookup starts when the answer is complete
    setFound({ state: 'busy' });
    fetch(`${path}?q=${encodeURIComponent(q)}`)
      .then(async (r) => ({ ok: r.ok, status: r.status, d: await r.json().catch(() => null) }))
      .then(({ ok, status, d }) => {
        if (!live) return;
        if (ok && d?.name) { setFound({ state: 'found', name: d.name, place: d.place ?? '', ended: !!d.ended }); report.current(d.name); }
        else setFound({ state: status === 404 ? 'not-found' : 'unavailable' });
      })
      .catch(() => { if (live) setFound({ state: 'unavailable' }); });
    return () => { live = false; };
  }, [complete, q, path]);
  if (!complete || found.state === 'idle') return null;
  return (
    <p className="text-[13px] text-ink-soft" aria-live="polite" data-lead-lookup={found.state}>
      {found.state === 'busy' && t.busy}
      {found.state === 'not-found' && t.notFound}
      {found.state === 'unavailable' && t.unavailable}
      {found.state === 'found' && <><span className="text-ink">{found.name}</span>{found.place && ` · ${found.place}`}{found.ended && ` · ${t.ended}`}</>}
    </p>
  );
}

/** The drawn checkbox (a tick) or radio (a dot) of a choice card. */
function Box({ round }: { round: boolean }) {
  return (
    <span className={choiceBox(round)} aria-hidden="true">
      {round
        ? <svg className="size-[10px]" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="var(--signal)" /></svg>
        : <svg className="size-[14px]" viewBox="0 0 14 14" fill="none" stroke="var(--on-signal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>}
    </span>
  );
}

/** Every country with its flag, sorted by name in the language; the browser can autofill it. */
function CountrySelect({ id, lang, value, autoComplete, onChange, invalid }: {
  id: string; lang: Lang; value: string; autoComplete: string; onChange: (v: string) => void; invalid: object;
}) {
  const list = useMemo(() => countries(lang), [lang]);
  return (
    <select id={id} className={field} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} {...invalid}>
      <option value="" disabled>{dictionary[lang].lead.chooseCountry}</option>
      {list.map((c) => <option key={c.code} value={c.code}>{`${flag(c.code)} ${c.name}`}</option>)}
    </select>
  );
}

/** A phone number with its country code in front: the code from the number already given, else
 *  `fallback` (e.g. the company's country). Answered as '+45 12345678', or '' while the number is
 *  empty. A full number pasted or autofilled (+4512345678, 004512345678) sets the code itself. */
function Phone({ id, lang, value, fallback, autoComplete, onChange }: {
  id: string; lang: Lang; value: string; fallback: string; autoComplete: string; onChange: (v: string) => void;
}) {
  const t = dictionary[lang].lead;
  const list = useMemo(() => countries(lang), [lang]);
  const given = value.match(/^\+(\d{1,4}) (.*)$/);
  const [country, setCountry] = useState(() => (given && countryOfNumber(given[1], fallback)) || (dialCodes[fallback] ? fallback : ''));
  const [number, setNumber] = useState(given ? given[2] : '');
  // Without a country code a typed number is passed on as it is, so the check asks for the code.
  const emit = (c: string, n: string) => { setNumber(n); onChange(!n.trim() ? '' : c ? `+${dialCodes[c]} ${n.trim()}` : n.trim()); };
  const typed = (raw: string) => {
    const intl = raw.trim().replace(/^00/, '+');
    if (intl.startsWith('+')) {
      const c = countryOfNumber(intl, country);
      if (c) { setCountry(c); emit(c, intl.replace(/[^\d]/g, '').slice(dialCodes[c].length)); return; }
    }
    emit(country, raw);
  };
  return (
    <div className="flex gap-2">
      {/* Closed, the list shows only the flag and the code (laid over it); open, the full names. */}
      <div className="relative shrink-0 w-[7.5rem]">
        <select className={`${fieldBase} w-full text-transparent [&>option]:text-ink`} aria-label={t.countryCode} value={country} onChange={(e) => { setCountry(e.target.value); emit(e.target.value, number); }}>
          <option value="" disabled>{t.countryCode}</option>
          {list.map((c) => <option key={c.code} value={c.code}>{`${flag(c.code)} +${c.dial} ${c.name}`}</option>)}
        </select>
        <span className="absolute inset-y-0 left-3 flex items-center text-[15px] text-ink pointer-events-none tabular-nums" aria-hidden="true">
          {country ? `${flag(country)} +${dialCodes[country]}` : '+'}
        </span>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 size-[12px] text-ink-soft pointer-events-none" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <input id={id} className={`${fieldBase} flex-1 min-w-0`} type="tel" inputMode="tel" aria-label={t.number} autoComplete={autoComplete} value={number} maxLength={24} onChange={(e) => typed(e.target.value)} />
    </div>
  );
}
