# Banner N QA notes (v2, cut-out format)

Format: Cycles OptiX 160-192 samples, AgX, 1600x1600 RGBA, film transparent + shadow catcher. Camera auto-fitted (fit.py):
subject bbox centred, longest side ~86 % of frame, nothing touches the edge. Alpha faded over outer 5.5 % so the
contact shadow never ends in a hard line. Clip check 0 pairs on all three. Rim lights: two shadowless area lights (cobalt-white).
Checked: full-size over #13213a, 707x413 (360 px art right side), phone (200 px art above copy), 328 px downscale.

## N1 postcards
Six postcards fan + cobalt envelope with green enamel seal. Added paper-fibre bump on every paper, coated envelope, halftone fronts.
Fixed: v1 tiny/in corner (now fills frame). Limit: lower cards show wedges only.

## N2 mailbox
Added rivets on the seam, noise bump + roughness variation on paint (worn), wood grain, puck bump. Door shelf flush with floor, letters rest on it.
Fixed: bevel overlap in the cavity (1.6 mm bevel); shadow clipped at frame edge (alpha fade). Limit: letters small on phone.

## N3 paper plane
Path now starts at the pin tip (first dash touches pin head), rises, and ends at the plane tail; plane heading equals the path end tangent
and the tail centre sits on the path end. Added globe bump, paper fibre. Fixed: v1 plane hung in empty space with a path that met its wing.
Limit: paper top face reads flat grey; the green keel carries the plane silhouette. Plane and dashes float on purpose (they read as the flight).
