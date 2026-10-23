# Fix round 2026-10-22b — community load flash, participants title, slower reveal, profile cut-off

Read README (latest log entries) and HANDOFF-2026-10-22.md first. Keep every delight moment (deal-out/restack, tilt/sheen,
follow shake, stamps). PC is shared with gaming: ONE headless browser at a time, below-normal priority (psutil, see
`qa/onboarding-v2.2/h.py`), swiftshader only for WebGL. Server 8766 runs detached — do not start another.
MSYS_NO_PATHCONV=1. Backup first (`backups/before-fix-1022b/`). Bump every `?v=` key you touch (community-v2.mjs key must
match in pages.mjs AND giveaway-hero.mjs AND community/index.html refs). Add a README log entry. Do NOT commit or push.
QA probe already written: `qa/fix-1022b/probe.py <tag> [comm|prof|both]` (load frames + profile clip list). Baseline shots `r0-*`.

## 1. Community — no flash of passport cards on first load
Cause: `site/community-v2.mjs` ~L274-279 writes the whole page (`<div data-giveaway></div>` + participants deck + …) into
`root.innerHTML`, then `await import('./giveaway-hero.mjs')` and only then renders the hero. For a moment the deck sits at
the top of the page (see `qa/fix-1022b/_comm-390.png`, frame 1800 ms), then the hero pushes it down.
Fix:
- Start the giveaway-hero import BEFORE building the markup (in parallel with the data work), await it, write innerHTML,
  render the hero synchronously right after, THEN wire the deck (`wirePassports`). One paint, hero on top.
- Belt and braces: the page content fades in once (opacity 0 → 1, ~250 ms) after the hero is mounted, so no half-built
  state is ever painted. Reduced motion = no fade, just show.
- The plain "Loading community…" line may stay, but must not jump the footer around: give `main` a min-height (~100vh)
  while loading so the footer is not visible mid-screen during load.
- Verify with probe frames at 390 and 1440: no frame may show the passport deck above the hero.

## 2. Participants title — better graphic, no outline
`site/passport-mini.css` `.pm h2` uses `-webkit-text-stroke` + hard text-shadow. Charlie: the outline looks bad.
New look (sticker/label, still sits on top of the deck and reads over cream cards AND over the page):
- "participants." set in cream (#f5f4ee) on a solid ink (#0b1b27) label block: generous padding, radius ~16px, slight
  rotation (−3°), soft drop shadow (no hard offset shadow), green full stop. NO text stroke, NO doubled text-shadow.
- Sub chip "N explorers in this month’s race" as a green (#07d653, ink text) pill under it, rotated +2°, slightly overlapping
  the label bottom edge — like two stickers.
- Light theme: same ink label (it is a sticker, it does not flip). Check contrast passes axe.
- Size: keep it big on desktop (≈ clamp(48px,8vw,132px)); must fit 320px without overflow.
- Reduced-motion branch (title as a normal heading above the carousel) keeps its plain style; remove the stroke there too
  (already 0) and do not apply the label block there — or apply it unrotated, pick what looks better.

## 3. Slower participants → card reveal
`wirePassports` in `site/passport-mini.mjs`: deal fires as soon as 40% of the section is in view; title fades in .4-.45 s.
People cannot read "participants" before it is gone. New timing:
- When the section first scrolls into view: the title label "lands" (small scale 1.08→1 + fade, ~450 ms), then HOLDS fully
  readable for ~1.8 s, then fades out over ~0.7 s while the cards deal. Deal transition ~1.0 s per card, stagger ~90 ms.
- If the user taps/clicks the deck, uses the arrow buttons or keyboard during the hold: deal at once (no waiting).
- If the section leaves view during the hold: cancel the pending deal (no deal off-screen).
- Restack (out of view) behaves as now; the next re-entry uses the same hold (can be shorter, ~1.2 s).
- Reduced motion unchanged (open at once).

## 4. Profile — nothing cut off at any desktop window size
Since the desktop profile became a fixed, non-scrolling window (`html.pp-app`, ≥1100px, `profile/profile.css` blocks at
~L226, ~L341, ~L397, ~L420, ~L460 and `profile.js` fitPassport/appShell), boxes are clipped. Baseline `qa/fix-1022b/r0-prof-*`:
- 1100×620, 1280×720: left pane — share bar and the bottom of the passport are cut off (fitPassport min zoom .7 is too high).
- 1366×768 and smaller heights: right pane — bio + traveler type + contributions take almost all the height, the tab panel
  (my map globe, lists, want-to-go form) gets ~100 px and is cut off.
- 1100–1279 wide: the vertical tabs (positioned `right:100%` of the record) cover the "← community" link in the left pane.
Fix:
- Right pane: make the WHOLE record (`.pp-rec`) one scroll container (overflow-y:auto, overscroll-behavior:contain);
  remove the fixed `flex:0 0 44%` bio + separately scrolling `.pp-vpanels`. Bio, type, contributions, tabs, panel all flow
  at natural height. The vertical tabs must stay reachable/visible while the record scrolls (keep them pinned to the pane
  edge — they live outside the scroller, so they do not scroll away). Keep the fitBio auto-fit sane when the bio block is no
  longer a fixed height (give it a sensible fixed or min height, or drop the fit and let text wrap — no clipped text).
- Left pane: fitPassport must fit card + share bar inside the field at every size: lower the min zoom (~.45), measure the
  share bar correctly, and as a last resort the field scrolls (overflow-y:auto) rather than clipping.
- Move the "← community" link so the tabs never cover it (e.g. top-LEFT of the field), at all widths ≥1100.
- Also fix the small clips the probe lists everywhere: `.pp-id9-stamp` sticks out of the card by 5–12 px (bottom); mole
  `IMG in pp-mole` overflows (check it is intended cropping, not a visible cut — if it is the intended crop, leave it).
- Must work for own preview (`?user=preview`, owner tabs incl. want-to-go form) AND another user (`?user=wayfarer`), every tab
  (my map, explored, picks, contributions, items), at: 1100×620, 1100×800, 1280×720, 1366×768, 1440×900, 1536×864,
  1680×1050, 1920×1080, 2560×1440, plus phones 390/360/320 (must not regress).
- Do not change the look of the passport card itself.

## Checks
- `node --check` on changed .mjs/.js; `node --test qa/*.test.mjs`.
- Probe: `python qa/fix-1022b/probe.py r1` (extend the probe to click through each profile tab and to scroll the record to
  the bottom and screenshot). Look at EVERY shot. Nothing cut off, every control reachable. Fix, run r2. ≥2 rounds.
- Community: frames at 390 + 1440 show no deck before the hero; a timed sequence (scroll to the deck, frames at 0/0.5/1/1.5/
  2/2.5/3.5 s) shows the title readable ≥1.5 s before cards deal. Dark + light shot of the new title at 1440/390/320.
- axe 0 (community + profile), console 0, scrollWidth == viewport at every size.
- Report: what changed (files + keys), probe results per size, anything not fixed.
