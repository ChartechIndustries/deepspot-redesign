# Promo banner variations — build spec (2026-10-14)

Goal: 5 new layout variations for EACH of the three home promo banners (15 total). Same design system as the current banners. Vary only composition/arrangement of the graphic. Text stays EXACTLY the same.

## Current banners (reference, do not break)
- Markup: `source/editorial.js`, the `<div class="ed-promos">…</div>` string (3 `<article class="ed-promo ed-competition|ed-week|ed-road">`).
- CSS: `source/editorial.css` (many override layers; the last ~120 lines are the 2026-10-14 redesign + bold + brand-color passes). `source/panel-colors.css` overrides under `html[data-panel-color=on|off]`.
- Card size on desktop: ~477 × 330 px. Phone (≤650px): single column ~315–360 wide, competition 370 tall, others 330.
- Clicks: buttons carry `data-promo="competition|week|roadmap"`; editorial.js navigates on click. Keep these buttons and attributes in every variant.

## Fixed text per banner (do not change words)
- Competition: `$300` (class ed-prize), `for your curiosity.` (ed-prize-line), button `the competition ↗`.
- Week: h3 `go<br><i>underground.</i>`, button `spot of the week ↗`, caption `oya history museum · utsunomiya, japan`, seal ring `DEEPSPOT VERIFIED · DEEPSPOT VERIFIED · ` with star.
- Road: h3 `the way<br><i>forward.</i>`, button `view our roadmap ↗`.
- Small rank numerals 1/2/3 on competition are allowed. No other new words.

## Design system (use only these)
- Colors: green #07d653, cobalt #3c60ff, aqua #83cdce, cream #f5f4ee / print white #fbfaf5, ink #0b1b27, light green tint #a6f5c3 (only for text on cobalt).
- Type: Arial/Helvetica bold, tight negative letter-spacing like current h3/.ed-prize. Buttons: 12px Arial with 1px underline (existing `.ed-promo button` style).
- Motifs already in use: white-bordered photo prints with drop shadow; round rank badges; halftone dot fields (radial-gradient dots); 1px hairline inset frames; green circular "DEEPSPOT VERIFIED" ring seal (SVG textPath); topographic contour lines; thick green route with photo pins (SVG pattern-filled circles) and a dashed goal ring.
- Photos: `/spots/*.jpg` — rummu, teufelsberg, maishima, chiatura, xwejni, oyunohara, sandchurch, srt, tomb, musee, oya. Week banner must use `/spots/oya.jpg`. Oya is only 1024px wide: never scale it above ~1.2× its card.
- Animation: ONLY simple hover transitions (transform/opacity/stroke-dashoffset). No entrance/scroll animations. Respect prefers-reduced-motion.
- Contrast: text must pass 3:1 for large type, 4.5:1 for the 12px button text. No ink-on-cobalt small text, no cream-on-green text, no green-on-cobalt text.

