import type { ComponentType } from 'react';
import { JsonLd } from '@/components/JsonLd';
import { RegNav, RegSection } from '@/components/RegNav';
import { type TocItem, tocSections } from '@/components/Toc';
import type { Lang } from '@/i18n/lang';
import { DANNY_ID, graph, ORG_ID, regBreadcrumb, webPage } from '@/lib/schema';
import { PAGES, type PageKey } from '@/site';

type Text = Record<Lang, string>;
/** The questions under "Questions and answers" in a guide, for search engines. Keep in step with the MDX. */
export type Faq = Record<Lang, [question: string, answer: string][]>;

/** A guide page under Regulation: the Markdown text with the topic menu, and its structured data. */
export function GuidePage({ lang, page: key, content, toc, name, about, faq }: {
  lang: Lang; page: Extract<PageKey, 'mica' | 'payments' | 'aml' | 'stablecoins'>; content: Record<Lang, ComponentType>; toc: Record<Lang, TocItem[]>; name: Text; about: string[]; faq: Faq;
}) {
  const Content = content[lang];
  const { path, lastModified } = PAGES[key];
  const page = webPage(path, lang, name[lang]);
  return (
    <>
      <JsonLd data={graph(
        // The page is a FAQPage (a kind of WebPage) because it ends with questions and answers.
        {
          ...page, '@type': 'FAQPage', breadcrumb: { '@id': `${page.url}#breadcrumb` }, about,
          mainEntity: faq[lang].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
        { '@type': 'Article', '@id': `${page.url}#article`, headline: name[lang], inLanguage: lang, mainEntityOfPage: { '@id': page['@id'] }, dateModified: lastModified, author: { '@id': DANNY_ID }, publisher: { '@id': ORG_ID } },
        regBreadcrumb(path, lang, name[lang]),
      )} />
        <RegSection>
          <RegNav lang={lang} current={path} sections={tocSections(toc[lang])} />
          <div>
            <article className="doc">
              <Content />
            </article>
          </div>
        </RegSection>
    </>
  );
}
