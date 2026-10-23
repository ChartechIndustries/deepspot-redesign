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

# ---------------- materials
paper = mat("paper", "#f1eee3", rough=0.8)
add_bump(paper, 900.0, 0.15, 6.0)
keel = mat("keel", "#07d653", rough=0.7)
brass = mat("brass", "#ffd400", rough=0.3, metal=0.9)
base_m = mat("base", "#2c4676", rough=0.45, coat=0.25)
dash_m = mat("dash", "#00c94a", rough=0.4, emit="#07d653", emit_strength=0.35)
pin_m = mat("pin", "#ffd400", rough=0.3, coat=0.5)

globe_m = bpy.data.materials.new("globe")
globe_m.use_nodes = True
nt = globe_m.node_tree
bs = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
bs.inputs["Roughness"].default_value = 0.38
bs.inputs["Coat Weight"].default_value = 0.35
tc = nt.nodes.new("ShaderNodeTexCoord")
mp = nt.nodes.new("ShaderNodeMapping")
mp.inputs["Scale"].default_value = (1, 1, 1)
nz = nt.nodes.new("ShaderNodeTexNoise")
nz.inputs["Scale"].default_value = 9.0
nz.inputs["Detail"].default_value = 5.0
nz.inputs["Roughness"].default_value = 0.55
nz.inputs["Distortion"].default_value = 0.3
ramp = nt.nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.interpolation = "CONSTANT"
e = ramp.color_ramp.elements
e[0].position = 0.0
e[0].color = hexcol("#2a47d6")
e[1].position = 0.5
e[1].color = hexcol("#07d653")
e2 = e.new(0.66)
e2.color = hexcol("#6fe39a")
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
nt.links.new(nz.outputs["Fac"], ramp.inputs["Fac"])
nt.links.new(ramp.outputs["Color"], bs.inputs["Base Color"])
bmp = nt.nodes.new("ShaderNodeBump")
bmp.inputs["Strength"].default_value = 0.25
bmp.inputs["Distance"].default_value = 0.002
nt.links.new(nz.outputs["Fac"], bmp.inputs["Height"])
nt.links.new(bmp.outputs["Normal"], bs.inputs["Normal"])

# ---------------- globe assembly (all parts one built object)
GR = 0.10
RING_R = 0.113
STEM_H = 0.05
BASE_H = 0.016
CZ = BASE_H + STEM_H + 2 * RING_R * 0 + RING_R  # globe centre height: ring bottom sits on stem top
base = cyl("base", 0.075, BASE_H, (0, 0, BASE_H / 2), material=base_m, bev=0.004, seg=3, assembly="globe")
stem = cyl("stem", 0.009, STEM_H, (0, 0, BASE_H + STEM_H / 2), material=brass, bev=0.0015, seg=2, verts=32, assembly="globe")


