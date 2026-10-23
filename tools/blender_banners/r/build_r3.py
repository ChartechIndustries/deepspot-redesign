import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from common import *

A = args()
sc = reset()
setup_render(sc, A["spl"], A["scale"], ambient=("#8da0ff", 0.4))
sc.view_settings.exposure = -0.4

DIA = 0.36                      # hex circumradius*2 (m)
HEIGHTS = [0.12, 0.26, 0.42, 0.60, 0.80, 1.04]
N = len(HEIGHTS)
DONE = 3                        # pillars 0..2 done, 3 = current
D = Vector((0.80, 0.60)).normalized()
START = Vector((-1.3, -1.0))
STEP = 0.50


pos = [START]
for _i in range(1, N):
    hd = math.radians(52 - 7 * (_i - 1))
    pos.append(pos[-1] + Vector((math.cos(hd), math.sin(hd))) * STEP)


def stone_mat(name, dot_hex, zmax, base=None):
    """Off-white stone with a halftone dot gradient (dots dense at bottom, fading up)."""
    m = mat(name, base or PAL["white"], 0.55, coat=0.1)
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / 0.10, 1 / 0.10, 1 / 0.10)
    vo = nt.nodes.new("ShaderNodeTexVoronoi")
    vo.feature = "DISTANCE_TO_EDGE" if False else "F1"
    vo.inputs["Randomness"].default_value = 0.0
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange")
    cmp_ = nt.nodes.new("ShaderNodeMath"); cmp_.operation = "LESS_THAN"
    mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], vo.inputs["Vector"])
    nt.links.new(tc.outputs["Object"], sp.inputs[0])
    nt.links.new(sp.outputs["Z"], mr.inputs["Value"])
    mr.inputs["From Min"].default_value = 0.0
    mr.inputs["From Max"].default_value = zmax
    mr.inputs["To Min"].default_value = 0.62   # dot radius (lattice units) at bottom
    mr.inputs["To Max"].default_value = 0.0    # none at top
    mr.clamp = True
    # Voronoi F1 distance in lattice units; the nearest cell centre is at the lattice point (0.5 offset in Voronoi cells)
    nt.links.new(vo.outputs["Distance"], cmp_.inputs[0])
    nt.links.new(mr.outputs["Result"], cmp_.inputs[1])
    mix.inputs[6].default_value = lin(base or PAL["white"]) + [1]
    mix.inputs[7].default_value = lin(dot_hex) + [1]
    nt.links.new(cmp_.outputs[0], mix.inputs[0])
    nt.links.new(mix.outputs[2], b.inputs["Base Color"])
    return m


