// A general engine for question flows: which steps and questions to show, whether the answers are
// valid, which tags the rules give, and the brief the answers make. It knows nothing about Vizory:
// a flow (src/lead/flows) describes the questions, conditions, rules and brief sections as data, so
// a question is added, changed or removed in the flow alone. The browser (LeadForm) and, later, the
// server use the same functions, so they cannot disagree.
//
// No runtime imports, so the tests run it directly with Node (tools/lead).
import type { Lang } from '../i18n/lang';

export type Text = Record<Lang, string>;
export type Answer = string | string[] | boolean;
export type Answers = Record<string, Answer>;

/** A condition on the answers. All keys must hold; `any` holds if one of its conditions does. */
export type Condition = {
  [questionId: string]: Check | Condition[] | undefined;
  any?: Condition[];
};
/** One check on one answer. */
export type Check =
  | { equals: string }          // a single choice is this option
  | { in: string[] }            // a single choice is one of these options
  | { includes: string }        // a multiple choice includes this option
  | { includesAny: string[] }   // a multiple choice includes one of these options
  | { answered: boolean }       // the question has (or has not) been answered
  | { withinDays: number };     // a date falls within this many days from now

export type Option = { id: string; label: Text; /** a page to suggest on the receipt when chosen */ link?: string };

type Base = {
  id: string;
  label: Text;
  /** A shorter label for the brief, for a long question. */
  short?: Text;
  help?: Text;
  required?: boolean;
  showIf?: Condition;
  /** The brief section the answer goes under; questions without one are left out of the brief. */
  section?: string;
  /** The browser's autofill hint (the HTML autocomplete token), e.g. 'organization' or 'email'. */
  autocomplete?: string;
};
export type Question =
  | (Base & { type: 'single'; options: Option[] })
  | (Base & { type: 'multi'; options: Option[] })
  | (Base & { type: 'text' | 'textarea' | 'email' | 'date'; maxLength?: number; placeholder?: Text;
      /** A text answer must match this regular expression (whole answer, spaces ignored), e.g. a
       *  CVR number: '\\d{8}'. `inputMode` picks the phone's keyboard, e.g. 'numeric'. */
      pattern?: string; inputMode?: 'numeric' | 'text';
      /** The characters the field takes, as a regular expression character set ('0-9'); anything
       *  else typed or pasted is dropped, and the rest cut at `maxLength`. */
      allow?: string;
      /** Once the answer matches `pattern`, the browser looks it up at `path` (?q=answer), which
       *  answers { name, place } or an error; it shows what it found under the field and fills
       *  `fill`, another question, with the name while that is still empty. */
      lookup?: { path: string; fill?: string } })
  | (Base & { type: 'consent' })
  /** A country from the list, answered as its ISO 3166 code (DK). With `fromGeo` it starts at the
   *  visitor's country as the site's /api/geo sees it, until the visitor chooses one. */
  | (Base & { type: 'country'; fromGeo?: boolean })
  /** A phone number with its country code, answered as '+45 12345678'; the code is preselected
   *  from the answer to `countryFrom`, a country question, else from the visitor's country. */
  | (Base & { type: 'phone'; countryFrom?: string });

/** A step is one screen. `why` says why the step's questions matter (shown above the step);
 *  `intro` is a short hint under its title; `summary` shows the answers so far above its questions. */
export type Step = { id: string; title: Text; why?: Text; intro?: Text; showIf?: Condition; summary?: boolean; questions: Question[] };

/** A tag the rules can give: a flag (shown in brackets first in the subject, e.g. urgent) or a track. */
export type Tag = { id: string; kind: 'flag' | 'track'; label: Text };
export type Rule = { when: Condition; tag: string };

export type Flow = {
  id: string;
  steps: Step[];
  sections: { id: string; title: Text }[];
  tags: Tag[];
  rules: Rule[];
  /** The answer that names the sender in the subject, e.g. the company. */
  subjectQuestion: string;
  /** Text for a field left empty and for yes/no answers. */
  words: { none: Text; yes: Text; no: Text; assessment: Text };
};

const DAY = 864e5;
const COUNTRY = /^[A-Z]{2}$/;
/** '+45 12345678': a country code, a space, then 4 to 15 digits (spaces allowed between them). */
const PHONE = /^\+\d{1,4} (?:\d ?){4,15}$/;

