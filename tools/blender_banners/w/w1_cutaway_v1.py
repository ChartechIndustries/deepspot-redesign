import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

args = sys.argv[sys.argv.index("--") + 1:]
out = args[0]
mode = args[1] if len(args) > 1 else "final"
PREV = mode == "prev"

clear()
s = setup_render(960 if PREV else 1920, 600 if PREV else 1200, 48 if PREV else 200, transparent=True)
world(NAVY, 0.15)

# ---------- materials
m_tuff = tex_mat("tuff", "old_sandstone_02", 2.0, tint=(1.0, 0.86, 0.68), tint_mix=0.6, bump=0.8, rough_mul=1.0)
m_tuff_in = tex_mat("tuff_in", "old_sandstone_02", 1.6, tint=(1.0, 0.8, 0.55), tint_mix=0.5, bump=1.0)
m_rock = tex_mat("rock", "rock_wall_08", 1.8, tint=(0.7, 0.8, 1.0), tint_mix=0.5, val=0.9, bump=0.9)
m_soil = tex_mat("soil", "excavated_soil_wall", 1.5, tint=(0.8, 0.5, 0.35), tint_mix=0.5, bump=0.7)
m_grass = tex_mat("grass", "leafy_grass", 2.4, tint=(0.25, 1.0, 0.3), tint_mix=0.85, sat=1.7, bump=0.6)
m_floor = tex_mat("floorstone", "seaworn_stone_tiles", 1.2, tint=(1.0, 0.82, 0.6), tint_mix=0.55, bump=0.7, rough_mul=0.8)
m_bg = solid("bg", (*NAVY, 1), rough=1.0)
m_lamp = solid("lamp", (1, 0.6, 0.25), emission=kelvin(2200), em_strength=8)
m_iron = solid("iron", (0.05, 0.05, 0.06), rough=0.45, metal=0.8)
m_jacket = solid("jacket", srgb("#07d653"), rough=0.6)
m_skin = solid("skin", srgb("#e7b48f"), rough=0.6)

# ---------- block (rotated assembly on a pivot)
BW, BD = 8.0, 6.0
layers = [  # name, z0, z1, mat
    ("strata_rock", 0.0, 0.7, m_rock),
    ("strata_tuff", 0.7, 4.6, m_tuff),
    ("strata_soil", 4.6, 5.0, m_soil),
    ("strata_grass", 5.0, 5.12, m_grass),
]
CAV = dict(x0=-3.0, x1=3.0, y0=-3.3, y1=1.2, z0=1.0, z1=3.9)
cutter = box("cutter", (CAV["x1"] - CAV["x0"], CAV["y1"] - CAV["y0"], CAV["z1"] - CAV["z0"]),
             ((CAV["x0"] + CAV["x1"]) / 2, (CAV["y0"] + CAV["y1"]) / 2, (CAV["z0"] + CAV["z1"]) / 2), bev=0)
blocks = []
for n, z0, z1, mat in layers:
    o = box(n, (BW, BD, z1 - z0), (0, 0, (z0 + z1) / 2), mat, bev=0.055 if n != "strata_grass" else 0.03)
    blocks.append(o)
    if z1 > CAV["z0"] and z0 < CAV["z1"]:
        apply_all(o)  # bake outer bevel first
        boolean_diff(o, cutter)
        bevel(o, 0.03, 2, angle=40, apply=True)
        smooth(o)
bpy.data.objects.remove(cutter)

# soil/grass overhang lip: slightly wider grass slab
grass = bpy.data.objects["strata_grass"]
# cavern interior floor slab (thin, polished) -> sits ON cut floor
floor = box("slabfloor", (6.0, 4.2, 0.06), (0, -0.9, CAV["z0"] + 0.03), m_floor, bev=0.01)
floor.name = "floor_slab"
# pillars (carved-in-place columns)
px = [-1.75, 1.75]
py = [-2.0, -0.2]
pillars = []
for i, x in enumerate(px):
    for j, y in enumerate(py):
        p = box(f"pillar_{i}{j}", (0.8, 0.8, CAV["z1"] - CAV["z0"] - 0.06), (x, y, (CAV["z0"] + 0.06 + CAV["z1"]) / 2 + 0.0), m_tuff_in, bev=0.04)
        pillars.append(p)
# lintel-less: pillars end exactly at ceiling
for p in pillars:
    p.location.z = CAV["z0"] + 0.06 + (CAV["z1"] - CAV["z0"] - 0.06) / 2

