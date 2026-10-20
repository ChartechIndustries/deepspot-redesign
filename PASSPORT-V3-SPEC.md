# Passport v3 — design spec (Opus, 2026-10-20)

Reference Charlie loves: `qa/passport-v3/reference.png` (Remilia profile). Keep OUR style; borrow its structure.

## Why the reference works (apply these, not its colors/fonts)
1. One focal object on an atmospheric field: left pane = halftoned photo, a physical ID card centered on it.
2. One tint family; color comes only from content (avatars, photos).
3. One repeating module: every right-side section = identical thin header bar (label · count · show) + content
   at one padding; one card component reused everywhere.
4. The ID card reads like a document: labeled rows with hairline rules, small print, a signature strip.
5. Small mono labels, generous air, faint dot-grid paper; one loud element (the big score badge).

## What was wrong in v2 (fix all)
- Full aqua left panel: off-palette. The site never fills large areas with aqua. Remove it.
- Padding drifts (20/24/28/36 px); section headers not one module; nothing anchors the page.

## Tokens (only these)
Surfaces: page `var(--br-bg)`, panel `var(--br-panel)`, card `var(--br-card)`, line `var(--br-line)`, text
`var(--br-text)`, muted `var(--br-muted)`. Accents: green `#07d653` (light theme text-size green `#08782f`),
cobalt `#3c60ff` (level badge, white text), cream print `#f5f4ee` (the ID card only), ink `#0b1b27` (text on the card).
Aqua `#83cdce` only as a tiny accent (≤ 1 small element). Panel-color off: accents → `var(--br-accent)`/neutral.
Type: display = site heading style (Arial/Helvetica 800, tight negative tracking, lowercase section titles);
labels = `ui-monospace` 10–11px uppercase, letter-spacing .08em, muted; body 15–16px.
**Spacing scale: 8 · 12 · 16 · 24 · 32 · 48 only.** Section content padding 24 (phone 16). Card padding 12 or 16.
Grid gaps 12. Header bars 40 px tall, padding 0 24 (phone 0 16). Radii: cards 8, ID card 12, chips 99.

## Frame
`max-width:1240px`, two panes `minmax(0,5fr) minmax(0,7fr)`, one 1px `--br-line` border around the whole thing,
hairline between panes. Both panes same height on desktop; left pane is `position:sticky;top:<header>`;
height `min(100vh - header, 980px)`, right pane scrolls with the page.
≤1000 px: stack (left pane first, height 620px), ≤650: left pane 560px, card width `calc(100% - 32px)`.

## Left pane — "the field"
- Top: tab bar (40 px, hairline bottom, background `color-mix(var(--br-panel) 80%, transparent)`): two tabs
  `passport` and `my mark` (mono labels; selected = text color + 2px green underline). On other people's passports
  the second tab reads `their mark` (read-only).
- Background: **their top posting photo rendered through the hero Earth halftone** (same glyph set + Bayer
  threshold + the Earth ink ramp k0…k8 from `page-C89T775K-v51.js`), static render on load + resize (debounced),
  cell 6 px, filling the pane (object-fit cover math in the shader). New module `source/profile/halftone-photo.mjs`
  (reuse code from `site/halftone-field.mjs`). Photo = first posting with a photo; else `/spots/oya.jpg`.
  No WebGL → the photo in CSS with `filter:grayscale(1) contrast(1.1)` + a dot overlay.
- **ID card** centered (width 440, phone full width): cream print `#f5f4ee`, ink text, radius 12, 1px
  `rgba(11,27,39,.12)` border, shadow `0 30px 70px rgba(0,0,0,.45)`, padding 24.
  - Row 1 (mono 10px): `deepspot · explorer passport` … `no. 001` (rank) — hairline below, 16 px gap.
  - Body: grid `132px 1fr`, gap 16. Left: mole in a 132 px rounded-square (radius 10) on the rank color
    (top 3: green/aqua/cobalt; others `#dfe6e4`), head crop via `moleCrop`; small level bubble (40 px cobalt circle,
    white number + "lvl") overlapping its bottom-right corner. Right: 4 field rows — `name`, `user`, `since`, `level`
    (value = member level, e.g. "legend") — each row: label mono 10px muted left, value 15px 700 ink right/left
    aligned consistently, 1px hairline under each row, row height 34.
  - Level progress: 4 px bar, green fill, "6,800 / 7,840 pts" mono 10px.
  - MRZ line (mono 10px, letter-spacing .12em) at the card bottom.
- **Signature strip** under the card, attached (same width, radius 0 0 12 12 joined, or a separate 8 px-gap plate):
  light print `#fbfaf5`, 72 px tall, shows their art (`signatureArt`) contained, else "no mark yet" in muted mono.
- `my mark` tab (own passport): the card area becomes the art pad card (same card frame): canvas on dot-grid paper
  (aspect 2:1), below it tool chips (smooth / pixel / eraser · small / big · undo · clear (two-step) · save) and
  12 round color chips — all in the card's ink style. Save → shows in the signature strip, switches back to
  `passport`. Others' `their mark` tab: the art large on the paper, read-only, or empty state.

## Right pane — "the record"
Background `var(--br-panel)` + faint dot grid (`radial-gradient` 1 px dots, 16 px grid, 6% opacity).
Every section = **header bar** (40 px; background `var(--br-card)`; hairline top/bottom; left mono label + count
in muted parentheses; right optional `show` / `hide` chip) + **content** (padding 24, gaps 12).
1. `bio` — top row: mini mole 56 px (radius 8) + name (display 32px, keep their case) + `@handle` muted; right:
   **big level badge** 96 px cobalt disk, number 40px 800 white, ring text "level" mono (the one loud element).
   Bio text 16px/1.5 max 60ch (empty state for real people). Chips row: `6,800 pts`, `since aug 2026`, member level;
   socials (preview only) right-aligned.
2. `traveler type` — one card: icon disk 56 px (cobalt, `travelerMark`), type name display 28px, one-line
   description, then the category bar (8 px tall, radius 99) + legend chips; "based on N postings" mono.
3. `contributions` — 4 equal stat tiles in a row (points, spots, stories, rank this month); tile padding 16;
   number 36px 800 (green for points), label mono 10px. Member-level ladder as a compact chip row under it.
4. `postings (N)` — card grid, 3 columns desktop / 2 tablet / 1 phone: image 4:3 top, caption 12 px padding
   (place mono 10, title 15/700, 1–2 category chips). Show 6 + `show all` chip in the header bar.
5. `stamps (earned/total)` — reference "achievements" layout: first earned stamp as a large card (stamp art 96 px +
   name + how earned), others as small cards in a grid; locked stamps at 40% opacity with "how to earn".
6. `places (N)` — chips.
7. `giveaway` — one wide card: rank, points, gap to next, `see the race ↗`.
Footer note (mono 10px muted) inside the pane at the bottom.

## Checks (same as v2) + design QA
Screenshots 1440 / 1024 / 768 / 390, dark + light, panel off once, for lampbane, wayfarer, sixbacteria,
preview-seeded, preview-empty, and the `my mark` tab. Measure: every section content padding = 24 (16 phone), every
header bar = 40 px, every card padding ∈ {12,16}, no aqua fills (script these checks with getComputedStyle and
report). 0 errors, no overflow 390/320, axe 0, pad tests, share image still works, community cards still link.
Backup `backups/before-passport-v3-20261020/`. Bump keys. No deploy, no README edit.
