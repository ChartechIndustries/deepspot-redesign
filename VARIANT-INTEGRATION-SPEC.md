# Style variants v2 (halftone) + v3 (moles) — integration spec (2026-10-23)

Base for both: v1 after Charlie's notes round (commit "Charlie's notes round", see README 2026-10-23). Each variant is a
full copy of the site with ONE visual system applied. Same content, same features, same routes as v1.

| | v2 halftone | v3 moles |
|---|---|---|
| Folder | `C:\Users\CharD\Desktop\DeepSpot Globe v2` | `C:\Users\CharD\Desktop\DeepSpot Globe v3` |
| Repo / live | ChartechIndustries/deepspot-redesign-v2 → github.io/deepspot-redesign-v2/ | ChartechIndustries/deepspot-redesign-v3 → github.io/deepspot-redesign-v3/ |
| Local server | `python serve.py 8767` | `python serve.py 8769` |
| System | Audit **revision 2** "printed in dots": `git -C "…v2" show 3793eed:UX-AUDIT-2026-10-23.md` §1–3 | Audit **revision 3** "mole world": `UX-AUDIT-2026-10-23.md` (current) §1–3 |
| Art / kit | `_variant-assets/` (`kit/ds-halftone.mjs`, `kit/halftone_bake.py`, `final/*`) | `_variant-assets/` (Blender kit + `final/*` loops and stills) |

## Shared rules (both variants)
- Four inks: navy `#0b1a2e`, cobalt `#3c60ff`, green `#07d653`, cream `#f5f4ee` (+ v3: mole colours on moles only). Remove
  cyan/teal, lime, yellow, pink, purple, olive from section backgrounds, tabs and accents (keep data colours where they
  ARE data, e.g. archetype legend dots — make them the 4 inks + tints if possible).
- Type: headings heavy lowercase, one green word max; two-tone blue+green only on the home hero. Mono caps only on the
  passport and coordinates; everywhere else sans 14–15 px sentence case. Desktop nav lowercase.
- Shapes: cards 14 px radius, 1 px line, no shadow; pill buttons; no solid full-width colour bars as section headers.
- Every section: heading = what it is, one line = what you can do, one button (familiar verb).
- Home = 6 blocks in this order: hero → what's new → discover deep spots → the world is deeper → race → hidden gem +
  weekly find. Remove the home "community" table + photo-bubble collage (the race replaces it). Spot of the week and the
  roadmap become what's-new panels or leave home.
- Understandability fixes from audit §3 (both): "Extra / Un-Ordinary" break, what's-new rail words → tabs/dots, browse
  tags = one lowercase tag + short voice title, profile tab colours one colour (active green), stat boxes quieter.
- Keep everything Charlie's notes round built (swipe, deck, tilt, pad, dialog, menu, count pill, explore link).
- Keep the delight moments: print-in + REGISTERED, ISSUED slam, follow shake + hearts, deck deal-out, mole reveal.
- Dev toggles (light / color on) stay — test build.
- Retire per system (see audit table §2): glossy mountain, globe + paper plane, cake-base gem, CSS podium look, duotone
  W5, SVG seals, photo-bubble collage.

## Per-variant graphic map
Use the audit's §2 table of the variant's revision. Art that the kit did not make yet: build it in the same system (v2:
`ds-halftone` text/tone/mask or the baker; v3: write it down as "art still missing" and use the closest existing render
or the HTML/CSS fallback in the same system — do not invent a third style).

## Two builders per variant, strict ownership
- **G (global + home):** `source/index.html`, `_next/**`, `readable/page.js`, `editorial.*`, `whats-new.*`,
  `featured-spots.*`, `world-banner.*`, `community.*` (home block), `responsive.css`, `panel-colors.*`, `site-cta.*`,
  `site/refinements.css`, `site/finishing.css`, `site/navigation.js`, `site/account-nav.css`, new shared art module
  (`site/art.mjs` or the kit copied to `site/halftone/`), `banners/` + new art files.
- **P (pages):** `site/community-v2.*`, `site/community-hub.*`, `site/giveaway-hero.*`, `site/passport-mini.*`,
  `site/pages.*`, `site/core.mjs` (no change to followTab/tabFades), `browse/*`, `profile/*` (keep passport + edit
  dialog behaviour), `site/contribute.mjs`, `404.html`, `competition/`, `leaderboard/`, `roadmap/`, `membership/`,
  `faq/`, `spot/`, `guides/`, `contribute/`.
- G goes first on the shared tokens (CSS custom properties in `site/refinements.css`: `--ink-navy`, `--ink-cobalt`,
  `--ink-green`, `--ink-cream`, type scale vars) within its first hour and writes them in `qa/variant/<v>/TOKENS.md`;
  P reads that file and uses the tokens.
- Neither runs `tools/bump_keys.py`; the lead does. No commit/push/publish.

## Checks
- Headless (below-normal priority; swiftshader for WebGL pages), phone 390/360, tablet 820/1180, desktop 1440; dark +
  light. 0 console errors, no overflow, no clipped text, reduced motion = static.
- `node --test qa/*.test.mjs`, `qa/onboarding-v2.2/flow.py` (pass), `node --check` on changed files.
- Before/after contact sheets per page in `qa/variant/<v>/` — the whole site must read as ONE style. Look at every shot.
- README entry in the variant folder.
