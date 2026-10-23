# W banners QA notes (spot of the week, dark navy #0b1a2e)

Pipeline: headless Cycles OptiX, 200-256 samples + OptiX denoise, AgX Medium High Contrast. Render is RGBA with a
shadow-catcher floor, composited over exact #0b1a2e in post.py, plus film grain 1.6. Scripts: w1_cutaway.py, w2_stair.py,
w3_seal.py (+ --seal for the alpha seal). Blends saved next to scripts. Clip check run inside every build.

## W1 cutaway (with DeepSpot mole, hard hat)
Checked: full-size render, 3/4-high and low-side QA cams, crops at 431x331 / 357x301 / 328x331, 328 px downscale.
Found/fixed (rounds): block too big and text-zone overlap -> smaller, shifted up/right; mole faced away -> rotated (nose is +x
in BLOOD1); mole floated (bound_box vs real vertices) -> vertex-based bounds, feet seated on floor slab; hat and floor blown
out -> interior lights cut ~4x; visitor figure hidden behind pillar -> moved; haze too thick -> 0.07; top of block tiled
stripes -> grass tile 2.4 m. Mole is BLOOD1 base + Hard Hat only (no shirt, rules file respected), read-only append.
Clip check: 0 pairs. Known limits: mole is ~35 px tall on the 431 card (reads as a hat + face); visitor is a plain
mannequin; at 2.4:1 crops the trees are cut.

## W2 stair down
Checked: same set. Found/fixed: stairs invisible at 32 deg camera (treads edge-on) -> 45 deg, shallower stairs (17 x 30 cm);
haze made the stair milky -> 0.012; slab too deep/tall -> thin; glow panel blown -> emission 1.1; top tree cut -> shift.
Clip check: 0 pairs after jamb/trim rework. Known limits: treads dim; glow panel is still the brightest spot; lawn is
deliberately dark so the green reads muted.

## W3 seal
Checked: same set + seal-alone alpha on navy and on tan. Found/fixed: radial streaks on the enamel (ngon fan) -> ring grid
tops; seal gear-like -> softer 20 lobes; stone washed out -> spot lights + gobo so the lower-left (text zone) stays dark;
pedestal looked glassy -> dark slate material; enamel too pale -> deeper green + lower exposure for the alpha export.
No text on the seal (24-lobe medal, navy asterisk relief, halftone dot ring). Clip check: 0 pairs.
Known limits: seal has no "DEEPSPOT VERIFIED" lettering (brief: no text); alpha export is a tilted 3/4 view, not a
front-on sticker, so it will not match the SVG seal outline exactly.

## Round 2 (coordinator review)
W1: green figure removed; mole x1.4 (2.24 m, toy scale), feet on hall floor (vertex-based bounds), clip 0. Outer faces are now
one earth block with a procedural strata shader (world-z, noise-warped boundaries): dark loam, red clay, rust sandstone band,
pale tuff with pick marks, bedrock; no masonry outside. Hall ceiling is 2.25 m below the grass (37% of block height). Hall and
pillars use a pale tuff pick-mark shader (horizontal bands + chips). Round burrow opening on the left side wall (connects to
the hall). Camera pulled to keep mole readable at 328 px (checked).
W2: same strata on block sides, trench walls in pick-mark tuff, step material brighter (val 1.55) + two small warm lights, side
fill light so the strata read, camera zoomed out slightly. Clip 0.
Limits: strata boundaries are shader-only (flat, bump only); at tablet the W1 pine tops touch the top edge.