## The 15 variations
Competition (green #07d653 background unless stated):
- C1 Podium prints: three prints standing in a row at podium heights (1 tallest, centre; 2 left; 3 right), bottoms on a thin ink baseline; $300 above/right.
- C2 Photo in type: giant `$300` fills most of the card with a location photo clipped into the numerals (background-clip:text, fallback solid ink); ink outline or shadow for crispness; prize line + button below. Small "1" badge.
- C3 Leaderboard bars: left half = three rows (rank badge, square photo thumb, horizontal ink bar of length 100%/72%/50%); right = $300 stack.
- C4 Prize ticket: a cream ticket shape (notched / perforated edge, CSS mask or SVG) on cobalt background, holding `$300` in ink; the three prints tucked behind the ticket edge. Button text cream on cobalt.
- C5 Rosette: a large green-on-ink or cobalt rosette/medal (scalloped SVG circle + two ribbon tails) with a round photo inside and a big "1"; on aqua background; $300 in ink to the right.

Week (photo-driven):
- W1 Split: photo left ~58% full height; ink panel right with h3, caption, button; green seal straddles the seam.
- W2 Porthole: cobalt background; very large circular crop of the oya photo bleeding off the right/bottom edge; text left in cream (`underground.` in #a6f5c3); seal sits on the circle's rim.
- W3 Giant type: full-bleed photo; h3 set much larger (≈ 64–80px on desktop) running to the bottom-left edge; thin green vertical depth gauge (tick marks only, no numbers) down the left; seal top-right.
- W4 Print on cream: cream card; the photo as a white-bordered print, slightly rotated, filling the right ~60%; ink h3 on the left (`underground.` in cobalt or green-dark #0a8a3a for contrast); seal clipped to the print corner.
- W5 Duotone: photo in cobalt/ink duotone (grayscale + mix-blend-mode or SVG filter); `underground.` in green huge across the bottom; seal top-left.

Road (cobalt #3c60ff background unless stated):
- R1 Metro line: horizontal transit-diagram line across the card (thick green, rounded), three station circles with photo pins above them on short stems, dashed future segment to the goal ring at the right; text top-left.
- R2 Rising steps: green background; ink step blocks rising left→right (like a bar staircase), each with a photo pin on top, the last step dashed outline with the goal ring; ink text.
- R3 Big arrow: a huge cream-outlined arrow shape pointing up-right filling the card; the route runs along its shaft with photo pins; text in cream.
- R4 Summit map: ink background; large green contour lines (stronger), summit marked with a small flag shape + goal ring; route climbing to it with pins; text bottom-left.
- R5 Route cards: three small photo prints in a row tilted alternately, joined by a dashed green line ending in a goal ring; tiny state icons on each (check, check, dot) as SVG; text top.

## Files to create
1. `source/promo-variations.js` — defines `window.DSPromoVariants = { competition: [fn,fn,fn,fn,fn], week: [...], road: [...] }`. Each fn returns `{ cls: 'ed-promo ed-competition pv-c1', html: '<inner html>' }`. Inner HTML must include the `.ed-promo-copy` with the exact h3 and the `data-promo` button. IDs inside SVG must be unique per instance (accept an `uid` argument).
2. `source/promo-variations.css` — all variant styles, scoped by `.pv-c1` … `.pv-r5`. Must override editorial.css/panel-colors.css rules where needed (use `html .ed-promos .pv-xx …` or higher specificity; panel-colors uses `html[data-panel-color=on] .ed-competition`). Include phone (≤650px) and tablet (651–1000px) rules so nothing overlaps or clips (badges, buttons, seals inside the card).
3. `source/promo-variations.html` — review page. `<html data-theme="dark" data-panel-color="on">`, body bg #0b1019, loads `/editorial.css?v=banners10`, `/panel-colors.css?v=5`, `/promo-variations.css`, `/promo-variations.js`. Three sections (competition, week, road). Each section: a heading and a wrapping row of 6 cards at fixed 477×330: first = "current" (copy the current article markup from editorial.js), then V1–V5, each with a small label above (e.g. `C1 · podium prints`). Each card must be wrapped in a `<div class="ed-promos">` (or equivalent) so editorial.css selectors apply. Add a "phone width" toggle button that switches all cards to 340 wide (competition 370 tall) by a body class so the phone rules can be checked. Labels/headings in the page chrome may use any words.
4. Homepage switch: in `source/editorial.js`, after the innerHTML is set, if `new URLSearchParams(location.search).get('promo')` exists (format `c3,w1,r5`; any part optional), load `/promo-variations.js` (+ inject `/promo-variations.css` link) and replace the matching `<article>` className + innerHTML. Without the param, behaviour must be unchanged. Bump `editorial.js?v=` in `source/index.html` to `banners11`.

## Checks before reporting
- `node --check` on both JS files.
- Load `http://localhost:8766/promo-variations.html` and `http://localhost:8766/?promo=c1,w1,r1` (server is already running on 8766; do not start another, and do not open browser windows) — at minimum fetch them with curl and confirm 200 and that referenced assets return 200.
- Back up `source/editorial.js` and `source/index.html` to `backups/before-promo-variations-20261014/` before editing.
- Report: files changed, any deviations from this spec, anything you could not verify.

---
# Round 2 (2026-10-14): roadmap "yellow arrow" set Y1–Y5

User picks so far: competition = current + C4; week = current + W4 + W5. Do not change those.
New request: 5 roadmap variations, all on a cobalt blue background (#3c60ff) with a YELLOW ARROW MOVING FORWARD.

## Rules
- Text unchanged: h3 `the way<br><i>forward.</i>`, button `view our roadmap ↗` with `data-promo="roadmap"` (reuse `roadCopy`).
- Yellow: #ffd400 (arrow fill). Text colors: "the way" #fbfaf5, "forward." #ffd400 (3.5:1 on cobalt, large text OK). Button text #fbfaf5. Optional accents from the system: ink #0b1b27, green #07d653 sparingly.
- "Moving forward" = a continuous, calm CSS loop (user asked for motion, so a loop is OK here): arrow advances ~6–12 design px and eases back, or a seamless scroll of chevrons/dashes, period 1.6–3s. Transform/background-position only. Pause on `prefers-reduced-motion: reduce` (static). Hover may speed or extend the move a little; nothing else animates.
- Arrows must look designed: crisp SVG, solid fills, clean geometry, rounded or sharp joins used consistently. Bold scale — the arrow is the hero graphic of each card.
- Use the same container-unit system as the other variants (`--u`, `.pv-stage`, `svg()` helper 477×330 viewBox, bottom-anchored). Stage spans full card width (QA fix at the end of promo-variations.css); make compositions work at 477×330 AND on the wider 619×330 home card AND phone 340×370 (no clipping of text/button; arrow may bleed off edges on purpose).

## The five
- Y1 Hero arrow: one huge solid yellow arrow (thick shaft + big head) pointing right across the lower 55% of the card, tail bleeding off the left edge; text top-left. Loop: arrow nudges right and back.
- Y2 Chevron march: a band of large yellow chevrons (› › › ›) across the card's middle/bottom, seamlessly scrolling right (background-position or translate on a repeated SVG group, wraps without a jump). Text top-left.
- Y3 Road: an ink road in perspective (trapezoid from bottom edge to a vanishing point near upper-right), white dashed centre line scrolling toward the viewer, and a big yellow painted arrow on the asphalt pointing up the road. Text top-left, clear of the road.
- Y4 Route arrow: a thick yellow curved path sweeping from bottom-left to the right edge, ending in a large arrowhead; three round photo pins (reuse `pin()` + `pinDefs`, ring color #fbfaf5) sit on the curve; dashes/flow along the path (stroke-dashoffset loop on an overlay dash line). Text top-left.
- Y5 Road sign: a big yellow diamond road sign (rounded corners, ink border inset) with an ink arrow inside pointing right, tilted slightly, on the right half; 2–3 thin yellow speed lines behind it. Loop: sign glides right a few px and back. Text left.

## Wiring
- Add `arrow:[5 fns]` to `window.DSPromoVariants` (keep competition/week/road untouched).
- `?promo=` parser in editorial.js: accept `y1..y5` → replaces the roadmap card (same as `r#`). Bump `promo-variations.js?v=`/`.css?v=` refs in editorial.js and `editorial.js?v=` in index.html (currently banners12 → banners13).
- Review page `promo-variations.html`: add a 4th section "roadmap — yellow arrow" showing current roadmap + Y1–Y5 (labels `Y1 · hero arrow`, etc.). Also add a short "shortlist" line in the page header: "picks: competition current + C4 · week current + W4 + W5".
- Append new CSS at the END of promo-variations.css under a `/* ---- Y set ---- */` header, selectors `html body .ed-promos .ed-promo.pv-y1` … `.pv-y5`. Class on the article: `ed-promo ed-road pv-yN`.

## Checks
- node --check both JS files; curl 200 for the page and assets. No browser tools, no new servers.
- Report geometry decisions for the three widths, and anything unverified.

---
# Round 3 (2026-10-14): C4 ticket rip + R4 rebuild (R4a/R4b/R4c)

## Part A — C4 ticket rip interaction (keep C4 look otherwise)
Current C4: `h3.pv-ticket` holds `.pv-fan` (prints), `.pv-stub` (right 22%, dots + blue star), `.ed-prize`, `.ed-prize-line`. `:before` paints side notches, `:after` paints the 78% top/bottom notches + dashed perforation.
Goal: the stub (right of the perforation) is a separate paper piece that can tear off.
- Ticket body background ends at the perforation: paint the cream only to `calc(78% + 5px)`; the right-edge side notch moves onto the stub.
- Stub: own cream background + its dots + the right-edge half-circle notch; its LEFT edge is a torn/jagged edge (clip-path polygon with ~18 small irregular teeth, ~4–5px deep). Flush and invisible when intact (body cream under the teeth).
- Body's perforation `:after` (dashed line + 78% notches) stays with the body.
- Hover (pointer:fine only, not when ripped): stub tears partially — `transform-origin: left bottom; rotate(6–8deg)` plus 2px x shift, so a wedge gap opens from the top; 0.35s ease-out. Optional: a 1–2deg counter tilt on the body.
- Click anywhere on the C4 card (including the button): first click rips the stub fully — it falls away (e.g. translate(35%,55%) rotate(32deg), opacity to .0 by the end, 0.65s cubic-bezier(.5,0,.75,0)) and the body settles (rotate(-1.5deg)). THEN navigate: after the animation, trigger the normal `[data-promo="competition"]` click so editorial.js navigates. Implementation: one document-level CAPTURE click listener in promo-variations.js: if the click is inside `.pv-c4` and the card lacks `.pv-ripped` → preventDefault + stopPropagation, add `.pv-ripped`, setTimeout(button.click, 650 or 0 for reduced motion). When the card already has `.pv-ripped`, let the click pass. On the review page (no navigation), remove `.pv-ripped` after ~1.8s so it can be tried again. Keyboard: Enter/Space on the button must also rip then navigate (the button click goes through the same listener).
- prefers-reduced-motion: no transitions; hover does nothing; click goes straight to navigation (ripped state may apply instantly).

## Part B — R4 rebuild: "summit map", three clean versions
Problem with current R4: contours are busy/irregular and collide with the text, the route and pins feel random, and PHOTOS on the route make no sense for a product roadmap. Remove photos entirely from R4 variants.
Shared language (all three):
- Background ink #0b1b27. Text: "the way" #fbfaf5, "forward." #07d653, button #fbfaf5. Text block never has art under it (keep a clear zone; check bboxes).
- Milestone markers instead of photos (all SVG, crisp, consistent sizes):
  - done: solid green circle r≈11 with ink check mark;
  - now ("you are here"): cream circle r≈9 inside a green ring r≈15, plus a soft halo ring that slowly breathes (opacity/scale loop 2.4s; off for reduced motion);
  - next: hollow circle r≈10, green dashed stroke;
  - summit/goal: a small flag (cream pole, green pennant) on top of a small ink-filled circle with green stroke.
- Route: one smooth path. Completed part solid green (width 5, round caps); future part dashed green (width 3.5, dasharray 2 9, round caps). Markers sit exactly ON the path (compute points from the same path data: use SVGPathElement-like math or define the path from the marker points with smooth curves through them).
- Contours: smooth, evenly spaced, NON-crossing concentric rings (same center, monotonically increasing radius, gentle low-frequency wobble only, amplitude ≤ 6% of radius, identical phase so they never cross). 6–8 rings, stroke #07d653 opacity .18, every 3rd ring opacity .38 and width 1.5.
- Hover: route future dashes flow toward the summit (stroke-dashoffset loop), nothing else.
- Classes: `ed-promo ed-road pv-r4a|pv-r4b|pv-r4c`; promo codes `r4a`, `r4b`, `r4c` in the `?promo=` parser (they replace the roadmap card). Keep existing `r4` as-is for reference.

### R4a · summit map (cleaned original)
- Text bottom-left (as now).
- Summit at about (372, 92) in the 477×330 design space; contour rings centered there, radii 26→~250 so the outer rings bleed off the card edges evenly; nothing crosses the text zone except the faintest outer rings (opacity ≤ .12 inside the text zone, or mask them there with a gradient).
- Route enters from the bottom edge around x≈250, climbs with two gentle switchbacks to the summit. Markers along it: done, done, now, next, then summit.

### R4b · elevation profile (side view)
- Text top-left.
- A ridge silhouette drawn as an elevation-profile line from the left edge (low, y≈300) rising to a peak at about (390, 120) then dropping off to the right edge; area under it filled with a subtle green-to-transparent vertical gradient (opacity .18→0); faint horizontal elevation grid lines (4–5, #fbfaf5 opacity .08) with tiny tick marks on the left edge (no numbers).
- The route IS the profile line (solid up to "now", dashed after). Markers on the line: done, done, now, next; flag at the peak.

### R4c · switchback trail
- Text top-left in a clean column (left ~45%).
- Right half: a tall zigzag switchback trail (4–5 legs with rounded turns) climbing from the bottom edge (x≈300) to a summit near the top-right (≈ (420, 70)); contours as a few nested rounded shapes around the summit, bleeding off the top/right edges.
- Markers at the turns: done, done, now, next; flag at the top.

## Wiring / review page
- Add the three to `window.DSPromoVariants.road4 = [r4a, r4b, r4c]` (or extend parsing so `r4a/b/c` resolve). Don't change the other sets.
- Review page: replace the "roadmap — yellow arrow" section with "roadmap — summit (R4 rebuild)": current R4 (from the road set) + R4a, R4b, R4c. Keep the Y set code in the JS (just not shown). Update the header picks line: "picks: competition current + C4 (rip on hover/click) · week current + W4 + W5 · roadmap R4 rebuild".
- Bump cache keys: promo-variations.css/js refs in editorial.js (v=4 / v=3) and editorial.js?v=banners14 in index.html.
- Checks: node --check both JS; curl 200 for page, assets, `/?promo=c4,w4,r4a`. No browser tools, no new servers. Report geometry for 477×330, 620×330 home card, 340×370 phone, and anything unverified.
