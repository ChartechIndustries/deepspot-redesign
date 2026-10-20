# Audit fixes — plan (2026-10-19)

Source: `AUDIT-2026-10-19.txt`. Evidence: `qa/audit-20261019/`.
Server: http://localhost:8766 (serves `source/`, already running; do not start another).
No deploy in this round. No browser windows: headless Playwright only.

Two builders work in parallel on disjoint files. Opus re-audits after both finish.

## Common rules
- Backup every file before the first edit to `backups/before-audit-fixes-20261019/<same relative path>`.
- Never delete source assets. Move retired files to `_archive/` (outside `source/`), same relative paths.
- Bump `?v=` on every changed CSS/JS/MJS in every place that references it. Keep keys consistent across pages.
- Match the surrounding code style (terse one-liners, minified-looking CSS lines).
- `node --check` every changed JS/MJS. Run `node qa/*.test.mjs` at the end.
- Home (`source/index.html` + `_next` chunks): do not edit the React chunks. Any home change goes in plain
  scripts/CSS loaded by index.html. Check for hydration error #418 after any home change.

## Builder A — assets and deploy folder
Files owned: everything under `source/` that is an image/video/binary, `source/backups/`, unreferenced files,
`source/editorial-stories.json`, new `_archive/`.
1. H2 Move `source/backups/` → `backups/source-backups-moved-20261019/`.
2. H2 Dead files → `_archive/source-dead-20261019/`. Only files proven unreferenced:
   page/index/layout chunk versions older than v51 (confirm the v51 trio imports none of them),
   japan.jpg, london.jpg, austria.jpg, athens.webp, other mirror leftovers, retired bridge-lab files.
   Proof per file: grep across all non-archived text files (html/js/mjs/css/json/svg/webmanifest),
   including dynamic patterns (`${id}.jpg`, ids in JSON). Keep anything in doubt. Keep review pages
   (banner-variations.html, promo-variations.html) and what they load.
3. H1 Images: every raster in `source/` over 400 KB or over 2000 px long edge (except earth textures used
   by the globe and the mole assets): originals to `_archive/originals-20261019/`, replace in place, same
   filename and format, long edge 1920 px (photos) — JPEG q82 progressive, PNG → keep PNG only if alpha,
   strip metadata. Same filename keeps every reference working.
4. H1 roadmap-mountain.png: also create `roadmap-mountain.webp` (≤1600 px). Builder B switches the
   pages.mjs reference.
5. H1 Hotlinked Wikimedia images in `editorial-stories.json` (and any other data file): download, resize to
   1600 px, save under `source/editorial-assets/`, point the JSON at the local file. Keep credit/source fields.
6. Report: bytes before/after for home, /stories/, /story/?id=boundary, /roadmap/, /browse/ (use
   `qa/audit-20261019/weight.py`), list of moved files, any file kept "in doubt".

## Builder B — code, CSS, accessibility
Files owned: html/css/js/mjs/content.json (not editorial-stories.json, not images).
1. M3 `profile/data.mjs`: import `../site/account-state.mjs?v=pad1`. Unify `site-cta.css` key on all pages
   to one new key.
2. M5 New `source/404.html`: standalone page in the site design (header/footer like other routes, dark default,
   theme from localStorage, "this spot is off the map." style copy, links home/browse). Netlify serves it.
3. M1 Contrast on cobalt: text panels with small text on `#3c60ff` → background `#3858f0`
   (cream 4.99:1). Tinted small text on cobalt (#e1e5ff, #c9d9ff, #e2e7ff, #dfe5ff, #eff2ff) → cream #f5f4ee
   or white. Targets: .ds-cta-contribute, .ds-wide-cta, community hub slide + top handle, competition prize
   panel + eyebrow, membership paid card. Large display type and the home banners stay #3c60ff.
4. M2 Light mode only: home `.hero .headline-green` → a darker green with ≥3:1 on #f6f3ec. Dark mode unchanged.
   Put the rule in a CSS file loaded by index.html (not the hashed CSS unless you bump it).
5. M4 Home theme: inline script in `index.html` head, before the module scripts: if the URL has no `theme`
   param and localStorage `deepspot-theme` is set, `history.replaceState` to add `?theme=<stored>`.
   Verify: stored light + open `/` → light, no #418, globe renders.
6. M6 Leaderboard ≤480 px: all five columns visible at 390 without sideways scroll (compact padding/type,
   shorter header labels allowed), or a sticky first column + edge fade if impossible.
7. L1 a11y: ticker inside a landmark (e.g. wrap in `<aside aria-label="this week's weirdest finds">` at top
   level, or move into header); fix heading order on /spot/, /stories/, /guides/, /app/, /cookies/; nested
   `<aside>` → `<div>` or top-level; remove `role="group"` from `<article>` slides (use a div wrapper or
   `aria-roledescription` on a div).
8. L2 Tap targets ≥24 px at 390 on /contribute/, /stories/, /spot/, /story/ (padding, not visual size changes
   where avoidable).
9. L3 Only if clean: pages that do not use featured-spots.json / content.json stop fetching them. If the
   loading is shared in core.mjs and a split is risky, skip and report.
10. L4 content.json legal headings: "01.What" → "01. What" (number-dot-space).
11. L5 og/twitter tags on all routes: og:title, og:description (from existing title/description), og:type,
    og:image `/og-image.jpg` (1200×630, make it from a hero render: dark theme, headless with
    `--use-angle=swiftshader`), twitter:card summary_large_image.
12. L6 promo-variations.html: no sideways scroll at 390; `promo-variations.js?v=` key.
13. pages.mjs roadmap image → `roadmap-mountain.webp` (Builder A makes it).
14. Report: per item done / skipped (why), files changed, cache keys.

## Re-audit (Opus)
Rerun crawl.py (5 views), axe.py (3 views), flows.py, weight.py, link check, tests; compare with the
10-19 baseline; visual check of changed pages at 1440/390, light/dark. Log in README.
