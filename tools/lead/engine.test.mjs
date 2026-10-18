// Tests of the question-flow engine (src/lead/engine.ts) with a small flow of its own, and of
// Vizory's flow (src/lead/flows/vizory.ts): its description is sound and its rules give the right
// tracks and urgency. Run: npm test
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { buildBrief, checkFlow, clean, matches, tagsFor, validate, visibleSteps } from '../../src/lead/engine.ts';
import { vizoryFlow } from '../../src/lead/flows/vizory.ts';
import { countries, countryOfNumber, dialCodes, flag } from '../../src/lead/countries.ts';

const t = (s) => ({ en: s, da: s });
const NOW = Date.parse('2026-10-17');
const mini = {
  id: 'mini', subjectQuestion: 'who',
  words: { none: t('-'), yes: t('Yes'), no: t('No'), assessment: t('Tags') },
  sections: [{ id: 's', title: t('Section') }],
  steps: [
    { id: 'one', title: t('One'), questions: [{ id: 'kind', type: 'multi', required: true, section: 's', label: t('Kind'), options: [{ id: 'a', label: t('A'), link: '/a' }, { id: 'b', label: t('B') }] }] },
    { id: 'two', title: t('Two'), showIf: { kind: { includes: 'b' } }, questions: [{ id: 'more', type: 'single', required: true, section: 's', label: t('More'), options: [{ id: 'x', label: t('X') }] }] },
    { id: 'three', title: t('Three'), questions: [
      { id: 'who', type: 'text', required: true, section: 's', label: t('Who'), maxLength: 5 },
      { id: 'mail', type: 'email', section: 's', label: t('Mail') },
      { id: 'when', type: 'date', section: 's', label: t('When') },
    ] },
  ],
  tags: [{ id: 'hot', kind: 'flag', label: t('Hot') }, { id: 'tb', kind: 'track', label: t('Track B') }],
  rules: [{ when: { when: { withinDays: 30 } }, tag: 'hot' }, { when: { any: [{ kind: { includes: 'b' } }, { more: { equals: 'x' } }] }, tag: 'tb' }],
};

test('conditions: every check, all keys, any', () => {
  const a = { k: 'x', m: ['p', 'q'], e: '', d: '2026-10-20' };
  assert.ok(matches({ k: { equals: 'x' }, m: { includes: 'q' } }, a, NOW));
  assert.ok(!matches({ k: { equals: 'x' }, m: { includes: 'z' } }, a, NOW));
  assert.ok(matches({ k: { in: ['y', 'x'] }, m: { includesAny: ['z', 'p'] } }, a, NOW));
  assert.ok(matches({ e: { answered: false }, k: { answered: true } }, a, NOW));
  assert.ok(matches({ d: { withinDays: 5 } }, a, NOW) && !matches({ d: { withinDays: 1 } }, a, NOW));
  assert.ok(matches({ any: [{ k: { equals: 'no' } }, { m: { includes: 'p' } }] }, a, NOW));
  assert.ok(matches(undefined, a, NOW));
});

test('steps follow the answers, and hidden answers are dropped', () => {
  assert.deepEqual(visibleSteps(mini, {}, NOW).map((s) => s.id), ['one', 'three']);
  assert.deepEqual(visibleSteps(mini, { kind: ['b'] }, NOW).map((s) => s.id), ['one', 'two', 'three']);
  assert.deepEqual(clean(mini, { kind: ['a', 'zz'], more: 'x', who: '  Ann ', extra: 'no' }, NOW), { kind: ['a'], who: 'Ann' });
});

test('validation', () => {
  assert.deepEqual(validate(mini, {}, undefined, NOW), { kind: 'required', who: 'required' });
  const e = validate(mini, { kind: ['c'], who: 'toolong', mail: 'nope', when: '20-10-2026' }, undefined, NOW);
  assert.deepEqual(e, { kind: 'option', who: 'length', mail: 'email', when: 'date' });
  assert.deepEqual(validate(mini, { kind: ['a'], who: 'Ann', mail: 'a@b.dk' }, undefined, NOW), {});
});

