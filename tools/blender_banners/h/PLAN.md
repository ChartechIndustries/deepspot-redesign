# Banner H — "know a hidden gem?" (cobalt #3a5bef, 707x413 desktop)

Common: Cycles OptiX 192 spl + denoise, AgX Medium High Contrast, 1920x1200 RGBA render with shadow-catcher floor,
composited over exact #3a5bef in `scripts/post.py` (shadows navy-tinted, soft glow, grain). Camera uses lens shift to
push the subject to x~80-84 %, y~42-48 %. Text zone = left 60 % + paragraph to x~85 % at y 52-65 % -> subject
sits above/right of the paragraph end. HDRI: Poly Haven `photo_studio_01` (reflections only, hidden by transparent film).
Assets: Poly Haven CC0 `farm_soil` (soil PBR), `stone_01` (pebbles), `rusted_spade_01` (H3). Gem, plinth, globe, pin, mounds hand modeled.
Lights per shot: key area 5400 K upper-left-front (shadow falls right/back), fill 4x dimmer cool, rim from back-right, green point light at gem.
Gem: 8-fold brilliant cut (table, crown, girdle, pavilion), glass transmission + green volume absorption + emission, 2-seg bevel.

Pass/fail (all shots): clip check 0 (or justified), no floating, gem reads green + faceted at 328 px, subject clear of paragraph,
no blown whites, bg exactly the cobalt, no text.

## H1 gem in ground
- Soil chunk 0.24 x 0.19 x 0.10 m (modeled, 48x subdivided, crater displaced, bevel 4 mm); grass lip + soil strata by shader.
- Gem R 0.032 m (6.4 cm wide), tilted ~30 deg, half-buried, table facing up-camera. Pebbles stone_01 scaled ~1.2-2 cm, resting on terrain.
- Light spilling up: green point light + faint beam cone + glow. Camera 135 mm, ~2.8 m, elev 26 deg, az -22 deg.

## H2 pin + gem
- Desk-globe wedge: sphere r 0.10 m with a 90 deg wedge cut out; surface = navy ocean with halftone dots + green land; cut face shows concentric layers
  (crust off-white, mantle yellow-orange, core). Off-white plinth disc r 0.13, h 0.015, bevel 3 mm.
- Push pin: needle 8 cm (steel, tapered), collar, gem head R 0.024 m, stuck into land at tilt ~15 deg, needle tip inside the globe surface.

## H3 dig + mole
- Soil mound r 0.20 m on the floor with a dug hole; found gem R 0.03 m in the hole. Poly Haven rusted spade scaled 0.45, stuck in the mound back-right, leaning.
- DeepSpot mole (BLOOD1.blend, base + Hard Hat, no shirt) toy scale ~0.17 m tall, feet on ground, 3/4 turned toward the gem. Loose soil clods + pebbles.
