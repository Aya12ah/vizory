'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { dictionary } from '@/i18n/dictionary';
import { type Lang, localPath } from '@/i18n/lang';
import { type Answer, type Answers, type ErrorCode, type Flow, type Question, buildBrief, labelled, validate, visibleSteps } from '@/lead/engine';
import { countries, countryOfNumber, dialCodes, flag } from '@/lead/countries';
import { mailAddress } from './Mail';
import { buttonPrimary, buttonSecondary, choice, field, fieldBase, signalLink } from './styles';

// Shows any question flow (src/lead/flows) one step at a time, from its description alone: the
// engine decides which steps and questions are shown, checks the answers and builds the brief. The
// answers are kept in sessionStorage, so a reload loses nothing. The brief is sent from the
// visitor's own email program for now (the address is assembled in the browser, see Mail).

type Saved = { answers: Answers; step: string | null };
const key = (flow: Flow) => `vz-lead-${flow.id}`;
function load(flow: Flow): Saved | null { try { return JSON.parse(sessionStorage.getItem(key(flow)) || 'null'); } catch { return null; } }
function save(flow: Flow, s: Saved | null) { try { if (s) sessionStorage.setItem(key(flow), JSON.stringify(s)); else sessionStorage.removeItem(key(flow)); } catch {} }

export function LeadForm({ flow, lang }: { flow: Flow; lang: Lang }) {
  const t = dictionary[lang].lead;
  const [answers, setAnswers] = useState<Answers>({});
  const [stepId, setStepId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, ErrorCode>>({});
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  // The answers so far, after a reload; must run in the browser only.
  useEffect(() => {
    const s = load(flow);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage exists only in the browser
    if (s) { setAnswers(s.answers || {}); setStepId(s.step); }
  }, [flow]);
  useEffect(() => { if (!done) save(flow, { answers, step: stepId }); }, [flow, answers, stepId, done]);
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

  if (done) {
    return (
      <div className="mt-10 grid gap-5 max-w-[56ch]" data-lead-done>
        <h2 ref={heading} tabIndex={-1} className="text-[21px] leading-[1.3] outline-none">{t.doneTitle}</h2>
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
    );
  }

  const only = step.questions.length === 1;
  return (
    <form className="mt-10 grid gap-6 max-w-[56ch]" noValidate onSubmit={(e) => { e.preventDefault(); if (last) send(); else next(); }} data-lead-step={step.id}>
      <div className="grid gap-2">
        <p className="text-[12px] text-ink-soft tabular-nums">{t.step(index + 1, steps.length)}</p>
        <div className="h-[3px] rounded-pill bg-line overflow-hidden" aria-hidden="true">
          <div className="h-full bg-signal transition-[width] duration-300 ease-[ease]" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
      </div>
      <div className="grid gap-2">
        <h2 ref={heading} tabIndex={-1} className="text-[21px] leading-[1.3] outline-none">{step.title[lang]}</h2>
        {step.intro && <p className="text-[14px] text-ink-soft">{step.intro[lang]}</p>}
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
        <Field key={q.id} q={q} lang={lang} answers={answers} error={errors[q.id] && t.errors[errors[q.id]]} hideLabel={only && q.type !== 'consent'} onChange={(v) => set(q.id, v)} />
      ))}
      <div className="flex flex-wrap gap-2">
        {index > 0 && <button type="button" className={buttonSecondary} onClick={() => go(index - 1)}>{t.back}</button>}
        <button type="submit" className={buttonPrimary}>{last ? t.send : t.next}</button>
        {last && <button type="button" className={buttonSecondary} onClick={copy}>{copied ? t.copied : t.copy}</button>}
      </div>
    </form>
  );
}

/** One question of any type, with its error. On a step with a single question its label is only
 *  for screen readers: the step's title says it. */
function Field({ q, lang, answers, error, hideLabel, onChange }: {
  q: Question; lang: Lang; answers: Answers; error?: string; hideLabel: boolean; onChange: (v: Answer) => void;
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
        {q.options.map((o) => (
          <label key={o.id} className={choice}>
            {q.type === 'single'
              ? <input type="radio" name={id} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
              : <input type="checkbox" name={id} value={o.id} checked={list.includes(o.id)} onChange={(e) => onChange(e.target.checked ? [...list, o.id] : list.filter((x) => x !== o.id))} />}
            <span>{o.label[lang]}</span>
          </label>
        ))}
        {err}
      </fieldset>
    );
  }
  if (q.type === 'consent') {
    return (
      <div className="grid gap-2">
        <label className={choice}>
          <input type="checkbox" id={id} checked={value === true} onChange={(e) => onChange(e.target.checked)} {...invalid} />
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
        <Phone id={id} lang={lang} value={typeof value === 'string' ? value : ''} fallback={typeof from === 'string' ? from : lang === 'da' ? 'DK' : ''} autoComplete={q.autocomplete ?? 'tel'} onChange={onChange} />
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
