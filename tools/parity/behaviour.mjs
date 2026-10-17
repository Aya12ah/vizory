// Behaviour check: the interactive parts of the site work as before.
//   node tools/parity/behaviour.mjs <base-url>
import { chromium } from 'playwright';

const base = process.argv[2];
if (!base) { console.log('usage: behaviour.mjs <base-url>'); process.exit(2); }
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let failed = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : '  ' + detail}`);
  if (!ok) failed++;
}
const PHONE = { width: 390, height: 844 };
async function page(path, { lang = 'en', theme = 'light', locale = 'en-GB', timezoneId = 'UTC', viewport = undefined } = {}) {
  const ctx = await browser.newContext({ locale, timezoneId, reducedMotion: 'reduce', ...(viewport ? { viewport } : {}) });
  await ctx.addInitScript(([l, t]) => {
    // Only on the first load in this context, so a choice made on the page survives navigation.
    if (sessionStorage.getItem('init')) return;
    sessionStorage.setItem('init', '1');
    if (l) localStorage.setItem('vz-lang', l); else localStorage.removeItem('vz-lang');
    if (t) localStorage.setItem('vz-theme', t);
  }, [lang, theme]);
  const p = await ctx.newPage();
  await p.goto(base + path, { waitUntil: 'networkidle' });
  return p;
}
const clean = (u) => new URL(u).pathname.replace(/\/$/, '') || '/';

// Theme toggle
{
  const p = await page('/people');
  check('theme starts light', (await p.getAttribute('html', 'data-theme')) === 'light');
  check('theme button not pressed', (await p.getAttribute('#themeBtn', 'aria-pressed')) === 'false');
  await p.click('#themeBtn');
  check('theme switches to dark', (await p.getAttribute('html', 'data-theme')) === 'dark');
  check('theme button pressed', (await p.getAttribute('#themeBtn', 'aria-pressed')) === 'true');
  check('theme button label', (await p.getAttribute('#themeBtn', 'aria-label')) === 'Switch to light mode');
  check('theme remembered', (await p.evaluate(() => localStorage.getItem('vz-theme'))) === 'dark');
  await p.reload({ waitUntil: 'networkidle' });
  check('theme kept after reload', (await p.getAttribute('html', 'data-theme')) === 'dark');
  await p.context().close();
}
// Theme from the clock when nothing is chosen
{
  const ctx = await browser.newContext({ timezoneId: 'UTC' });
  await ctx.addInitScript(() => { localStorage.setItem('vz-lang', 'en'); });
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date('2026-10-16T22:00:00Z'));
  await p.goto(base + '/people', { waitUntil: 'networkidle' });
  check('theme dark at night', (await p.getAttribute('html', 'data-theme')) === 'dark');
  await ctx.close();
}
// Language button
{
  const p = await page('/people');
  check('language button says DA', (await p.textContent('#langBtn')) === 'DA');
  await Promise.all([p.waitForURL('**/da/people'), p.click('#langBtn')]);
  check('language button goes to /da/people', clean(p.url()) === '/da/people', p.url());
  check('language remembered', (await p.evaluate(() => localStorage.getItem('vz-lang'))) === 'da');
  check('danish page lang', (await p.getAttribute('html', 'lang')) === 'da');
  check('language button says EN', (await p.textContent('#langBtn')) === 'EN');
  await Promise.all([p.waitForURL((u) => clean(u.href) === '/people'), p.click('#langBtn')]);
  check('language button back to /people', clean(p.url()) === '/people', p.url());
  await p.context().close();
}
// Remembered language wins over the address
{
  const p = await page('/regulation', { lang: 'da' });
  await p.waitForURL('**/da/regulation');
  check('chosen Danish sends /regulation to /da/regulation', clean(p.url()) === '/da/regulation', p.url());
  await p.context().close();
}
// No choice: browser language decides when the location is unknown
{
  const p = await page('/mica', { lang: null, locale: 'da-DK' });
  await p.waitForURL('**/da/mica');
  check('Danish browser goes to /da/mica', clean(p.url()) === '/da/mica', p.url());
  await p.context().close();
  const q = await page('/mica', { lang: null, locale: 'en-US' });
  await q.waitForTimeout(500);
  check('English browser stays on /mica', clean(q.url()) === '/mica', q.url());
  await q.context().close();
}
// Email
{
  const p = await page('/');
  const href = await p.getAttribute('footer a', 'href');
  const text = await p.textContent('footer a');
  check('email link shown', href === 'mailto:' + ['hello', 'vizory.dk'].join('@') && text === ['hello', 'vizory.dk'].join('@'), `${href} ${text}`);
  check('email visible', await p.isVisible('footer a'));
  const html = await (await fetch(base + '/')).text();
  check('email not in page source', !html.includes(['hello', 'vizory.dk'].join('@')));
  await p.context().close();
}
// Front page: acts
{
  const p = await page('/');
  await p.click('button[data-act="MiCAR"]');
  // The open act's description is the only visible block in #actInfo.
  const openAct = p.locator('#actInfo > [data-act]:visible');
  check('act opens', (await openAct.count()) === 1 && (await openAct.getAttribute('data-act')) === 'MiCAR');
  check('act expanded', (await p.getAttribute('button[data-act="MiCAR"]', 'aria-expanded')) === 'true');
  check('act link to guide', (await openAct.locator('a').getAttribute('href')) === '/mica');
  await p.click('button[data-act="PSR"]');
  check('other act replaces it', (await openAct.count()) === 1 && (await openAct.getAttribute('data-act')) === 'PSR');
  await p.click('button[data-act="PSR"]');
  check('act closes on second tap', (await openAct.count()) === 0);
  await p.click('button[data-act="AMLR"]');
  await p.keyboard.press('Escape');
  check('act closes on Escape', (await openAct.count()) === 0);
  await p.context().close();
  const d = await page('/da', { lang: 'da' });
  await d.click('button[data-act="MiCAR"]');
  check('danish act link', (await d.locator('#actInfo > [data-act]:visible a').getAttribute('href')) === '/da/mica');
  await d.context().close();
}
// Regulation menu marks the current page
{
  const p = await page('/mica-qa');
  check('reg menu marks current', (await p.getAttribute('main nav a[aria-current="page"]', 'href')) === '/mica-qa');
  check('header marks regulation', (await p.getAttribute('#regBtn', 'aria-current')) === 'page');
  await p.context().close();
}
// ESMA Q&A
{
  const p = await page('/mica-qa', { theme: 'light', viewport: PHONE });
  const qa = p.locator('details[name="qa"]');
  check('Q&As listed', (await qa.count()) === 46, String(await qa.count()));
  await qa.nth(0).locator('summary').click();
  await qa.nth(1).locator('summary').click();
  check('one Q&A open at a time', (await p.locator('details[name="qa"][open]').count()) === 1);
  // The topics are in the shared contents bar (ContentsBar), as on the guides.
  const bar = p.locator('[data-contents-bar] button');
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(200);
  check('topic bar hidden at the top', !(await bar.isVisible()));
  const second = await p.locator('section > h2').nth(1).getAttribute('id');
  await p.evaluate((id) => document.getElementById(id).scrollIntoView(), second);
  await p.waitForTimeout(200);
  check('topic bar sticks further down', await bar.isVisible());
  await bar.click();
  check('topic menu opens', await p.isVisible('#contents-menu'));
  check('topic bar expanded', (await bar.getAttribute('aria-expanded')) === 'true');
  check('menu marks topic', (await p.locator('#contents-menu a[aria-current]').getAttribute('href')) === `#${second}`);
  check('topic menu titled Contents, no counts', (await bar.innerText()).startsWith('Contents') && (await p.locator('#contents-menu li span').count()) === 0);
  await p.keyboard.press('Escape');
  check('topic menu closes on Escape', !(await p.isVisible('#contents-menu')));
  check('focus back on topic bar', await bar.evaluate((b) => document.activeElement === b));
  await bar.click();
  const target = await p.locator('#contents-menu a').nth(2).getAttribute('href');
  await p.locator('#contents-menu a').nth(2).click();
  await p.waitForTimeout(200);
  check('menu link jumps to topic', new URL(p.url()).hash === target, p.url());
  check('menu closes after jump', !(await p.isVisible('#contents-menu')));
  await bar.click();
  await p.mouse.click(5, 400);
  check('menu closes on outside click', !(await p.isVisible('#contents-menu')));
  await p.context().close();
}
// The guides' contents bar (phones and tablets upright): hidden at the top, sticks once the
// contents are passed, names the section being read, and its menu jumps to a section with the
// heading clear of the bar.
{
  const p = await page('/mica', { theme: 'light', viewport: PHONE });
  const bar = p.locator('[data-contents-bar] button');
  check('contents bar hidden at the top', !(await bar.isVisible()));
  await p.locator('#prudential-requirements').scrollIntoViewIfNeeded();
  await p.evaluate(() => document.getElementById('prudential-requirements').scrollIntoView());
  await p.waitForTimeout(200);
  check('contents bar sticks further down', await bar.isVisible());
  check('contents bar names the section', (await bar.innerText()).includes('Prudential requirements'), await bar.innerText());
  await bar.click();
  check('contents menu opens', await p.isVisible('#contents-menu'));
  await p.keyboard.press('Escape');
  check('contents menu closes on Escape', !(await p.isVisible('#contents-menu')));
  await bar.click();
  await p.locator('#contents-menu a[href="#how-we-help"]').click();
  await p.waitForTimeout(300);
  const top = await p.evaluate(() => document.getElementById('how-we-help').getBoundingClientRect().top);
  check('contents link jumps below the bar', top >= 48 && top <= 80, String(top));
  check('contents menu closes after jump', !(await p.isVisible('#contents-menu')));
  await p.context().close();
}
// From 900px the top-level sections are in the left menu instead of the bar, with the wordmark
// on top: the menu stays in view and marks the section being read (inside a subsection, the
// section it belongs to).
{
  const p = await page('/mica', { theme: 'light' });
  const side = p.locator('[data-side-sections]');
  check('no contents bar on a wide screen', !(await p.locator('[data-contents-bar] button').isVisible()));
  check('sections in the left menu', await side.isVisible());
  check('no subsections in the left menu', (await side.locator('a[href="#prudential-requirements"]').count()) === 0);
  check('wordmark in the left menu, not the header', await p.locator('[data-reg-mark] a').isVisible() && !(await p.locator('header a[aria-label="vizory, front page"]').isVisible()));
  await p.evaluate(() => document.getElementById('prudential-requirements').scrollIntoView());
  await p.waitForTimeout(300);
  // Scrolled: the wordmark stops near the top and the menu sits just below it; the address shows.
  const pos = await p.evaluate(() => {
    const nav = document.querySelector('[data-reg-nav]'), top = (el) => el.getBoundingClientRect().top;
    return { mark: top(document.querySelector('[data-reg-mark] a')), menu: top(nav.querySelector('p a[href="/regulation"]')), mail: document.querySelector('[data-reg-address] a[href^="mailto:"]')?.checkVisibility() };
  });
  check('wordmark stays at the top of the left menu', pos.mark >= 0 && pos.mark < 40, JSON.stringify(pos));
  check('menu rises to just below the wordmark', pos.menu - pos.mark > 20 && pos.menu - pos.mark < 60, JSON.stringify(pos));
  check('address in the left menu, footer left out', pos.mail === true && !(await p.locator('footer').isVisible()));
  check('address at the bottom of the screen', await p.evaluate(() => Math.round(innerHeight - document.querySelector('[data-reg-address]').getBoundingClientRect().bottom) === 24));
  check('left menu marks the section of a subsection', (await side.locator('a[aria-current]').getAttribute('href')) === '#what-an-application-for-casp-authorisation-must-contain');
  check('header buttons still work beside the menu', await p.evaluate(() => { const b = document.getElementById('peopleBtn').getBoundingClientRect(); return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest('#peopleBtn') !== null; }) || (await p.evaluate(() => document.getElementById('peopleBtn').getBoundingClientRect().bottom)) < 0);
  await side.locator('a[href="#how-we-help"]').click();
  await p.waitForTimeout(300);
  const top = await p.evaluate(() => document.getElementById('how-we-help').getBoundingClientRect().top);
  check('left menu link jumps to the section', top >= 48 && top <= 80, String(top));
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(300);
  check('last section marked at the end of the page', (await side.locator('a[aria-current]').getAttribute('href')) === '#questions-and-answers');
  await p.context().close();
  const q = await page('/mica-qa', { theme: 'light' });
  check('Q&A topics in the left menu, no counts', (await q.locator('[data-side-sections] li').count()) === (await q.locator('section > h2').count()) && (await q.locator('[data-side-sections] li span').count()) === 0);
  check('Q&A contents titled Contents, no counts', (await q.locator('nav.toc .toc-title').innerText()) === 'Contents' && (await q.locator('nav.toc li span').count()) === 0);
  await q.context().close();
}
// The wordmark glides between pages as a view transition named "wordmark", which the browser skips
// if two rendered elements carry the name: exactly one on every page, wide and on a phone.
for (const viewport of [undefined, PHONE]) {
  const p = await page('/', { viewport });
  const counts = [];
  for (const path of ['/', '/people', '/regulation', '/mica', '/mica-qa', '/payments', '/aml', '/stablecoins', '/dlt']) {
    await p.goto(base + path, { waitUntil: 'networkidle' });
    counts.push(await p.evaluate(() => [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).viewTransitionName === 'wordmark' && e.checkVisibility()).length));
  }
  check(`one wordmark to glide on every page (${viewport ? 'phone' : 'wide'})`, counts.every((n) => n === 1), counts.join(' '));
  await p.context().close();
}
// Links between pages of the same language navigate without a full page load, and the header
// marks the new section.
{
  const p = await page('/');
  await p.evaluate(() => { window.__sameDocument = true; });
  await Promise.all([p.waitForURL('**/people'), p.click('#peopleBtn')]);
  check('people link loads without full reload', await p.evaluate(() => window.__sameDocument === true));
  check('header marks people', (await p.getAttribute('#peopleBtn', 'aria-current')) === 'page');
  await Promise.all([p.waitForURL('**/regulation'), p.click('#regBtn')]);
  await Promise.all([p.waitForURL('**/mica'), p.click('main nav a[href="/mica"]')]);
  check('reg menu link loads without full reload', await p.evaluate(() => window.__sameDocument === true));
  check('title follows the page', (await p.title()).startsWith('MiCA licence (CASP authorisation)'));
  check('header marks regulation after navigation', (await p.getAttribute('#regBtn', 'aria-current')) === 'page' && !(await p.getAttribute('#peopleBtn', 'aria-current')));
  // From 900px the regulation pages carry the wordmark in the left menu.
  await Promise.all([p.waitForURL((u) => clean(u.href) === '/'), p.click('[data-reg-mark] a')]);
  check('wordmark leaves the header on the front page', (await p.locator('header a[aria-label="vizory, front page"]').count()) === 0);
  await p.context().close();
}
// Location lookup
{
  const r = await fetch(base + '/api/geo');
  const j = await r.json();
  check('/api/geo answers', r.ok && 'country' in j);
  check('/api/geo not cached', (r.headers.get('cache-control') || '').includes('no-store'));
}

await browser.close();
console.log(failed ? `${failed} check(s) failed` : 'all checks passed');
process.exitCode = failed ? 1 : 0;
