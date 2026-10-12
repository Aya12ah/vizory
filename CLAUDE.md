# Working in this repository

- Push changes directly to `main`. Do not open pull requests unless Danny asks for one.
- Every push to `main` deploys to production on Vercel, so check a change before pushing.
- Danny is not technical in GitHub: explain results in plain Danish, without Git jargon.
- Keep the email address out of the repository as plain text (it is assembled by script in `index.html`).
- The Danish pages in `da/` are generated from the English ones. After changing `index.html`, `people/index.html`, `mica/index.html` or `regulation/index.html`. The ESMA Q&A page `mica-qa/index.html` is built from `data/esma-mica-qa.json` with `python3 tools/build-esma-qa.py` (and the data from ESMA's PDF export with `tools/esma-qa-from-text.py`); run it before `build-da.py`, run `python3 tools/build-da.py` and commit the result. New pages also go in `sitemap.xml`.
