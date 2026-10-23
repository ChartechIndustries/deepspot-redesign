import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

args = sys.argv[sys.argv.index("--") + 1:]
out = args[0]
mode = args[1] if len(args) > 1 else "final"
PREV = mode == "prev"

clear()
s = setup_render(960 if PREV else 1920, 600 if PREV else 1200, 48 if PREV else 220, transparent=True)
world(NAVY, 0.15)

BW, BD, BH = 8.0, 6.0, 5.88   # block (earth) ; grass slab 0.12 on top -> lawn at z=6.0
LAWN = BH + 0.12
m_strata = strata_mat("strata", BH)
m_hall = tuff_pick_mat("hall_tuff", base=(0.90, 0.74, 0.52), dark=(0.66, 0.50, 0.32), bump=2.0, bands_z=9.0, marks_z=30.0)
m_grass = tex_mat("grass", "leafy_grass", 2.4, tint=(0.25, 1.0, 0.3), tint_mix=0.85, sat=1.7, bump=0.6)
m_bg = solid("bg", (*NAVY, 1), rough=1.0)
m_lamp = solid("lamp", (1, 0.6, 0.25), emission=kelvin(2200), em_strength=8)
m_iron = solid("iron", (0.05, 0.05, 0.06), rough=0.45, metal=0.8)

CAV = dict(x0=-3.1, x1=3.1, y0=-3.3, y1=1.2, z0=1.0, z1=3.75)
TUN = dict(x0=-4.5, x1=-2.7, yc=-1.2, zc=1.6, r=0.6)

# ---------- earth block
blk = box("strata_block", (BW, BD, BH), (0, 0, BH / 2), m_strata, bev=0.055)
blk.data.materials.append(m_hall)
bpy.context.view_layer.objects.active = blk
blk.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
apply_all(blk)  # bake outer bevel
cutter = box("cutter", (CAV["x1"] - CAV["x0"], CAV["y1"] - CAV["y0"], CAV["z1"] - CAV["z0"]),
             ((CAV["x0"] + CAV["x1"]) / 2, (CAV["y0"] + CAV["y1"]) / 2, (CAV["z0"] + CAV["z1"]) / 2), bev=0)
bpy.ops.object.transform_apply(location=True)
boolean_diff(blk, cutter)
bpy.data.objects.remove(cutter)
# burrow tunnel on the left side wall (round, axis x)
bpy.ops.mesh.primitive_cylinder_add(radius=TUN["r"], depth=TUN["x1"] - TUN["x0"], vertices=48,
                                    location=((TUN["x0"] + TUN["x1"]) / 2, TUN["yc"], TUN["zc"]), rotation=(0, math.pi / 2, 0))
tcut = bpy.context.active_object
tcut.name = "cutter_tun"
boolean_diff(blk, tcut)
bpy.data.objects.remove(tcut)
n_int = assign_interior(blk, [(CAV["x0"], CAV["x1"], CAV["y0"], CAV["y1"], CAV["z0"], CAV["z1"]),
                              (TUN["x0"], TUN["x1"], TUN["yc"] - TUN["r"], TUN["yc"] + TUN["r"], TUN["zc"] - TUN["r"], TUN["zc"] + TUN["r"])],
                        outer_x=BW / 2, outer_y=-BD / 2)
print("INTERIOR_FACES", n_int)
bevel(blk, 0.03, 2, angle=40, apply=True)
smooth(blk)

grass = box("grass_slab", (BW, BD, 0.12), (0, 0, BH + 0.06), m_grass, bev=0.03)

# ---------- hall furniture
FLOOR = CAV["z0"]
CH = CAV["z1"] - CAV["z0"]
pillars = []
for x in (-1.9, 1.9):
    for y in (-2.0, -0.2):
        pillars.append(box(f"pillar_{x}_{y}", (0.8, 0.8, CH), (x, y, FLOOR + CH / 2), m_hall, bev=0.04))


def lamp(name, loc):
    b = box(name + "_bracket", (0.14, 0.05, 0.22), loc, m_iron, bev=0.01)
    g = box(name + "_glow", (0.09, 0.07, 0.15), (loc[0], loc[1] - 0.055, loc[2]), m_lamp, bev=0.015)
    b["assembly"] = name; g["assembly"] = name


lamp("lampA", (-2.5, CAV["y1"] - 0.025, 2.9))
lamp("lampB", (2.5, CAV["y1"] - 0.025, 2.9))
lamp("lampC", (0.0, CAV["y1"] - 0.025, 3.1))
lamp("lampD", (-1.9, -2.4 - 0.025, 2.6))
lamp("lampE", (1.9, -2.4 - 0.025, 2.6))
bench = box("bench", (4.4, 0.5, 0.4), (0.4, CAV["y1"] - 0.25, FLOOR + 0.2), m_hall, bev=0.03)