test('tags, subject, brief text and links', () => {
  const b = buildBrief(mini, { kind: ['a', 'b'], more: 'x', who: 'Ann', when: '2026-10-25' }, 'en', NOW);
  assert.deepEqual(b.tags.map((x) => x.id), ['hot', 'tb']);
  assert.equal(b.subject, '[Hot] Ann · Track B');
  assert.match(b.text, /^TAGS\n– Hot\n– Track B\n\nSECTION\nKind:\n  – A\n  – B\nMore:\n  – X\nWho:\n  – Ann\nWhen:\n  – October 25, 2026$/);
  assert.deepEqual(b.sections[0].rows[0], { label: 'Kind', value: 'A, B' });
  assert.deepEqual(b.links, [{ href: '/a', label: 'A' }]);
  assert.equal(buildBrief(mini, { kind: ['a'], who: 'Ann' }, 'en', NOW).subject, 'Ann');
});

test('checkFlow finds mistakes in a description', () => {
  assert.deepEqual(checkFlow(mini), []);
  const bad = { ...mini, rules: [{ when: { kidn: { equals: 'a' } }, tag: 'hot' }, { when: { kind: { includes: 'c' } }, tag: 'nope' }] };
  assert.deepEqual(checkFlow(bad), ['rule 1: unknown question kidn', 'rule 2: kind has no option c', 'rule 2: unknown tag nope']);
});

test('country and phone answers', () => {
  const f = { ...mini, steps: [{ id: 's', title: t('S'), questions: [
    { id: 'land', type: 'country', required: true, section: 's', label: t('Land') },
    { id: 'tel', type: 'phone', section: 's', label: t('Tel'), countryFrom: 'land' },
  ] }], rules: [], subjectQuestion: 'land' };
  assert.deepEqual(validate(f, { land: 'DK', tel: '+45 12 34 56 78' }, undefined, NOW), {});
  assert.deepEqual(validate(f, { land: 'Denmark', tel: '12345678' }, undefined, NOW), { land: 'option', tel: 'phone' });
  assert.deepEqual(validate(f, { land: 'DK', tel: '+45 12' }, undefined, NOW), { tel: 'phone' });
  assert.deepEqual(clean(f, { land: 'dk', tel: ' +45 12345678 ' }, NOW), { tel: '+45 12345678' });
  const b = buildBrief(f, { land: 'DK', tel: '+45 12345678' }, 'da', NOW);
  assert.match(b.text, /Land:\n  – Danmark\nTel:\n  – \+45 12345678/);
  assert.deepEqual(checkFlow(f), []);
  const bad = { ...f, steps: [{ ...f.steps[0], questions: [f.steps[0].questions[0], { ...f.steps[0].questions[1], countryFrom: 'tel' }] }] };
  assert.deepEqual(checkFlow(bad), ['question tel: countryFrom tel is not a country question']);
});

test('countries: dialling codes, flags and names', () => {
  assert.equal(countryOfNumber('+4512345678'), 'DK');
  assert.equal(countryOfNumber('004412345678'.replace(/^00/, '+')), 'GB');
  assert.equal(countryOfNumber('+35812345'), 'FI');
  assert.equal(countryOfNumber('+15551234', 'CA'), 'CA');
  assert.equal(countryOfNumber('+15551234'), 'US');
  assert.equal(countryOfNumber('+79001234567'), 'RU');
  assert.equal(flag('DK'), '\u{1F1E9}\u{1F1F0}');
  assert.equal(dialCodes.DK, '45');
  const da = countries('da');
  assert.ok(da.length > 230 && da.some((c) => c.code === 'DK' && c.name === 'Danmark'));
  assert.ok(da.findIndex((c) => c.code === 'DK') < da.findIndex((c) => c.code === 'SE'));
});

// Vizory's flow
const base = { status: 'new', help: ['application'], timing: 'later', company: 'Firma ApS', country: 'DK', name: 'Ann', email: 'ann@firma.dk', consent: true };
const tags = (a) => tagsFor(vizoryFlow, clean(vizoryFlow, { ...base, ...a }, NOW), NOW).map((x) => x.id);

test('Vizory: every help link goes to a page and heading that exist', () => {
  const pages = { '/mica': 'mica', '/stablecoins': 'stablecoins', '/payments': 'payments', '/dlt': 'dlt', '/aml': 'aml', '/mica-qa': null };
  for (const s of vizoryFlow.steps) for (const l of s.links ?? []) for (const lang of ['en', 'da']) {
    const [path, anchor] = l.href[lang].split('#');
    assert.ok(path in pages, `${s.id}: unknown page ${path}`);
    if (anchor) assert.ok(readFileSync(new URL(`../../src/content/${pages[path]}.${lang}.mdx`, import.meta.url), 'utf8').includes(`id="${anchor}"`), `${s.id}: no heading #${anchor} in ${path} (${lang})`);
  }
});

