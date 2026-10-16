// ESMA's Q&As on MiCA, read from data/esma-mica-qa.json when the site is built.
// The data comes from ESMA's PDF export via tools/esma-qa-from-text.py.
import data from '../../data/esma-mica-qa.json';

export type QA = {
  id: string; number: number; url: string; submitted: string; answered: string;
  status: string; topic: string; legal_reference: string; subject: string;
  question: string[]; answer: string[]; footnotes: string[]; disclaimer: string[];
};
export type Topic = { id: string; title: string; items: QA[] };

const items = data.items as QA[];
export const qaCount = items.length;

/** "18/02/2026" -> ["2026", "02", "18"], or null when the date is missing. */
export function splitDate(d: string): [string, string, string] | null {
  if (!d || d.split('/').length !== 3) return null;
  const [dd, mm, yy] = d.split('/');
  return [yy, mm, dd];
}

const sortKey = (q: QA) => [...(splitDate(q.answered || q.submitted) ?? ['0', '0', '0']), q.number] as const;
function compare(a: QA, b: QA) {
  const x = sortKey(a), y = sortKey(b);
  for (let i = 0; i < 4; i++) if (x[i] !== y[i]) return x[i] > y[i] ? -1 : 1;
  return 0;
}

export const topicId = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Topics with the most Q&As first; within a topic the newest Q&A first. */
export function topics(): Topic[] {
  const map = new Map<string, QA[]>();
  for (const q of [...items].sort(compare)) {
    const t = q.topic || 'Other';
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(q);
  }
  return [...map].map(([title, qs]) => ({ id: topicId(title), title, items: qs })).sort((a, b) => b.items.length - a.items.length);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_DA = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

/** When the data was downloaded from ESMA: "12 October 2026" / "12. oktober 2026". */
export function downloaded(lang: 'en' | 'da'): string {
  const m = /(\w+) (\d+), (\d{4})/.exec(data.downloaded);
  if (!m) return data.downloaded;
  const day = Number(m[2]);
  return lang === 'en' ? `${day} ${m[1]} ${m[3]}` : `${day}. ${MONTHS_DA[MONTHS.indexOf(m[1])]} ${m[3]}`;
}
