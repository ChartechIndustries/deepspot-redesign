import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector, Matrix
from lib import *

a = args()
out = a[0]
preview = len(a) > 1 and a[1] == "preview"
reset()
setup_render(samples=160)

# ---------- floor (shadow catcher)
floor(mat("floor", "#13213a", 0.9))

# ---------- envelope (cobalt), flat on the floor
EW, EH = 0.162, 0.114
env_mat = mat("env", "#2442dc", rough=0.55, coat=0.1)
flap_mat = mat("flap", "#3556f0", rough=0.55, coat=0.1)
seal_mat = mat("seal", "#07d653", rough=0.25, coat=0.6)
asterisk_mat = mat("ast", "#f2f1e8", rough=0.35)
add_bump(env_mat, 700.0, 0.1, 6.0)
add_bump(flap_mat, 700.0, 0.1, 6.0)
add_bump(seal_mat, 40.0, 0.08, 3.0)
EZ = 0.0016
FZ = 0.0005
env_loc = (0.115, 0.06, 0.0)
env_rot = math.radians(-6)
env = rbox("envelope", (EW, EH, EZ), (0, 0, EZ / 2), material=env_mat, bev=0.0004, seg=2)
# flap prism (triangle), pointing down (-y) from the top edge, flush on the body top
fl = 0.066
bm = bmesh.new()
pts = [(-EW / 2, EH / 2), (EW / 2, EH / 2), (0.0, EH / 2 - fl)]
vs = [bm.verts.new((x, y, EZ)) for x, y in pts]
f = bm.faces.new(vs)
r = bmesh.ops.extrude_face_region(bm, geom=[f])
vv = [v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)]
bmesh.ops.translate(bm, verts=vv, vec=(0, 0, FZ))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
flap = from_bm("flap", bm, flap_mat)
bevel(flap, 0.00018, 2)
flap["assembly"] = "env"
# seal at flap tip
sz = 0.0035
seal = cyl("seal", 0.0125, sz, (0, EH / 2 - fl + 0.004, EZ + FZ + sz / 2), material=seal_mat, bev=0.0012, seg=3, assembly="env")
for k in range(3):
    bar = rbox("ast%d" % k, (0.014, 0.0026, 0.0014), (0, EH / 2 - fl + 0.004, EZ + FZ + sz + 0.0006), (0, 0, math.radians(k * 60)), asterisk_mat, bev=0.0005, seg=2, assembly="env")
# parent envelope parts
root = bpy.data.objects.new("env_root", None)
link(root)
root.location = (env_loc[0], env_loc[1], 0)
root.rotation_euler = (0, 0, env_rot)
for o in [env, flap, seal] + [bpy.data.objects["ast%d" % k] for k in range(3)]:
    o.parent = root
    o.matrix_parent_inverse = Matrix.Identity(4)

# ---------- postcards fan
CW, CH, CT = 0.148, 0.105, 0.0011
fronts = ["pc_cavern", "pc_sunset", "pc_skyline", "pc_tunnel", "pc_cavern", "pc_back"]
angles = [-50, -37, -24, -11, 3, 19]
pivot_local = Vector((-0.052, -0.034))
pivot_world = Vector((-0.02, -0.045))
z = EZ + FZ + 0.0001
for i, name in enumerate(fronts):
    m = image_mat(name, os.path.join(ASSETS, name + ".png"), (CW, CH), rough=0.5)
    th = math.radians(angles[i])
    R = Matrix.Rotation(th, 2)
    c = pivot_world + R @ (-pivot_local)
    rbox("card%d" % i, (CW, CH, CT), (c.x, c.y, z + CT / 2), (0, 0, th), m, bev=0.00025, seg=2)
    z += CT + 0.00005

# ---------- camera + lights
target = Vector((0.03, 0.01, 0.0))
el = math.radians(56)
d, SX, SY = params("n1", 1.0, -0.05, -0.05)
cam = Vector((0.0, -d * math.cos(el), d * math.sin(el))) + target
camera(cam, target, 50, shift=(SX, SY))
std_lights((0, 0, 0), 1.0, key=55, fill=16, rim=40)

res = finish(out, os.path.join(HERE, "n1.blend"), preview=preview)
print("RESULT", res)
