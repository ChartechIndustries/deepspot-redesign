# Banner R QA notes (2026-10-22)
Pipeline: Cycles OptiX, AgX Medium High Contrast, 256 spl + OptiX denoise, transparent film + shadow catcher,
composited over exact #3c60ff in post.py (grain 2.2, vignette 3.5 %). Masters: renders/r1.png r2.png r3.png.
Scripts: build_r1/2/3.py, common.py, run.py, post.py, export.py, qa_crops.py. Blends: r1/r2/r3.blend.
Clip check: 0 pairs on all three final builds (R2 earlier showed 1 stone-in-cap pair and 1 open-mesh hill pair; both fixed).

## R1 terrain
Checked: full-size look, crops (431x331, 357x301, 714x301, 328x331, 707x413, 360x413), 328 px row, 5 render rounds.
Found/fixed: blown-white treads (lights cut 2.7x, exposure -0.2, body colours deepened); white plate overhang
(plate now follows slab-0 outline +5 cm); thin path (wider sectors, green emissive 0.35); pins too small (head r 44 mm);
pale flag (base #ffb300). Contour lines are raised white rings, not flat tread colour.
Limits: flag tip is close to the copy on phone at pos 45 %; use 55 %. Path riser patches are blocky by design.

## R2 road
Checked: same set, 6 rounds. Found/fixed: camera too high hid the floating rock (lowered to 28 deg, rock depth 0.46 m);
hill seam ring (skirt verts were shared, now separate); road overhanging land edge (start moved in); signs edge-on
(boards now face camera, 3 directions); rock washed lavender (under-light cut, gradient navy 101c3d to 2f4778);
stone sunk in cap (clip check).
Limits: rock edge low contrast against cobalt on the left; ground shadow is soft and drifts toward the button area
(faint). Flag top is 12 % from top edge: touches the top edge in the 2.4:1 crop only when pos-y is not 50 %.

## R3 stepping stones
Checked: same set, 7 rounds. Found/fixed: read as a bar chart (now irregular 8-sided tapered columns, gaps 14 cm,
6 stones, camera 27 deg); arrow collided with the copy (stones lowered and span cut so arrow x < 49 %, y > 31 %);
arrow pale peach under AgX (base #c47400, no emission); moire dots (lattice 10 cm); top ring clipping (fixed).
Limits: smallest subject of the three. On phone the first stone is partly cut at pos 30 %; arrow ends ~at the
left edge of "forward.". Dots are procedural (Voronoi), no texture files.

## Revision 2 (coordinator fixes)
1. Yellow: AgX cannot hold #ffd400 (measured amber, e.g. 214,157,90 and 206,167,98). Fix: a second mask render
   (yellow-flagged materials white, Standard view) in common.render_mask; post.py recolours masked pixels to #ffd400
   scaled by the render's own shading (floor 38 %). Measured top-15 %-lit yellow pixels: R1 (254,211,1), R2 (255,212,0),
   R3 (254,211,1) vs target (255,212,0). Applies to flags, flag balls, now pin + halo, signpost, R3 arrow + top ring.
2. R1 path: one continuous ribbon mesh (pathRibbon), 21 mm wide, 2.8 mm thick, bottom 3 mm above every surface,
   follows plate -> wall 0 -> each tread -> each wall -> plateau, smoothed (Chaikin + subsurf). Pins stand on it.
   Clip check 0 pairs.
