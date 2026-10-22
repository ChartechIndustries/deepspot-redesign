# Archetype icons v2 — bold, cool, no mistakes (2026-10-21, Opus)

## Ask (Charlie)
"I need extra emphasis on the icons of the archetype to make sure they are bold, cool, and perfect with no mistakes."
They show: the passport crest (top-left circle) on the profile + community passports, the archetype stamp, the
edit-profile/onboarding archetype picker chips + cards, the traveler-type box on the profile.

## Source
`tools/archetypes.py` writes `travelerStyles` (id, name, group, description, path) into `source/site/account-state.mjs`;
`travelerMark(id)` wraps `path` in `<svg viewBox="0 0 24 24">` and every consumer strokes it with currentColor
(stroke-width ~1.6, no fill). The current 45 paths were drawn quickly in one pass — some are weak, muddy or wrong
(e.g. check: ghost hunter, monster hunter, conspiracy theorist, worm lord, taboo gourmand, pub crawler, grease monkey,
bureaucrat, futurist, mystic, furball, astronaut, beach bum, prospector — but review ALL 45).

## Deliver
Redraw all 45 as ONE coherent icon family:
- 24×24 grid, 2px optical keyline padding, `stroke-width` 2 (set it IN the icon set: update `travelerMark` to output
  `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"` on the svg so every consumer matches;
  check consumers that override stroke-width in CSS — profile.css, onboarding.css, passport-mini.css, account.css,
  passport-edit.mjs — and align them), plus at most ONE small solid accent per icon (`fill="currentColor"` on a single
  sub-path, e.g. eyes, a flame, a star) for punch. Bold silhouettes, readable at 16px, iconic at 64px.
- Each icon must say its archetype at a glance (use the description in the list). Distinct from each other — no two
  share a silhouette. Pixel-snapped coordinates (integers or .5), closed shapes closed, no stray segments, no strokes
  touching the viewBox edge, symmetric where it should be.
- Keep ids/names/groups/descriptions exactly; only `path` changes. Update `tools/archetypes.py` and re-run it.
- Inspiration: Lucide / Phosphor Bold / Tabler weight and clarity (draw your own; do not copy licensed sets verbatim).

## Verify (do not skip — "no mistakes")
- Render a contact sheet of all 45 at 16, 24, 48 and 96px, dark on cream and cream on ink → `qa/archetype-icons/`
  (headless, ONE browser, below-normal priority: the PC is shared with gaming; or render with cairosvg/resvg in Python
  if available). LOOK at every icon at every size. Fix and re-render until each is clean. ≥3 rounds.
- Then render them in place: passport crest + stamp (profile `/profile/?user=wayfarer`, community cards), the picker in
  the edit dialog, the traveler-type box. Screens of each.
- Test: `qa/passport-rules.test.mjs` / `qa/account-state.test.mjs` still pass (`node --test qa/*.test.mjs`); add a test
  that every path parses (balanced, only allowed elements: path/circle/ellipse/rect/line/polyline/polygon) and stays inside 0..24.
- Backup `backups/before-icons-v2-20261021/`. Bump the account-state import keys where the module is imported (search
  `account-state.mjs?v=`), keep every importer on the SAME key. README log. Do not commit/push.
- Coordinate: another builder is editing profile.js/profile.css, site/passport-mini.*, community-v2.* and
  profile/passport-edit.mjs at the same time for the passport layout. You own account-state.mjs, tools/archetypes.py and
  the icon CSS stroke rules only; if you must touch a shared file, make a minimal, clearly separated edit at the END of
  the file and tell the coordinator in your report.
