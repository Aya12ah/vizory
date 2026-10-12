#!/usr/bin/env python3
"""Build the Danish pages (da/index.html, da/people/index.html, da/mica/index.html, da/regulation/index.html, da/mica-qa/index.html) from the English ones.

The English pages are the source. Both languages already sit in the markup; this script only
changes what differs per address: language, title, description, links and canonical URL.
Run it after every change to index.html, people/index.html, mica/index.html, regulation/index.html or mica-qa/index.html:  python3 tools/build-da.py
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

COMMON = [
    ('<html lang="en" data-lang="en">', '<html lang="da" data-lang="da">'),
    ('<meta property="og:locale" content="en_GB">\n<meta property="og:locale:alternate" content="da_DK">',
     '<meta property="og:locale" content="da_DK">\n<meta property="og:locale:alternate" content="en_GB">'),
    ('content="https://vizory.dk/og.png"', 'content="https://vizory.dk/og-da.png"'),
    ('href="/people"', 'href="/da/people"'),
    ('aria-label="People"', 'aria-label="Mennesker"'),
    ('href="/regulation"', 'href="/da/regulation"'),
    ('aria-label="Regulation"', 'aria-label="Regulering"'),
    ('aria-label="Skift til dansk">DA</button>', 'aria-label="Switch to English">EN</button>'),
]

PAGES = {
    'index.html': ('da/index.html', [
        ('<title>Vizory · Financial compliance advisory in Copenhagen</title>',
         '<title>Vizory · Compliance-rådgivning til finansielle virksomheder i København</title>'),
        ('<meta property="og:title" content="Vizory · Financial compliance advisory in Copenhagen">',
         '<meta property="og:title" content="Vizory · Compliance-rådgivning til finansielle virksomheder i København">'),
        ('content="Compliance advisory for financial firms in payments, crypto-assets (MiCAR), DLT-based capital markets and AML: applications, frameworks, mock-inspections and dialogue with national competent authorities."',
         'content="Rådgivning til finansielle virksomheder inden for betalinger, kryptoaktiver (MiCAR), DLT-baserede kapitalmarkeder og hvidvask: ansøgninger, compliance frameworks, mock-inspektioner og dialog med nationale kompetente myndigheder."'),
        ('<link rel="canonical" href="https://vizory.dk/">', '<link rel="canonical" href="https://vizory.dk/da">'),
        ('<meta property="og:url" content="https://vizory.dk/">', '<meta property="og:url" content="https://vizory.dk/da">'),
    ]),
    'people/index.html': ('da/people/index.html', [
        ('<title>People · Vizory</title>', '<title>Mennesker · Vizory</title>'),
        ('<meta property="og:title" content="People · Vizory">', '<meta property="og:title" content="Mennesker · Vizory">'),
        ('content="Danny Dehghani spent nine years at the Danish FSA working on fintech, crypto-assets, payments and DLT, and negotiated MiCA on Denmark\'s behalf."',
         'content="Danny Dehghani har ni års erfaring fra Finanstilsynet med fintech, kryptoaktiver, betalinger og DLT og har forhandlet MiCA på Danmarks vegne."'),
        ('<link rel="canonical" href="https://vizory.dk/people">', '<link rel="canonical" href="https://vizory.dk/da/people">'),
        ('<meta property="og:url" content="https://vizory.dk/people">', '<meta property="og:url" content="https://vizory.dk/da/people">'),
        ('<a class="wm wm-sm" href="/" aria-label="vizory, front page">', '<a class="wm wm-sm" href="/da" aria-label="vizory, forside">'),
    ]),
    'mica/index.html': ('da/mica/index.html', [
        ('<title>MiCA and CASP authorisation: application, compliance and governance · Vizory</title>',
         '<title>MiCA og CASP-tilladelse: ansøgning, compliance og governance · Vizory</title>'),
        ('<meta property="og:title" content="MiCA and CASP authorisation: application, compliance and governance · Vizory">',
         '<meta property="og:title" content="MiCA og CASP-tilladelse: ansøgning, compliance og governance · Vizory">'),
        ('content="What an application for CASP authorisation under MiCA must contain, how the Danish FSA assesses it, and the compliance and governance requirements that apply afterwards."',
         'content="Hvad en ansøgning om CASP-tilladelse efter MiCA skal indeholde, hvordan Finanstilsynet behandler den, og hvilke krav til compliance og governance der gælder bagefter."'),
        ('<link rel="canonical" href="https://vizory.dk/mica">', '<link rel="canonical" href="https://vizory.dk/da/mica">'),
        ('<meta property="og:url" content="https://vizory.dk/mica">', '<meta property="og:url" content="https://vizory.dk/da/mica">'),
        ('"@id": "https://vizory.dk/mica#page", "url": "https://vizory.dk/mica", "name": "MiCA and CASP authorisation"',
         '"@id": "https://vizory.dk/da/mica#page", "url": "https://vizory.dk/da/mica", "name": "MiCA og CASP-tilladelse", "inLanguage": "da"'),
        ('<a class="wm wm-sm" href="/" aria-label="vizory, front page">', '<a class="wm wm-sm" href="/da" aria-label="vizory, forside">'),
        ('href="/mica"', 'href="/da/mica"'),
        ('href="/mica-qa"', 'href="/da/mica-qa"'),
    ]),
    'regulation/index.html': ('da/regulation/index.html', [
        ('<title>Regulation · Vizory</title>', '<title>Regulering · Vizory</title>'),
        ('<meta property="og:title" content="Regulation · Vizory">', '<meta property="og:title" content="Regulering · Vizory">'),
        ('content="Guides to EU financial regulation from Vizory, starting with MiCA and CASP authorisation."',
         'content="Vejledninger om EU\'s finansielle regulering fra Vizory, begyndende med MiCA og CASP-tilladelse."'),
        ('<link rel="canonical" href="https://vizory.dk/regulation">', '<link rel="canonical" href="https://vizory.dk/da/regulation">'),
        ('<meta property="og:url" content="https://vizory.dk/regulation">', '<meta property="og:url" content="https://vizory.dk/da/regulation">'),
        ('<a class="wm wm-sm" href="/" aria-label="vizory, front page">', '<a class="wm wm-sm" href="/da" aria-label="vizory, forside">'),
        ('href="/mica"', 'href="/da/mica"'),
        ('href="/mica-qa"', 'href="/da/mica-qa"'),
    ]),
    'mica-qa/index.html': ('da/mica-qa/index.html', [
        ('<title>ESMA Q&amp;As on MiCA · Vizory</title>', '<title>ESMA&#39;s spørgsmål og svar om MiCA · Vizory</title>'),
        ('<meta property="og:title" content="ESMA Q&amp;As on MiCA · Vizory">', '<meta property="og:title" content="ESMA&#39;s spørgsmål og svar om MiCA · Vizory">'),
        ('content="All questions and answers on MiCA published by ESMA, grouped by topic, with links to ESMA&#39;s own versions."',
         'content="Alle spørgsmål og svar om MiCA, som ESMA har offentliggjort, sorteret efter emne og med links til ESMA&#39;s egne versioner."'),
        ('<link rel="canonical" href="https://vizory.dk/mica-qa">', '<link rel="canonical" href="https://vizory.dk/da/mica-qa">'),
        ('<meta property="og:url" content="https://vizory.dk/mica-qa">', '<meta property="og:url" content="https://vizory.dk/da/mica-qa">'),
        ('<a class="wm wm-sm" href="/" aria-label="vizory, front page">', '<a class="wm wm-sm" href="/da" aria-label="vizory, forside">'),
        ('href="/mica"', 'href="/da/mica"'),
        ('href="/mica-qa"', 'href="/da/mica-qa"'),
    ]),
}

for src, (dst, pairs) in PAGES.items():
    html = open(os.path.join(ROOT, src), encoding='utf-8').read()
    for old, new in pairs + COMMON:
        n = html.count(old)
        if n == 0:
            raise SystemExit(f'{src}: could not find {old[:70]!r}. Update tools/build-da.py.')
        html = html.replace(old, new)
    html = html.replace('<!doctype html>', '<!doctype html>\n<!-- Generated from ' + src + ' by tools/build-da.py. Edit the English page and rerun the script. -->', 1)
    out = os.path.join(ROOT, dst)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(html)
    print('wrote', dst)
