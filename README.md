> **Current version — October 8, 2026:** This project is now the full DeepSpot frontend prototype, not just the original Earth mirror. Serve `source/` with `serve.py` at http://localhost:8766/. See [SITE-EXPANSION-HANDOFF.txt](SITE-EXPANSION-HANDOFF.txt) for all 29 routes, source coverage, local interactions, backend boundaries, and QA. The active homepage uses the v51 chunk trio. Earlier entries below are historical notes.

# DeepSpot Globe — sourced from deepspot-globe-preview.tomcat1205167.chatgpt.site

Pulled 2026-09-10 through the logged-in Chrome session (site is behind ChatGPT login; curl gets 401).
Every file byte-verified by SHA-256 against the live site.

## Layout
source/                      exact mirror of the deployed site (serve this)
  index.html                 SSR HTML (vinext / Next-style app router, React 19)
  earth-surface.jpg          = three.js examples/textures/planets/earth_atmos_2048.jpg (2048x1024)
  japan.jpg india.jpg athens.webp austria.jpg london.jpg   location photos (pin preview + dialog)
  _next/static/css/index.3fOv_FAP.css     Tailwind v4 preflight + site styles (site styles start at `.ticker`)
  _next/static/chunks/page-C89T775K.js    THE APP: globe renderer + locations + page component
  _next/static/chunks/index-B9ZOBUSp.js   router/runtime
  _next/static/chunks/framework-D_rUT4EX.js   React
  _next/static/chunks/rolldown-runtime-*.js, layout-segment-context-*.js   glue
readable/                    prettified copies (page.js, index.css, index.html) for reading/editing

## Run
    cd source
    python -m http.server 8765
    open http://localhost:8765/index.html

Note: the globe render loop bails while `document.hidden` is true. A background tab shows a black canvas — that's by design, not a bug.

## Where things are (readable/page.js)
- ~L5316  `bo` = locations array {name, place, lat, lon, image, text}
- ~L5364  `xo` = Globe component (canvas + pins + hover preview). Render loop, pin projection, yaw easing.
- ~L5535  `So` = page: ticker, header, hero copy, globe controls, footer dots, explore dialog
- ~L3      `o(img)` = Canvas2D halftone fallback; `s(img,canvas)` = WebGL halftone shader (GLSL inline)
- Icons: lucide (map-pin, arrow-up-right, chevron-right, earth, pause, play, x). Dialog: Base UI.

## Where things are (readable/index.css)
- Site styles from ~L5492 (`.ticker`, `.header`, `.hero`, `.globe-stage`, `.map-pin`, `.pin-preview`, `.explore-bar`, `.location-dialog`, footer)
- Fonts: system stack only (no webfont files). Palette: paper #F6F3EC, ink navy, blue #3B5BDB-ish, green accent.

## Editing minified vs readable
`readable/` is prettified only — not a build setup. To ship changes either:
1. edit `readable/page.js` and copy it over `source/_next/static/chunks/page-C89T775K.js` (ES module, still valid), or
2. rebuild as a standalone page: lift `o`, `s`, `bo`, `xo`, `So` into plain React/vanilla — everything site-specific is in those five symbols.

## Current state (2026-09-10, chunk page-C89T775K-v25.js)
- Halftone: 9-glyph square set replicated from the reference image; grazing light + rim crescent; shadow smoothstep(.55,.92).
- Variants (bottom-left switcher / URL): tex=day|night|neon|atmos, theme=dark|light, color=1 (source-colour ink), clouds=0 to drop the cloud overlay. Clouds are a live GPU layer (2nd texture unit, drifting + warped UVs, `cloudAmt`/`time` uniforms); Canvas2D fallback gets a baked screen-blend.
- Locations: 10 DeepSpot picks in `bo` (readable/page.js ~L5513); images in source/spots/. Full scraped catalog (281 spots) in deepspot_catalog.json.
- Pins: fixed 3.0s ease-in-out yaw tween (no wobble); active pin rotates to 45° left of centre; pins hidden when light < .35; card auto-shows once settled, hover overrides.
- Dev flags: raf=timer (rAF via setTimeout for hidden tabs), snap=1 (yaw jumps to target).
- SSR gotcha: anything that changes first render (pins, ticker, dots, coordinates, explore text) must also be edited in source/index.html or React throws hydration error #418 and the globe loop dies.
- Cache gotcha: bump the page chunk suffix (vNN) and update refs in index.html + index-B9ZOBUSp.js on every JS change; serve.py sends no-store.

## Reference-style update (v26)
- Current served application is page-C89T775K-v26.js; readable/page.js is kept in sync.
- Expanded grazing light reveals geography and cloud detail, with a narrower cyan rim and a grid of fine background points.
- Rim fades by dropping glyph cells across four cell widths.
- Pins use stepped outlines, square apertures and cyan/ice colours; matching photo cards retain location content.
- Hover no longer suspends the location cycle.
- Previous readable files and HTML are in backups/before-reference-style; the v25 application chunk is preserved.

## v28 — Colored Day light variation
Added Day · Color Light to the switcher (?tex=day&theme=light&color=1). Colored Day cloud strength increased from 0.45 to 0.75 in GPU and baked fallback paths. Other texture cloud strengths preserved.