function holds(check: Check, a: Answer | undefined, now: number): boolean {
  if ('equals' in check) return a === check.equals;
  if ('in' in check) return typeof a === 'string' && check.in.includes(a);
  if ('includes' in check) return Array.isArray(a) && a.includes(check.includes);
  if ('includesAny' in check) return Array.isArray(a) && a.some((x) => check.includesAny.includes(x));
  if ('answered' in check) return isAnswered(a) === check.answered;
  if ('withinDays' in check) {
    if (typeof a !== 'string' || !a) return false;
    const t = Date.parse(a);
    return !Number.isNaN(t) && t - now <= check.withinDays * DAY;
  }
  return false;
}

/** Whether a condition holds for these answers. No condition always holds. */
export function matches(c: Condition | undefined, answers: Answers, now = Date.now()): boolean {
  if (!c) return true;
  return Object.entries(c).every(([key, v]) => {
    if (v === undefined) return true;
    if (key === 'any') return (v as Condition[]).some((sub) => matches(sub, answers, now));
    return holds(v as Check, answers[key], now);
  });
}

export function isAnswered(a: Answer | undefined): boolean {
  if (Array.isArray(a)) return a.length > 0;
  if (typeof a === 'string') return a.trim() !== '';
  return a === true;
}

/** The steps to show, each with its questions to show; steps left with no questions are skipped. */
export function visibleSteps(flow: Flow, answers: Answers, now = Date.now()): Step[] {
  return flow.steps
    .filter((s) => matches(s.showIf, answers, now))
    .map((s) => ({ ...s, questions: s.questions.filter((q) => matches(q.showIf, answers, now)) }))
    .filter((s) => s.questions.length > 0);
}

export const allQuestions = (flow: Flow) => flow.steps.flatMap((s) => s.questions);

/** Only the answers to questions that are known and shown, with known options: what is sent on. */
export function clean(flow: Flow, answers: Answers, now = Date.now()): Answers {
  const out: Answers = {};
  for (const q of visibleSteps(flow, answers, now).flatMap((s) => s.questions)) {
    const a = answers[q.id];
    if (q.type === 'single') { if (typeof a === 'string' && q.options.some((o) => o.id === a)) out[q.id] = a; }
    else if (q.type === 'multi') { if (Array.isArray(a)) { const ok = a.filter((x) => q.options.some((o) => o.id === x)); if (ok.length) out[q.id] = ok; } }
    else if (q.type === 'consent') { if (a === true) out[q.id] = true; }
    else if (q.type === 'country') { if (typeof a === 'string' && COUNTRY.test(a)) out[q.id] = a; }
    else if (q.type === 'phone') { if (typeof a === 'string' && PHONE.test(a.trim())) out[q.id] = a.trim(); }
    else if (typeof a === 'string' && a.trim()) out[q.id] = a.trim().slice(0, ('maxLength' in q && q.maxLength) || 500);
  }
  return out;
}

export type ErrorCode = 'required' | 'email' | 'date' | 'option' | 'length' | 'phone' | 'format';

/** What is wrong with the answers to these questions (by default all shown questions). */
export function validate(flow: Flow, answers: Answers, questions?: Question[], now = Date.now()): Record<string, ErrorCode> {
  const errors: Record<string, ErrorCode> = {};
  const qs = questions ?? visibleSteps(flow, answers, now).flatMap((s) => s.questions);
  for (const q of qs) {
    const a = answers[q.id];
    if (!isAnswered(a)) { if (q.required) errors[q.id] = 'required'; continue; }
    if (q.type === 'single' && !q.options.some((o) => o.id === a)) errors[q.id] = 'option';
    else if (q.type === 'multi' && !(Array.isArray(a) && a.every((x) => q.options.some((o) => o.id === x)))) errors[q.id] = 'option';
    else if (q.type === 'email' && !(typeof a === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.trim()))) errors[q.id] = 'email';
    else if (q.type === 'country' && !(typeof a === 'string' && COUNTRY.test(a))) errors[q.id] = 'option';
    else if (q.type === 'phone' && !(typeof a === 'string' && PHONE.test(a.trim()))) errors[q.id] = 'phone';
    else if (q.type === 'date' && !(typeof a === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a) && !Number.isNaN(Date.parse(a)))) errors[q.id] = 'date';
    else if ((q.type === 'text' || q.type === 'textarea' || q.type === 'email') && typeof a === 'string' && a.length > (q.maxLength ?? 500)) errors[q.id] = 'length';
    else if ((q.type === 'text' || q.type === 'textarea') && q.pattern && typeof a === 'string' && !new RegExp(`^(?:${q.pattern})$`).test(a.replace(/\s/g, ''))) errors[q.id] = 'format';
  }
  return errors;
}

