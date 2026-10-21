# Community v3.1 — participants deck + passport variation (2026-10-21, Opus plan → Sonnet build)

Builds on COMMUNITY-V3-SPEC.md (read it for the rules, checks and paths). Charlie's feedback on v3:

## 1. Background animation only on the top graphic
- The animated halftone field (`halftoneField` from `site/halftone-field.mjs`) stays ONLY in the race hero (giveaway-hero.mjs).
- Remove it from "participants." and from "live from the discord." (community-v2.mjs imports it — drop those uses).
  Those sections keep flat colour backgrounds (participants: page ink; discord: cobalt). A static, non-moving texture
  is OK only if it adds something; default = none.

## 2. Participants: deck → carousel on scroll, much less empty space
- Section height ≈ the card stack + controls, no big empty bands. At 1440×900 the whole section should fit in one
  screen with the cards dominant (target ≤ ~720px tall incl. padding). No separate header row eating space.
- Start state: all 10 cards stacked as a neat DECK in the centre (slight offsets/rotations, ±3°, so it reads as a deck),
  with the huge "participants." title centred ON TOP of the deck (overlapping the cards, above them in z-order;
  title colour must stay readable over cream cards — e.g. cream text with a strong dark shadow, or ink on cream; check
  contrast). Under it the small line "10 explorers in this month's race".
- When the section scrolls into view (IntersectionObserver, ~40% visible): the title fades out (opacity + slight scale/
  blur, ~400ms) and the cards deal out of the deck into the coverflow carousel (staggered ~50ms per card, transform
  transitions ~700ms, ease-out back). Then the carousel works exactly as now (drag, arrows, keys, click side card →
  centre, click centre → passport). Arrows + "1 / 10" fade in after the deal.
- Once opened it stays open (no re-stacking on scroll up). Reduced motion: no deal animation — show the open carousel
  directly with the title as a normal heading above it. Screen readers: the title stays in the DOM as the section
  heading (visually hidden after fade, not display:none).
- Phone: same idea, deck centred, title over it, deals into the one-card swipe view.

## 3. Card shape: more vertical
- Portrait card, ratio about 5:7 (e.g. 300×420 desktop centre card, 240×336 phone). Re-flow the layout for portrait:
  header, then the mole photo LARGE on top (full card width minus padding, square or 4:5) with level bubble + ink stamp,
  then the NAME / USER / SINCE / LEVEL rows, mark line, MRZ at the bottom. Nothing cropped or ellipsised that matters.

## 4. Header: archetype first
- Where the card header says "DEEPSPOT" (big), show the person's traveler archetype instead, big and bold, lowercase
  like the site headings, e.g. "the history buff." (use `travelerStyles` name + period; drop nothing). Under it, small
  mono caps: "DEEPSPOT EXPLORER PASSPORT". Keep the crest and the red "no. 00N" stamp. Long names
  ("conspiracy theorist", "hot spring hunter", "decadent gourmand") must fit: wrap to 2 lines or step the size down — never
  truncate. Archetype comes from the same data as now (passport-rules `travelerType`); if none, "the explorer."… no —
  if none, show "explorer passport" as the big line and skip the archetype (do not invent one).
- The ink stamp on the photo now repeats the archetype — change the stamp to show the LEVEL TITLE + level number
  (e.g. "PATHFINDER · 8") so the card does not say the archetype twice.

## 5. More variation between passports
Each card must look clearly different at a glance, while all stay the same system. Derive everything deterministically
from real data (archetype group, rank, id hash) — no randomness per load:
- Archetype GROUP → card colourway (paper tint + accent used on rules, crest, header text, photo backing):
  weird & alternative = violet/ink, nature & outdoors = green, history & culture = ochre/sepia, food & drink = tomato,
  nightlife & social = magenta/night, science & tech = cobalt/cyan, art & design = pink/aqua, wellness & spirit = lilac,
  extra = lime. Keep paper light enough that ink text passes 4.5:1. Use the site palette where it fits
  (cobalt #3c60ff, green #07d653, aqua #83cdce, cream #f5f4ee, ink #0c101b).
- Archetype icon (`travelerMark(id)` from `site/account-state.mjs`) as a large faint watermark on the card (replaces the
  generic star watermark), tinted with the accent.
- Foil by rank: #1 gold, #2–3 chrome, #4–10 holo; foil intensity can differ slightly by hash.
- Photo backing colour + a subtle pattern from the id hash (dots / stripes / grid / waves / plain), 5 options.
- Stamp ink colour + angle from the id hash (blue / red / green / violet; −18°…+12°).
- Optional small rank ribbon on the top 3 ("1st", "2nd", "3rd").
Check all 10 cards side by side (make a contact sheet `qa/community-v3/r5/cards-sheet.png` rendering each card flat)
and make sure no two look alike and none is ugly or low-contrast.

## Rules + checks
Same as v3 spec: data honesty, no edits to `source/profile/*`, backup first (`backups/before-community-v3.1-20261021/`),
bump keys (community-v2.mjs key must match in pages.mjs AND giveaway-hero.mjs), `node --check`, screenshots
1440/1920/390/320 dark+light, colour on/off, scrollWidth == viewport, axe 0 (strip canvases if axe hangs), console 0,
README log entry. To screenshot the opened state, scroll the section into view and wait for the deal to finish; also
capture the closed deck state. Server is already running on 8766 — do not start another. Headless only. No commit/push.
Note: type sizes were raised site-wide today — keep them; minimum 13px on cards except MRZ (11px ok on cards).
