# Builder brief — Blender banner graphics (read fully before building)

Read first: `C:\Users\CharD\Desktop\DeepSpot Globe\BLENDER-BANNERS-PLAN.md` (the plan; your banner's 3
variations are listed there) and `C:\Users\CharD\.claude\skills\blender-scene\SKILL.md` (quality gates).
Current banner screenshots: `C:\Users\CharD\Desktop\DeepSpot Globe\qa\banners-blender\before\`.

## Your job
Build the 3 variations for ONE banner id (given in your prompt). Plan first: write `PLAN.md` in your
folder (shot sheet per variation: camera, lens, objects with real sizes + sources, lights, pass/fail),
then build, then QA, then fix, then report.

## Rules
- Folder: `C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\<id>\` (scripts, PLAN.md,
  renders/, qa/). Do not edit anything in `source/` except writing your final WebP files into
  `source/banners/` (create it if missing). Do not touch other banner folders.
- Headless only: `"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P script.py -- args`.
  Never open a Blender window or a browser window. Do not use the Blender MCP tools (live Blender).
  The PC is shared with gaming: start Blender at below-normal priority, e.g. from Python
  `subprocess.Popen(..., creationflags=0x00004000)` (BELOW_NORMAL_PRIORITY_CLASS). One render at a time.
- Engine Cycles, GPU OptiX. Set `prefs.compute_device_type='OPTIX'`, call `get_devices()`, enable only
  devices whose `type=='OPTIX'` (not the CPU). `scene.cycles.device='GPU'`. Samples 128–256 + denoise.
  Read enum identifiers instead of hardcoding; find shader nodes by `type`.
- Colour management AgX. Final master 1920x1200 PNG. The background colour must match the banner's
  brand colour (see plan) so the card keeps its identity; the render fills the whole card.
- NO text, letters or numerals rendered except where the plan says (e.g. podium 1/2/3, use a bold
  system font like `C:\Windows\Fonts\arialbd.ttf`). All copy stays HTML.
- Keep the plan's text zone clear (low detail, plain background) and the subject in the safe box.
- Bevels on all hand-modeled geometry, smooth shading, real-world scale. CC0 Poly Haven assets allowed
  (`https://api.polyhaven.com/assets?t=models`, `/files/<id>`); download into `<id>\assets\`. No AI
  images or AI meshes. Do not use paid/credit tools.
- Clip check: run `runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"]()`
  inside each headless build (after building, before render). Target 0 pairs, or justify in qa notes.
- Save each scene `.blend` in your folder so it can be re-rendered.

## QA (mandatory, before reporting)
1. Look at every final render at full size with the Read tool (crop into tiles if needed).
2. Crop test: write a Python/PIL script that cover-crops each render to 431x331, 714x301, 328x331,
   707x413 and 360x413, and draws the banner's HTML copy roughly where it sits (white or navy bold
   Arial, see the before/ screenshots). Look at every crop. Subject must read, text must be legible.
3. Fix and re-render until it passes. A first render is never final: at least 2 rounds per variation.
4. Also downscale to 328 px wide and look again.
5. Write `qa\<id>_notes.md`: per variation — what was checked, what was found, what was fixed, known limits.

## Deliver
- `source/banners/<id>1.webp`, `<id>2.webp`, `<id>3.webp` (1600x1000, WebP q≈82, each ≤ 180 KB; use PIL).
- Masters `<id>\renders\<id>N.png`, crop sheets `<id>\qa\`, `.blend` files.
- Final report (short): file paths, one line per variation, your recommended pick and why, known limits,
  and for each variation the best CSS `object-position` per layout (desktop / tablet / phone).

## Moles (user ask, 2026-10-22): some variations use a DeepSpot mole, not all
Only these 3 variations get a mole: **C1 podium** (mole standing on step 1), **W1 cutaway** (mole in the
carved cavern / tunnel), **H3 dig** (mole at the dig, next to the found gem). All other variations: no mole.
- Source: `C:\Users\CharD\Downloads\BLOOD1.blend` — collections Body/Shirt, Head/Hat, Eyes, Face, Mouth Area,
  Jackets, Back Bling, "Collection" (base; mesh "Body" ~1.44 x 1.74 x 1.46 units). NOT rigged (static pose).
- NEVER modify or save BLOOD1.blend. Append with `bpy.data.libraries.load(path, link=False)` into your scene.
- Outfit = base + at most one Body/Shirt + one Head/Hat (+ optional Eyes). Obey
  `C:\Users\CharD\Downloads\Mole Export\MOLE_RULES.json` (Smock/Yellow_Smock/Manifest never with a shirt;
  no Nami bikini). Pick a clean, readable outfit (e.g. a hat that fits the scene: hard hat / miner for W1 & H3
  if one exists).
- Look at the blend's own materials/lighting in a test render first so the mole looks like the PFP moles
  (`source\community-assets\moles\*.webp` show the look). Scale the mole to the scene (toy/diorama scale ok).
- Contact: feet on the step/floor (measure bounds). Mole must not clip into props. Face readable at 328 px.

## CTA banners H and N: new output format (review, 2026-10-22)
Full-bleed 16:10 backgrounds made the CTA subjects tiny and cut off in a corner. For H and N deliver
instead a **transparent cut-out** of the subject (film_transparent, shadow catcher kept for the contact
shadow): master 1600x1600 PNG with alpha, subject fills ~85 % of the frame, nothing touches the edges.
Export `source/banners/<id>N.webp` (alpha WebP, 1000x1000, ≤ 150 KB). The page places it with CSS in the
right part of the block (desktop ~360 px tall), and above the copy on phone (~200 px).
Richer objects: more detail, materials with texture (paper fibre, enamel, worn paint), good rim light so
the edges separate from a dark navy / cobalt page. Nothing floats without a reason that reads.
QA: composite each cut-out over the real background colour at 707x413 (right side, 360 px tall) and
360 px wide phone (200 px tall above copy); look at both.
