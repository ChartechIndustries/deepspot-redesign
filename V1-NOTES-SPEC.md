# v1 — Charlie's notes build (2026-10-23)

Project: `C:\Users\CharD\Desktop\DeepSpot Globe` (v1, repo ChartechIndustries/deepspot-redesign). Site = `source/`.
Server: http://localhost:8766 (serve.py, no-store). The detailed item list is `LAUNCH-PLAN-2026-10-23.md` (§ numbers below).
Read `HANDOFF-2026-10-22.md` and the latest README entries first.

## Scope
All of Charlie's Notes.docx items EXCEPT: page speed + load flicker (parked until the Vercel merge), the map page, and any
copy rewrite (copy waits for Kai: keep the current words, tag changed-or-questioned strings with `data-copy="kai-<n>"` and
list them in `COPY-FOR-KAI.md`). Not in v1: the hidden-gem render v2 and any new art style (those are the v2/v3 variants).

## Four builders in parallel, one shared working tree — FILE OWNERSHIP IS STRICT
Edit only files you own. If you need a change in a file you do not own, write it in your report instead.

| Builder | Items (LAUNCH-PLAN §) | Owns |
|---|---|---|
| A · home | 2.1 dots over pins, 2.2 centre the place card, 2.3 explore → `/map/?spot=` (map side too), 2.4 swipeable what's-new banner, 2.5 bigger "browse all deep spots"; home spot counter = catalog length (one number with browse) | `source/index.html`, `source/_next/**` (chunk v51 + css), `readable/page.js`, `whats-new.js/.css`, `editorial.js/.css`, `responsive.css`, `featured-spots.*`, `world-banner.*`, `community.js/.css` (home block), `site/map.mjs`, `map/index.html` |
| B · nav, browse, tours | 1.1 burger menu (keep browse, map, tours, community, your account), 3.1 browse tabs follow, 3.2 count bubble, 3.3 remove the Deep Spots/Stories/Guides tab row from browse + guides, 6.1 tours opening crop | `site/navigation.js`, `browse/*`, `site/core.mjs` (`collectionTabs`; do not change `followTab`/`tabFades`), `site/pages.mjs`, `guides/*`, `site/tours.mjs`, `tours/*` |
| C · community | 5.1 hero eyebrow style (no mono caps; month goes into the countdown chip), 5.2 deck moves smoothly (drag follows, spring, arrows animate), 5.3 feed looks like a live chat (real `forum[]` posts only, typing row, arrival one by one, label "latest from the discord" + `LIVE_SOURCE` flag), 5.4 guidelines = modal (big ✕, Esc, outside tap, back button, `#guidelines` deep link, focus trap; phone = sheet; text unchanged), 5.5 join-now tile tighter, 5.6 remove "two ways to shape deepspot", 5.7 participants deal-out on hover/click/tap + "deal again", not scroll-driven | `site/community-v2.*`, `site/community-hub.*`, `site/giveaway-hero.*` (keep every export: home uses `CROP, PRIZES, mole, PODIUM_ORDER, podiumHTML`), `site/passport-mini.*`, `site/discord-link.mjs`, `community/*`, new `site/ds-dialog.mjs/.css` |
| D · profile + iPad | 4.1 profile tabs follow + peek + one nudge, 4.2 passport tilt with the phone (iOS permission chip "tilt to shine", foil light follows, ±8°, reduced motion off), 7.1 iPad picture crop (same face position 390/820/1024/1180/1440), 7.2 iPad mark pad (bigger pad, no selection, no double-tap zoom, pen pressure, palm rejection) | `profile/*` (`passport-edit.mjs` is imported by `site/passport-mini.mjs` — keep its exports and signatures), `site/onboarding*.*`, `welcome/*`, `site/account*.*` |

Shared helper (already added, do not rewrite): `site/core.mjs` → `followTab(row, tab)` and `tabFades(row)`; CSS
`.has-more-left/.has-more-right` in `site/refinements.css`. Use them for 3.1 / 4.1 / any sideways tab row you own.

## Rules for every builder
- Backup every file you change first: `backups/before-notes-1023/<same path>`.
- **Do NOT run `tools/bump_keys.py`** and do not edit `?v=` keys (four builders at once would collide). The server sends
  no-store, so your checks see fresh files. The lead runs bump_keys once at the end.
- SSR gotcha (A): any change to first-render home markup must be made in BOTH the chunk and `source/index.html`
  (hydration #418 otherwise). Edit `readable/page.js`, copy over the served chunk.
- Headless checks with Playwright at below-normal priority (`psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)`),
  close the browser when done. `--use-angle=swiftshader` only for pages with WebGL (home globe, profile map).
- Device matrix per item tag: phone 390×844 + 360×780 (`is_mobile`, `has_touch`); tablet 820×1180, 1180×820, 1024×1366
  (`has_touch`); desktop 1440×900 + 1024×768. Dark and light.
- Each item: no console errors, no horizontal scroll, no clipped/overlapping text, reduced motion = no new motion.
- Delight moments to keep (name them, do not lose them): print-in + REGISTERED stamp, ISSUED slam, follow shake + hearts,
  deck deal-out, mole reveal. New ones you add must be snappy and off for reduced motion.
- Real data only. No invented names, counts or quotes.
- Screenshots to `qa/notes-1023/<A|B|C|D>/`. Look at every one before you report.
- Do not commit, push or publish. Do not touch files of another builder.
- README: do not edit (the lead writes one entry). Put your notes in `qa/notes-1023/<X>/REPORT.md`.

## Report (short)
Per item: done / partly / not done, files changed, how it looks now (1 line), screenshot paths, anything left.