# ---------- mole (BLOOD1, hard hat). nose is +x locally
mole_parts = load_mole(("Hard Hat",))
mroot = bpy.data.objects.new("mole_root", None)
bpy.context.collection.objects.link(mroot)
for o in mole_parts:
    o.parent = mroot
    if o.type == "MESH":
        o["assembly"] = "mole"
mn, mx = world_bounds(mole_parts)
MH = 2.24
k = MH / (mx.z - mn.z)
mroot.scale = (k, k, k)
cx, cy = (mn.x + mx.x) / 2, (mn.y + mx.y) / 2
mroot.location = (-0.25 - cx * k, -1.7 - cy * k, FLOOR - mn.z * k)
mroot.rotation_euler = (0, 0, math.radians(-90 - 24 + 22))

# ---------- toy trees + rocks
m_pine = solid("pine", srgb("#0f8a4a"), rough=0.7)
m_trunk = solid("trunk", srgb("#6b4228"), rough=0.8)
m_rockc = solid("rockc", srgb("#8b93a0"), rough=0.7)
for i, (tx, ty, ts) in enumerate(((-2.8, 1.6, 1.3), (-3.2, 0.3, 1.0), (3.0, 1.9, 1.1))):
    toy_tree(i, tx, ty, ts, LAWN, m_pine, m_trunk)
toy_rock(0, 2.2, -0.9, 0.28, 0.5, LAWN, m_rockc)
toy_rock(1, 2.7, -1.3, 0.16, 1.2, LAWN, m_rockc)
toy_rock(2, -0.2, 2.1, 0.22, 2.0, LAWN, m_rockc)

bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -0.001))
gp = bpy.context.active_object; gp.name = "ground_bg"; gp.data.materials.append(m_bg); gp.is_shadow_catcher = True

# haze volume
vol = box("wallvol", (CAV["x1"] - CAV["x0"] - 0.05, CAV["y1"] - CAV["y0"] - 0.1, CH - 0.05),
          ((CAV["x0"] + CAV["x1"]) / 2, (CAV["y0"] + CAV["y1"]) / 2, FLOOR + CH / 2), bev=0)
vm = bpy.data.materials.new("haze"); vm.use_nodes = True
nt = vm.node_tree; nt.nodes.clear()
vs = nt.nodes.new("ShaderNodeVolumeScatter"); vs.inputs["Density"].default_value = 0.06
vs.inputs["Anisotropy"].default_value = 0.4; vs.inputs["Color"].default_value = (1.0, 0.85, 0.65, 1)
vo = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(vs.outputs["Volume"], vo.inputs["Volume"])
vol.data.materials.append(vm); vol.display_type = "BOUNDS"; vol.visible_shadow = False

# ---------- pivot
pivot = bpy.data.objects.new("pivot", None)
bpy.context.collection.objects.link(pivot)
for o in list(bpy.context.scene.objects):
    if (o.type == "MESH" or o.name == "mole_root") and o.name != "ground_bg" and o.parent is None:
        o.parent = pivot
pivot.rotation_euler = (0, 0, math.radians(24))
bpy.context.view_layer.update()
mn3, mx3 = world_bounds(mole_parts)
mroot.location.z += FLOOR - mn3.z

# ---------- lights
warm = kelvin(2600); cool = kelvin(7500)
for l in (area_light("in_key", (0.5, -1.2, CAV["z1"] - 0.08), (0, -1.0, FLOOR), 2.2, 85, warm, size_y=2.2),
          area_light("in_back", (0, 0.6, CAV["z1"] - 0.08), (0, -1.2, FLOOR), 3.0, 40, warm, size_y=1.5),
          point_light("lA", (-2.5, 0.9, 2.9), 30, warm, 0.07), point_light("lB", (2.5, 0.9, 2.9), 30, warm, 0.07),
          point_light("lC", (0, 0.9, 3.1), 30, warm, 0.07), point_light("lD", (-1.9, -2.65, 2.6), 25, warm, 0.07),
          point_light("lE", (1.9, -2.65, 2.6), 25, warm, 0.07),
          point_light("tunnel", (-3.9, -1.3, 1.6), 25, warm, 0.1)):
    l.parent = pivot
area_light("key", (-9, -10, 14), (0, 0, 3.0), 6, 3300, kelvin(5300), size_y=6)
area_light("rim", (9, 8, 8), (0, 0, 3.0), 6, 2200, cool, size_y=3)
area_light("fill", (10, -12, 4), (0, 0, 2.5), 8, 550, kelvin(6500), size_y=6)

camera((0, -71, 22), (0.9, 0, 3.2), 135, shift=(-0.07, -0.04))

if "--noclip" not in args:
    bpy.context.view_layer.update()
    print("CLIP", clipcheck())
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "w1_cutaway.blend"))
s.render.filepath = out
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER_TIME", time.time() - t)
if "--qa" in args:
    qa_cams((0, 0, 3.0), 15, 45, os.path.join(HERE, "qa", "w1"))
