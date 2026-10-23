import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix, Euler
from lib import *

a = args()
out = a[0]
preview = len(a) > 1 and a[1] == "preview"
reset()
setup_render(samples=192)
floor(mat("floor", "#13213a", 0.9))

YAW = math.radians(float(os.environ.get("N2_YAW", "118")))
RZ = Matrix.Rotation(YAW, 4, "Z")


def put(o, loc, rot=(0, 0, 0)):
    o.matrix_world = RZ @ Matrix.Translation(loc) @ Euler(rot).to_matrix().to_4x4()
    return o


def profile(w, hr, n=28):
    """arch profile in (x, z): rectangle up to hr, semicircle on top"""
    r = w / 2
    pts = [(-r, 0), (r, 0), (r, hr)]
    for i in range(1, n):
        th = math.pi * i / n
        pts.append((r * math.cos(th), hr + r * math.sin(th)))
    pts.append((-r, hr))
    return pts


def extrude_profile(name, pts, y0, y1, material):
    bm = bmesh.new()
    vs = [bm.verts.new((x, y0, z)) for x, z in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    vv = [v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=vv, vec=(0, y1 - y0, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return from_bm(name, bm, material)


def boolean_diff(o, cutter):
    m = o.modifiers.new("cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cutter
    m.solver = "EXACT"
    apply_mods(o)
    bpy.data.objects.remove(cutter, do_unlink=True)


# ---- materials
paint = mat("paint", "#2a49e6", rough=0.38, coat=0.3)
add_bump(paint, 60.0, 0.05, 8.0, rough_var=0.12)
green = mat("green", "#07d653", rough=0.3, coat=0.4)
metal = mat("metal", "#d9dde6", rough=0.28, metal=1.0)
puck_m = mat("puck", "#2c4676", rough=0.55, coat=0.2)
add_bump(puck_m, 120.0, 0.08, 8.0)
wood = bpy.data.materials.new("wood")
wood.use_nodes = True
nt = wood.node_tree
b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
b.inputs["Roughness"].default_value = 0.62
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (60, 60, 4)
nz = nt.nodes.new("ShaderNodeTexNoise")
nz.inputs["Scale"].default_value = 3.0
nz.inputs["Detail"].default_value = 6.0
cr = nt.nodes.new("ShaderNodeValToRGB")
cr.color_ramp.elements[0].color = hexcol("#8d5b34")
cr.color_ramp.elements[1].color = hexcol("#c28a56")
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
nt.links.new(nz.outputs["Fac"], cr.inputs["Fac"])
nt.links.new(cr.outputs["Color"], b.inputs["Base Color"])

# ---- dimensions (metres)
BW, BH, BL, T = 0.17, 0.10, 0.36, 0.006   # width, rect height, length, wall
PLANK_T = 0.02
POST_H = 0.17
PUCK_R, PUCK_H = 0.17, 0.035

# ---- puck + post + plank
puck = cyl("puck", PUCK_R, PUCK_H, (0, 0, PUCK_H / 2), material=puck_m, bev=0.006, seg=4)
put(puck, (0, 0, PUCK_H / 2))
post = rbox("post", (0.06, 0.06, POST_H), (0, 0, 0), material=wood, bev=0.003)
put(post, (0, 0.0, PUCK_H + POST_H / 2))
plank = rbox("plank", (0.13, 0.34, PLANK_T), material=wood, bev=0.003)
put(plank, (0, 0.0, PUCK_H + POST_H + PLANK_T / 2))
Z0 = PUCK_H + POST_H + PLANK_T  # box bottom z

# ---- mailbox body (local origin: box bottom centre at front-back middle)
YB0 = -BL / 2
YF = BL / 2
body = extrude_profile("body", profile(BW, BH), YB0, YF, paint)
cav = extrude_profile("cavity", profile(BW - 2 * T, BH, 28), YB0 + T, YF + 0.05, paint)
# lift the cavity floor to z=T
for v in cav.data.vertices:
    if v.co.z < 1e-6:
        v.co.z = T
boolean_diff(body, cav)
bevel(body, 0.0016, 3, 40)
put(body, (0, 0, Z0))

# ---- door open as a shelf (inner face flush with cavity floor)
door = extrude_profile("door", profile(BW, BH), 0.0, T, paint)
bevel(door, 0.0016, 3, 40)
door.matrix_world = RZ @ Matrix.Translation((0, YF, Z0 + T)) @ Euler((-math.pi / 2, 0, 0)).to_matrix().to_4x4()
# hinge pin
hinge = cyl("hinge", 0.0045, BW * 0.9, rot=(0, math.pi / 2, 0), material=metal, bev=0, assembly="door")
door["assembly"] = "door"
hinge.matrix_world = RZ @ Matrix.Translation((0, YF + 0.0, Z0 + T / 2)) @ Euler((0, math.pi / 2, 0)).to_matrix().to_4x4()
hinge["assembly"] = "body"
body["assembly"] = "body"
# hinge touches both door and body: keep inside "body" group; door overlaps? door starts at y=YF, hinge r.0045 straddles

# rivets along the lower seam on both sides
for sx_ in (-1, 1):
    for yy in [-0.14, -0.07, 0.0, 0.07, 0.14]:
        rv = sphere("rivet", 0.0034, (0, 0, 0), metal, seg=24, rings=12, assembly="body")
        put(rv, (sx_ * (BW / 2), yy, Z0 + 0.012))
# ---- letters resting on the floor/shelf, protruding over the shelf
letters = [
    ("let_cream_p", 0.13, 0.18, 0.15, -0.012, 5),
    ("let_blue_p", 0.13, 0.18, 0.11, 0.008, -7),
    ("pc_sunset_p", 0.12, 0.17, 0.13, -0.004, 9),
    ("let_yellow_p", 0.13, 0.18, 0.085, 0.012, -4),
]
zz = T + 0.0002
for i, (img, lw, ll, prot, dx, ang) in enumerate(letters):
    th = 0.0016
    m = image_mat(img, os.path.join(ASSETS, img + ".png"), (lw, ll), rough=0.55)
    o = rbox("letter%d" % i, (lw, ll, th), material=m, bev=0.0004, seg=2)
    put(o, (dx, YF + prot - ll / 2, Z0 + zz + th / 2), (0, 0, math.radians(ang)))
    zz += th + 0.0001

# ---- flag (on the visible -x side)
FZ_PIV = BH * 0.5
piv = cyl("flag_pivot", 0.0125, 0.007, material=metal, rot=(0, math.pi / 2, 0), bev=0.0015, seg=2)
put(piv, (-BW / 2 - 0.0035, -0.03, Z0 + FZ_PIV), (0, math.pi / 2, 0))
piv["assembly"] = "flag"
AW = 0.016
arm = rbox("flag_arm", (0.0035, AW, 0.135), material=green, bev=0.0012, seg=2, assembly="flag")
put(arm, (-BW / 2 - 0.007 - 0.00175, -0.03, Z0 + FZ_PIV + 0.0675 - 0.01))
plate = rbox("flag_plate", (0.0035, 0.075, 0.045), material=green, bev=0.0012, seg=2, assembly="flag")
put(plate, (-BW / 2 - 0.007 - 0.00175, -0.03 - 0.0375 + AW / 2, Z0 + FZ_PIV + 0.135 - 0.01 - 0.0225))
# flag pieces overlap each other intentionally (one built object)

# ---- handle on nothing (door open); small latch knob on body? skip

# ---- camera + lights
target = Vector((0.0, 0.0, 0.2))
el = math.radians(13)
az = math.radians(-8)   # camera azimuth from -Y toward -X
d, SX, SY = params("n2", 2.8, -0.05, -0.05)
cam = target + Vector((d * math.cos(el) * math.sin(az), -d * math.cos(el) * math.cos(az), d * math.sin(el)))
camera(cam, target, 70, shift=(SX, SY))
std_lights((0, 0, 0.2), 1.0, key=70, fill=20, rim=60)

res = finish(out, os.path.join(HERE, "n2.blend"), preview=preview)
print("RESULT", res)
