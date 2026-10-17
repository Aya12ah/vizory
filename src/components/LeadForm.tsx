'use client';
import Link from 'next/link';
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import { type Answer, type Answers, type ErrorCode, type Flow, type Question, allQuestions, buildBrief, isAnswered, labelled, validate, visibleSteps } from '@/lead/engine';
import { countries, countryOfNumber, dialCodes, flag } from '@/lead/countries';
import { Address, FootButtons } from './Footer';
import { mailAddress } from './Mail';
import { buttonPrimary, buttonSecondary, choice, choiceBox, choiceInput, field, fieldBase, signalLink } from './styles';

// Shows any question flow (src/lead/flows) one step at a time, from its description alone: the
// engine decides which steps and questions are shown, checks the answers and builds the brief. The
// answers are kept in sessionStorage, so a reload loses nothing. Country questions marked fromGeo
// start at the visitor's country from /api/geo (as LangButton uses it), and so do phone codes. The brief is sent from the
// visitor's own email program for now (the address is assembled in the browser, see Mail).

type Saved = { answers: Answers; step: string | null };
const key = (flow: Flow) => `vz-lead-${flow.id}`;
function load(flow: Flow): Saved | null { try { return JSON.parse(sessionStorage.getItem(key(flow)) || 'null'); } catch { return null; } }
function save(flow: Flow, s: Saved | null) { try { if (s) sessionStorage.setItem(key(flow), JSON.stringify(s)); else sessionStorage.removeItem(key(flow)); } catch {} }

/** `title`, `lede` and `note` stand beside the steps; a step's own `why` takes the lede's place while
 *  that step is shown. */
