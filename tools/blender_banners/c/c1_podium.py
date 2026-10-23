import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

A = argv()
OUT = A[0]
SAMPLES = int(A[1]) if len(A) > 1 else 160
PCT = int(A[2]) if len(A) > 2 else 100
QA = "--qa" in A
CLIP = "--noclip" not in A

reset()
sc = setup_render(SAMPLES, PCT)
setup_world(1.0, rot_z=math.radians(200))
add_floor()

CREAM, NAVY, COBALT, YEL = "#eceee8", "#0b1a2e", "#3c60ff", "#ffd400"


# ------------------------------------------------------------ halftone block material
def mn(nt, op, a=None, b=None, clamp=False):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    n.use_clamp = clamp
    for i, v in enumerate((a, b)):
        if v is None:
            continue
        if isinstance(v, (int, float)):
            n.inputs[i].default_value = v
        else:
            nt.links.new(v, n.inputs[i])
    return n.outputs[0]


def halftone_mat(name, height, cell=0.05, base=CREAM, dot=COBALT):
    m = pbr(name, base, rough=0.28, coat=0.5, coat_rough=0.08)
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(tc.outputs["Object"], sp.inputs[0])
    u = mn(nt, "ADD", sp.outputs[0], sp.outputs[1])
    z = mn(nt, "ADD", sp.outputs[2], height / 2)
    U = mn(nt, "FRACT", mn(nt, "DIVIDE", u, cell))
    V = mn(nt, "FRACT", mn(nt, "DIVIDE", z, cell))
    dx = mn(nt, "SUBTRACT", U, 0.5)
    dy = mn(nt, "SUBTRACT", V, 0.5)
    d2 = mn(nt, "ADD", mn(nt, "MULTIPLY", dx, dx), mn(nt, "MULTIPLY", dy, dy))
    # radius grows toward the bottom of the block: r = 0.46 * clamp(1 - z/(0.5h))
    g = mn(nt, "SUBTRACT", 1.0, mn(nt, "DIVIDE", z, height * 0.5), clamp=True)
    r = mn(nt, "MULTIPLY", g, 0.47)
    r2 = mn(nt, "MULTIPLY", r, r)
    mask = mn(nt, "MULTIPLY", mn(nt, "SUBTRACT", r2, d2), 90.0, clamp=True)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = hexlin(base)
    mix.inputs[7].default_value = hexlin(dot)
    nt.links.new(mask, mix.inputs[0])
    nt.links.new(mix.outputs[2], bsdf.inputs["Base Color"])
    return m


# ------------------------------------------------------------ podium
W, D, GAP = 0.84, 0.80, 0.03
steps = [("2", -(W + GAP), 0.50), ("1", 0.0, 0.72), ("3", (W + GAP), 0.34)]
top_mat = pbr("podium_top", CREAM, rough=0.3, coat=0.25, coat_rough=0.12)
navy = pbr("navy", "#13294a", rough=0.45)
tops = {}
for label, x, h in steps:
    bm = bm_box(W, D, h)
    for f in bm.faces:
        f.material_index = 1 if f.normal.z > 0.5 else 0
    mats = [halftone_mat(f"block{label}", h), top_mat]
    ob = obj_from_bm(f"block{label}", bm, mats, loc=(x, 0, h / 2), bevel=(0.014, 3), assembly=f"block{label}")
    tops[label] = h
    # numeral on the front (-y) face
    t = text_mesh(label, 0.34, 0.03, 0.004, navy, name=f"num{label}", assembly=f"block{label}")
    t.rotation_euler = (math.pi / 2, 0, 0)
    t.location = (x, -D / 2 - 0.012, h * 0.52)
    finish_obj(t, (0.003, 2), True, 30, f"block{label}")

# ------------------------------------------------------------ props
concrete = pbr("concrete", "#a6a69e", rough=0.92)
concrete_d = pbr("concrete_dark", "#7d7d78", rough=0.95)
window = pbr("window", "#16202d", rough=0.3)
white = pbr("white_panel", "#f3f4ef", rough=0.35, coat=0.3)
gold_m = gold()


GRP = []


def part(name, bm, mat, loc, asm, rot=(0, 0, 0), bevel=(0.003, 2)):
    o = obj_from_bm(name, bm, [mat], loc=loc, rot=rot, bevel=bevel, assembly=asm)
    GRP.append(o)
    return o


def scale_group(origin, K):
    root = bpy.data.objects.new('grp_' + str(len(bpy.data.objects)), None)
    bpy.context.scene.collection.objects.link(root)
    root.location = origin
    bpy.context.view_layer.update()
    for o in GRP:
        o.parent = root
        o.matrix_parent_inverse = root.matrix_world.inverted()
    root.scale = (K, K, K)
    GRP.clear()


