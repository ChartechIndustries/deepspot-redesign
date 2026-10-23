import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

args = sys.argv[sys.argv.index("--") + 1:]
out = args[0]
PREV = len(args) > 1 and args[1] == "prev"
clear()
s = setup_render(960 if PREV else 1920, 600 if PREV else 1200, 48 if PREV else 220, transparent=True)
world(NAVY, 0.1)

m_tuff = tex_mat("tuff", "old_sandstone_02", 1.6, tint=(1.0, 0.86, 0.68), tint_mix=0.6, bump=0.9)
m_step = tex_mat("step", "seaworn_stone_tiles", 1.0, tint=(1.0, 0.85, 0.65), tint_mix=0.5, bump=0.8, rough_mul=0.9)
m_soil = tex_mat("soil", "excavated_soil_wall", 1.5, tint=(0.8, 0.5, 0.35), tint_mix=0.5, bump=0.7)
m_grass = tex_mat("grass", "leafy_grass", 2.4, tint=(0.25, 1.0, 0.3), tint_mix=0.85, sat=1.7, bump=0.6)
m_rock = tex_mat("rock", "rock_wall_08", 1.8, tint=(0.7, 0.8, 1.0), tint_mix=0.5, val=0.9, bump=0.9)
m_bg = solid("bg", (*NAVY, 1), rough=1.0)
m_glow = solid("glow", (1, 0.6, 0.25), emission=kelvin(2400), em_strength=1.1)
m_pine = solid("pine", srgb("#0f8a4a"), rough=0.7)
m_trunk = solid("trunk", srgb("#6b4228"), rough=0.8)
m_rockc = solid("rockc", srgb("#8b93a0"), rough=0.7)

SW, SD = 7.2, 7.4          # slab size
layers = [("strata_rock", -3.6, -3.25, m_rock), ("strata_tuff", -3.25, -0.6, m_tuff),
          ("strata_soil", -0.6, -0.12, m_soil), ("strata_grass", -0.12, 0.0, m_grass)]
# trench: x -0.85..0.85, y from -3.0 (lawn level start) to 1.6 (end wall), floor z -3.5
TX, TY0, TY1, TZ = 1.1, -2.9, 1.9, -3.1
trench = box("cutter1", (2 * TX, TY1 - TY0, 3.5), (0, (TY0 + TY1) / 2, TZ + 1.75), bev=0)
# doorway through end wall into a tunnel
TL = 1.6
door = box("cutter2", (1.5, TL + 0.05, 2.17), (0, TY1 - 0.05 + (TL + 0.05) / 2, (-2.72 - 0.55) / 2), bev=0)
for n, z0, z1, mat in layers:
    o = box(n, (SW, SD, z1 - z0), (0, 0.3, (z0 + z1) / 2), mat, bev=0.05)
    if z1 > TZ:
        apply_all(o)
        boolean_diff(o, trench)
        boolean_diff(o, door)
        bevel(o, 0.03, 2, angle=40, apply=True)
        smooth(o)
bpy.data.objects.remove(trench); bpy.data.objects.remove(door)

# stairs: 16 treads, rise 0.19, run 0.26 ; start at y=TY0, flush with lawn z=0
N, RISE, RUN = 16, 0.17, 0.30
for i in range(N):
    top = -i * RISE - 0.0
    h = top - TZ
    st = box(f"step_{i:02d}", (2 * TX - 0.01, RUN - 0.002, h), (0, TY0 + RUN * (i + 0.5), TZ + h / 2), m_step, bev=0.02)
