#!/usr/bin/env python3
"""Build mica-qa/index.html (ESMA's Q&As on MiCA) from data/esma-mica-qa.json.

Run after the data changes, then run tools/build-da.py for the Danish page:
  python3 tools/build-esma-qa.py && python3 tools/build-da.py
The page frame (head, header, footer) is taken from mica/index.html, so the pages stay alike.
"""
import html, json, os, re
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, 'data', 'esma-mica-qa.json'), encoding='utf-8'))
frame = open(os.path.join(ROOT, 'mica', 'index.html'), encoding='utf-8').read()

T = 'ESMA Q&amp;As on MiCA · Vizory'
D = 'All questions and answers on MiCA published by ESMA, grouped by topic, with links to ESMA&#39;s own versions.'
STATUS = {'Published Answer Updated': ('Answer updated', 'Svar opdateret'),
          'Question Published': ('Not answered yet', 'Ikke besvaret endnu')}


def esc(t):
    return html.escape(t, quote=False)


def para(t):
    t = esc(t)
    return re.sub(r'\[\[fn(\d+)\]\]', r'<sup>\1</sup>', t)


def sort_key(q):
    d = q['answered'] or q['submitted']
    dd, mm, yy = d.split('/') if d.count('/') == 2 else ('0', '0', '0')
    return (yy, mm, dd, q['number'])


def bi(en, da, tag='span'):
    return f'<{tag} class="en">{en}</{tag}><{tag} class="da" lang="da">{da}</{tag}>'


topics = OrderedDict()
for q in sorted(data['items'], key=sort_key, reverse=True):
    topics.setdefault(q['topic'] or 'Other', []).append(q)
topics = OrderedDict(sorted(topics.items(), key=lambda kv: -len(kv[1])))

dl = data['downloaded']
m = re.search(r'(\w+) (\d+), (\d{4})', dl)
months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
mda = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december']
date_en = f'{int(m.group(2))} {m.group(1)} {m.group(3)}' if m else dl
date_da = f'{int(m.group(2))}. {mda[months.index(m.group(1))]} {m.group(3)}' if m else dl

o = []
o.append('      <article class="doc qa-page">')
o.append('        <h1 class="page-title">' + bi('ESMA Q&amp;As on MiCA', 'ESMA&#39;s spørgsmål og svar om MiCA') + '</h1>')
o.append('        <p class="lede en">The questions and answers on MiCA that ESMA has published, grouped by topic with the newest first. ESMA publishes its Q&amp;As in English only.</p>')
o.append('        <p class="lede da" lang="da">De spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne med de nyeste først. ESMA offentliggør kun spørgsmål og svar på engelsk.</p>')
o.append(f'        <p class="qa-source en">Source: ESMA. This page was drafted using material downloaded from ESMA&#39;s website (ESMA&#39;s Q&amp;A tool, {len(data["items"])} Q&amp;As as of {date_en}). The layout has been rebuilt from ESMA&#39;s PDF export; each Q&amp;A links to ESMA&#39;s own version, which is the authoritative text.</p>')
o.append(f'        <p class="qa-source da" lang="da">Kilde: ESMA. Siden er udarbejdet med materiale hentet fra ESMA&#39;s hjemmeside (ESMA&#39;s Q&amp;A-værktøj, {len(data["items"])} spørgsmål og svar pr. {date_da}). Opsætningen er genskabt fra ESMA&#39;s PDF-udtræk; hvert spørgsmål linker til ESMA&#39;s egen version, som er den gældende tekst.</p>')
o.append('        <nav class="toc" aria-label="Topics">')
o.append('          ' + bi('Topics', 'Emner', 'p').replace('<p class="en">', '<p class="toc-title en">').replace('<p class="da"', '<p class="toc-title da"'))
o.append('          <ol>')
for t, qs in topics.items():
    o.append(f'            <li><a href="#{re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")}" lang="en">{esc(t)}</a> <span class="qa-count">{len(qs)}</span></li>')
o.append('          </ol>')
o.append('        </nav>')
for t, qs in topics.items():
    tid = re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')
    o.append(f'        <h2 id="{tid}" lang="en">{esc(t)}</h2>')
    for q in qs:
        o.append(f'        <details class="qa" id="{q["id"].lower().replace("_", "-")}" lang="en">')
        st = STATUS.get(q['status'])
        meta = [esc(q['id'])]
        if q['answered']: meta.append(esc(q['answered']))
        if q['legal_reference']: meta.append(esc(q['legal_reference']))
        stx = (' · ' + bi(*st)) if st else ''
        o.append(f'          <summary><span class="qa-subject">{esc(q["subject"])}</span><span class="qa-meta">{" · ".join(meta)}{stx}</span></summary>')
        o.append('          <div class="qa-body">')
        o.append('            <p class="qa-label">' + bi('Question', 'Spørgsmål') + '</p>')
        for p in q['question']: o.append(f'            <p>{para(p)}</p>')
        if q['answer']:
            o.append('            <p class="qa-label">' + bi('ESMA answer', 'ESMA&#39;s svar') + '</p>')
            for p in q['answer']: o.append(f'            <p>{para(p)}</p>')
        if q['footnotes']:
            o.append('            <ol class="qa-notes">' + ''.join(f'<li>{para(n)}</li>' for n in q['footnotes']) + '</ol>')
        for p in q['disclaimer']: o.append(f'            <p class="qa-disclaimer">{para(p)}</p>')
        o.append(f'            <p><a href="{q["url"]}" rel="noopener">' + bi(f'{esc(q["id"])} on ESMA&#39;s website', f'{esc(q["id"])} på ESMA&#39;s hjemmeside') + '</a></p>')
        o.append('          </div>')
        o.append('        </details>')
o.append('      </article>')

page = frame
page = re.sub(r'<title>.*?</title>', f'<title>{T}</title>', page)
page = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{T}">', page)
page = re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*(">)', lambda mm: mm.group(1) + D + mm.group(2), page)
page = page.replace('https://vizory.dk/mica"', 'https://vizory.dk/mica-qa"').replace('https://vizory.dk/da/mica"', 'https://vizory.dk/da/mica-qa"')
page = re.sub(r'<script type="application/ld\+json">.*?</script>\n', '', page, flags=re.S)
page = re.sub(r'<!-- content -->\n.*?<!-- /content -->', lambda _: '<!-- content -->\n' + '\n'.join(o) + '\n      <!-- /content -->', page, flags=re.S)
os.makedirs(os.path.join(ROOT, 'mica-qa'), exist_ok=True)
open(os.path.join(ROOT, 'mica-qa', 'index.html'), 'w', encoding='utf-8').write(page)
print('wrote mica-qa/index.html with', len(data['items']), 'Q&As')
