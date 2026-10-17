// Visual and SEO parity check: screenshots and head tags for every page, compared with a baseline.
//
//   node tools/parity/parity.mjs capture <base-url|dir> <out-dir>
//   node tools/parity/parity.mjs compare <baseline-dir> <candidate-dir> [<candidate-dir> ...]
//
// A directory is served locally with Vercel's clean URLs (/people -> people/index.html).
// Language and theme are set in localStorage before load, so no redirect or clock decides them,
// and reduced motion stops the blinking cursor, so two runs of the same page are pixel-identical.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const PATHS = ['/', '/people', '/regulation', '/mica', '/mica-qa', '/payments', '/aml', '/stablecoins', '/dlt', '/da', '/da/people', '/da/regulation', '/da/mica', '/da/mica-qa', '/da/payments', '/da/aml', '/da/stablecoins', '/da/dlt'];
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 390, height: 844 } };
const THEMES = ['light', 'dark'];
// Interactive states: a name, the page, what to do before the screenshot, and optionally only some viewports.
const STATES = [
  { name: 'act-open', path: '/', run: (p) => p.click('button[data-act="MiCAR"]') },
  { name: 'qa-open', path: '/mica-qa', run: (p) => p.click('details[name="qa"] summary') },
  { name: 'topic-menu', path: '/mica-qa', viewportOnly: true, viewports: ['mobile'], run: async (p) => { await p.evaluate(() => document.querySelectorAll('section > h2')[1].scrollIntoView()); await p.waitForTimeout(200); await p.click('[data-contents-bar] button'); } },
  { name: 'side-sections', path: '/mica', viewportOnly: true, viewports: ['desktop'], run: async (p) => { await p.evaluate(() => document.getElementById('prudential-requirements').scrollIntoView()); await p.waitForTimeout(300); } },
  { name: 'contents-menu', path: '/mica', viewportOnly: true, viewports: ['mobile'], run: async (p) => { await p.evaluate(() => document.getElementById('prudential-requirements').scrollIntoView()); await p.waitForTimeout(200); await p.click('[data-contents-bar] button'); } },
];

function serve(dir) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (url === '/api/geo') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end('{"country":null}'); }
    const tries = [url, url + '.html', path.join(url, 'index.html')];
    for (const t of tries) {
      const f = path.join(dir, t);
      if (f.startsWith(dir) && fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
        return fs.createReadStream(f).pipe(res);
      }
    }
    res.writeHead(404); res.end();
  });
  return new Promise((resolve) => server.listen(0, () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port })));
}

