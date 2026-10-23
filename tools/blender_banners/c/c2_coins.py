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
setup_world(0.22, rot_z=math.radians(150))
floor = add_floor()


def floor_glossy_tint(floor, rgb):
    """Floor shows warm tone to glossy rays (gold reflections) and brand green to diffuse bounce."""
    m = floor.data.materials[0]
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    d2 = nt.nodes.new("ShaderNodeBsdfDiffuse")
    d2.inputs["Color"].default_value = rgb
    lp = nt.nodes.new("ShaderNodeLightPath")
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lp.outputs["Is Glossy Ray"], mx.inputs[0])
    nt.links.new(bsdf.outputs[0], mx.inputs[1])
    nt.links.new(d2.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs["Surface"])


floor_glossy_tint(floor, (0.035, 0.02, 0.003, 1))

# ------------------------------------------------------------ coin (24 mm, 2.8 mm thick incl. rims)
R = 0.012       # radius
T = 0.0018      # body thickness
RIM_H = 0.0005  # rim relief per side
RIM_IN, RIM_OUT = 0.0103, 0.0113
FIELD_R = RIM_IN
REED_N = 96
gold_m = pbr("gold", (1.0, 0.74, 0.07, 1), metallic=1.0, rough=0.2)
field_m = gold_m


def coin_mesh():
    b = 0.00035
    prof = [(0.0, -T / 2)]
    prof += [(FIELD_R, -T / 2), (R - b, -T / 2)]
    for i in range(1, 4):
        a = math.radians(-90 + 90 * i / 3)
        prof.append((R - b + b * math.cos(a), -T / 2 + b + b * math.sin(a)))
    for i in range(1, 4):
        a = math.radians(90 * i / 3)
        prof.append((R - b + b * math.cos(a), T / 2 - b + b * math.sin(a)))
    prof += [(R - b, T / 2), (FIELD_R, T / 2), (0.0, T / 2)]
    # remove duplicate points
    clean = []
    for p in prof:
        if not clean or abs(p[0] - clean[-1][0]) + abs(p[1] - clean[-1][1]) > 1e-9:
            clean.append(p)
    bm = bm_lathe(clean, REED_N * 2, 1e-8)
    # reeds: alternate outer-wall vertices
    step = 2 * math.pi / REED_N
    for v in bm.verts:
        r = math.hypot(v.co.x, v.co.y)
        if r > R - b * 0.2:
            ang = math.atan2(v.co.y, v.co.x) % (2 * math.pi)
            k = round(ang / (step / 2))
            if k % 2:
                v.co.x *= 0.982
                v.co.y *= 0.982
    for f in bm.faces:
        c = f.calc_center_median()
        rr = max(math.hypot(v.co.x, v.co.y) for v in f.verts)
        if rr <= FIELD_R + 1e-7 and abs(abs(c.z) - T / 2) < 1e-7:
            f.material_index = 1
    body = obj_from_bm("coin_body", bm, [gold_m, field_m], bevel=None, smooth=True, split=35)
    parts = [body]
    # rim rings (both faces)
    for sgn in (1, -1):
        ring = bm_lathe(rounded_rect_profile(RIM_IN, RIM_OUT, T / 2 - 0.00006, T / 2 + RIM_H, 0.00018, 2), 144, 1e-8)
        if sgn < 0:
            for v in ring.verts:
                v.co.z *= -1
            bmesh.ops.reverse_faces(ring, faces=ring.faces)
        parts.append(obj_from_bm(f"coin_rim{sgn}", ring, [gold_m], smooth=True, split=35))
    # asterisk bars, both faces
    L, Wd, H = 0.0092, 0.0016, 0.0009
    for sgn in (1, -1):
        for k in range(3):
            bar = bm_box(L, Wd, H)
            ob = obj_from_bm(f"coin_bar{sgn}{k}", bar, [gold_m], loc=(0, 0, sgn * (T / 2 + H / 2 - 0.0004)),
                             rot=(0, 0, math.radians(60 * k + 90)), bevel=(0.00045, 2), smooth=True, split=35)
            parts.append(ob)
    bpy.context.view_layer.update()
    cm = bmesh.new()
    for p in parts:
        me = bake(p)
        me.transform(p.matrix_world)
        cm.from_mesh(me)
        bpy.data.meshes.remove(me)
    for p in parts:
        bpy.data.objects.remove(p)
    me = bpy.data.meshes.new("coin_mesh")
    cm.to_mesh(me)
    cm.free()
    me.materials.append(gold_m)
    me.materials.append(field_m)
    try:
        me.shade_smooth()
    except Exception:
        pass
    return me


coin_me = coin_mesh()
print("COIN verts", len(coin_me.vertices))


def coin(name, loc, rot_deg=(0, 0, 0)):
    ob = bpy.data.objects.new(name, coin_me)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    return ob


PITCH = T + 2 * RIM_H + 0.00002
# stack of 3, small natural offsets
stack = []
for i, (dx, dy, rz) in enumerate([(0, 0, 0), (0.0006, -0.0004, 23), (-0.0004, 0.0005, 41)]):
    stack.append(coin(f"stack{i}", (dx, dy, (T / 2 + RIM_H) + i * PITCH), (0, 0, rz)))

falling = [
    ("fall1", (0.0035, -0.004, 0.0185), (24, 9, 30)),
    ("fall2", (-0.0185, 0.004, 0.0235), (58, -12, 70)),
    ("fall3", (0.0195, -0.011, 0.030), (72, 8, 25)),
    ("fall4", (-0.0065, 0.012, 0.0365), (38, 18, 110)),
    ("fall5", (0.034, 0.002, 0.011), (15, -30, 160)),
]
for n, loc, rot in falling:
    coin(n, loc, rot)

# coin lying flat on the floor, in front of the stack (right side)
flat_loc = (0.0245, -0.0235, T / 2 + RIM_H)
coin("flat1", flat_loc, (0, 0, 17))

# ------------------------------------------------------------ camera + lights
CX, CY, CZ = 0.0, 0.0, 0.0
az = math.radians(14)
dist = 0.43
cam_loc = (dist * math.sin(az), -dist * math.cos(az), 0.011)
TARGET = (0.004, 0.0, 0.021)
SHX, SHY = 0.0, 0.0
if len(A) > 3 and A[3].startswith("shift="):
    SHX, SHY = map(float, A[3][6:].split(","))
SHX, SHY = (0.165, 0.125)
make_camera(cam_loc, TARGET, 85, shift=(SHX, SHY))
area_light("key", (-0.20, -0.28, 0.22), (0, 0, 0.02), 0.20, 6.5, 5300)
area_light("fill", (0.30, -0.22, 0.05), (0, 0, 0.02), 0.25, 3.5, 6000)
area_light("rim", (0.10, 0.30, 0.18), (0, 0, 0.02), 0.20, 12, 6500)

bpy.context.view_layer.update()
if CLIP:
    bad = clipcheck(0.00025)
    print("CLIP_PAIRS", len(bad), bad[:20])
if QA:
    qa_views("c2", (0.004, 0, 0.025), 0.30, 70, os.path.join(HERE, "qa"))
    sc.render.film_transparent = True
    sc.render.resolution_percentage = PCT
    sc.cycles.samples = SAMPLES
    sc.camera = bpy.data.objects["cam"]
render_to(OUT)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "c2_coins.blend"))
