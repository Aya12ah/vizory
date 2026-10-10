# Vizory

Website for Vizory, a Copenhagen advisory for authorisations, compliance and the dialogue with regulators in payments, crypto-assets, DLT-based capital markets and AML/CFT.

## Status

MVP: the front page only (`index.html`). One static file, no build step.

- Fresh theme from the Vizory design system (light and dark, follows the system setting, with a toggle).
- English and Danish. On Vercel, visitors in Denmark, Greenland and the Faroe Islands get Danish and everyone else English (`api/geo.js` reads the visitor's country). Opened locally, the browser language decides. Visitors can always switch in the header.
- The footer email address is assembled by script, so it is not in the page source as plain text.

The planned sitemap is in [docs/sitemap.md](docs/sitemap.md).

## Deploy

Hosted on Vercel: import this repository as a new project with the default settings (no framework, no build command). Every push to `main` deploys.

## Run locally

Open `index.html` in a browser, or run `vercel dev` to include the location lookup.