export function LeadForm({ flow, lang, title, lede, note }: { flow: Flow; lang: Lang; title: string; lede: string; note: ReactNode }) {
  const t = dictionary[lang].lead;
  const [answers, setAnswers] = useState<Answers>({});
  const [stepId, setStepId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, ErrorCode>>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [geo, setGeo] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(80);
  const moved = useRef(false);

  // The answers so far, after a reload; must run in the browser only.
  useEffect(() => {
    const s = load(flow);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser
    if (s) { setAnswers(s.answers || {}); setStepId(s.step); }
  }, [flow]);
  useEffect(() => { if (!done) save(flow, { answers, step: stepId }); }, [flow, answers, stepId, done]);
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
  const go = (to: number) => { moved.current = true; setErrors({}); setStepId(steps[to].id); };
  const checked = () => { const e = validate(flow, answers, step.questions); setErrors(e); return Object.keys(e).length === 0; };
  const next = () => { if (checked()) go(index + 1); };
  const send = () => {
    if (!checked()) return;
    window.location.assign(`mailto:${addr()}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.text)}`);
    moved.current = true;
    setDone(true);
  };
  const copy = async () => { try { await navigator.clipboard.writeText(mailText()); setCopied(true); } catch {} };
  const restart = () => { save(flow, null); moved.current = true; setAnswers({}); setStepId(null); setDone(false); setCopied(false); };

  // Clearing the answers asks first, so a stray click does not lose them.
  const startAgain = () => { if (window.confirm(t.restartConfirm)) restart(); };
  const answered = Object.values(answers).some(isAnswered);

  // From 900px two columns: the title, the text on why the step matters and the note stay put on
  // the left while the step is answered on the right. The progress and the buttons sit in a bar at
  // the bottom of the screen, so they stay in reach however long the step is.
  // On a phone the note and "start again" follow the step instead, so the question comes first.
  const aside = (
    <>
      <div className="max-w-[44ch] text-[13px] leading-[1.55] text-ink-soft">{note}</div>
      {answered && !done && <p><button type="button" className="p-0 border-0 [background:none] [font:inherit] text-[13px] text-ink-soft underline underline-offset-3 cursor-pointer hover:text-signal-text" onClick={startAgain}>{t.restart}</button></p>}
    </>
  );
  const intro = (why: string) => (
    <div className="grid gap-4 content-start wide:sticky wide:top-8 wide:col-start-1 wide:row-start-1">
      <h1 className="page-title">{title}</h1>
      <p className="lede mt-0" data-lead-why>{why}</p>
      <div className="hidden wide:grid gap-4 mt-2">{aside}</div>
    </div>
  );
  const asideBelow = <div className="grid gap-4 wide:hidden">{aside}</div>;
  const grid = 'grid gap-8 wide:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] wide:gap-16 items-start';
  const headingClass = 'text-[24px] leading-[1.25] tracking-[-0.01em] outline-none scroll-mt-8 phone:text-[21px]';

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

  const only = step.questions.length === 1;
  const incomplete = Object.values(validate(flow, answers, step.questions)).includes('required');
  return (
    <form className="flex flex-col min-h-[calc(100dvh-148px)] pb-[calc(var(--bar)+56px)] phone:min-h-[calc(100dvh-90px)] phone:pb-[calc(var(--bar)+24px)]" style={{ '--bar': `${barHeight}px` } as CSSProperties} noValidate onSubmit={(e) => { e.preventDefault(); if (last) send(); else next(); }} data-lead-step={step.id}>
      <div className={`${grid} flex-1`}>
        {intro(step.why?.[lang] ?? lede)}
        <div className="grid gap-7 min-w-0 wide:col-start-2 wide:row-start-1">
          <div className="grid gap-2">
            <h2 ref={heading} tabIndex={-1} className={headingClass}>{step.title[lang]}</h2>
            {step.intro && <p className="text-[15px] text-ink-soft">{step.intro[lang]}</p>}
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
            <Field key={q.id} q={q} lang={lang} answers={answers} geo={geo} error={errors[q.id] && t.errors[errors[q.id]]} hideLabel={only && q.type !== 'consent'} onChange={(v) => set(q.id, v)} />
          ))}
          {last && <p><button type="button" className={buttonSecondary} onClick={copy}>{copied ? t.copied : t.copy}</button></p>}
        </div>
        {asideBelow}
        {/* From 900px the address and the theme and language buttons stand at the foot of the left
            column, just above the bar, instead of in the footer (as on the regulation pages). */}
        <div className="hidden wide:flex wide:col-start-1 wide:row-start-1 self-end sticky bottom-[calc(var(--bar)+24px)] justify-between items-end gap-6 pb-[15px]" data-lead-address>
          <Address lang={lang} />
          <FootButtons lang={lang} copy />
        </div>
      </div>
      {/* The bar, fixed to the bottom of the screen; the form keeps its height free below the step. */}
      <div ref={bar} className="fixed inset-x-0 bottom-0 z-10 bg-bg border-t border-line" data-lead-bar>
      <div className="box-border max-w-[1120px] mx-auto px-(--gutter) flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] phone:gap-x-3 phone:pt-3">
        {/* From 721px: Back, the progress, Next. On a phone the progress above the two buttons. */}
        <button type="button" className={`${buttonSecondary} phone:order-2`} disabled={index === 0} onClick={() => go(index - 1)}>{t.back}</button>
        <div className="flex items-center gap-5 flex-1 min-w-0 phone:basis-full phone:order-1 phone:flex-col phone:items-stretch phone:gap-2">
          <p className="flex-none text-[15px] text-ink-soft tabular-nums whitespace-nowrap" data-lead-count>{t.step(index + 1, steps.length)}</p>
          {/* One segment per step: the steps done and the current one filled. */}
          <div className="flex flex-1 gap-[6px]" aria-hidden="true" data-lead-progress>
            {steps.map((s, i) => <div key={s.id} className={`h-[4px] flex-1 rounded-sm transition-[background-color] duration-300 ease-[ease] ${i <= index ? 'bg-signal' : 'bg-line'}`} />)}
          </div>
        </div>
        {/* Disabled until every required question of the step is answered; other mistakes (an
            email without a domain) show when it is pressed. */}
        <button type="submit" className={`${buttonPrimary} phone:order-3 phone:ml-auto`} disabled={incomplete}>
          {last ? t.send : t.next}
          {!last && <svg className="size-[18px]" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 9h11M10 4.5 14.5 9 10 13.5" /></svg>}
        </button>
      </div>
      </div>
    </form>
  );
}

/** One question of any type, with its error. On a step with a single question its label is only
 *  for screen readers: the step's title says it. */
function Field({ q, lang, answers, geo, error, hideLabel, onChange }: {
  q: Question; lang: Lang; answers: Answers; geo: string; error?: string; hideLabel: boolean; onChange: (v: Answer) => void;
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
          <span>{label}</span>
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
  const common = { id, className: field, value: typeof value === 'string' ? value : '', maxLength: q.maxLength, autoComplete: q.autocomplete ?? (q.type === 'email' ? 'email' : undefined), onChange: (e: { target: { value: string } }) => onChange(e.target.value), ...invalid };
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'text-[15px] font-medium'}>{label}</label>
      {help}
      {q.type === 'textarea'
        ? <textarea rows={5} {...common} />
        : <input type={q.type === 'email' ? 'email' : q.type === 'date' ? 'date' : 'text'} {...common} />}
      {err}
    </div>
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