def torus(name, R, r, material, loc, axis_rot=(math.pi / 2, 0, 0), nR=96, nr=16):
    bm = bmesh.new()
    verts = []
    for i in range(nR):
        th = 2 * math.pi * i / nR
        row = []
        for j in range(nr):
            ph = 2 * math.pi * j / nr
            x = (R + r * math.cos(ph)) * math.cos(th)
            y = (R + r * math.cos(ph)) * math.sin(th)
            z = r * math.sin(ph)
            row.append(bm.verts.new((x, y, z)))
        verts.append(row)
    for i in range(nR):
        for j in range(nr):
            bm.faces.new((verts[i][j], verts[(i + 1) % nR][j], verts[(i + 1) % nR][(j + 1) % nr], verts[i][(j + 1) % nr]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = from_bm(name, bm, material, loc, axis_rot)
    for f in o.data.polygons:
        f.use_smooth = True
    return o


ring = torus("ring", RING_R, 0.0035, brass, (0, 0, CZ))
ring["assembly"] = "globe"
TILT = math.radians(23)
globe = sphere("globe", GR, (0, 0, CZ), globe_m, assembly="globe")
globe.rotation_euler = (0, TILT, math.radians(-40))
# axis rod in the ring plane (XZ), tilted 23 deg from vertical
rod = cyl("rod", 0.0022, 2 * RING_R, (0, 0, CZ), (0, TILT, 0), material=brass, bev=0, verts=24, assembly="globe")
globe["assembly"] = "globe"
# stem top touches ring bottom: ring bottom z = CZ - RING_R - 0.0035
stem_top = BASE_H + STEM_H
ring.location.z = stem_top + RING_R + 0.0035 - 0.0001  # ring rests on the stem (tiny overlap inside one assembly)
globe.location.z = ring.location.z
rod.location.z = ring.location.z
CZ = ring.location.z

# map pin on the globe surface (front, right of centre)
n = Vector((0.74, -0.55, -0.38)).normalized()
PK = 1.7
tip = Vector((0, 0, CZ)) + n * GR
pin_cone = cyl("pin_cone", 0.0045 * PK, 0.02 * PK, material=pin_m, bev=0.0005, seg=2, verts=32, r2=0.0004, assembly="pin")
pin_head = sphere("pin_head", 0.0085 * PK, material=pin_m, seg=32, rings=16, assembly="pin")
rotq = n.to_track_quat("Z", "Y")
pin_cone.rotation_mode = "QUATERNION"
# bmesh cone: radius1 (wide) at -Z end; flip so the narrow tip faces the globe
pin_cone.rotation_quaternion = rotq @ Euler((math.pi, 0, 0)).to_quaternion()
pin_cone.location = tip + n * (0.01 * PK)
pin_head.location = tip + n * ((0.02 + 0.0085 - 0.0008) * PK)

# ---------------- path (bezier) from the pin head to the plane tail
P0 = tip + n * ((0.02 + 0.0085 * 2) * PK + 0.003)
f = Vector((0.72, -0.30, 0.50)).normalized()
P1 = P0 + Vector((0.02, -0.02, 0.10))
P3 = Vector((0.20, -0.03, CZ + 0.115))
P2 = P3 - f * 0.11


def bez(t):
    u = 1 - t
    return u ** 3 * P0 + 3 * u * u * t * P1 + 3 * u * t * t * P2 + t ** 3 * P3


def dbez(t):
    u = 1 - t
    return 3 * u * u * (P1 - P0) + 6 * u * t * (P2 - P1) + 3 * t * t * (P3 - P2)


N = 400
pts = [bez(i / N) for i in range(N + 1)]
cum = [0.0]
for i in range(1, N + 1):
    cum.append(cum[-1] + (pts[i] - pts[i - 1]).length)
TOTAL = cum[-1]
DASH, GAP = 0.016, 0.014
s = 0.0
k = 0
PLANE_BACK = -0.008  # keep dashes this far from the plane tail
dash_mats = dash_m
while s + DASH < TOTAL - PLANE_BACK:
    def at(sv):
        i = next(i for i in range(N + 1) if cum[i] >= sv)
        return i / N
    t0, t1 = at(s), at(s + DASH)
    p0, p1 = bez(t0), bez(t1)
    mid = (p0 + p1) / 2
    dvec = (p1 - p0)
    dl = dvec.length
    o = cyl("dash%d" % k, 0.0032, dl + 0.0064, material=dash_m, bev=0.0028, seg=3, verts=20)
    o.rotation_mode = "QUATERNION"
    o.rotation_quaternion = dvec.normalized().to_track_quat("Z", "Y")
    o.location = mid
    s += DASH + GAP
    k += 1

# ---------------- paper plane
L, S = 0.16, 0.063
bm = bmesh.new()
Nn = bm.verts.new((0, L / 2, 0.0))
Tc = bm.verts.new((0, -L / 2, -0.024))
Kb = bm.verts.new((0, -L / 2, -0.062))
def wing(sg):
    wi = bm.verts.new((sg * S * 0.5, -L / 2, 0.010))
    wo = bm.verts.new((sg * S, -L / 2, 0.040))
    f_in = bm.faces.new((Nn, wi, Tc) if sg < 0 else (Nn, Tc, wi))
    f_out = bm.faces.new((Nn, wo, wi) if sg < 0 else (Nn, wi, wo))
    f_in.material_index = 0
    f_out.material_index = 0
wing(-1)
wing(1)
fk = bm.faces.new((Nn, Kb, Tc))
fk.material_index = 1
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
plane = from_bm("plane", bm, paper)
plane.data.materials.append(keel)
sol = plane.modifiers.new("sol", "SOLIDIFY")
sol.thickness = 0.0012
sol.offset = 0
apply_mods(plane)
bevel(plane, 0.0003, 2, 50)
plane["assembly"] = "plane"
# orientation: heading up-right and away, banked so the top faces show
f = Vector((0.72, -0.30, 0.50)).normalized()
up = Vector((0, 0, 1))
right = f.cross(up).normalized()
up2 = right.cross(f).normalized()
M = Matrix(((right.x, f.x, up2.x), (right.y, f.y, up2.y), (right.z, f.z, up2.z))).to_4x4()
plane.matrix_world = Matrix.Translation(P3 + f * (L / 2 + 0.004) + up2 * 0.024) @ M @ Matrix.Rotation(math.radians(-10), 4, "Y")

# ---------------- camera + lights
target = Vector((0.115, 0.0, CZ + 0.02))
el = math.radians(12)
d, SX, SY = params("n3", 2.3, -0.05, -0.05)
cam = target + Vector((0, -d * math.cos(el), d * math.sin(el)))
camera(cam, target, 60, shift=(SX, SY))
std_lights((0.1, 0, CZ), 1.0, key=70, fill=20, rim=60)

res = finish(out, os.path.join(HERE, "n3.blend"), preview=preview)
print("RESULT", res)
