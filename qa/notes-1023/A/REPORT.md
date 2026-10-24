# Builder A report (home) — 2026-10-23

All items done. No commit, no push, no bump_keys, no `?v=` edits. Backups: `backups/before-notes-1023/`.

## Items
| Item | State | What changed |
|---|---|---|
| 2.1 dots over pins | done | Cause: `responsive.css` phone rule `.map-pin:not(.decorative-pin)::before {inset:-6px}` (touch target) still had the ground-oval look (10x4 green, 60 %). The oval sat at the pin's top-left corner. Rule now resets width/height/background. Tablet/desktop oval is under the stem tip (unchanged, anchored). |
| 2.2 centre the card | done | Phone/tablet (<=1100): card centred on the stage by CSS (`responsive.css`, both hero rules). Chunk: active pin rotates to screen centre (clamped 12-40 deg left so it stays lit); measured pin x = 195 of 390, card centre 195. Desktop >1100: card centred on the pin, above it; below it if no room; beside it (level with pin) if neither fits. Pin never under the card, card always on screen (all sizes, dark + light). |
| 2.3 explore -> map | done | `<button class="explore-bar">` is now `<a href="/map/?spot=<slug>">` in chunk and `source/index.html` (no #418 in console). Each of the 10 globe spots has a `slug` (= `site/content.json` key). Click: pin drop/bounce 240 ms (`.is-dropping`), then navigates; modified click and middle click go straight; reduced motion = instant, no animation. `.hero-copy a.explore-bar{pointer-events:auto}` added (phone had `.hero-copy{pointer-events:none}` for buttons only). Map: `site/map.mjs` accepts slug or full id; opens the card after the fly ends so Leaflet pans it fully into view. Tested 390 + 1440, Oya and Teufelsberg. |
| 2.4 swipe banner | done | `whats-new.js` `wireSwipe()`: touch/pen only. Next panel follows the finger 1:1 (drag left); previous panel enters from the left (drag right). Release > 20 % width or flick > 0.4 px/ms commits (440 ms, ease-out spring); less springs back (320 ms). Autoplay pauses while touching + 6 s. `touch-action:pan-y` on `.wn-window`; vertical page scroll over banner verified (scrollY changed, panel did not). Click after a drag is suppressed. Arrows, tabs, pause, keyboard unchanged. Swipe expands a collapsed tablet banner. Reduced motion: no follow, instant switch. |
| 2.5 browse button | done | `featured-spots.css`: 56 px tall, 20 px text, 28 px side padding, pill; phone full width (max 360). Works with colour on (green) and off (outlined pill). Specificity beats `panel-colors.css`. |
| home count | done | `featured-spots.js` counts with `prepareCatalog` from `/browse/catalog.mjs` (same list as browse). Home 369, browse 369. Fallback inline if the import fails. |

## Files changed
- `source/_next/static/chunks/page-C89T775K-v51.js` (slugs, yaw centre, desktop card, explore link + drop)
- `source/index.html` (explore `<a>`)
- `readable/page.js` — was stale (no drag/pitch code); regenerated from the chunk with `?v=` stripped. Do not copy it back over the chunk.
- `source/responsive.css`, `source/whats-new.js`, `source/whats-new.css`, `source/featured-spots.js`, `source/featured-spots.css`, `source/site/map.mjs`
- Not touched: `map/index.html`, `editorial.*`, `community.*`, `world-banner.*`, `_next` css (not needed).

## Needs the lead
- Run `tools/bump_keys.py`: chunk, responsive.css, whats-new.js/css, featured-spots.js/css, map.mjs keys; `featured-spots.js` imports `/browse/catalog.mjs?v=776ebad9` (builder B's file, key will change).
- The old explore dialog code is still in the chunk but nothing opens it.
- `?raf=timer&snap=1` + document.hidden shim used for all globe checks (`lib.py`).

## Look now (1 line each)
- Phone: no stray green dots, active pin mid-screen, card centred under it, explore pill is a real link.
- Tablet portrait: card centred under the pin; landscape/desktop: card beside or below the pin, nothing hidden.
- Banner: drag shows the next panel sliding over; release springs.
- Browse button: big green pill, 56 px.

## Screenshots (`qa/notes-1023/A/`)
- Before: `pins_p390_before.png`, `pins_t820_before.png`, `pins_d1440_before.png`
- Globe matrix, dark + light: `f_<p390|p360|t820|t1180|t1024|d1440|d1024>_<dark|light>.png`
- Map after explore: `map_p390.png`, `map_d1440.png`, `f_map_d1440_teufelsberg.png`
- Swipe: `swipe_p390_middrag.png`, `swipe_p390_dragright.png`, `swipe_p390_after_next.png`, `swipe_p390_after_prev.png`
- Browse button: `browse_<p390|p360|t820|d1440>_<dark|light>.png`, `f_browse_coloroff_d1440.png`
- Scripts: `lib.py shot_home.py probe_pins.py explore.py swipe.py swipe2.py browse_btn.py final.py patch_chunk.py`

## Checks run
- No console errors, no horizontal scroll, card on screen, no pin under card, no card/explore-bar overlap: 390, 360, 820, 1180, 1024x1366, 1440, 1024x768, dark + light.
- Reduced motion: explore navigates at once.
- Swipe tested with CDP touch at 390 and 820 (follow, commit next/prev, spring back, vertical scroll).

## Open
- Real-device check needed for swipe feel and flick speed (headless touch events are slow: the flick path was not reproducible, code path is simple).
- Tablet 651-1100: the active pin is limited to 40 deg left of centre by the globe geometry (stage is 62 vw tall); it sits left of the card centre there, not exactly above it.
- Desktop >1100: card position beside the pin when the stage is short (620 px high at 1440x900).