const slug = (p) => (p === '/' ? 'home' : p.slice(1).replace(/\//g, '_'));

async function head(page) {
  return page.evaluate(() => {
    const attrs = (sel, keys) => [...document.querySelectorAll(sel)].map((e) => Object.fromEntries(keys.map((k) => [k, e.getAttribute(k)])));
    return {
      lang: document.documentElement.lang,
      title: document.title,
      meta: attrs('head meta[name], head meta[property]', ['name', 'property', 'content', 'media'])
        .filter((m) => m.name !== 'viewport' && m.name !== 'next-size-adjust')
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      links: attrs('head link[rel="canonical"], head link[rel="alternate"], head link[rel="icon"], head link[rel="apple-touch-icon"]', ['rel', 'hreflang', 'href', 'type', 'sizes'])
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
      // Visible text in reading order: catches a missing or reworded sentence that a screenshot might hide.
      text: document.body.innerText.replace(/\s+/g, ' ').trim(),
    };
  });
}

async function capture(target, out) {
  let base = target, server;
  if (!/^https?:/.test(target)) ({ server, url: base } = await serve(path.resolve(target)));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const meta = {};
  async function open(p, vp, theme) {
    const ctx = await browser.newContext({ viewport: VIEWPORTS[vp], reducedMotion: 'reduce', locale: 'en-GB', timezoneId: 'UTC' });
    const lang = p.startsWith('/da') ? 'da' : 'en';
    await ctx.addInitScript(([l, t]) => { localStorage.setItem('vz-lang', l); localStorage.setItem('vz-theme', t); }, [lang, theme]);
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // Wait for every web font the page declares (whatever its family name), then for two frames,
    // so text never shows in the fallback font or half-rendered.
    await page.evaluate(async () => {
      await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
      await document.fonts.ready;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    return { ctx, page };
  }
  // Warm-up: the very first page of a run can render text before the web font is fully settled.
  await (await open('/', 'desktop', 'light')).ctx.close();
  for (const p of PATHS) for (const vp of Object.keys(VIEWPORTS)) for (const theme of THEMES) {
    const { ctx, page } = await open(p, vp, theme);
    if (vp === 'desktop' && theme === 'light') meta[p] = await head(page);
    await page.screenshot({ path: path.join(out, `${slug(p)}.${vp}.${theme}.png`), fullPage: true });
    await ctx.close();
  }
  for (const s of STATES) for (const vp of s.viewports || Object.keys(VIEWPORTS)) for (const theme of THEMES) {
    const { ctx, page } = await open(s.path, vp, theme);
    await s.run(page);
    await page.waitForTimeout(100);
    await page.screenshot({ path: path.join(out, `state-${s.name}.${vp}.${theme}.png`), fullPage: !s.viewportOnly });
    await ctx.close();
  }
  fs.writeFileSync(path.join(out, 'head.json'), JSON.stringify(meta, null, 1));
  await browser.close();
  server?.close();
  console.log('captured', fs.readdirSync(out).length, 'files in', out);
}

// A screenshot counts as different only if it differs from the baseline in every candidate run:
// the browser now and then rasterises text on a long page a little differently, and that noise
// does not repeat, while a real change does.
function differs(a, b, f, diffDir) {
  const fb = path.join(b, f);
  if (!fs.existsSync(fb)) return 'missing';
  const A = PNG.sync.read(fs.readFileSync(path.join(a, f)));
  const B = PNG.sync.read(fs.readFileSync(fb));
  if (A.width !== B.width || A.height !== B.height) return `size ${A.width}x${A.height} -> ${B.width}x${B.height}`;
  const D = new PNG({ width: A.width, height: A.height });
  const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0 });
  if (!n) return null;
  fs.mkdirSync(diffDir, { recursive: true });
  fs.writeFileSync(path.join(diffDir, f), PNG.sync.write(D));
  return `${n} pixels differ`;
}

function compare(a, ...runs) {
  let failed = 0;
  const b = runs[0];
  for (const r of runs) fs.rmSync(path.join(r, 'diff'), { recursive: true, force: true });
  for (const f of fs.readdirSync(a).filter((f) => f.endsWith('.png'))) {
    const results = runs.map((r) => differs(a, r, f, path.join(r, 'diff')));
    if (results.every(Boolean)) { console.log(`PIXELS  ${f}: ${results.join(' / ')}`); failed++; }
    else if (results.some(Boolean)) console.log(`noise   ${f}: differs in one run only`);
  }
  const ha = JSON.parse(fs.readFileSync(path.join(a, 'head.json')));
  const hb = JSON.parse(fs.readFileSync(path.join(b, 'head.json')));
  for (const p of Object.keys(ha)) for (const k of Object.keys(ha[p])) {
    const x = JSON.stringify(ha[p][k]), y = JSON.stringify(hb[p]?.[k]);
    if (x === y) continue;
    failed++;
    if (Array.isArray(ha[p][k]) && Array.isArray(hb[p]?.[k])) {
      // Show only the entries that were removed or added.
      const A = ha[p][k].map((e) => JSON.stringify(e)), B = hb[p][k].map((e) => JSON.stringify(e));
      const removed = A.filter((e) => !B.includes(e));
      // Known and accepted: Next.js adds twitter:* tags copied from the Open Graph tags.
      const added = B.filter((e) => !A.includes(e) && !/^\{"name":"twitter:(title|description|image)/.test(e));
      if (!removed.length && !added.length) { failed--; continue; }
      console.log(`HEAD    ${p} ${k}`);
      removed.forEach((e) => console.log('  - ' + e.slice(0, 300)));
      added.forEach((e) => console.log('  + ' + e.slice(0, 300)));
    } else {
      // Text: show where the two first differ.
      let i = 0; while (i < x.length && x[i] === y[i]) i++;
      console.log(`HEAD    ${p} ${k} differs at ${i}\n  was: …${x.slice(Math.max(0, i - 80), i + 120)}\n  now: …${String(y).slice(Math.max(0, i - 80), i + 120)}`);
    }
  }
  console.log(failed ? `${failed} difference(s)` : 'identical');
  process.exitCode = failed ? 1 : 0;
}

const [cmd, x, y] = process.argv.slice(2);
if (cmd === 'capture') await capture(x, y);
else if (cmd === 'compare') compare(x, ...process.argv.slice(4));
else { console.log('usage: parity.mjs capture <url|dir> <out> | compare <baseline> <candidate>'); process.exitCode = 2; }
