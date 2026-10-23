# Banner N — "new stories every week." (navy #13213a)

Card 632x413 desktop. Copy occupies: heading x0-45% y20-40%; paragraph to x72% y44-52%;
email row to x91% y61-75%; small note y78-82%. So the subject lives in the TOP-RIGHT block
(centre x~77%, y~28%, extent x58-98%, y4-56%) and the bottom strip (y>84%) stays empty.
Camera `shift_x/shift_y` pushes the subject there. Render 1920x1200, PNG RGBA with a
shadow-catcher floor, composited in PIL over exact #13213a (+ faint glow, grain). No text.

Shared: Cycles OptiX 160 samples + denoise, AgX Medium High Contrast. Key area light ~5200 K
upper-left-front, fill 4x dimmer cool, rim cobalt from behind-right. Bevels on all hand parts,
smooth by angle. Real scale. Clip check before render (assembly property marks built groups).

## N1 postcards (top-down 3/4, 50 mm, elevation ~58 deg)
- Envelope 0.162x0.114x0.002 m cobalt, flap prism 0.0012 m, green wax seal r 0.012 with relief asterisk. Rests on floor z=0.
- 5 postcards 0.148x0.105x0.001 m, stacked on envelope top (z step 1.1 mm), fanned around a pivot, rotations -28..+22 deg.
  Lower 4 show printed fronts (PIL illustrations, halftone), top card shows back (address lines, stamp, postmark).
- Pass: 0 clip pairs, fan edges readable, stamp visible at 328 px, text zone clear.

## N2 mailbox (3/4 front-left, 70 mm)
- Arch body 0.16 wide x 0.18 tall x 0.42 long cobalt, 6 mm wall, boolean cavity. Door open 90 deg as shelf, inner face flush with cavity floor.
- 4 letters 0.11x0.15 stacked on floor/shelf, protruding over the shelf, address-line texture + stamp.
- Green flag arm + plate on side, pivot cylinder. Square wood post 0.05 on a round base disc 0.34 dia. Box rests on post top.
- Pass: letters rest on floor (no sink), flag pivot clean, door shelf flush.

## N3 paper plane (3/4 front, 60 mm)
- Globe r 0.1 (procedural land/sea), tilted 23 deg, meridian ring + axis rod + base cylinder; small green pin on surface.
- Paper plane 0.2 long, 0.14 span, 0.8 mm solidify, off-white wings + green keel. Floats (intended), banked, pointing up-right.
- Dashed path: 14 capsules along a bezier from the pin to the plane, floating (intended).
- Pass: globe readable at 328 px, plane silhouette clean, dashes evenly spaced.