# --- 1: Rummu prison (concrete block + tower), back half of step 1
z1 = tops["1"]
asm = "rummu"
bx, by = 0.0, 0.26
part("r_wall", bm_box(0.28, 0.17, 0.12), concrete, (bx, by, z1 + 0.06), asm)
part("r_roof", bm_box(0.30, 0.19, 0.012), concrete_d, (bx, by, z1 + 0.126), asm)
for i, wx in enumerate((-0.095, -0.035, 0.065, 0.1)):
    part(f"r_win{i}", bm_box(0.03, 0.006, 0.045), window, (bx + wx, by - 0.0855, z1 + 0.068), asm, bevel=(0.002, 2))
tx, ty = bx + 0.17, by + 0.02
part("r_tower", bm_cyl(0.04, 0.04, 0.22, 24), concrete, (tx, ty, z1 + 0.11), asm)
part("r_tower_cap", bm_cyl(0.055, 0.055, 0.015, 24), concrete_d, (tx, ty, z1 + 0.2275), asm)
part("r_tower_roof", bm_cyl(0.05, 0.004, 0.05, 24), concrete_d, (tx, ty, z1 + 0.26), asm, bevel=None)
for i, a in enumerate((0, 90, 180, 270)):
    rx, ry = math.cos(math.radians(a)) * 0.041, math.sin(math.radians(a)) * 0.041
    part(f"r_tw{i}", bm_box(0.012 if a % 180 else 0.006, 0.006 if a % 180 else 0.012, 0.022), window,
         (tx + rx, ty + ry, z1 + 0.18), asm, bevel=(0.001, 2))

K_PRISON, K_RADAR, K_CANDY = 1.35, 1.5, 1.5
scale_group((bx, by, z1), K_PRISON)

# --- 2: Teufelsberg radar dome
z2 = tops["2"]
asm = "radar"
cx, cy = -(W + GAP), 0.0
part("t_tower", bm_cyl(0.075, 0.075, 0.13, 32), concrete, (cx, cy, z2 + 0.065), asm)
part("t_deck", bm_cyl(0.092, 0.092, 0.012, 32), concrete_d, (cx, cy, z2 + 0.136), asm)
for i in range(8):
    a = math.radians(i * 45 + 22)
    part(f"t_slit{i}", bm_box(0.012, 0.004, 0.05), window, (cx + math.cos(a) * 0.0755, cy + math.sin(a) * 0.0755, z2 + 0.07), asm,
         rot=(0, 0, a + math.pi / 2), bevel=(0.001, 2))


def dome(r, zc, sub=2):
    bm = bm_ico(r, sub)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -r * 0.15], context="VERTS")
    edges = [e for e in bm.edges if e.is_boundary]
    bmesh.ops.holes_fill(bm, edges=edges, sides=0)
    return bm


GRP.append(obj_from_bm("t_dome", dome(0.105, 0), [white], loc=(cx, cy, z2 + 0.142 + 0.105 * 0.15), bevel=(0.0035, 2), smooth=False, split=0, assembly=asm))
# small secondary dome on a stub tower, back right of the step
part("t_stub", bm_cyl(0.028, 0.028, 0.11, 20), concrete, (cx + 0.2, cy + 0.2, z2 + 0.055), asm)
GRP.append(obj_from_bm("t_dome2", dome(0.04, 0), [white], loc=(cx + 0.2, cy + 0.2, z2 + 0.11 + 0.04 * 0.15), bevel=(0.002, 2), smooth=False, split=0, assembly=asm))
scale_group((cx, cy, z2), K_RADAR)

# --- 3: Maishima candy tower
z3 = tops["3"]
asm = "maishima"
mx, my = (W + GAP), 0.0
cols = ["#ff5d8f", "#ffd400", "#17c3b2", "#3c60ff", "#ff8a3d", "#ff5d8f", "#ffd400"]
cm = [pbr(f"candy{i}", c, rough=0.3, coat=0.6, coat_rough=0.06) for i, c in enumerate(cols)]
h = 0.04
for i in range(7):
    r = 0.052 - 0.002 * (i % 2)
    part(f"m_band{i}", bm_cyl(r, r, h, 32), cm[i], (mx + 0.08, my + 0.07, z3 + h / 2 + i * h), asm, bevel=(0.0025, 2))
top_z = z3 + 7 * h
part("m_ball", bm_sphere(0.04, 32, 16), gold_m, (mx + 0.08, my + 0.07, top_z + 0.036), asm, bevel=None)
# low squat tower + stripes
for i in range(3):
    part(f"m_low{i}", bm_cyl(0.078, 0.078, 0.04, 32), cm[(i * 2 + 1) % 7], (mx - 0.1, my - 0.1, z3 + 0.02 + i * 0.04), asm, bevel=(0.0025, 2))