test('Vizory flow description is sound', () => {
  assert.deepEqual(checkFlow(vizoryFlow), []);
});

test('Vizory: crypto track depends on an existing authorisation', () => {
  assert.deepEqual(tags({ area: ['crypto'], cryptoLicence: 'no' }), ['casp']);
  assert.deepEqual(tags({ area: ['crypto'], cryptoLicence: 'yes' }), ['art60']);
});

test('Vizory: stablecoin and payment tracks', () => {
  assert.deepEqual(tags({ area: ['stablecoins'], stableRole: 'emt', stableLicence: 'no' }), ['emt-licence']);
  assert.deepEqual(tags({ area: ['stablecoins'], stableRole: 'emt', stableLicence: 'yes' }), []);
  assert.deepEqual(tags({ area: ['stablecoins'], stableRole: 'art', stableLicence: 'no' }), ['art-issuer']);
  assert.deepEqual(tags({ area: ['payments'], payEmoney: 'yes', payVolume: 'under3' }), ['emi']);
  assert.deepEqual(tags({ area: ['payments'], payEmoney: 'no', payVolume: 'under3' }), ['limited']);
  assert.deepEqual(tags({ area: ['payments'], payEmoney: 'no', payVolume: 'over3' }), ['full']);
  assert.deepEqual(tags({ area: ['payments'], payEmoney: 'no', payVolume: 'unknown' }), []);
});

test('Vizory: urgency', () => {
  assert.deepEqual(tags({ area: ['aml'], amlChallenge: ['risk'], status: 'fsa-contact' }), ['urgent']);
  assert.deepEqual(tags({ area: ['aml'], amlChallenge: ['risk'], timing: '3m' }), ['urgent']);
  assert.deepEqual(tags({ area: ['aml'], amlChallenge: ['risk'], deadline: '2026-12-01' }), ['urgent']);
  assert.deepEqual(tags({ area: ['aml'], amlChallenge: ['risk'], timing: '6m', deadline: '2027-06-01' }), []);
});

test('Vizory: answers for an area no longer chosen do not count', () => {
  assert.deepEqual(tags({ area: ['aml'], amlChallenge: ['risk'], cryptoLicence: 'no' }), []);
});

test('Vizory: a whole brief in Danish', () => {
  const b = buildBrief(vizoryFlow, { ...base, area: ['crypto', 'aml'], cryptoServices: ['custody', 'exchange'], cryptoLicence: 'no', amlChallenge: ['policies'], status: 'fsa-contact', message: 'Linje et\n\nLinje to' }, 'da', NOW);
  assert.equal(b.subject, '[Haster] Firma ApS · Ansøgning om CASP-tilladelse');
  assert.match(b.text, /KRYPTOAKTIVER \(MICA\)\nHvilke kryptoaktivtjenester\?\n  – Opbevaring og forvaltning på vegne af kunder\n  – Veksling til penge eller andre kryptoaktiver\nAnden finansiel tilladelse i forvejen\?\n  – Nej\n/);
  assert.doesNotMatch(b.text, /valgfri/);
  assert.match(b.text, /\nAndet, vi bør vide\?\n  Linje et\n\n  Linje to$/);
  assert.deepEqual(b.links.map((l) => l.href), ['/mica', '/aml']);
  assert.doesNotMatch(b.text, /Ikke besvaret|Hjemmeside/);
  assert.deepEqual(validate(vizoryFlow, { ...base, area: ['crypto'], cryptoLicence: 'no' }, undefined, NOW), {});
});

test('Vizory: the CVR number is asked for Danish companies only, as 8 digits', () => {
  const company = (answers) => visibleSteps(vizoryFlow, { area: ['aml'], ...answers }, NOW).find((s) => s.id === 'company').questions.map((q) => q.id);
  assert.ok(company({ country: 'DK' }).includes('cvr'));
  assert.ok(!company({ country: 'SE' }).includes('cvr'));
  const cvr = vizoryFlow.steps.find((s) => s.id === 'company').questions.filter((q) => q.id === 'cvr');
  assert.deepEqual(validate(vizoryFlow, { cvr: '12345678' }, cvr, NOW), {});
  assert.deepEqual(validate(vizoryFlow, { cvr: '1234567' }, cvr, NOW), { cvr: 'format' });
  assert.deepEqual(validate(vizoryFlow, {}, cvr, NOW), {});
  assert.equal(clean(vizoryFlow, { area: ['aml'], country: 'SE', cvr: '12345678' }, NOW).cvr, undefined);
});
