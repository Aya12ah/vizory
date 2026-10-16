# Vizory

Website for Vizory, a Copenhagen advisory for authorisations, compliance and the dialogue with regulators in payments, crypto-assets, DLT-based capital markets and AML/CFT.

## Status

Five pages, each in English and Danish: the front page (`/`, `/da`), People, Regulation, the MiCA guide and ESMA's Q&As on MiCA.

- Next.js (App Router), React, TypeScript, Tailwind CSS (via PostCSS). Every page is prerendered as static HTML.
- Fresh theme from the Vizory design system. Light from 07:00 to 19:00 on the visitor's clock, dark otherwise, with a toggle that is remembered.
- English and Danish live at separate addresses (`/` and `/da`), so search engines index both. Each page carries only its own language; the texts for both sit side by side in the code.
- Visitors in Denmark, Greenland and the Faroe Islands who land on an English page are sent to the Danish one (`/api/geo` reads the country from Vercel). The visitor's own choice in the header wins and is remembered.
- SEO: titles, descriptions, canonical and hreflang links, social preview images (`public/og.png`, `public/og-da.png`), structured data, and a generated `sitemap.xml` and `robots.txt`, all from the list of pages in `src/site.ts`.
- The font, Space Grotesk, is downloaded from Google Fonts at build time by `next/font` and served from vizory.dk, so visitors' browsers never contact Google.
- Vercel Web Analytics and Speed Insights (both cookieless) measure visits and real-user performance.
- Moving between pages of the same language uses `next/link` (prefetched, no full reload) with a short fade (React `<ViewTransition>`); none for visitors who prefer reduced motion.
- The footer email address is assembled in the browser, so it is not in the page source as plain text.

The planned sitemap is in [docs/sitemap.md](docs/sitemap.md).

## Layout

```
src/app/(en)/…          English routes (/ , /people, …), one root layout with <html lang="en">
src/app/(da)/da/…       Danish routes (/da, /da/people, …), root layout with <html lang="da">
src/app/api/geo         visitor's country, for the language choice
src/views/              the pages, shared by both languages
src/components/         header, footer, menus and the interactive parts
src/content/            the MiCA guide in Markdown (MDX), one file per language
src/i18n/               languages, paths and the shared dictionary
src/lib/                structured data and the ESMA Q&A data
src/site.ts             every page with its titles and descriptions
src/styles/             Tailwind theme with the Vizory tokens, and the base stylesheet
data/                   ESMA Q&A data
tools/                  ESMA PDF-text converter, parity and behaviour checks
```

## Run locally

```
npm install
npm run dev        # http://localhost:3000
npm run lint && npm run typecheck && npm run build
```

## Deploy

Hosted on Vercel; `vercel.json` selects the Next.js framework. Every push to `main` deploys.
