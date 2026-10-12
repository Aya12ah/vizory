# Vizory

Website for Vizory, a Copenhagen advisory for authorisations, compliance and the dialogue with regulators in payments, crypto-assets, DLT-based capital markets and AML/CFT.

## Status

Two pages, each in English and Danish: the front page (`index.html`, Danish at `da/index.html`) and People (`people/index.html`, Danish at `da/people/index.html`). Styles in `styles.css`, scripts in `script.js`. Static files, no build step on Vercel.

- Fresh theme from the Vizory design system. Light from 07:00 to 19:00 on the visitor's clock, dark otherwise, with a toggle that is remembered.
- English and Danish live at separate addresses (`/` and `/da`), so search engines index both. Both languages sit in the markup of every page.
- **The Danish pages are generated.** Edit the English page, then run `python3 tools/build-da.py` to rebuild `da/`. Danish titles and descriptions live in that script.
- On Vercel, visitors in Denmark, Greenland and the Faroe Islands who land on an English page are sent to the Danish one (`api/geo.js` reads the country). The visitor's own choice in the header wins and is remembered.
- SEO: titles, descriptions, canonical and hreflang links, social preview images (`og.png`, `og-da.png`), structured data, `sitemap.xml` and `robots.txt`.
- The footer email address is assembled by script, so it is not in the page source as plain text.

The planned sitemap is in [docs/sitemap.md](docs/sitemap.md).

## Deploy

Hosted on Vercel: import this repository as a new project with the default settings (no framework, no build command). Every push to `main` deploys.

## Run locally

Open `index.html` in a browser, or run `vercel dev` to include the location lookup.
