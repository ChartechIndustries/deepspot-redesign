# Site-wide scroll fade-in (2026-10-23)

Charlie: every section on the site gets a calm, ambient fade-in as you scroll down. Goal: the site feels smooth while
images and data still load. Tighten-up rules still apply (HANDOFF-2026-10-22.md, README latest log).

## Behaviour
- One shared module `source/site/reveal.mjs` + `source/site/reveal.css`, loaded on EVERY page (all routes in
  routes.json, home `source/index.html`, `/welcome/`, `/profile/`, 404). Prefer one include point that every page already
  loads (e.g. `site/navigation.js` or `site-cta.js` injects it) so pages need no new tags; if that is not possible, add the
  tags. Run `python tools/bump_keys.py` at the end.
- What reveals: each top-level content block of the page — the direct children of `main` / `.ds-page` that are sections,
  and on long pages also big cards/rows inside a section (grids: stagger the children, 60–80 ms apart, max 6 per group).
  Header, ticker, nav, skip-link, dialogs, sheets, toasts, fixed overlays: NEVER.
- Motion: opacity 0 → 1 and translateY(18px) → 0, 700 ms, ease `cubic-bezier(.2,.7,.2,1)`. Soft, no scale, no blur,
  no bounce. Trigger when 12% of the block is in view (rootMargin `0px 0px -8% 0px`). Reveal once; never hide again.
- Above the fold on first load: blocks already in view fade in as soon as they are rendered (same motion, stagger by
  order), so the first screen also eases in instead of popping. Never wait longer than ~150 ms after a block exists.
- Content rendered later by JS (most pages render into `main` after fetch): a MutationObserver picks up new blocks and
  reveals them the same way. A block that was revealed stays revealed through re-renders (re-render of the same node).
- Safety: content is never stuck hidden.
  - Hidden state is applied by JS only (class/attribute set by reveal.mjs), so no-JS shows everything.
  - Fallback timer: anything still hidden 2.5 s after it entered the viewport is shown.
  - `prefers-reduced-motion: reduce` → no motion; everything visible at once.
  - Print → visible.
  - Elements with focus inside are shown at once (keyboard users never tab into invisible content).
- Do not double-animate things that already have their own entrance: the community participants deck (`.pm`), the
  community page fade (`fx` load fade), the onboarding stage/sheets (`/welcome/`), the passport print-in/issue animations,
  the home globe hero (`.globe-stage`, hero copy — SSR + hydration: do NOT change first-render markup; only add attributes
  from JS after hydration, never on the hero), the tours stage (fixed, one screen), the desktop profile fixed window
  (≥1100px `html.pp-app`: reveal only inside the record pane's scrolling content, using that pane as the IO root; the
  passport field does not reveal). Phone profile reveals normally.
- No layout shift: use transform/opacity only. `will-change` only while animating. No horizontal overflow (translateY
  only).

## Checks
- `node --check`; `node --test qa/*.test.mjs`; `python tools/bump_keys.py --check` = 0 stale.
- Headless (one browser at a time, below-normal priority via qa/onboarding-v2.2/h.py): for home, browse, map,
  community, profile (wayfarer + preview, 390 and 1440), stories, story, spot, guides, leaderboard, roadmap, faq,
  welcome, 404: scroll top→bottom in steps, assert every block ends with opacity 1; screenshot a mid-reveal frame and
  the final state at 390 + 1440. Reduced-motion run: everything visible at load. axe 0, console 0, no overflow at
  320/390/1440. Home: no hydration error (#418) in console.
- Look at the shots. README log entry. Backup to backups/before-reveal-1023/. Do not commit or push.
