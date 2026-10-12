#!/usr/bin/env python3
"""Turn the text of ESMA's Q&A PDF export into data/esma-mica-qa.json.

ESMA's Q&A tool exports the Q&As for a legal act as a PDF ("View PDF" with the MiCA filter on).
Convert it to text (pdftotext, or any PDF reader) and run:  python3 tools/esma-qa-from-text.py export.txt
The PDF text has lost its layout, so this script rebuilds paragraphs, footnotes and hyphenated
words as well as it can. The page links every Q&A to ESMA's own version.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'esma-mica-qa.json')
LABELS = {'Submission Date', 'Additional Information', 'Level 1 Regulation', 'Topic',
          'Additional Legal Reference', 'Subject Matter', 'Question'}
# Words that can stand before a number in the running text ("Article 60 of", "Class 2 and").
NUM_OK = {'article', 'articles', 'paragraph', 'paragraphs', 'recital', 'recitals', 'class', 'annex',
          'and', 'or', 'least', 'to', 'title', 'point', 'points', 'level', 'of', 'within', 'than',
          'after', 'for', 'chapter', 'section', 'tier', 'step', 'phase', 'from', 'until', 'by', 'next', 'first', 'last'}


def dehyphenate(text, hyphenated):
    # pdftotext joins words split over a line ("crypto-" + "asset" -> "cryptoasset"); put the hyphen back
    # when the hyphenated form occurs elsewhere in the export.
    def fix(m):
        w = m.group(0)
        return hyphenated.get(w.lower(), w) if w.lower() in hyphenated else w
    return re.sub(r"[A-Za-z]{6,}", fix, text) if hyphenated else text


def stray_numbers(text):
    # Page numbers and lost footnote marks land between words: "is 5 specifically".
    def fix(m):
        return m.group(0) if m.group(1).lower() in NUM_OK else m.group(1) + ' ' + m.group(3)
    return re.sub(r"\b([A-Za-z]+) (\d{1,2}) ([a-z]+)", fix, text)


def paragraphs(lines):
    paras, cur = [], []
    for raw in lines:
        l = raw.strip()
        if not l or l == 'Original language':
            continue
        starts_item = re.match(r"^(\(?[a-z]{1,4}[\.\)]|\(?\d{1,2}\)|[•\-–] )\s", l)
        if l == 'Answer provided by the European Commission':
            if cur: paras.append(' '.join(cur)); cur = []
            paras.append(l); continue
        if cur and (starts_item or (re.search(r"[\.:\?;](\s*\d{0,2})$", cur[-1]) and len(cur[-1]) < 74)):
            paras.append(' '.join(cur)); cur = []
        cur.append(l)
    if cur: paras.append(' '.join(cur))
    return paras


def split_footnotes(lines):
    # Footnotes sit at the end of the answer as "1.Text" lines, possibly wrapped.
    notes, body = [], list(lines)
    i = len(body)
    start = None
    for j in range(len(body) - 1, -1, -1):
        if re.match(r"^1\.\S", body[j].strip()):
            start = j; break
    if start is None:
        return body, notes
    cur = None
    for l in body[start:]:
        m = re.match(r"^(\d{1,2})\.(\S.*)$", l.strip())
        if m and (cur is None or int(m.group(1)) == cur[0] + 1):
            cur = [int(m.group(1)), m.group(2)]; notes.append(cur)
        elif cur and l.strip():
            cur[1] += ' ' + l.strip()
    return body[:start], [n[1] for n in notes]


def mark_footnotes(text, count):
    if not count: return text
    def fix(m):
        n = int(m.group(2))
        return m.group(1) + '[[fn%d]]' % n if 1 <= n <= count else m.group(0)
    return re.sub(r"([\.\,;:\)a-z’”])\s?(\d{1,2})(?=[\s\.\,;]|$)", fix, text)


def parse(text):
    # \x02 is how the export writes a hyphen at a line break ("crypto\x02asset").
    text = text.replace('\r', '').replace('\f', '\n').replace('\x02', '-').replace('\u00ad', '-')
    # Different PDF-to-text tools differ in blank lines and trailing spaces; neither carries meaning here.
    text = '\n'.join(l.strip() for l in text.split('\n') if l.strip())
    hyph = {w.replace('-', '').lower(): w for w in re.findall(r"\b[A-Za-z]+-[A-Za-z]+\b", text)}
    blocks = re.split(r"\n(?=ESMA_QA_\d+\n(?:Submission Date))", text)
    items = []
    for b in blocks:
        lines = b.split('\n')
        m = re.match(r"^ESMA_QA_(\d+)$", lines[0].strip())
        if not m or len(lines) < 4 or lines[1].strip() != 'Submission Date':
            continue
        qa = {'id': 'ESMA_QA_' + m.group(1), 'number': int(m.group(1)),
              'url': 'https://www.esma.europa.eu/publications-data/questions-answers/' + m.group(1)}
        i, field = 1, None
        meta = {}
        while i < len(lines) and lines[i].strip() != 'Question':
            l = lines[i].strip(); i += 1
            if l.startswith('Status:'):
                meta['status'] = l.split(':', 1)[1].strip(); field = None
            elif l in LABELS:
                field = l
            elif l and field:
                meta[field] = (meta.get(field, '') + ' ' + l).strip()
        qa['submitted'] = meta.get('Submission Date', '')
        qa['status'] = meta.get('status', '')
        qa['topic'] = meta.get('Topic', '')
        qa['legal_reference'] = meta.get('Additional Legal Reference', '')
        qa['subject'] = dehyphenate(meta.get('Subject Matter', ''), hyph)
        rest = lines[i + 1:]
        if 'ESMA Answer' in [l.strip() for l in rest]:
            k = [l.strip() for l in rest].index('ESMA Answer')
            qlines, alines = rest[:k], rest[k + 1:]
        else:
            qlines, alines = rest, []
        qa['question'] = [stray_numbers(dehyphenate(p, hyph)) for p in paragraphs(qlines)]
        qa['answered'] = ''
        qa['answer'], qa['footnotes'], qa['disclaimer'] = [], [], []
        if alines:
            while alines and not alines[0].strip(): alines.pop(0)
            if alines and re.match(r"^\d{2}-\d{2}-\d{4}$", alines[0].strip()):
                qa['answered'] = alines.pop(0).strip().replace('-', '/')
            dis = [l.strip() for l in alines].index('Disclaimer:') if 'Disclaimer:' in [l.strip() for l in alines] else None
            if dis is not None:
                qa['disclaimer'] = [' '.join(l.strip() for l in alines[dis + 1:] if l.strip())]
                alines = alines[:dis]
            body, notes = split_footnotes(alines)
            qa['footnotes'] = [stray_numbers(dehyphenate(n, hyph)) for n in notes]
            qa['answer'] = [mark_footnotes(stray_numbers(dehyphenate(p, hyph)), len(notes)) for p in paragraphs(body)]
        items.append(qa)
    return items


if __name__ == '__main__':
    src = sys.argv[1]
    m = re.search(r"Download date: (.+)", open(src, encoding='utf-8').read())
    items = parse(open(src, encoding='utf-8').read())
    data = {'source': 'ESMA Q&A tool, legal act MiCA', 'downloaded': m.group(1).strip() if m else '', 'items': items}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(len(items), 'Q&As written to', os.path.relpath(OUT, ROOT))
