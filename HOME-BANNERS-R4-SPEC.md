# Home banners round 4 — spec (2026-10-22)

Two banner sets on the home page:
- **Top** = `<deepspot-news>` "what's new" panels (`source/whats-new.js/.css`, v2 from today: discoveries,
  community, featured spot). Spec of v2: `WHATS-NEW-V2-SPEC.md`.
- **Below** = promo cards `.ed-promos` in `source/editorial.js/.css` ($300 competition, spot of the week,
  roadmap) with the Blender art + `?bb=` switch (`BLENDER-BANNERS-INTEGRATION-SPEC.md`, README "Blender banners").

## Charlie's asks → what to build
### 1. $300 promo card → a simplified version of the community page race graphic
Reference: `/community/` hero (`source/site/giveaway-hero.mjs` + css; screenshot
`qa/banners-blender/r4/comm_hero_0.png`): dark navy, faint dot grid + cobalt glow, green bars with mole
avatars in rings, names in dark pills, points on the bars, `$300`/`$100` prize tags, rank chips under the baseline.
- Card becomes dark navy (`#0b1a2e`-ish, same as the hero) with the dot grid + glow.
- Show ONLY the top 3 as a podium-order bar trio (2 · 1 · 3), bar height = same scale rule as the hero
  (sqrt(points)), mole avatar ring on each bar top (rank 1 green ring + larger), name pill, points on the bar,
  prize tag next to #1 (`$300`) and #2/#3 (`$100`), rank chips 2/1/3 below.
- Real data only: same source + same code path as the hero (this month's leaderboard from
  `/site/content.json`, moles from `/community-assets/moles/<id>.webp`). Reuse/export helpers from
  giveaway-hero.mjs rather than copying logic. No invented names/points.
- Copy: heading "the race<br>for **$300**." ($300 in green #07d653), the existing button → `/competition/`
  (keep `data-promo="competition"` behaviour). Copy top-left, bars bottom-right; nothing overlaps at any width.
- Delight: bars grow up from the baseline (stagger 120ms) when the card scrolls into view; #1 avatar does a
  tiny bounce. Off for reduced motion.
- Phone (≤650): bars centred under the heading, all three avatars + names readable at 320px.
- The Blender c1–c3 art stays reachable via `?bb=c1..c3`; the new race card is the default (`?bb=c0` = old
  green CSS card stays as is).

### 2. Spot of the week → the duotone one (W5)
- Default week card = promo variant **W5** (cobalt/ink duotone Oya photo, seal top-left, huge green
  "underground."). Source: `source/promo-variations.js` (W5 builder, line ~51) + `promo-variations.css`
  (`/* ---- W5 duotone ---- */` + its QA fixes at the end). Port its markup + CSS into editorial.js/.css so
  the home page does not need to load promo-variations.* by default. Keep `?bb=w1..w3` (Blender) and
  `?bb=w0` (old photo) working.
- Check phone 320/360/390 (fit, no clipped text) — W5's phone layout was a scaled desktop; tailor it.

### 3. Discoveries panel (top set) → new location, sharp photo
Rummu photo is too soft. Use **Teufelsberg** (`/spots/teufelsberg.jpg`, 1600x1200, sharp).
- title: `a pile of rubble.<br>a spy station.<br>a gallery.`
- description: `Berlin's Teufelsberg is a man-made hill of war rubble, topped by a Cold War listening station that is now a sprawling street-art canvas.`
- place: `Teufelsberg, Berlin` · publisher `Johan SWE` (author link like the old community panel) · href
  `/blog/berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti` · alt text describing the domes + graffiti.
- Keep the v2 "photo window" layout; re-tune the crop so the white domes clear the paper card (no blur hack if
  the domes sit right). Check that the srcset/variant system (`site/img.mjs` cardSet) serves a sharp size.

### 4. Community panel (top set) → stack of passports, "new customizable profiles"
Replace the live-discord content (keep `site/discord-link.mjs`; community-v2 still uses it).
- Copy: eyebrow chip `new` · heading `your profile<br>is a passport.` · line `pick your traveler type, roll
  your mole, sign your mark and choose a foil.` (all real features of /welcome/ + the passport) · button
  `make yours ↗` → `/welcome/` · small link `see an example ↗` → `/profile/?user=wayfarer`.
- Graphic: a fanned **stack of 3–4 real passport cards** using the shared mini passport (`site/passport-mini.*`,
  the "participants" deck on /community/ — `passportModels`, `participantsHTML`). Real community members only
  (same models the community page builds). Different foils visible (holo/gold/chrome) if the data allows.
  Fan: back cards rotated −8°/−3°/+4°, offset, top card straight; soft shadows.
- Delight: on panel activation the cards deal into the fan (stagger 140ms); hover on desktop lifts the top
  card and spreads the fan slightly. Off for reduced motion.
- Phone: heading + button top, fan below, fully inside the panel at 320px.

### 5. Featured spot panel (top set) → fix the composition
Charlie dislikes the v2 "poster" (heading overlapping the photo, hairline frame, cramped). New layout, clean:
- Photo fills the RIGHT ~60% of the panel, full height, edge to edge (no padding, no frame), `object-fit:cover`
  framed on the candy tower + gold dome (Maishima photo is 1600x1593, use a focus that shows both).
- A soft blue gradient from the panel colour fades into the photo's left edge (~80px).
- Left column on the blue: eyebrow chip `featured spot`, heading (no overlap onto the photo), description,
  place line `Maishima, Osaka`, `read more →` at the bottom. Generous spacing, aligned to the same baseline
  grid as the discoveries card.
- Phone: photo on top (full width, ~55% of the panel), copy below on blue. No overlap tricks.

## Rules
- Backup first: `backups/before-home-r4-20261022/` (every file you change).
- After edits: `python tools/bump_keys.py`, then `python tools/bump_keys.py --check` = 0 stale.
- Headless only (playwright, `--use-angle=swiftshader`, below-normal priority, one browser at a time).
  Server http://localhost:8766. Shot helpers: `qa/banners-blender/wn_shot.py` (top set),
  `qa/banners-blender/phone_shot.py` + `card_shot.py` (promo cards).
- Screenshots 1440, 1024, 820, 390, 360, 320; dark + light; every panel and every promo card. Save to
  `qa/banners-blender/r4/after_*`. Look at every one. No console errors, no horizontal scroll, no clipped or
  overlapping text, contrast ≥ 4.5.
- Real data only; no invented names, numbers or quotes.
- README.md: short "Home banners r4 (2026-10-22)" entry. Do not commit, push or publish.

## Report
Short: files changed, how each of the 5 looks now, screenshot paths, anything left.
