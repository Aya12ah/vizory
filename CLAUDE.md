# Working in this repository

- Push changes directly to `main`. Do not open pull requests unless Danny asks for one.
- Every push to `main` deploys to production on Vercel, so check a change before pushing: `npm run lint && npm run typecheck && npm run build` must pass. For a change that should not alter the look, also run the parity check (below).
- Danny is not technical in GitHub: explain results in plain Danish, without Git jargon.
- Keep the email address out of the repository as plain text (it is assembled in the browser by `src/components/Mail.tsx`).
- The site is Next.js (App Router) with React, TypeScript and Tailwind. Every page is static HTML built at deploy time.
- Each page exists in English (`/people`) and Danish (`/da/people`). Both languages' texts sit side by side in the code (`{ en: …, da: … }`), and the Danish dictionary must have every key the English one has (`src/i18n/dictionary.ts`).
- A new page needs: an entry in `src/site.ts` (titles, descriptions; this also puts it in the sitemap), a view in `src/views/`, and a two-line `page.tsx` in both `src/app/(en)/<path>/` and `src/app/(da)/da/<path>/`.
- Styling: Tailwind classes using the Vizory tokens from `src/styles/globals.css` (colours like `text-ink-soft`, `bg-signal`; spacing on Tailwind's 4px scale; `phone:` up to 720px, `wide:` from 900px). Do not add Tailwind's default colours or change the design: there is no preflight reset on purpose. `src/styles/vizory.css` holds the tokens, base rules and the typography of the long reading pages (`.doc`, `.toc`).
- The MiCA guide is Markdown: `src/content/mica.en.mdx` and `src/content/mica.da.mdx`. Headings that the table of contents links to keep their fixed `id`.
- The ESMA Q&A page is built from `data/esma-mica-qa.json` at build time. The data comes from the text of ESMA's PDF export (MiCA filter) via `python3 tools/esma-qa-from-text.py <file.txt>`; commit the JSON and the page follows.
- Parity check (`tools/parity/`): `parity.mjs capture <url|dir> <out>` takes screenshots and head tags of every page, `parity.mjs compare <baseline> <run1> <run2>` compares them; `behaviour.mjs <url>` checks theme, language, email, the act list and the Q&A menu. Capture a baseline from the current production build before a visual refactor.
