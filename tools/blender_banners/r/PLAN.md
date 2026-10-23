# Banner R (roadmap, cobalt #3c60ff) - shot sheet

Common: 1920x1200, Cycles OptiX, AgX (Medium High Contrast), 192 spl + denoise. Film transparent; ground is a
shadow catcher; PIL composites over exact #3c60ff, adds grain + vignette. World = dim blue ambient (lighting only).
Text zone top-right: render x>57%, y<30% stays empty. Button zone bottom-right: x>62%, y>78% empty.
Subject safe box: x 25-62%, y 22-85%. Key: area 5300 K upper-left-front; fill 4x dimmer cool; rim from back-right.
Units m. Tabletop diorama scale. Bevel 1.5-3 mm on every hand-modeled part, smooth by angle.
Palette: cobalt #3c60ff, green #07d653, yellow #ffd400, navy #0b1a2e, off-white #eceee8.
Assets: all hand-modeled (no library has a stylized topo diorama). No text/numerals.

## R1 terrain (reads in 0.5 s: stacked topo mountain with a green path climbing to a flag)
- Camera: 85 mm, sensor 36, at (0.0,-1.9,1.25) looking at (0.0,0,0.10). 3/4 high view, static.
- Mountain: 14 nested terrace slabs (radial outline r_k(theta), ellipse + low-freq noise), 14 mm thick
  each, base dia ~0.70 m, height 0.2 m. Body cobalt-light, 3 mm white band on top of each slab (contour line).
  Rests: slab k bottom = slab k-1 top. Base slab on ground z=0.
- Path: green tread sectors spiralling up (one sector per level), riser patches between. 1 mm above treads.
- Summit flag: pole 0.09 m, yellow pennant 0.04x0.028 m, on top slab.
- 3 milestone pins (stem 0.025 m + sphere head dia 0.03): done green, now yellow with halo ring, next white ring.
- Pass: no slab penetration, pins on treads, flag base on summit, text zone empty, readable at 328 px.

## R2 road (floating land chunk with a winding road)
- Camera: 70 mm at (0.0,-2.1,1.0) target (0,0,-0.02). Static.
- Land: grass cap (outline blob, dia 0.80 m, 22 mm thick) over inverted soil cone 0.30 m deep (navy-brown), rocks
  tint. Hover shadow on catcher ground at z=-0.55.
- Road: ribbon mesh 4 mm thick, width 0.10 -> 0.035 (perspective taper), S-curve to a back hill (cone) with flag.
  White dashed centre line (small boxes on road top). 3 signposts (post 0.12 m + arrow board, green/yellow/white).
  A few low-poly trees/rocks for scale. All rest on cap top z.
- Pass: road within cap outline, signs on ground, nothing past the edge, text zone empty.

## R3 stepping stones
- Camera: 60 mm at (0.9,-3.4,1.1) target (0.15,0,0.65). Low angle to read the rise.
- 7 hex pillars (dia 0.34 m, heights 0.15,0.30,0.48,0.68,0.90,1.15,1.45 m) along a rising arc, gaps 0.05 m.
  Stone off-white with navy halftone dots on sides; done pillars (first 3): green glowing top slab + green
  light pool; pillar 4 = "now" with green ring. Last pillar: yellow 3D arrow above (floating meant).
- Pass: pillars on ground (z=0), no overlaps, glow doesn't blow whites, arrow below text zone.

## QA
Clip check each build; full-size looks; crop sheets 431x331, 714x301, 328x331, 707x413, 360x413; 328 px look;
>= 2 render rounds each. Notes -> qa/r_notes.md.