# niche lamps: little iron brackets with glowing glass on back wall and pillars
def lamp(name, loc, rot=0):
    b = box(name + "_bracket", (0.14, 0.05, 0.22), loc, m_iron, bev=0.01)
    g = box(name + "_glow", (0.09, 0.07, 0.15), (loc[0], loc[1] - 0.03, loc[2]), m_lamp, bev=0.015)
    g["assembly"] = name
    b["assembly"] = name
    return b, g

# back wall lamps (wall face y = 1.2)
lamp("lampA", (-2.3, 1.2 - 0.025, 2.8))
lamp("lampB", (2.3, 1.2 - 0.025, 2.8))
lamp("lampC", (0.0, 1.2 - 0.025, 3.0))
# on front-facing faces of the front pillars (face y = -2.4)
lamp("lampD", (-1.75, -2.4 - 0.025, 2.5))
lamp("lampE", (1.75, -2.4 - 0.025, 2.5))
for n in ("lampD", "lampE"):
    for suf in ("_bracket", "_glow"):
        o = bpy.data.objects[n + suf]
        o.location.y = -2.4 - 0.025 if suf == "_bracket" else -2.4 - 0.025 - 0.03
# fix: the lamps on the front face of pillars must sit on the face (outside), not inside
for n in ("lampD", "lampE"):
    b = bpy.data.objects[n + "_bracket"]
    g = bpy.data.objects[n + "_glow"]
    b.location.y = -2.4 - 0.025
    g.location.y = -2.4 - 0.025 - 0.055
for n in ("lampA", "lampB", "lampC"):
    b = bpy.data.objects[n + "_bracket"]
    g = bpy.data.objects[n + "_glow"]
    b.location.y = 1.2 - 0.025
    g.location.y = 1.2 - 0.025 - 0.055

# small crates / bench: carved stone bench along back wall
bench = box("bench", (4.2, 0.5, 0.4), (0, 1.2 - 0.25, CAV["z0"] + 0.06 + 0.2), m_tuff_in, bev=0.03)

# visitor for scale (behind, between pillar rows)
fig = figure("visitor", (1.0, -0.9, CAV["z0"] + 0.06), 1.75, rot_z=math.radians(-20), jacket=m_jacket, skin=m_skin)

# DeepSpot mole (BLOOD1.blend, read-only append): base + Hard Hat
mole_parts = load_mole(("Hard Hat",))
mroot = bpy.data.objects.new("mole_root", None)
bpy.context.collection.objects.link(mroot)
for o in mole_parts:
    o.parent = mroot
    if o.type == "MESH":
        o["assembly"] = "mole"
mn, mx = world_bounds(mole_parts)
MH = 1.6  # metres tall (toy scale)
k = MH / (mx.z - mn.z)
mroot.scale = (k, k, k)
cx, cy = (mn.x + mx.x) / 2, (mn.y + mx.y) / 2
mroot.location = (-0.5 - cx * k, -1.9 - cy * k, CAV["z0"] + 0.06 - mn.z * k)
mroot.rotation_euler = (0, 0, math.radians(-90 - 24 + 22))  # nose is +x; faces camera, slight turn

# toy trees + rocks on the lawn (all rest on grass top z=5.12)
m_pine = solid("pine", srgb("#0f8a4a"), rough=0.7)
m_trunk = solid("trunk", srgb("#6b4228"), rough=0.8)
m_rockc = solid("rockc", srgb("#8b93a0"), rough=0.7)
GZ = 5.12
def tree(n, x, y, s):
    a = f"tree_{n}"
    tr = cyl(a + "_trunk", 0.09 * s, 0.5 * s, (x, y, GZ + 0.25 * s), m_trunk, bev=0.01, verts=16)
    tr["assembly"] = a
    z = GZ + 0.45 * s
    for i, (r, h) in enumerate(((0.55, 0.75), (0.42, 0.65), (0.28, 0.55))):
        bpy.ops.mesh.primitive_cone_add(radius1=r * s, radius2=0, depth=h * s, vertices=24, location=(x, y, z + h * s / 2))
        c = bpy.context.active_object
        c.name = f"{a}_cone{i}"
        c.data.materials.append(m_pine)
        bevel(c, 0.012 * s)
        smooth(c)
        c["assembly"] = a
        z += h * s * 0.55
for i, (tx, ty, ts) in enumerate(((-2.8, 1.6, 1.3), (-3.2, 0.3, 1.0), (3.0, 1.9, 1.1))):
    tree(i, tx, ty, ts)
def rock(n, x, y, r, rz):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, subdivisions=2, location=(x, y, GZ + r * 0.55))
    o = bpy.context.active_object
    o.name = f"rock_{n}"
    o.scale = (1.0, 0.8, 0.6)
    o.rotation_euler = (0.2, 0.1, rz)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    o.location.z = GZ + 0.0 - min(v.co.z for v in o.data.vertices) * 1.0 + 0.0 - 0.02
    o.data.materials.append(m_rockc)
    bevel(o, 0.02)
    smooth(o, 60)