# landing from last step to door: floor slab at z=TZ ... last tread top = -15*0.19 = -2.85; landing top TZ+? make landing top -3.05
land_top = -N * RISE
yl0 = TY0 + RUN * N
pass
# tunnel floor continuing through door (z=land_top) and back wall glow
tfloor = box("tunnelfloor", (1.5, TL - 0.06, land_top - TZ), (0, TY1 + (TL - 0.06) / 2, TZ + (land_top - TZ) / 2), m_step, bev=0.015)
gl = box("glow_panel", (1.4, 0.05, 2.1), (0, TY1 + TL - 0.03, land_top + 1.05), m_glow, bev=0)
# lintel frame around doorway (stone blocks), sits in front of end wall
fz = land_top
jam_l = box("jamb_l", (0.35, 0.04, 2.0), (-0.925, TY1 - 0.024, -1.55), m_tuff, bev=0.03)
jam_r = box("jamb_r", (0.35, 0.04, 2.0), (0.925, TY1 - 0.024, -1.55), m_tuff, bev=0.03)
lintel = box("lintel", (2.2 - 0.02, 0.04, 0.5), (0, TY1 - 0.02, -0.3), m_tuff, bev=0.03)
for o in (jam_l, jam_r, lintel):
    o["assembly"] = "doorframe"

# lawn props
for i, (x, y, sc) in enumerate(((-2.7, -2.0, 1.2), (2.7, 1.9, 1.5), (-2.3, 2.7, 1.0))):
    toy_tree(i, x, y, sc, 0.0, m_pine, m_trunk)
toy_rock(0, 1.7, -2.6, 0.26, 0.6, 0.0, m_rockc)
toy_rock(1, -1.9, -0.4, 0.18, 1.5, 0.0, m_rockc)
toy_rock(2, 1.9, 2.9, 0.2, 2.2, 0.0, m_rockc)

bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -3.6 - 0.001))
gp = bpy.context.active_object; gp.name = "ground_bg"; gp.data.materials.append(m_bg); gp.is_shadow_catcher = True

# haze rising out of the trench
vol = box("wallvol", (2 * TX - 0.02, TY1 - TY0 - 0.02, 3.9), (0, (TY0 + TY1) / 2, TZ + 1.95), bev=0)
vm = bpy.data.materials.new("haze"); vm.use_nodes = True
nt = vm.node_tree; nt.nodes.clear()
vs = nt.nodes.new("ShaderNodeVolumeScatter"); vs.inputs["Density"].default_value = 0.012
vs.inputs["Anisotropy"].default_value = 0.5; vs.inputs["Color"].default_value = (1.0, 0.8, 0.55, 1)
vo = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(vs.outputs["Volume"], vo.inputs["Volume"])
vol.data.materials.append(vm); vol.display_type = "BOUNDS"; vol.visible_shadow = False

warm = kelvin(2400)
# the glow: area at doorway lighting up the stair (grazing) + point deeper
area_light("door_key", (0, TY1 - 0.5, fz + 1.2), (0, TY0, 0.0), 1.0, 160, warm, size_y=1.8)
point_light("tunnel", (0, TY1 + 1.0, fz + 1.0), 220, warm, 0.3)
point_light("spill", (0, (TY0 + TY1) / 2 + 0.8, -1.0), 60, warm, 0.5)
# moonlight on lawn: cool, dim, from left-back
area_light("moon", (-12, 10, 14), (0, 0, -1), 8, 720, kelvin(8500), size_y=8)
area_light("rim", (12, -6, 8), (0, 0, -2), 6, 1500, kelvin(7000), size_y=5)

pivot = bpy.data.objects.new("pivot", None)
bpy.context.collection.objects.link(pivot)
for o in list(bpy.context.scene.objects):
    if o.type == "MESH" and o.name != "ground_bg" and o.parent is None:
        o.parent = pivot
pivot.rotation_euler = (0, 0, math.radians(-18))
camera((0, -54, 54), (0.3, 0.3, -1.1), 175, shift=(-0.07, -0.03))
bpy.context.view_layer.update()
if "--noclip" not in args:
    print("CLIP", clipcheck())
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "w2_stair.blend"))
s.render.filepath = out
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER_TIME", time.time() - t)
if "--qa" in args:
    qa_cams((0, 0, -1.5), 12, 45, os.path.join(HERE, "qa", "w2"))