/** The tags the rules give, in the order the flow lists its tags. */
export function tagsFor(flow: Flow, answers: Answers, now = Date.now()): Tag[] {
  const given = new Set(flow.rules.filter((r) => matches(r.when, answers, now)).map((r) => r.tag));
  return flow.tags.filter((t) => given.has(t.id));
}

/** An answer as words: option labels, yes/no, or the text itself. */
export function answerText(flow: Flow, q: Question, a: Answer | undefined, lang: Lang): string {
  if (!isAnswered(a)) return flow.words.none[lang];
  if (q.type === 'single' || q.type === 'multi') {
    const ids = Array.isArray(a) ? a : [a as string];
    return ids.map((id) => q.options.find((o) => o.id === id)?.label[lang] ?? id).join(', ');
  }
  if (q.type === 'consent') return a ? flow.words.yes[lang] : flow.words.no[lang];
  if (q.type === 'country') { try { return new Intl.DisplayNames([lang], { type: 'region' }).of(a as string) ?? String(a); } catch { return String(a); } }
  if (q.type === 'date') { try { return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${a}T00:00:00Z`)); } catch { return String(a); } }
  return String(a);
}

/** A question's label in the brief: its short label if it has one, without a note in brackets at
 *  the end, such as '(optional)', which only matters while the form is filled in. */
const briefLabel = (q: Question, lang: Lang) => (q.short ?? q.label)[lang].replace(/\s*\([^)]*\)$/, '');

/** A label before its answer: with a colon, unless it is a question. */
export const labelled = (label: string) => (/[?:]$/.test(label) ? label : `${label}:`);

export type Brief = {
  subject: string;
  tags: Tag[];
  sections: { title: string; rows: { label: string; value: string }[] }[];
  /** As plain text for an email: headings in capitals, a choice of several options and a written
   *  message each on lines of their own under the label. */
  text: string;
  /** Pages to suggest, from the chosen options that carry a link. */
  links: { href: string; label: string }[];
};

/** The brief the answers make: subject, tags, the answers by section, as text, and pages to suggest. */
export function buildBrief(flow: Flow, input: Answers, lang: Lang, now = Date.now()): Brief {
  const answers = clean(flow, input, now);
  const shown = visibleSteps(flow, answers, now).flatMap((s) => s.questions);
  const tags = tagsFor(flow, answers, now);
  const grouped = flow.sections
    .map((sec) => ({
      title: sec.title[lang],
      // Questions left unanswered (only optional ones can be) are left out.
      questions: shown.filter((q) => q.section === sec.id && q.type !== 'consent' && isAnswered(answers[q.id])),
    }))
    .filter((s) => s.questions.length > 0);
  const sections = grouped.map((s) => ({ title: s.title, rows: s.questions.map((q) => ({ label: briefLabel(q, lang), value: answerText(flow, q, answers[q.id], lang) })) }));
  const flags = tags.filter((t) => t.kind === 'flag').map((t) => `[${t.label[lang]}]`);
  const tracks = tags.filter((t) => t.kind === 'track').map((t) => t.label[lang]);
  const who = answers[flow.subjectQuestion];
  // The sender first, so it shows in the inbox however short the subject line is cut.
  const subject = [...flags, [typeof who === 'string' ? who : '', tracks.join(' / ')].filter(Boolean).join(' · ')].filter(Boolean).join(' ');
  const heading = (title: string) => title.toLocaleUpperCase(lang);
  const lines: string[] = [];
  if (tags.length) lines.push(heading(flow.words.assessment[lang]), ...tags.map((t) => `- ${t.label[lang]}`), '');
  for (const s of grouped) {
    lines.push(heading(s.title));
    for (const q of s.questions) {
      const a = answers[q.id], label = labelled(briefLabel(q, lang));
      if (q.type === 'multi' && Array.isArray(a) && a.length > 1) lines.push(`- ${label}`, ...a.map((id) => `  – ${q.options.find((o) => o.id === id)?.label[lang] ?? id}`));
      else if (q.type === 'textarea') lines.push(`- ${label}`, ...String(a).split(/\r?\n/).map((l) => (l.trim() ? `  ${l.trimEnd()}` : '')));
      else lines.push(`- ${label} ${answerText(flow, q, a, lang)}`);
    }
    lines.push('');
  }
  const links: Brief['links'] = [];
  for (const q of shown) {
    if (q.type !== 'single' && q.type !== 'multi') continue;
    const a = answers[q.id];
    for (const id of Array.isArray(a) ? a : [a]) {
      const o = q.options.find((x) => x.id === id);
      if (o?.link && !links.some((l) => l.href === o.link)) links.push({ href: o.link, label: o.label[lang] });
    }
  }
  return { subject, tags, sections, text: lines.join('\n').trim(), links };
}

/** Mistakes in a flow description that types cannot catch: conditions on questions or options that
 *  do not exist, rules giving unknown tags, questions in unknown sections, ids used twice. */
export function checkFlow(flow: Flow): string[] {
  const problems: string[] = [];
  const qs = allQuestions(flow);
  const byId = new Map(qs.map((q) => [q.id, q]));
  const seen = new Set<string>();
  for (const q of qs) { if (seen.has(q.id)) problems.push(`question ${q.id} twice`); seen.add(q.id); }
  const optionIds = (id: string) => { const q = byId.get(id); return q && (q.type === 'single' || q.type === 'multi') ? q.options.map((o) => o.id) : null; };
  const walk = (c: Condition | undefined, where: string) => {
    if (!c) return;
    for (const [key, v] of Object.entries(c)) {
      if (v === undefined) continue;
      if (key === 'any') { (v as Condition[]).forEach((sub) => walk(sub, where)); continue; }
      if (!byId.has(key)) { problems.push(`${where}: unknown question ${key}`); continue; }
      const check = v as Check, opts = optionIds(key);
      const used = 'equals' in check ? [check.equals] : 'in' in check ? check.in : 'includes' in check ? [check.includes] : 'includesAny' in check ? check.includesAny : [];
      // A country question has no options: a condition on it names country codes.
      const known = (o: string) => (byId.get(key)?.type === 'country' ? COUNTRY.test(o) : !!opts?.includes(o));
      for (const o of used) if (!known(o)) problems.push(`${where}: ${key} has no option ${o}`);
    }
  };
  for (const s of flow.steps) { walk(s.showIf, `step ${s.id}`); for (const q of s.questions) walk(q.showIf, `question ${q.id}`); }
  const tagIds = new Set(flow.tags.map((t) => t.id));
  flow.rules.forEach((r, i) => { walk(r.when, `rule ${i + 1}`); if (!tagIds.has(r.tag)) problems.push(`rule ${i + 1}: unknown tag ${r.tag}`); });
  const sectionIds = new Set(flow.sections.map((x) => x.id));
  for (const q of qs) if (q.section && !sectionIds.has(q.section)) problems.push(`question ${q.id}: unknown section ${q.section}`);
  if (!byId.has(flow.subjectQuestion)) problems.push(`unknown subject question ${flow.subjectQuestion}`);
  for (const q of qs) if ('pattern' in q && q.pattern) { try { new RegExp(q.pattern); } catch { problems.push(`question ${q.id}: pattern ${q.pattern} is not a regular expression`); } }
  for (const q of qs) if ('lookup' in q && q.lookup?.fill && !byId.has(q.lookup.fill)) problems.push(`question ${q.id}: lookup fills unknown question ${q.lookup.fill}`);
  for (const q of qs) if (q.type === 'phone' && q.countryFrom && byId.get(q.countryFrom)?.type !== 'country') problems.push(`question ${q.id}: countryFrom ${q.countryFrom} is not a country question`);
  return problems;
}
