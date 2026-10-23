# Blender banners — integration spec (2026-10-22)

Plan: `BLENDER-BANNERS-PLAN.md`. Art: `source/banners/` (c1-3, w1-3, w3-seal, r1-3 = 1600x1000 full-bleed
WebP; h1-3, n1-3 = 1000x1000 transparent cut-outs). Builder notes with object-position per layout:
`tools/blender_banners/<id>/qa/<id>_notes.md` and their reports (copied below).

## Goal
Home page banners show the Blender art. Every variation is reachable for review. Copy stays HTML.

## Defaults (my picks)
c1 (podium + mole) · w3 (seal on carved stone) · r1 (terrain) · h3 (dig + mole) · n3 (paper plane).

## Switches
- `/?bb=c2,w1,r3,h2,n1` — any subset; overrides per banner. `?bb=old` = all banners as before (old CSS/SVG art).
  Per-banner old: `c0,w0,r0,h0,n0`.
- Review page `source/blender-banners.html`: 5 rows (one per banner), each with "old" + 3 variations rendered
  in real card frames using the live CSS (desktop card size), plus a phone-width toggle (328 px cards / 360 px
  CTA). Each card links to `/?bb=<id>` for the live view. Default pick marked "default".

## Promo cards (editorial.js `.ed-promos`)
- Replace the decorative art (dots + entry fan for competition; photo + frame + seal for week; svg map for
  road) with `<img class="ed-art" src="/banners/<id>.webp" alt="" loading="lazy" decoding="async">`
  (week keeps a meaningful alt for the place? No: the place caption stays as text; alt="").
- Keep: headings, buttons, the week place caption, `data-promo` dialogs, hover behaviour.
- `object-fit:cover`, `object-position` per variation + breakpoint from the builders' tables
  (CSS custom property `--bb-pos` set inline per variant, overridden in media queries via
  `--bb-pos-t` (tablet 651–1000px) and `--bb-pos-p` (≤650px)).
- Competition: "$300" is navy on green; check it stays readable. Week: green "underground." over stone —
  add a CSS gradient under the text zone (bottom-left, navy → transparent) for contrast ≥ 4.5.
- Delight: gentle hover lift/zoom of the art (scale 1.03, 400ms ease), off for reduced motion. Week w1/w2
  hover can keep the seal? No seal on w1/w2; on w3 the seal is in the render — drop the SVG seal.
- Panel-colors "off" mode: cards keep their render backgrounds (that is fine), but light theme must not
  put light text on light art; check light + dark.

## CTA (site-cta.js)
- `.ds-cta-contribute` gets `<img class="ds-cta-art" src="/banners/h3.webp">` absolutely positioned right,
  ~360px tall on desktop, `object-fit:contain`. Cap the paragraph width (~55 %) so the art never covers text.
  Same for `.ds-cta-newsletter` with n3 (keep the email row clear).
- Phone (≤650px): art sits above the copy, ~200px tall, centered, in normal flow.
- Subtle float animation on the art (translateY 4px, 6s ease-in-out, off for reduced motion).

## Rules
- Backup first: `backups/before-blender-banners-20261022/` (editorial.js, editorial.css, site-cta.js,
  site-cta.css, index.html, any other file you change).
- Bump every changed file's `?v=` in index.html (and wherever else it is referenced: grep for it).
- Do not touch the world video banner or the what's-new accordion.
- Headless browser only (playwright, `--use-angle=swiftshader`, one browser at a time, below-normal priority —
  pattern: `qa/banners-blender/shot.py`). Server: http://localhost:8766 (already running).
- Screenshots: phone 390/360/320, tablet 820, desktop 1440, dark + light theme, for defaults and for
  `?bb=old`. Look at every one. Save to `qa/banners-blender/after/`.
- Check: no console errors, no horizontal scroll, text never covered, contrast ≥ 4.5 on all banner copy,
  home page weight added ≤ 1 MB (lazy loading counts).
- README.md: add a short "Blender banners (2026-10-22)" entry (files, switches, keys, backup).
- Do not commit, push or publish.

## Report
Short: what changed (files), switches, screenshots paths, any problem left.
