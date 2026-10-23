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
m_step = tex_mat("step", "seaworn_stone_tiles", 1.0, tint=(1.0, 0.88, 0.7), tint_mix=0.45, val=1.55, bump=0.8, rough_mul=0.9)
m_soil = tex_mat("soil", "excavated_soil_wall", 1.5, tint=(0.8, 0.5, 0.35), tint_mix=0.5, bump=0.7)
m_grass = tex_mat("grass", "leafy_grass", 2.4, tint=(0.25, 1.0, 0.3), tint_mix=0.85, sat=1.7, bump=0.6)
m_rock = tex_mat("rock", "rock_wall_08", 1.8, tint=(0.7, 0.8, 1.0), tint_mix=0.5, val=0.9, bump=0.9)
m_bg = solid("bg", (*NAVY, 1), rough=1.0)
m_glow = solid("glow", (1, 0.6, 0.25), emission=kelvin(2400), em_strength=1.1)
m_pine = solid("pine", srgb("#0f8a4a"), rough=0.7)
m_trunk = solid("trunk", srgb("#6b4228"), rough=0.8)
m_rockc = solid("rockc", srgb("#8b93a0"), rough=0.7)

SW, SD = 7.2, 7.4          # slab size
BTOP, BBOT = -0.12, -4.2
m_strata = strata_mat("strata", BTOP, dscale=0.8)
m_hall = tuff_pick_mat("hall_tuff", base=(0.90, 0.74, 0.52), dark=(0.66, 0.50, 0.32), bump=2.0, bands_z=9.0, marks_z=30.0)
# trench: x -1.1..1.1, y from -2.9 (lawn level start) to 1.9 (end wall), floor z -3.1
TX, TY0, TY1, TZ = 1.1, -2.9, 1.9, -3.1
TL = 2.0 - 0.4
trench = box("cutter1", (2 * TX, TY1 - TY0, 3.5), (0, (TY0 + TY1) / 2, TZ + 1.75), bev=0)
door = box("cutter2", (1.5, TL + 0.05, 2.17), (0, TY1 - 0.05 + (TL + 0.05) / 2, (-2.72 - 0.55) / 2), bev=0)
for n in (trench, door):
    n.select_set(True)
bpy.context.view_layer.objects.active = trench
bpy.ops.object.transform_apply(location=True)
bpy.context.view_layer.objects.active = door
bpy.ops.object.transform_apply(location=True)
blk = box("strata_block", (SW, SD, BTOP - BBOT), (0, 0.3, (BTOP + BBOT) / 2), m_strata, bev=0.05)
blk.data.materials.append(m_hall)
grass_s = box("strata_grass", (SW, SD, 0.12), (0, 0.3, -0.06), m_grass, bev=0.03)
grass_s.data.materials.append(m_hall)
for o in (blk, grass_s):
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.transform_apply(location=True)
    apply_all(o)
    boolean_diff(o, trench)
    if o is blk:
        boolean_diff(o, door)
    boxes = [(-TX, TX, TY0, TY1, TZ, 0.5)] + ([(-0.75, 0.75, TY1, TY1 + TL, -2.72, -0.55)] if o is blk else [])
    print("INTERIOR_FACES", o.name, assign_interior(o, boxes, zmin_exclude_top=-0.2 if o is blk else -0.05))
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
jam_l = box("jamb_l", (0.35, 0.04, 2.0), (-0.925, TY1 - 0.024, -1.55), m_hall, bev=0.03)
jam_r = box("jamb_r", (0.35, 0.04, 2.0), (0.925, TY1 - 0.024, -1.55), m_hall, bev=0.03)
lintel = box("lintel", (2.2 - 0.02, 0.04, 0.5), (0, TY1 - 0.02, -0.3), m_hall, bev=0.03)
for o in (jam_l, jam_r, lintel):
    o["assembly"] = "doorframe"

# lawn props
for i, (x, y, sc) in enumerate(((-2.7, -2.0, 1.2), (2.7, 1.9, 1.5), (-2.3, 2.7, 1.0))):
    toy_tree(i, x, y, sc, 0.0, m_pine, m_trunk)
toy_rock(0, 1.7, -2.6, 0.26, 0.6, 0.0, m_rockc)
toy_rock(1, -1.9, -0.4, 0.18, 1.5, 0.0, m_rockc)
toy_rock(2, 1.9, 2.9, 0.2, 2.2, 0.0, m_rockc)

bpy.ops.mesh.primitive_plane_add(size=80, location=(0, 0, -4.2 - 0.001))
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
point_light("stairA", (0, TY0 + 1.5, -0.6), 14, warm, 0.2)
point_light("stairB", (0, TY0 + 3.2, -1.6), 18, warm, 0.2)
# moonlight on lawn: cool, dim, from left-back
area_light("moon", (-12, 10, 14), (0, 0, -1), 8, 720, kelvin(8500), size_y=8)
area_light("sidefill", (-12, -14, 4), (0, 0, -2), 8, 1300, kelvin(6000), size_y=6)
area_light("rim", (12, -6, 8), (0, 0, -2), 6, 1500, kelvin(7000), size_y=5)

pivot = bpy.data.objects.new("pivot", None)
bpy.context.collection.objects.link(pivot)
for o in list(bpy.context.scene.objects):
    if o.type == "MESH" and o.name != "ground_bg" and o.parent is None:
        o.parent = pivot
pivot.rotation_euler = (0, 0, math.radians(-18))
camera((0, -54, 54), (0.3, 0.3, -1.6), 160, shift=(-0.07, -0.02))
bpy.context.view_layer.update()
if "--noclip" not in args:
    print("CLIP", clipcheck())
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "w2_stair.blend"))
s.render.filepath = out
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER_TIME", time.time() - t)
if "--qa" in args:
    qa_cams((0, 0, -1.5), 12, 45, os.path.join(HERE, "qa", "w2"))
