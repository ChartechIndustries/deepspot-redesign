# Home banners — Blender graphics (plan, 2026-10-22)

## Goal
Replace the flat CSS/SVG art in the home page banners with Blender-rendered 3D graphics.
Make 3 variations per banner. Copy stays HTML (accessible, translatable). Renders carry no text.

## Scope (home page, in page order)
| id | banner | file | current art | text zone (keep clear) |
|----|--------|------|-------------|------------------------|
| C | $300 competition | `editorial.js` `.ed-competition` | CSS dots + photo fan | top-right ("$300 / for your curiosity"), button bottom-right |
| W | spot of the week | `.ed-week` | Oya photo + SVG seal | bottom-left ("go underground."), top-left place caption |
| R | roadmap | `.ed-road` | SVG contour map + pins | top-right ("the way forward."), button bottom-right |
| H | know a hidden gem? | `site-cta.js` `.ds-cta-contribute` | flat cobalt | left 60 % (heading, text, button) |
| N | new stories every week | `.ds-cta-newsletter` | flat navy | left/top (heading, text, email row) |
Out of scope: the "world is deeper" video banner (user footage), the what's-new accordion.

## Sizes (measured 2026-10-22)
- Promo cards: desktop 431x331, tablet 357x301 (C = 714x301 full width), phone 328x331 (C 328x371).
- CTA: desktop 707x413 (H) and 632x413 (N); phone stacks full width.
- Render each graphic at **1920x1200** (16:10), PNG, `object-fit:cover`. The subject sits inside a
  **safe box** that survives every crop from 0.9:1 to 2.4:1: centre band x 30–70 %, y 15–85 %, pushed
  away from the text zone. Also export a 2x WebP for the page (quality 82, ≤ 180 KB each).

## Look (shared)
- Brand: green `#07d653`, cobalt `#3c60ff`, navy `#0b1a2e` / `#182a43`, yellow `#ffd400`, off-white `#eceee8`.
- Style: clean stylized 3D (toy / diorama / product-shot), soft shadows, bevels on every edge,
  subtle grain. Not photoreal clutter. Background = the card's brand colour so the card still reads
  as C green / R cobalt / W dark / H cobalt / N navy.
- Halftone nod: optional dot-pattern texture on one surface per scene (DeepSpot identity).
- Lights: one key (area, 5000–5600 K), fill 3–5x dimmer, rim for separation. AgX, Filmic look "Medium High Contrast".
- Engine: Cycles GPU (OptiX/CUDA), 128 samples + denoise; Eevee only if Cycles fails.
- Real-world scale for props (coin 24 mm, pin 1–2 m sign, etc.) — then camera frames them.
- Assets: Poly Haven CC0 models/textures where they fit (coins, rocks, lantern, paper); hand-model only
  stylized parts, always with Bevel modifier + smooth shading. No AI images or meshes.

## Variations
**C — $300 competition (green)**
- C1 "podium": glossy 3-step podium (1/2/3 embossed numerals) with tiny location props on top (concrete
  prison block, radar dome, candy-colored tower = rummu / teufelsberg / maishima). 3/4 view.
- C2 "coin drop": a stack of 3 gold coins with the DeepSpot asterisk embossed, more coins mid-fall,
  motion-blur off, crisp. Low angle.
- C3 "golden pin": a big gold map pin standing on a green felt card with a ribbon rosette (prize).

**W — spot of the week (dark)**
- W1 "cutaway": ground cross-section block (grass top, soil + rock strata) with a carved cavern hall lit
  warm inside, tiny figure for scale. Isometric. (Oya = carved stone quarry.)
- W2 "stair down": a hole in a green lawn, stone stair going down into warm light, rest of frame dark.
- W3 "seal": 3D embossed DEEPSPOT verified medallion (green enamel, asterisk relief) lying on carved tuff
  stone, raking light. Overlay-friendly; keeps the Oya photo idea as an option (transparent PNG too).

**R — roadmap (cobalt)**
- R1 "terrain": cobalt low-poly mountain with white contour bands, green ribbon path winding to a
  summit flag, 3 round milestone pins (done / now / next).
- R2 "road": a floating chunk of land with a curving road, 3 signposts and a far summit flag.
- R3 "stepping stones": rising stone pillars, green glow on the done ones, yellow arrow at the top.

**H — know a hidden gem? (cobalt)**
- H1 "gem in ground": cut green gem half-buried in a soil chunk, light spilling up from it.
- H2 "pin + gem": map pin whose head is a faceted green gem, stuck in a small globe slice.
- H3 "dig": shovel in a small mound with a gem revealed at the dig spot.

**N — new stories every week (navy)**
- N1 "postcards": fanned stack of blank postcards + stamp + envelope, top-down 3/4.
- N2 "mailbox": rounded mailbox with green flag up, letters peeking out.
- N3 "paper plane": folded paper airplane trailing a dashed path over a small globe.

## Build (who does what)
- Builders: 5 Sonnet subagents in parallel, one per banner (C, W, R, H, N). Each writes headless
  scripts in `tools/blender_banners/<id>/` and renders with
  `"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P <script> -- <out>` at below-normal
  priority. No windows (PC is shared with gaming). The live MCP Blender is not used.
- Output: `source/banners/<id><n>.webp` (+ `.png` master in `tools/blender_banners/<id>/renders/`).
- Each builder: clip check = 0, QA renders, crop test at 0.9:1, 1.3:1 and 2.2:1 with a mock text zone,
  `qa/banners-blender/<id>_v1.md` notes.
- Integration (one agent after renders): `?bb=c1,w2,...` swaps art on the live home cards;
  review page `/blender-banners.html` shows all 15 in real card frames at desktop + phone widths.
  Default = my pick per banner, wired into the home cards. Old art stays reachable with `?bb=old`.
- Cache keys bumped. Backup before edit: `backups/before-blender-banners-20261022/`.

## Checks (pass/fail)
- Subject readable at 328 px wide; text zone has contrast ≥ 4.5 for the HTML copy over it.
- No clipping, no floating props (unless meant), no stretched textures, no blown whites.
- Page weight: + ≤ 1 MB on home total (lazy load, WebP).
- Light + dark theme, panel-colors off still look right.
- Phone (390/360/320), tablet 820, desktop 1440 screenshots.

## Delight moments to keep
- Competition hover lift, verified-seal spin on hover, roadmap pin pulse — keep as CSS on top of renders
  where they still make sense; slight parallax tilt of the render on hover (2–3°, off for reduced motion).

## Risks
- Cycles on a shared GPU while gaming → run one render at a time per agent, 128 samples, small tiles.
- Cover-crop cuts the subject on phone → safe box rule + per-breakpoint `object-position`.
- Text over busy art → darken gradient under text zone in CSS, not baked into the render.