## Homepage v33
Updated hero copy, green Un-Ordinary, larger lighter supporting text; removed annotated concept controls. Added giveaway, weekly discovery and development banners with read-more dialogs and animated verification seal. Giveaway uses illustrative generated camera; entry details remain pending. JS syntax and local browser link checks passed.

## Homepage v34
Wide looping scroll-snap carousel with cropped adjacent banners, arrow and dot navigation, animated CSS podium, shared halftone styling. Latest mockup changes prize to 300 dollars cash. Competition details retain pending entry rules. Reduced-motion disables podium and seal animation. Checked JS syntax, center alignment, next-slide navigation and loop wrap in local browser.

## Banner design studies
Open /banner-variations.html for ten independently styled banner sections beneath the live dark colored Earth. Selector switches layouts; View all ten presents all 30 cards. Existing homepage is preserved. Files: source/banner-variations.html, source/banner-studies.css, source/banner-studies.js. Verified desktop layouts, mobile page overflow, image loading, variation selection and details dialog. Recommended directions: 02 editorial index and 06 halftone windows.


## v50 — Grab-to-rotate Earth and responsive layouts (2026-09-23)
- Serve `source/` as before. Active application: `page-C89T775K-v50.js`, with matching `index-B9ZOBUSp-v50.js` and `layout-segment-context-BmbrN5Mh-v50.js`. These three module paths must be versioned together because the router and layout import each other.
- Desktop: drag the Earth horizontally or vertically; release for a short glide. Arrow keys also rotate a focused globe. Touch: horizontal swipes rotate; vertical swipes scroll the page. Pin clicks still select a location. Automatic tours wait at least six seconds after dragging, then resume on their next interval.
- Texture sampling and pins share yaw/pitch transforms, including the Canvas2D fallback. Rendering pauses when the Earth is outside the viewport. No per-frame React updates were introduced for dragging.
- Phone/tablet layouts through 1100px place a compact location card over the lower Earth, fully inside the globe area. The hero heading stays separate. The old reserved shelf beneath the globe has been removed. `responsive.css` is the last stylesheet in index.html.
- Phones use full-width news panels with colored touch tabs. Stories become scroll-snap strips; desktop's opposing story animations are preserved. Smaller screens get larger controls, contained dialogs and adjusted type, grid spacing and footer links.
- Initial theme controls and editorial components mount after hydration to match the saved static HTML. Verified at 320, 390, 768, 1024 and 1440px, with light/dark theme checks, drag, keyboard rotation, pin selection and mobile banner switching.
- Pre-change entry files are in `backups/before-mobile-drag-20260923/`. Earlier application modules are preserved.


## Community floating portraits (2026-09-24)
- Replaced the bento video strip with community portraits inspired by Popeye. The final layout puts community on the left, stories on the right, and promotional covers beneath both.
- `source/community.js`, `community.css`, `community.json`, and `community-assets/` contain the feature. Six contributors are sorted by contributions. Hover/focus/tap connects portraits to list rows; profile links open clearly labeled demo profiles until real URLs are supplied.
- The user authorized placeholders: all six names, totals and photos are samples. Photos come from Random User's public placeholder portrait library. Replace the JSON with verified contributors and profile URLs, then set `preview` to false.
- Portraits move via six transform-only bodies with gentle collisions. Animation stops offscreen, in hidden tabs, inside the profile dialog, when paused, and for reduced-motion preferences. Desktop has two columns; phones stack the portrait field over the leaderboard.
- Component colors follow light/dark and the existing color-accents toggle. The production Netlify deployment is independent of this local change.
- Before-change entry/editorial files are preserved in `backups/before-community-20260924/`.


## Restored bento and video banner (2026-09-24)
- Community occupies the former videos half of the bento, with matching header/content heights beside the two story strips. On phones the portrait field, contributor list and stories stack.
- `source/world-banner.js` and `world-banner.css` add the user-supplied footage between featured spots and the bento. The headline reads "the world is deeper, stranger & cooler than you imagine."
- The local MP4 in `source/media/` is cropped with object-fit, silent and looping. It loads on approach, pauses offscreen or in hidden tabs, offers a pause/play button, and shows the poster by default for reduced motion.
- Checked desktop/mobile layout, light/dark themes, contributor interaction and video playback controls. The community active class is scoped to avoid an older global style affecting row heights.
- Before-change files and a video contact sheet are in `backups/before-bento-video-20260924/`. These edits are local; no production deployment was made.


## Intentional color-on system (2026-09-24)
- Color-on now uses green for actions/selections, aqua for the community portrait field, and cobalt in editorial details. Discovery cards, story reading surfaces and headers follow the light/dark page theme.
- The news accordion retains its original four-color identity even with color off. Hero and page backgrounds are unchanged.
- Rules are consolidated in `source/panel-colors.css` (v4), with community styles v6. See `COLOR-AUDIT-20260924.md` for the audit and verification. Backup: `backups/before-color-audit-20260924/`.

- Color balance follow-up (panel-colors v5): restored cobalt category/bento headers and contribution panel, plus aqua competition card. Neutral reading surfaces and page backgrounds preserved.