def column(name, r, rot, h, material, nside=8, seed=0, taper=(1.05, 1.0, 0.93), tilt=0.0):
    rr = random.Random(seed)
    jit = [1 + rr.uniform(-0.09, 0.09) for _ in range(nside)]
    zs = [0.0, h * 0.55, h]
    bm = bmesh.new()
    rings = []
    for z, f in zip(zs, taper):
        ring = []
        for k in range(nside):
            a = rot + 2 * math.pi * k / nside
            rad = r * f * jit[k] * (1 + 0.025 * math.sin(3 * a + z * 5))
            zz = z + (tilt * math.cos(a - 0.6) * r * 0.5 if z == h else 0.0)
            ring.append(bm.verts.new((rad * math.cos(a), rad * math.sin(a), zz)))
        rings.append(ring)
    for j in range(2):
        for k in range(nside):
            k2 = (k + 1) % nside
            bm.faces.new((rings[j][k], rings[j][k2], rings[j + 1][k2], rings[j + 1][k]))
    bm.faces.new(rings[-1])
    bm.faces.new(list(reversed(rings[0])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return from_bm(name, bm, material), rings


def hexpts(r, rot):
    return [(r * math.cos(rot + math.pi / 3 * i), r * math.sin(rot + math.pi / 3 * i)) for i in range(6)]


greenglow = mat("greenglow", PAL["green"], 0.35, coat=0.3, emit=PAL["green"], emit_strength=1.0)
yellow = mat("yellow", "#c47400", 0.5)
ringm = mat("ring", "#c47400", 0.5)

pillars = []
for i, h in enumerate(HEIGHTS):
    p = pos[i]
    # slight deterministic wobble in position and rotation so the line is not rigid
    p = p + Vector((-D.y, D.x)) * (0.05 * math.sin(i * 1.9))
    dot = "#0a7f3f" if i < DONE else PAL["navy"]
    m = stone_mat(f"stone{i}", dot, h * 0.95, "#6fe39a" if i < DONE else None)
    body, _r = column(f"pillar{i}", DIA / 2 * (1 + 0.12 * math.sin(i * 2.3)), 0.3 + 0.2 * i, h, m, seed=i + 3)
    body.location = (p.x, p.y, 0)
    finish(body, 0.014, 3, 40)
    top_r = DIA / 2 * 0.86
    if i < DONE:
        cap = prism(f"cap{i}", hexpts(top_r * 0.88, 0.3 + 0.2 * i), 0.0, 0.016, greenglow)
        cap.location = (p.x, p.y, h)
        finish(cap, 0.004, 2, 35)
        cap["assembly"] = f"pillar{i}"
        body["assembly"] = f"pillar{i}"
    elif i == DONE:
        ring = torus(f"ring{i}", top_r * 0.95, 0.011, (p.x, p.y, h + 0.006), greenglow, seg=96, rseg=16)
        ring["assembly"] = f"pillar{i}"
        body["assembly"] = f"pillar{i}"
    pillars.append((p, h))

# yellow arrow above the last pillar (floats on purpose, 0.16 m gap)
pl, ph = pillars[-1]
aw, ah = 0.24, 0.46
pts = [(-0.045, 0.0), (0.045, 0.0), (0.045, 0.24), (0.12, 0.24), (0.0, 0.46), (-0.12, 0.24), (-0.045, 0.24)]
bma = bmesh.new()
fr = [bma.verts.new((x, -0.025, z)) for x, z in pts]
bk = [bma.verts.new((x, 0.025, z)) for x, z in pts]
bma.faces.new(list(reversed(fr))); bma.faces.new(bk)
for i in range(len(pts)):
    j = (i + 1) % len(pts)
    bma.faces.new((fr[i], bk[i], bk[j], fr[j]))
bmesh.ops.recalc_face_normals(bma, faces=bma.faces[:])
arrow = from_bm("arrow", bma, yellow)
arrow.location = (pl.x, pl.y - 0.02, ph + 0.13)
arrow.scale = (0.8, 0.8, 0.8)
arrow.rotation_euler = (0, 0, -0.35)
finish(arrow, 0.012, 3, 40)
arrow["assembly"] = "arrow"
# floor ring under the arrow (glow cue on the top face)
tr = torus("topring", DIA / 2 * 0.80, 0.009, (pl.x, pl.y, ph + 0.0095), ringm, seg=96, rseg=16)
tr["assembly"] = "arrow"

# ---------------- ground, lights, camera ----------------
catcher(0.0)
area_light("key", (-4.0, -5.0, 5.5), (0.2, 0, 0.5), 3.0, 1500, 5300, sy=2.4)
area_light("fill", (5.0, -6.0, 2.2), (0, 0, 0.5), 4.0, 150, 7000)
rim = area_light("rim", (4.0, 5.5, 3.5), (0.2, 0, 0.6), 2.5, 1200, 6000)
rim.data.use_shadow = False
for i in range(DONE + 1):
    p, h = pillars[i]
    d = bpy.data.lights.new(f"glow{i}", "POINT")
    d.color = lin(PAL["green"]); d.energy = 60 if i < DONE else 30; d.shadow_soft_size = 0.12
    o = bpy.data.objects.new(f"glow{i}", d)
    link(o); o.location = (p.x, p.y, h + 0.18)
d = bpy.data.lights.new("arrowglow", "POINT"); d.color = lin(PAL["yellow"]); d.energy = 0.0; d.shadow_soft_size = 0.1
o = bpy.data.objects.new("arrowglow", d); link(o); o.location = (pl.x, pl.y - 0.3, ph + 0.5)

cam = camera((1.28, -9.63, 4.7), (0.0, 0.2, 0.40), 60)
cam.data.shift_x = 0.136
cam.data.shift_y = 0.06
for i, (p, h) in enumerate(pillars):
    print("FRAC pillar", i, proj_frac(cam, (p.x, p.y, h)), proj_frac(cam, (p.x, p.y, 0)))
print("FRAC arrowtop", proj_frac(cam, (pl.x, pl.y, ph + 0.13 + 0.46 * 0.8)))

clipcheck()
save_blend(os.path.join(HERE, "r3.blend"))
if A["cam"]:
    cx = {"hi": ((0, -4.5, 6.0), (0, 0, 0.4), 40), "side": ((8.0, -1.0, 1.0), (0, 0, 0.6), 60), "low": ((0.5, -6.0, 0.25), (0, 0, 0.8), 40)}[A["cam"]]
    camera(*cx)
    sc.render.resolution_x, sc.render.resolution_y = 960, 600
render(A["out"], A["noren"])
