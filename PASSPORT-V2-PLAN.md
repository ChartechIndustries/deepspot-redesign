# Passport v2 — plan (2026-10-20)

## Ask (Charlie)
Rework the explorer passport (`/profile/?user=<id>`, own preview `/profile/?user=preview`):
- Profile pictures → **moles**.
- A section where people make a **small piece of art** (the PictoChat-style pad exists; restyle it so it belongs on
  our site).
- **More vertical** layout so it holds more intel.
- **Left panel:** mole pfp with their **level in a smaller bubble** to its right; name; @username; member since;
  member level; bio; then the drawing/art section.
- **Right side:** the **type of traveler** they are, their **contributions**, the **actual postings**, and more.

## Where
`source/profile/` — index.html, profile.js (render), profile.css, data.mjs (loadProfile), sign-pad.mjs (pad),
passport-art.mjs (stampArt, moleCrop), passport-export.mjs (share image), profiles.json (10 real contributors).
`source/site/account-state.mjs` (draft: name, username, bio, style, avatarMode, mole, signatureArt, travelerStyles).
Moles: `source/community-assets/moles/<handle>.webp` (512², transparent, rolled with MOLE_RULES per handle).
Leaderboard points: `source/site/content.json` → `leaderboard.monthly/allTime` (by name; map via profiles aliases).
Server http://localhost:8766 (running). Headless only, no windows.

## Data rules (real or derived — never invented)
- **Mole:** real profile → `community-assets/moles/<id>.webp`; preview → draft mole png if rolled, else an empty
  mole slot with "roll your mole ↗" → `/account/`. Photos are no longer shown as the avatar on the passport.
- **Level:** derived from all-time points: `level = 1 + floor(sqrt(points / 40))` (Kris 6,800 → 14, Six 250 → 3);
  show progress to next level as a thin bar with "x / y pts". Preview: 0 points → level 1.
- **Member level:** title ladder by level — 1–2 newcomer, 3–4 scout, 5–6 explorer, 7–8 pathfinder, 9–10 trailblazer,
  11–13 cartographer, 14+ legend. One small "how levels work" note (points: +50 spot, +100 story, +10 upvote).
- **Traveler type:** real profiles → from the categories of their actual postings (map catalog tags to the existing
  `travelerStyles`: e.g. weird/funny → the explorer, food & bars → the foodie, museums/architecture/art → the
  shutterbug or poet — define the mapping in one table in data.mjs), show the top type + a small breakdown bar of
  categories with counts, labeled "based on N postings". Preview → `draft.style`.
- **Bio:** preview → draft bio; real → designed empty state ("no bio yet"). Never write bios for real people.
- **Member since:** `joined` from profiles.json. **Contributions:** spots + stories (verified snapshot) + points + rank
  this month / all time (leaderboard). **Postings:** the real records with photos (use 800 px card images from
  `editorial-assets/cards/` when they exist).
- "More": stamps (existing `stampArt`, earned by real rules only: first find; deep spot choice; 10+ spots;
  story writer), places list (unique places/regions from their postings), giveaway standing card (rank, points,
  link to /community/), share passport + download image (existing export).

## Layout (vertical passport, redesign style)
Desktop ≥1100: two columns inside one passport frame — **left identity column ~380–420 px, sticky** while the right
column scrolls; right column = stacked sections. 700–1100: left column on top as a wide card, right sections below.
Phone: single column. Same design system as the rest of the site: navy/cream tokens, cobalt/green/aqua accents,
big lowercase display headings ending in a period, mono labels, hairline borders, light/dark + panel color on/off.
Keep the passport identity: "explorer passport" label, passport number, machine-readable-zone line at the bottom of
the left column (exists today).

**Left column, top → bottom:** mole avatar (large circle on colored field, head crop via `moleCrop`) with a smaller
level bubble overlapping its lower right (number + "lvl"); name (display); @username; member since · member level
chips; level progress bar; bio; **art** section; MRZ line.

**Art section (replace the PictoChat look):** same function as `sign-pad.mjs` (free + pixel brush, small/big, eraser,
undo, two-step clear, 12 colors, save to `signatureArt`), restyled: canvas on the passport paper with a fine dot grid,
site chip buttons for tools (icons + labels), color swatches as small round chips, mono labels, no rounded gray device
frame, no Silkscreen/pixel font. Title "my mark." (or similar) + one-line hint. Own passport: editable. Others: their
saved art read-only (none yet → designed empty state "no art yet"). Keep the share-image export drawing the art.

**Right column sections:** traveler type (big type name + icon from `travelerMark`, short description, category
breakdown) · contributions (stat tiles: points, level, spots, stories, rank this month) · postings (photo grid, real
records, link to spot/story, show all toggle if > 6) · stamps · places · giveaway standing.

## Checks
- `node --check` changed JS; `qa/*.test.mjs` pass (add tests for level/member-level/traveler-type derivation).
- Headless screenshots: `/profile/?user=lampbane`, `wayfarer`, `sixbacteria`, and `preview` (seed a draft with mole +
  bio + art, and one with nothing) at 1440 / 1024 / 768 / 390, dark + light, panel off once. Look at every one; two
  review→fix rounds minimum. Save to `qa/passport-v2/`.
- Pad: scripted strokes in both brush modes, undo, clear (two-step), save, reload → art persists and shows; read-only
  on other profiles; share image includes mole + art.
- 0 console errors / failed requests, no overflow at 390/320, axe WCAG A/AA 0 on 3 profiles + preview.
- Community participants cards still link correctly. Backup first: `backups/before-passport-v2-20261020/`. Bump keys.
  No deploy, no README edit.