## Home promo banners redesign (2026-10-14)
- The three promo banners under the bento (`.ed-promos` in `source/editorial.js` + end of `editorial.css`) were redesigned. Copy is unchanged.
- $300: the blob podium is replaced by a fan of three location prints (rummu = 1, teufelsberg = 2, maishima = 3) with rank badges and a halftone corner.
- Spot of the week: full-color Oya photo, inset hairline frame, place caption, SVG "DEEPSPOT VERIFIED" ring seal with a green star.
- Roadmap: the AI mountain PNG is replaced by an inline SVG map (generated contours, green route, photo pins oyunohara/xwejni/sandchurch, dashed goal). `xMidYMax slice` keeps the goal visible on narrow cards.
- Cache keys: `editorial.css?v=banners1`, `editorial.js?v=banners1`. Backup: `backups/before-banner-redesign-20261014/`.
- Bold pass (same day): cards 330px tall, larger fan/seal/pins, brand colors (competition = green #07d653, roadmap = cobalt #3c60ff, green seal + "underground."). Tablet (651–1000px): competition spans full width. Phone: competition button sits under the prize line. Panel-colors "off" keeps neutral backgrounds. Backup: `backups/before-banner-bold-20261014/`. Cache key `editorial.css?v=banners10`.

## Promo banner variations (2026-10-14)
- Review page: `/promo-variations.html` (current + 5 variants per banner, 477x330, phone-width toggle). Spec: `PROMO-VARIATIONS-SPEC.md`.
- Live preview: `/?promo=c1..c5,w1..w5,r1..r5` (any subset) swaps the home cards; no param = unchanged.
- Files: `source/promo-variations.js` (`window.DSPromoVariants`), `source/promo-variations.css` (container-query units; QA fixes at the end). Backup: `backups/before-promo-variations-20261014/`.
- Live competition card: fan moved/shrunk on desktop (badge "2" was clipped, fan hit "$300" on ~430px cards). `editorial.css?v=banners11`, `editorial.js?v=banners12`.
- Phone layouts of variants are a scaled desktop layout; tailor them after the picks.
- Round 2: shortlist = competition current + C4, week current + W4 + W5. New roadmap set Y1–Y5 (cobalt + yellow #ffd400 arrow with calm CSS loops, off for reduced motion); `?promo=y1..y5`. QA fixes: Y1 tip inside card, Y3 dashes no longer merge, Y4 shifted off the edge. Keys: `promo-variations.css?v=3`, `.js?v=2`, `editorial.js?v=banners13`.
- Round 3: C4 ticket rips (hover = partial tear at perforation, click = stub falls off, then navigates to /competition/). R4 rebuilt without photos as R4a summit map / R4b elevation profile / R4c switchback trail (`?promo=r4a|r4b|r4c`), milestone markers done/now/next/summit. Review page row "roadmap — summit". Keys: promo css v4 / js v3, `editorial.js?v=banners14`.

## Passport round 1 (2026-10-15)
- Mole head crop: when the avatar is a mole, `data.mjs` sets `imageKind:'mole'` and the portrait becomes `.pp-portrait-mole` (container-unit crop from `moleCrop` in `passport-art.mjs`, x .17 / y 0 / w .66, tuned on real renders). The share image uses the same crop via drawImage source rect. Photo and traveler avatars unchanged.
- Signature pad: new `source/profile/sign-pad.mjs` + `.pp-pad`/`.sp-*` rules at the end of `profile.css`. PictoChat-style device (ruled paper, name tab, tool strip, 12 colors, Silkscreen font from Google Fonts). Free and pixel brush, small/big, eraser, undo (20), two-step clear, save. Canvas 512x256.
- `signatureArt` (png data url, under 200 KB) added to `normalizeAccount`; saved in the account draft, shown on `/profile/?user=preview`, drawn in the share image under the bio. Account editor shows a thumbnail and a "draw on your passport" link (`#pp-pad`).
- Cache keys: `profile.css?v=pad1`, `profile.js?v=pad1`, `account.mjs?v=pad1` (pages.mjs), `account-state.mjs?v=pad1`, `account.css?v=pad1`.
- Backup: `backups/before-passport-r1-20261015/`. QA shots: `qa/passport-r1/`.

## Full audit (2026-10-19)
- Report: `AUDIT-2026-10-19.txt`. Evidence and scripts: `qa/audit-20261019/`. No source files changed.
- Top items: page weight (home 15.3 MB), dead files + `source/backups/` inside the deploy folder, small text on cobalt under 4.5:1, `profile/data.mjs` imports account-state without `?v=pad1`, no 404.html.

## Mole trait rules + alpha fix (2026-10-19)
- Rules source: `Downloads\Mole Export\MOLE_RULES.json` (see that README). `sync_mole_rules.py` writes them into `source/site/mole/assets/scene.json` (`rules`) and copies the roller to `source/site/mole/mole-rules.mjs`. Do not edit those copies by hand.
- `mole-reveal.mjs`: `rollTraits` uses the shared roller; the flicker sequence uses `equip`, so even the flicker never shows a banned pair. Smock / Yellow Smock / Manifest never roll with any shirt, the Nami bikini or a dress.
- Alpha: Cig smoke and Fez strings render blended (`rules.softAlpha`); all other alpha stays a cutout. Fez.glb strings texture had inverted alpha (fixed with `fix_glb_alpha.py`).
- Cache keys: `mole-reveal.mjs?v=rules1` (account.mjs), `account.mjs?v=rules1` (pages.mjs), `mole-rules.mjs?v=1`, `scene.json?v=rules1`, trait GLBs `?v=rules1`.
- Evidence: `qa/mole-combos/` (165 combo renders, grids, alpha_compare.jpg). Backup: `backups/before-mole-rules-20261019/`.

## Audit fixes (2026-10-19)
- Plan `FIXES-PLAN-2026-10-19.md`; results at the end of `AUDIT-2026-10-19.txt`.
- Moved: `source/backups/` → `backups/source-backups-moved-20261019/`; dead files → `_archive/source-dead-20261019/`; original images → `_archive/originals-20261019/`. Hotlinked images → `source/editorial-assets/ext/` (map: `qa/audit-20261019/hotlink-map.json`).
- New: `source/404.html`, `source/og-image.jpg`, `source/roadmap-mountain.webp`.
- Keys: site-cta.css audit1, refinements.css 5, panel-colors.css 6, responsive.css 8, whats-new.js 10, account.css a11y1, account.mjs rules1, profile.css a11y2, promo-variations css 4 / js 3.
- Backups: `backups/before-audit-fixes-20261019/`, `backups/before-mole-rules-20261019/`.

## Community page v2 (2026-10-19)
- Spec `COMMUNITY-V2-PLAN.md`, mockup `qa/community-v2/mockup.png`. Code: `source/site/community-v2.mjs` + `community-v2.css` (`?v=1`, from pages.mjs and community/index.html). Old hub: `/community/?v=hub1`; older page `?v=old`.
- Sections: banner carousel (4 slides incl. refer-a-friend) · leaderboard ($300, real top 3, live month countdown, this month/all time, "you" row) + passports (3D moles in `community-assets/moles/`, rolled from each handle with MOLE_RULES) · live from the discord (real forum snapshot + real poll; `DISCORD_URL` placeholder → deepspot.io/community until the invite link is known) · community spots (41 local-photo spots, 800px cards in `editorial-assets/cards/`, 3 real pending submissions with Commons photos + credits in `community-assets/pending/credits.json`; YU Biznis Centar has no licensed photo yet) · roadmap (local votes).
- No invented counts/quotes: votes show the viewer's own choice only. Weight ~0.7 MB. axe 0, no errors, no overflow (390/320).
- Mole renderer: `qa/community-v2/moles/render_moles.py` (needs outfitter-3d served on 8799).
- Backup: `backups/before-community-v2-20261019/`. Not deployed.

## Community giveaway hero — 10 versions (2026-10-19)
- Spec `GIVEAWAY-HERO-SPEC.md`, sketch `qa/community-v2/giveaway-sketch.png`. Banner + leaderboard/passports panels removed from /community/; the giveaway hero renders first.
- Code: `site/giveaway-hero.mjs` / `.css` (`?v=1`); `community-v2.mjs?v=2` exports `people`, `passCard`, `fmt`.
- Switch: `/community/?giveaway=g1..g10` (default g1). Review page: `/giveaway-variations.html` (all 10, phone toggle). Debug: `?race=final|mid`.
- Versions: G1 bell bars · G2 finish line · G3 racetrack lanes · G4 oval track · G5 starting gates · G6 halftone lollipops · G7 tote board · G8 summit climb · G9 photo finish · G10 split hero. √ points scale (note on each).
- Screens: `qa/giveaway/` (all-1440.jpg contact sheet). Backup `backups/before-giveaway-hero-20261019/`. Not deployed.

- G1 v2 (picked): default on /community/; first version kept as `?giveaway=g1a`. giveaway-hero ?v=2, community-v2 ?v=3. Screens `qa/giveaway/g1v2/`. Backup `backups/before-g1v2-20261019/`.

- G1 v3 (2026-10-19, Opus design pass): title is one left lockup "the race for $300." + rules line (real end date) + inline countdown; finish tape, $300 flag and the upper read-more removed; cream prize chips ($300/$100/$100); CTA text = points rules; participants band spacing. New "your vote matters." section (`.cv-vm`, voteHTML in community-v2.mjs) before community spots + roadmap, with smooth in-page jumps. Keys: giveaway-hero css 4 / mjs 5, community-v2 css 4 / mjs 7. Screens `qa/giveaway/g1v3/` (r1 = first pass, r2 = after design audit). Backup `backups/before-g1v3-20261019/`.

- G1 motion (2026-10-19): racer(stage,move,{snap:true}) for G1 only. No bob/rotation; snapEase (one small settle); edges first, leader lands last (~1.3 s total vs ~4 s); heads lift (scale 1.12 + deep soft shadow via --lf) and land with a tight shadow; bars cast a side drop-shadow; leader breathe loop off; sparks fire at the leader landing. Other versions unchanged. Clip `qa/giveaway/motion/race-g1.mp4`. Keys: giveaway-hero css 5 / mjs 7, community-v2 mjs 9. Backup `backups/before-g1-motion-20261019/`.

- G1 ambient background (2026-10-19): `site/halftone-field.mjs?v=1` (WebGL) draws turbulent domain-warped noise through the hero Earth glyph set + Bayer threshold (copied from page-C89T775K-v51.js), ink = Earth ramp blue (dark) / navy (light), canvas opacity .13/.10 with a fade-up mask; replaces the static .gv-p1 dot field. 24 fps, paused offscreen/hidden tab, still frame for reduced motion, no WebGL = nothing. Also fixed: light-mode 2nd-place tag text was white; giveaway-hero now imports community-v2.mjs at the SAME key as pages.mjs (keep them in sync, else two module copies load). Keys: giveaway-hero css 7 / mjs 8, community-v2 mjs 10. Shots `qa/giveaway/halftone/` (*-full.png = boosted to 100% for judging). Backup `backups/before-halftone-bg-20261019/`.
- Halftone cell 6 → 10 px (bigger glyphs, same noise scale). Keys: giveaway-hero mjs 9, community-v2 mjs 11.
- Halftone quieter: opacity .075 dark / .06 light, motion speed .035 → .016 (about half). Keys: halftone-field 2, giveaway-hero css 8 / mjs 10, community-v2 mjs 12.

## Passport v2 (2026-10-20)
- Spec `PASSPORT-V2-PLAN.md`. Vertical passport: sticky identity column (mole + level bubble, name, @handle, member since, member level, level progress, bio, art pad "my mark." restyled to the site, MRZ) + right sections (traveler type from real posting categories, contributions, postings, stamps, places, giveaway standing).
- Rules in `source/profile/passport-rules.mjs`: level = 1 + floor(√(points/40)); member levels newcomer/scout/explorer/pathfinder/trailblazer/cartographer/legend; traveler-type category map. Tests `qa/passport-rules.test.mjs`.
- Moles from `community-assets/moles/<id>.webp`; photos no longer used as avatars. Posting photos: local + DeepSpot r2.dev images (data.mjs `photo()`); spots with no catalog photo show the "deep spot." placeholder.
- Keys: profile css/js/data/sign-pad/export/rules `pv2` (data.mjs + profile.js now `pv3`). Shots `qa/passport-v2/shots/`. Backup `backups/before-passport-v2-20261020/`. Not deployed.

- G1 cleanup (2026-10-20): no halftone dots inside the bars, no "bar height" note, no run-it-again button (foot removed; gv-wrap margin 48px keeps the gates clear). Keys: giveaway-hero css 10 / mjs 11, community-v2 mjs 13.

## Passport v3 (2026-10-20)
- Spec `PASSPORT-V3-SPEC.md` (Opus design analysis of Charlie's reference `qa/passport-v3/reference.png`). Two panes: left "field" = top local posting photo through the Earth halftone (`profile/halftone-photo.mjs`, Earth glyphs + Earth ink ramp) with a cream ID card (mole square + level bubble, name/user/since/level rows, progress, MRZ) and a signature plate; tabs `passport` / `my mark` (pad lives in the card frame). Right "record" = 7 sections, each a 40px header bar + 24px content (16 phone); one card system; no aqua fills; spacing scale 8/12/16/24/32/48 (measured by `qa/passport-v3/designqa.py`).
- Opus pass after the build: field height min(100vh-32px, 760px) so card + plate are visible at load; stronger halftone contrast; "the poet." period; every passport uses the Earth halftone (remote r2.dev photos can't be read by WebGL → first local posting photo, else /spots/teufelsberg.jpg).
- Keys: profile css `pv3b`, profile.js `pv3d`, halftone-photo `pv3b`, others `pv3`. Share image still v2 look. Backups `backups/before-passport-v3-20261020/`, `backups/before-passport-v3b-20261020/`. Not deployed.
- Passport field (2026-10-20): photo halftone replaced by the soft animated field (`site/halftone-field.mjs?v=2`, cell 8, 20 fps, opacity .16 dark / .12 light, edge-faded mask, faint cobalt glow behind the card). halftone-photo.mjs kept but unused. Keys: profile js/css `pv3e`. Backup `backups/before-passport-softbg-20261020/`.
- Passport field spans the whole comp (2026-10-20): `.pp-bg` (absolute, whole book) > `.pp-bg-in` (sticky, 100vh) hosts the canvas, so it covers both panes at every scroll position while rendering only one screen. Panes transparent above it; edge mask removed. Keys: profile js/css `pv3f`.
- Passport field: left column only (2026-10-20). `.pp-bg` moved inside `.pp-field` (full column height, sticky 100vh canvas layer); right pane opaque again. Keys: profile js/css `pv3g`.
- Fix (2026-10-20): `.pp-bg` used overflow:hidden, which made it a scroll container, so the sticky canvas never followed the page and the halftone stopped below the first screen. Now `overflow:clip`. Verified the canvas covers the visible left column at 6 scroll positions, DPR 1 and 2. Key: profile css `pv3h`.

## Sign-in / paid gate (2026-10-20)
- Spec `GATE-SPEC.md`, reference `qa/gate-reference.png` (NYT). Code `site/gate.mjs`, `gate-state.mjs`, `gate.css` (loaded only when a sheet shows). Review page `/gate-preview.html`; switch `?gate=out|free|member|off`; session `deepspot-session-preview` (local only, nothing sent).
- Free-account wall: `/spot/` after 2 paragraphs, `/story/` after 3; action sheet for save/vote/poll/roadmap/comment/trip share-save/contribute submit. Member wall: gallery photos 2+ and giveaway "join now". Never gated: home, browse, map, community viewing, lists, passports, membership/FAQ/legal/app/mission/404 (crawl-verified).
- Opus pass: NYT proportions — sheet ≈42% of a 900px viewport (top at 518px), one-line heading, email + continue on one row, 110px fade so the headline stays readable; copy "It’s free. Read full spots and stories, keep a fieldbook, plan trips and vote."
- Keys: gate.mjs / gate.css / account.mjs / planner.mjs `gate3`, gate-state `gate1`. Backups `backups/before-gate-20261020/`, `backups/before-gate-compact-20261020/`. Not deployed.

## GitHub + Pages (2026-10-20)
- Repo (public): https://github.com/ChartechIndustries/deepspot-redesign — `main` = source + docs + QA scripts (screenshots, backups, archives, deployments, raw scrapes are gitignored).
- Live: https://chartechindustries.github.io/deepspot-redesign/ — community `/community/`, passports `/profile/?user=<id>` (e.g. wayfarer, lampbane, preview).
- Publish after changes: commit + push `main`, then `bash publish_pages.sh` (builds with `build_pages.py`, force-pushes the `gh-pages` branch; Pages serves gh-pages root).
- `build_pages.py` rewrites root-absolute URLs to `/deepspot-redesign/` (regex for top-level entries + href="/" + an explicit list for navigation.js, core.mjs localURL, browse/profile home checks, vite preload base, home nav template). It exits if an expected string is missing — update the list when those files change.
- Gotchas: pass `--base deepspot-redesign` without a leading slash in Git Bash (it rewrites "/x" into a Windows path). The gh token has no `workflow` scope, so no GitHub Action; `gh auth refresh -s workflow` would allow one.
- Gate v2 look (2026-10-20, Opus): two-column sheet at site display scale — two-tone heading (text after the comma in green, clamp 48–92px), perks with green checks, 60px input + full-width continue, stacked 56px providers; member sheet "go deeper." + huge $1. Sheet ≈ 63% of a 900px viewport. axe 0 at 1440 d/l, 390, 320. Keys gate5. Backup `backups/before-gate-big-20261020/`.
- Gate rise (2026-10-20): the reading-wall sheet starts as a 156px peek (120 phone) and rises with scroll (`rise()` in gate.mjs, `translate` + `--gt-v`); focus or a click opens it fully. Keys gate6.
- Tours + nav (2026-10-20): main nav = browse · map · tours · community · app (adventures + stories removed from header, mobile nav, collection tabs, footer). `/tours/` = under-construction page (pages.mjs route, `.ds-tours` in pages.css); `/adventures/` redirects to `/tours/`. `/stories/` and story pages still work, unlinked from nav. Home nav edited in `page-C89T775K-v51.js` + SSR `index.html`. Community "pending review" block removed (community-v2 v14, giveaway-hero v12). site-cta.js key tours1. Backup `backups/before-tours-20261020/`.
- Passport "want to go" (2026-10-20, Sonnet): section after postings; own list editable (catalog spots + free-text places, max 30, reorder, remove), localStorage `deepspot-want-to-go-v1` via `profile/want-to-go.mjs?v=wtg1`; real profiles show an empty state. profile js/css key pv4a. Test `qa/want-to-go.test.mjs`.
- Tours tape (2026-10-20): `/tours/` = full-bleed stage — blurred inert mock tour page (real spot photos, bars for text) → construction mole (`tours/mole-construction.webp`, 3-frame animated from `Downloads/Mole Export/_construction/final/frame_1-3.png`; reduced motion uses `-still.webp`) → three tape bands (green / cobalt / cream with ink or cream stripes, "UNDER CONSTRUCTION" + DeepSpot star, box-shadow depth, slow marquee 125–170s). Code `site/tours.mjs?v=tape2`, CSS `tours/tours.css?v=tape2`.
- Tours v3 (2026-10-20, Charlie's sketch): one screen, no scroll (`html.tr-lock`, footer hidden, fixed stage under the header). Giant "tours." title → construction mole in front of the "o/u" → two green tape bands in an X (angles from the stage aspect, clamped ±24°) → "see the roadmap" pill. No plan-trip buttons. Keys tape4.
- Tours v3.1 (2026-10-20): no period on "tours", third green band clips the top-right corner (fixed 24°, y 20% / 4% phone), roadmap pill 64–96px tall. Keys tape5.
- Tours v3.2 (2026-10-20): corner band at 16°, placed from the measured "r" glyph so its lower edge just clips the tops of the r and s at every size. Keys tape7.
- Remove app (2026-10-20): "app" gone from header, phone menus (incl. home menu in navigation.js, which also now says tours instead of adventures/stories), home nav chunk + SSR, browse/profile static navs; pages.mjs app route removed; `/app/` redirects to home. Tours mole: CSS drop-shadow removed (Chromium clipped it at the image box, showing an edge); mock page masked around the mole. Keys tape9. Backup `backups/before-remove-app-20261020/`.
- Participants fan (2026-10-20, Charlie sketch): `bandHTML` in giveaway-hero.mjs is now a fanned 3D deck of passport cards (no section background), seated under the discord panel (discord z-index above, top shadow). Ambient cycle 3.4s (pauses on hover/focus/offscreen/hidden tab, off for reduced motion); tap a side card = bring it front, tap the front card = next; arrows + arrow keys; "<name>’s passport ↗" link follows the front card; keyboard Enter on the front card opens it. Keys: giveaway-hero js 13 / css 12, community-v2 js 15. Backup `backups/before-fan-20261020/`.
- Participants deck v2 (2026-10-20): tap the top card = open the passport; tap another card = bring it to the top; drag sideways to cycle (drag never counts as a tap); flatter fan, bigger cards (220–280px). Three layouts via `?fan=`: a (default) hangs from under the "your spot could be next" box, b rises out of the bottom edge of a giveaway-framed panel, c is a 3D ring on a floor shadow inside the giveaway frame. Discord overlap removed. Keys: giveaway-hero js 14 / css 15, community-v2 js 16.
- Deck A tweak (2026-10-20): stage clips at the CTA bottom (nothing can show over the race graphic), curve 2.5px·a², tilt 1.6°/card, only ~3% tucked under the box. css key 16.
- Race graphic shorter (2026-10-20): g1 --ph clamp(440,38cqw,540) / --hr clamp(168,14cqw,196) (was 560–700 / 236–268); tablet 420, phone 320. Bars start from a 46px floor (--bmin) so short bars keep their points above the baseline. 1440 stage 606px (was ~770). css key 19.
- Discord section from the original mockup (2026-10-20): header stats (new spots this month + members), #announcements pinned, #polls open, "Featured messages" live feed (forum posts as chat messages: avatar, handle, #channel, replies, 2-line text; next message slides in every 4.2s, pauses on hover/focus/offscreen, static for reduced motion). Real data only (mockup online count, poll %, timestamps were placeholders). Keys community-v2 js 17 / css 5, giveaway-hero js 15. Publish now builds from a clean worktree of HEAD when other sessions have uncommitted work.
- Phone (2026-10-20): ranked list under the race graph hidden visually at <=650px container width (kept for screen readers). giveaway-hero css 20.
- Passport v4 composition (2026-10-20, Remilia reference): desktop >=1100 = one fixed window under the header, two equal panes, page does not scroll; left = passport field (card centered, share button under it, "← community" in the tab bar), right = record that scrolls on its own; traveler type + contributions side by side, postings and want-to-go 4 across. Hover tilt on the ID card (pointer-driven rotateX/Y + light sheen; mouse only, off for reduced motion). Footer CTA and bottom note removed. Phone stacks as before. profile js/css pv5d. Backup `backups/before-passport-v4-20261020/`.
- Deck shadows (2026-10-20): one top light for every card, theme-aware (light mode ~10% ink), deck A clips only at the top so shadows are not cut; side cards recede with a faint page-colour wash instead of a grey brightness filter. css 21.
- Passport v6 (2026-10-20): no passport/mark tabs; the mark strip is part of the passport object (card + mark tilt together: eased perspective rotate, max ~7°/9°, no skew). Header account button now opens your own passport (`/profile/?user=preview`). Owner gets "edit profile" in the bio bar: name, username, bio, and a bio look (background green/cobalt/aqua/paper/ink/plain, type bold/serif/mono/hand, align) saved in `deepspot-bio-look-v1`; "draw my mark" swaps the left pane to the pad. Bio is a fixed, non-scrolling block whose text auto-fits the space. Below it a tabbed section with coloured vertical tabs: showcase (traveler type + pinned postings, pins in `deepspot-showcase-v1`, ☆ show buttons in edit mode), contributions, want to go, items (stamps + giveaway). Want to go = halftone globe (`profile/wtg-globe.mjs`, land from `profile/land-mask.png`) with pins, a card + stem to the selected pin, drag to turn, auto-cycle. Pin locations: `source/site/spot-coords.json` (10 exact from content.json, the rest approximate, geocoded once with `tools/geocode_spots.py` via Photon/OSM; 70 spots have none and stay list-only). Keys profile pv6g, wtg-globe wg2. Backup `backups/before-passport-v4-20261020/`.
- Passport v7 (2026-10-20): traveler type + contributions boxes back on top (under the bio, compact: type + bar, 2x2 tiles); index tabs hang off the left edge of the record into the passport pane (vertical, coloured, unselected ones smaller); passport object scaled up to fill its pane (fitPassport zoom, max 1.75). Keys pv7e. Backup `backups/before-passport-v7-20261020/`.
- Settings cog (2026-10-20): the old /account/ "your passport" tab is gone; /account/ and /account/?tab=profile redirect to /profile/?user=preview. On your own passport a cog next to "edit profile" opens a settings drawer with what only the old tab had: roll a mole (profile picture), instagram / x / website, traveler type fallback, preview session + sign out, links to the other account sections (stats, trips, submissions, placements, membership, notifications, account settings, inbox, invites), download my data, clear this passport (two-step). account.mjs v gate7, profile pv8b.
- Passport fixes (2026-10-20): tab switch keeps every box and tab in place (want-to-go no longer shrinks the bio or hides the boxes; tabs same height, the selected one only wider). "Roll your mole" on the card + "roll my mole" in edit profile open the mole reveal right on the passport (rollMole). Mark strip shows the whole drawing (absolutely positioned, contain) and keeps its label after saving. Want-to-go globe rebuilt on the home page Earth: same fragment shader copied from page-C89T775K-v51.js, earth-day.jpg + earth-clouds.jpg, colour halftone; HTML pins (dots, green selected + one dark name tag), drag, scroll/pinch/± zoom (1–6×). wtg-globe wg5, profile pv8g.
- Want-to-go v3 (2026-10-20): globe in its own square box, details in a separate box to the right (thumbnail, place, name, open the spot, prev/next, location note); light comes from above (shader light vec3(0,.62,.78) instead of the home page upper-left), shadow at the bottom. wtg-globe wg7, profile pv8j.
- Trophy case + item cards (2026-10-21, Remilia reference): `source/profile/items.mjs` holds 10 PLACEHOLDER items (name, kind, rarity, colour, note, line-art SVG). Who holds what is rolled from the passport id (4–7 items; rank #1 also gets the one-of-one race cup; own preview gets a fixed 6) until live accounts send item data. Record shows "<name>’s trophy case" shelf under the stats boxes (hidden on the want-to-go tab, like the stats). Click a trophy = the passport card + mark swap for a cream item card in the left pane; click the card, Escape, or the same trophy = back (focus returns to the trophy). Phones scroll up to the card. The old "items" vtab is renamed "stamps". Keys profile css it4 / js it1, items it1. Backup `backups/before-items-20261021/`. Not deployed.
- Want-to-go v4 (2026-10-21): composition per Charlie sketch — square globe (globe fills it) with a popup card + pointer over the selected pin | side box: add bar, "my list", 2-column place cards (tap a card to show it on the globe). Pin locations re-done strictly with `tools/geocode_spots_v2.py`: country/prefecture/city read from each spot text, Photon results kept only if they match (10 exact, 221 verified, 138 without a pin — no pin is better than a wrong one). Old file at `backups/spot-coords-v1.json`. wtg-globe wg8, profile pv8l.
- My map (2026-10-21): "want to go" + "collections" tabs merged into "my map" — Spotify model: want to go is the catch-all (♥), collections are named coloured lists (create, switch, delete; max 12) stored in deepspot-collections-v1 as items {type,id}|{type:place,name} (old name-only entries matched to catalog titles). Adding to a collection also adds to want to go. Globe shows the active list; pins take the collection colour. Every tab has its own colour (showcase green, explored pink, my map aqua, picks lilac, contributions cobalt, stamps yellow). Globe drag no longer inverted vertically. profile mm2, wtg-globe wg9. Backup `backups/before-mymap-20261021/`.
- Items + customize (2026-10-21): "stamps" tab is now "items" (stamps + placeholder items in one grid; trophy-case strip removed). Hovering / focusing an item deals a fanned 7-card stack where the passport sits; the front card flips to the item face (art, name, kind, note); moving to another item flips back, shuffles, flips again; leaving brings the passport back (tap toggles on touch, Escape closes). Owner-only "customize" tab: left-pane background (halftone, night, green, cobalt, paper; dusk/aurora/topo locked), name flair (star, compass, mole; flame/crown locked), passport foil (holo, gold, chrome; cobalt/prism locked) — placeholders, saved in deepspot-passport-style-v1, foil sheen follows the tilt. profile it2/it3. Backup `backups/before-items-20261021/`.
- Foils v2 + edit (2026-10-21): customizer (left background + passport foil) moved into edit profile — previews live, saved with "save profile", cancel restores; customize tab and flairs removed. Holo = multiplied rainbow stripes with gaps + a light streak, both sliding with the tilt; gold and chrome get metal stripes + streak. Small type raised across the passport (7→10, 8/9→11, 10→12, 11→12.5, 12→13 px in profile.css + profile-social.css). profile ho1/ho3. Backup `backups/before-holo-20261021/`.
- Passport card v9 (2026-10-21): security print (wave guilloche), crest + DEEPSPOT title, red number stamp, blue ink traveler-type stamp on the photo, the mark printed inside the card (signature line), two-line MRZ. Bio: text capped smaller + 3 quick facts (next up / latest find, top category, level). Holo: gradients no longer tile (no-repeat, 300%, pointer clamped 0–100%) so corners have no seams; a fine embossed bump (lit fractal noise SVG) under every foil, shifting slightly with the tilt. Backgrounds (all unlocked for testing): earth halftone, green dither, cobalt dither (live halftone field in that colour), night, starfield (drifting), aurora (moving), dusk, grain gradient, topo lines, blueprint, oya quarry photo, salt pans photo, green, cobalt, paper. profile c9b. Backup `backups/before-card9-20261021/`.
- v10 (2026-10-21): wavy security print removed from all passports. Foil texture is now a real lit bump: SVG fractal-noise height map with feSpecular+feDiffuseLighting and a point light that follows the pointer (shown only with a foil). Every background animates: shader field (halftone/dithers/night/topo/green/cobalt/paper), drifting stars, moving aurora, dusk sweep, grain jitter, scrolling blueprint grid, slow pan on the photos; reduced motion stops them. profile v10a/v10c. Backup `backups/before-anim-20261021/`.
- v11 (2026-10-21): foil + lit grain now sit under the printed data (photo, type, rules, stamps raised above them), softer (holo .32/.42, glare .35, grain .2); photo frame keeps clean paper. Card type and rules get a subtle bevel/emboss (light edge below, dark above) for clarity. profile css v11a.