part("m_low_ball", bm_sphere(0.032, 28, 14), gold_m, (mx - 0.1, my - 0.1, z3 + 0.12 + 0.028), asm, bevel=None)

scale_group((mx, my, z3), K_CANDY)

# ------------------------------------------------------------ mole on step 1
mole_obs = load_mole(("Partyhat", "Tux", "Aviators"))


def darken_fur(ob):
    """Near-black dense fur, desaturated so the green bounce does not tint it (face stays pale)."""
    for m in ob.data.materials:
        if not m or not m.use_nodes:
            continue
        nt = m.node_tree
        for b in [n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"]:
            lk = b.inputs["Base Color"].links
            if not lk:
                continue
            src = lk[0].from_socket
            hs = nt.nodes.new("ShaderNodeHueSaturation")
            hs.inputs["Saturation"].default_value = 0.35
            hs.inputs["Value"].default_value = 0.8
            gm = nt.nodes.new("ShaderNodeGamma")
            gm.inputs["Gamma"].default_value = 2.6
            nt.links.new(src, gm.inputs["Color"])
            nt.links.new(gm.outputs["Color"], hs.inputs["Color"])
            bw = nt.nodes.new("ShaderNodeRGBToBW")
            nt.links.new(src, bw.inputs["Color"])
            mr = nt.nodes.new("ShaderNodeMapRange")
            mr.inputs["From Min"].default_value = 0.42
            mr.inputs["From Max"].default_value = 0.62
            nt.links.new(bw.outputs["Val"], mr.inputs["Value"])
            mx = nt.nodes.new("ShaderNodeMix")
            mx.data_type = "RGBA"
            nt.links.new(mr.outputs["Result"], mx.inputs[0])
            nt.links.new(hs.outputs["Color"], mx.inputs[6])
            nt.links.new(src, mx.inputs[7])
            nt.links.new(mx.outputs[2], b.inputs["Base Color"])
            for k in ("Specular IOR Level", "Specular"):
                if k in b.inputs:
                    b.inputs[k].default_value = 0.15


for o in mole_obs:
    if o.type == "MESH" and o.name in ("Head", "Body", "Legs", "Claw1", "Claw 2", "Claw 3"):
        darken_fur(o)

for o in mole_obs:
    o.hide_render = False
    o.hide_viewport = False
    o["assembly"] = "mole"
bpy.context.scene.frame_set(1)
root = bpy.data.objects.new("mole_root", None)
bpy.context.scene.collection.objects.link(root)
for o in mole_obs:
    o.parent = root
meshes = [o for o in mole_obs if o.type == "MESH"]
lo, hi = bounds_of(meshes)
print("MOLE raw bounds", lo, hi)
S = 1.1 / (hi.z - lo.z)
root.scale = (S, S, S)
root.rotation_euler = (0, 0, math.radians(-48))
MX, MY = -0.12, -0.12
root.location = (MX, MY, z1 - lo.z * S)
bpy.context.view_layer.update()
lo, hi = bounds_of(meshes)
print("MOLE placed bounds", lo, hi)
root.location.z += z1 - lo.z
bpy.context.view_layer.update()
lo, hi = bounds_of(meshes)
print("MOLE final z", lo.z, hi.z, "step top", z1)

# ------------------------------------------------------------ camera + lights
import math as _m
az=_m.radians(40); R=11.4
CSX, CSY = 0.15, 0.15
CAMPOS = (R*_m.sin(az), -R*_m.cos(az), 2.6)
TARGET = (0.0, 0.0, 0.46)
make_camera(CAMPOS, TARGET, 62, shift=(CSX, CSY))
area_light("key", (-3.5, -4.5, 5.0), (0, 0, 0.4), 3.5, 700, 5400)
area_light("fill", (5.5, -3.0, 2.0), (0, 0, 0.4), 4.0, 140, 6000)
area_light("molefill", (2.5, -3.0, 1.9), (-0.14, -0.17, 1.1), 1.5, 260, 5600)
area_light("rim", (-1.5, 5.5, 3.0), (0, 0, 0.5), 3.0, 500, 6200)

bpy.context.view_layer.update()
if CLIP:
    bad = clipcheck(0.004)
    print("CLIP_PAIRS", len(bad), bad[:20])
if QA:
    qa_views("c1", (0, 0, 0.5), 5.0, 55, os.path.join(HERE, "qa"))
    sc.render.film_transparent = True
    sc.render.resolution_percentage = PCT
    sc.cycles.samples = SAMPLES
    sc.camera = bpy.data.objects["cam"]
render_to(OUT)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "c1_podium.blend"))
