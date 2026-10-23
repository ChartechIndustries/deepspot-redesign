# Banner H QA notes (cut-out format, 1600x1600 RGBA, webp 1000x1000)

Pipeline: `scripts/h{1,2,3}.py` (headless Cycles OptiX, 256 spl, AgX) -> `scripts/finish.py` (navy shadow tint, glow, sparkles, edge fade, webp) -> `scripts/qa.py`.
Rounds: 3 per variation (framing/scale, material/gem look, final polish incl. mole fix and shards).

## H1 gem in ground
- Checked: full-size on bg, 707x413 + phone crops, 328 px.
- Found/fixed: pale mint gem (overexposed, glass washed out) -> opaque faceted metal-green material with per-facet tone; grass hid the gem colour -> removed grass, bare soil; pebbles floated (origin offset) -> placed by bbox; added 3 small shards; shadow tail hit the frame edge -> edge fade.
- Clip: SoilChunk/Gem (gem half buried, intended), SoilChunk/stone_01.001-.003 (pebbles seated 0.4 mm into noisy soil, intended).
- Limits: soil is plain brown, no strata visible at small size.

## H2 pin + gem
- Checked as above. Clip = 0.
- Fixed: cutter wedge applied + removed (was clipping plinth), pin enlarged (was unreadable), globe sheen/roughness raised.
- Limits: globe surface still slightly milky from the studio HDRI; pin needle is thin at 328 px (gem + collar carry the read).

## H3 dig + mole
- Mole: BLOOD1.blend base mole + Hard Hat, no shirt, no jacket (MOLE_RULES ok). Body2/Notes hidden because their alpha cut-outs showed the background as blue patches. Feet on slab (bbox-snapped).
- Clip: DigSite/Gem (embedded in pit, intended), DigSite/stone_01.004 + Icosphere (seated 0.4-1.5 mm), DigSite/rusted_spade (blade stuck in heap, intended). Mole parts share assembly 'mole'; no mole pair reported.
- Limits: mole body is plain dark grey (no belly texture); spade is Poly Haven rusted (kept, reads as old tool).

## All
- alpha > 60 margins to frame edge are 60-340 px; faint shadow tail fades out before the edge.
- Copy overlap: at 707x413 the subject (360 px tall, right) touches the end of the paragraph line 1-2. In CSS cap the paragraph width (~55 %) or make the subject <= 330 px wide.

## Review round (2026-10-22, coordinator)
- H3 blue patches: cause was NOT alpha. The mole textures are fully opaque and no alpha is linked. My post step tinted every dark, low-luminance pixel navy (shadow tint), which turned near-black fur blue. Fixed in post.py (tint only dark AND translucent pixels). Body2 is shown again.
- H3 mole: turned 222 deg (3/4 to camera, looking at the gem), hat tilted back 14 deg and scaled 1.07 so both eyes show; fur darkened via its own materials (Body2 x0.2, Head x0.45); hard hat = brand yellow x0.62 so AgX does not wash it out.
- H1: moss grass lip, three strata (pale stone / clay / loam) with wobbly borders, 3 embedded stones, 3 roots on the front face, gem R 0.05 -> 0.062. Clip pairs (14) are all intended embedding: gem, pebbles, shard, embedded stones, roots.
- H1 limit: thin pale line at the crater rim (grass/soil transition).