rock(0, 2.2, -0.9, 0.28, 0.5)
rock(1, 2.7, -1.3, 0.16, 1.2)
rock(2, -0.2, 2.1, 0.22, 2.0)

# ground plane under diorama
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.001))
gp = bpy.context.active_object
gp.name = "ground_bg"
gp.data.materials.append(m_bg)
gp.is_shadow_catcher = True

# pivot rotate the whole diorama
pivot = bpy.data.objects.new("pivot", None)
bpy.context.collection.objects.link(pivot)
for o in list(bpy.context.scene.objects):
    if o.type == "MESH" and o.name != "ground_bg" and o.parent is None:
        o.parent = pivot
mroot.parent = pivot
pivot.rotation_euler = (0, 0, math.radians(24))
bpy.context.view_layer.update()
mn3, mx3 = world_bounds(mole_parts)
FLOOR = CAV["z0"] + 0.06
mroot.location.z += FLOOR - mn3.z  # pivot only rotates about z, so z shift is direct
print("MOLE_MINZ_BEFORE", mn3.z)
bpy.context.view_layer.update()
for o in mole_parts:
    if o.type == "MESH":
        zs = [(o.matrix_world @ v.co).z for v in o.data.vertices]
        print("MOLE_Z", o.name, round(min(zs), 3), round(max(zs), 3))

# ---------- volume (cavern haze)
vol = box("wallvol", (CAV["x1"] - CAV["x0"] - 0.05, CAV["y1"] - CAV["y0"] - 0.1 - 0.0, CAV["z1"] - CAV["z0"] - 0.05),
          ((CAV["x0"] + CAV["x1"]) / 2, (CAV["y0"] + CAV["y1"]) / 2 + 0.0, (CAV["z0"] + CAV["z1"]) / 2), bev=0)
vol.name = "wallvol"
vm = bpy.data.materials.new("haze")
vm.use_nodes = True
nt = vm.node_tree
nt.nodes.clear()
vs = nt.nodes.new("ShaderNodeVolumeScatter")
vs.inputs["Density"].default_value = 0.07
vs.inputs["Anisotropy"].default_value = 0.4
vs.inputs["Color"].default_value = (1.0, 0.85, 0.65, 1)
vo = nt.nodes.new("ShaderNodeOutputMaterial")
nt.links.new(vs.outputs["Volume"], vo.inputs["Volume"])
vol.data.materials.append(vm)
vol.display_type = "BOUNDS"
vol.parent = pivot
vol.visible_shadow = False

# ---------- lights (world space; pivot rotates objects only)
warm = kelvin(2600)
cool = kelvin(7500)
# interior key: hidden above front opening
lk = area_light("in_key", (0.5, -1.2, 3.62), (0, -1.0, 1.2), 2.2, 55, warm, size_y=2.2)
lk.parent = pivot
lk2 = area_light("in_back", (0, 0.6, 3.62), (0, -1.2, 1.2), 3.0, 40, warm, size_y=1.5)
lk2.parent = pivot
for nm, p in (("lA", (-2.3, 0.9, 2.8)), ("lB", (2.3, 0.9, 2.8)), ("lC", (0, 0.9, 3.0))):
    pl = point_light(nm, p, 30, warm, 0.07)
    pl.parent = pivot
for nm, p in (("lD", (-1.75, -2.65, 2.5)), ("lE", (1.75, -2.65, 2.5))):
    pl = point_light(nm, p, 25, warm, 0.07)
    pl.parent = pivot

# exterior: cool key left-above, warm kicker, cool rim
key = area_light("key", (-9, -10, 12), (0, 0, 2.2), 6, 3200, kelvin(5300), size_y=6)
rim = area_light("rim", (9, 8, 6), (0, 0, 2.5), 6, 2200, cool, size_y=3)
fill = area_light("fill", (10, -12, 3), (0, 0, 2), 8, 500, kelvin(6500), size_y=6)

# ---------- camera
cam = camera((0, -78, 24), (0.9, 0, 2.7), 135, shift=(-0.075, -0.05))

if "--noclip" not in args:
    bpy.context.view_layer.update()
    print("CLIP", clipcheck())

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "w1_cutaway.blend"))
s.render.filepath = out
t = time.time()
bpy.ops.render.render(write_still=True)
print("RENDER_TIME", time.time() - t)
if "--qa" in args:
    qa_cams((0, 0, 2.5), 14, 45, os.path.join(HERE, "qa", "w1"))
