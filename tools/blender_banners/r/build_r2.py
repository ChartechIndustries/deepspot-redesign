import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from common import *

A = args()
sc = reset()
setup_render(sc, A["spl"], A["scale"], ambient=("#8da0ff", 0.4))
sc.view_settings.exposure = -0.15

rng = random.Random(5)
P1, P2, P3 = [rng.uniform(0, 6.28) for _ in range(3)]
YS = 0.9
RB = 0.42
NS = 140
CAP_T = 0.03
SOIL_T = 0.035


def R(th):
    return RB * (1 + 0.07 * math.sin(2 * th + P1) + 0.05 * math.sin(3 * th + P2) + 0.025 * math.sin(5 * th + P3))


def outline(dr=0.0):
    out = []
    for i in range(NS):
        th = 2 * math.pi * i / NS
        r = R(th) + dr
        out.append((r * math.cos(th), YS * r * math.sin(th)))
    return out


grass = mat("grass", "#06a944", 0.7)
sand = mat("sand", "#e9d9b8", 0.6)
rock_m = mat("rock", "#2a3f69", 0.75)
road_m = mat("road", PAL["navy2"], 0.55, coat=0.1)
white = mat("white", PAL["white"], 0.45, coat=0.2)
yellow = mat("yellow", "#ffb300", 0.45, coat=0.2)
greenb = mat("greenb", PAL["green"], 0.4, coat=0.3, emit=PAL["green"], emit_strength=0.25)
cobaltb = mat("cobaltb", PAL["cobalt"], 0.4, coat=0.3)
navyb = mat("navyb", PAL["navy"], 0.4, coat=0.2)
wood = mat("wood", "#c58a55", 0.6)
pine = mat("pine", "#0a8d44", 0.55)
pine2 = mat("pine2", "#12a853", 0.55)

# ---------------- land ----------------
cap = prism("cap", outline(), 0.0, CAP_T, grass)
finish(cap, 0.004, 3, 35)
soil = prism("soil", outline(-0.012), -SOIL_T, 0.0, sand)
finish(soil, 0.0015, 2, 35)

# rock cone (closed, subsurf)
prof = [(0.0, 1.0), (0.06, 1.0), (0.14, 0.97), (0.24, 0.90), (0.36, 0.80), (0.48, 0.68), (0.60, 0.55), (0.72, 0.42), (0.83, 0.30), (0.92, 0.17)]
DEPTH = 0.46
bm = bmesh.new()
rings = []
nr = 44
jr = random.Random(21)
for j, (t, f) in enumerate(prof):
    z = -SOIL_T - DEPTH * t ** 1.05
    ring = []
    for i in range(nr):
        th = 2 * math.pi * i / nr
        wob = 1 + (0.12 * math.sin(3 * th + 1.7 * j + P1) + 0.08 * math.sin(5 * th + 2.3 * j + P2)) * (t * 1.3) + jr.uniform(-0.05, 0.05) * t
        r = (R(th) - 0.016) * f * wob
        ring.append(bm.verts.new((r * math.cos(th), YS * r * math.sin(th), z - 0.03 * math.sin(4 * th + j) * t + jr.uniform(-0.012, 0.012) * t)))
    rings.append(ring)
tip = bm.verts.new((0.01, 0.0, -SOIL_T - DEPTH - 0.04))
for j in range(len(rings) - 1):
    for i in range(nr):
        i2 = (i + 1) % nr
        bm.faces.new((rings[j][i], rings[j][i2], rings[j + 1][i2], rings[j + 1][i]))
for i in range(nr):
    bm.faces.new((rings[-1][i], rings[-1][(i + 1) % nr], tip))
bm.faces.new(list(reversed(rings[0])))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
rock = from_bm("rock", bm, rock_m)
s = rock.modifiers.new("Sub", "SUBSURF"); s.levels = 1; s.render_levels = 1
for p in rock.data.polygons: p.use_smooth = True
z_gradient(rock_m, -SOIL_T - DEPTH, -SOIL_T, "#101c3d", "#2f4778")
for o in (cap, soil, rock): o["assembly"] = "land"

# ---------------- hill + road ----------------
HC, HR, HH = (0.10, 0.20), 0.20, 0.10


def hill(x, y):
    d = math.hypot(x - HC[0], (y - HC[1]) / YS)
    if d >= HR: return 0.0
    return HH * (1 - (d / HR) ** 2) ** 2


bm = bmesh.new()
nrr, nth = 14, 56
grid = []
for a in range(nrr + 1):
    rr = HR * a / nrr
    row = []
    for b in range(nth):
        th = 2 * math.pi * b / nth
        x, y = HC[0] + rr * math.cos(th), HC[1] + YS * rr * math.sin(th)
        row.append(bm.verts.new((x, y, CAP_T + hill(x, y) - (0.0006 if a == nrr else 0))))
    grid.append(row)
for a in range(nrr):
    for b in range(nth):
        b2 = (b + 1) % nth
        bm.faces.new((grid[a][b], grid[a][b2], grid[a + 1][b2], grid[a + 1][b]))
rimtop = [bm.verts.new((v.co.x, v.co.y, v.co.z)) for v in grid[nrr]]
skirt = [bm.verts.new((v.co.x, v.co.y, CAP_T - 0.002)) for v in grid[nrr]]
for b in range(nth):
    b2 = (b + 1) % nth
    bm.faces.new((rimtop[b], rimtop[b2], skirt[b2], skirt[b]))
bm.faces.new(list(reversed(skirt)))
# invert: hill center ring a=0 collapsed? merge duplicates
bmesh.ops.remove_doubles(bm, verts=[v for r_ in grid[:1] for v in r_], dist=1e-6)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
hillo = from_bm("hill", bm, grass)
for p in hillo.data.polygons: p.use_smooth = True
finish(hillo, 0, 0, smooth=False)

wp = [(-0.18, -0.28), (-0.05, -0.22), (0.14, -0.13), (0.10, 0.00), (-0.07, 0.07), (-0.02, 0.17), (0.08, 0.21), (0.10, 0.24)]
cl, total = catmull([(x, y, 0) for x, y in wp], 260)
ROAD_T = 0.004
left, right, topz = [], [], []
for i, p in enumerate(cl):
    t = i / (len(cl) - 1)
    tan = (cl[min(i + 1, len(cl) - 1)] - cl[max(i - 1, 0)]).normalized()
    nrm = Vector((-tan.y, tan.x, 0))
    w = 0.080 - 0.040 * t
    pl, pr = p + nrm * w / 2, p - nrm * w / 2
    left.append((pl.x, pl.y, CAP_T + hill(pl.x, pl.y) + ROAD_T))
    right.append((pr.x, pr.y, CAP_T + hill(pr.x, pr.y) + ROAD_T))
road = strip("road", left, right, ROAD_T + 0.0004, road_m)
finish(road, 0.0006, 2, 30)

# dashes
nd = 16
for d in range(nd):
    i0 = int(len(cl) * (0.04 + 0.90 * d / nd))
    i1 = i0 + int(len(cl) * 0.025)
    if i1 >= len(cl): break
    l2, r2 = [], []
    for i in range(i0, i1 + 1):
        p = cl[i]
        tan = (cl[min(i + 1, len(cl) - 1)] - cl[max(i - 1, 0)]).normalized()
        nrm = Vector((-tan.y, tan.x, 0))
        hw = 0.0035 - 0.0015 * (i / len(cl))
        for sgn, lst in ((1, l2), (-1, r2)):
            q = p + nrm * hw * sgn
            lst.append((q.x, q.y, CAP_T + hill(q.x, q.y) + ROAD_T + 0.0016))
    dash = strip(f"dash{d}", l2, r2, 0.0016, white)
    dash["assembly"] = "road"
road["assembly"] = "road"

# ---------------- signposts ----------------


def sample(t):
    i = int(t * (len(cl) - 1))
    p = cl[i]
    tan = (cl[min(i + 1, len(cl) - 1)] - cl[max(i - 1, 0)]).normalized()
    return p, tan


def signpost(name, t, side, mat_board, flip=False):
    p, tan = sample(t)
    nrm = Vector((-tan.y, tan.x, 0))
    w = 0.080 - 0.040 * t
    base = p + nrm * side * (w / 2 + 0.028)
    z0 = CAP_T + hill(base.x, base.y)
    yaw = math.atan2(tan.y, tan.x)
    post = box(f"{name}_post", (0.007, 0.007, 0.14), (base.x, base.y, z0 + 0.14 / 2), wood)
    post.rotation_euler = (0, 0, 0)
    finish(post, 0.0012, 2, 40)
    # board: arrow pointing along +x local (road direction), mounted on post
    Lb, Hb = 0.085, 0.032
    pts = [(-Lb / 2, -Hb / 2), (Lb / 2 - 0.018, -Hb / 2), (Lb / 2, 0), (Lb / 2 - 0.018, Hb / 2), (-Lb / 2, Hb / 2)]
    if flip: pts = [(-x, y) for x, y in reversed(pts)]
    # build in XZ plane: prism along local y thickness
    bmb = bmesh.new()
    th_ = 0.005
    fr = [bmb.verts.new((x, -th_ / 2, z)) for x, z in pts]
    bk = [bmb.verts.new((x, th_ / 2, z)) for x, z in pts]
    bmb.faces.new(fr); bmb.faces.new(list(reversed(bk)))
    for i in range(len(pts)):
        j = (i + 1) % len(pts)
        bmb.faces.new((fr[i], fr[j], bk[j], bk[i]))
    bmesh.ops.recalc_face_normals(bmb, faces=bmb.faces[:])
    board = from_bm(f"{name}_board", bmb, mat_board)
    # offset so board sits against the road-facing side of the post (side faces road)
    c = base + Vector((0, -(0.0035 + th_ / 2 + 0.0002), 0))
    board.location = (c.x, c.y, z0 + 0.14 - 0.02)
    board.rotation_euler = (0, 0, 0)
    finish(board, 0.0009, 2, 40)
    for o in (post, board): o["assembly"] = name
    return base


s1 = signpost("sign1", 0.20, +1, white)
s2 = signpost("sign2", 0.46, -1, yellow, flip=True)
s3 = signpost("sign3", 0.62, +1, navyb)

# ---------------- flag on summit ----------------
sx, sy = HC
TOPZ = CAP_T + HH
pole = cyl("pole", 0.0025, 0.15, (sx, sy, TOPZ - 0.001), mat("pole", PAL["white"], 0.3, metal=0.5), segs=24)
finish(pole, 0.0006, 2, 40)
ball = sphere("pole_ball", 0.0045, (sx, sy, TOPZ + 0.15 + 0.002), mat("ball", PAL["yellow"], 0.3, metal=0.5))
L, H = 0.085, 0.052
bm = bmesh.new()
nu, nv = 14, 6
g = []
for iu in range(nu + 1):
    u = iu / nu
    row = []
    for iv in range(nv + 1):
        v = iv / nv
        hh = H * (1 - 0.5 * u)
        row.append(bm.verts.new((sx + 0.003 + u * L, sy + 0.007 * math.sin(u * 5.2) * (0.25 + u), TOPZ + 0.15 - 0.003 - v * hh)))
    g.append(row)
for iu in range(nu):
    for iv in range(nv):
        bm.faces.new((g[iu][iv], g[iu + 1][iv], g[iu + 1][iv + 1], g[iu][iv + 1]))
pen = from_bm("pennant", bm, mat("pennant", "#ffb300", 0.5, coat=0.15))
so = pen.modifiers.new("Solid", "SOLIDIFY"); so.thickness = 0.0025
for p in pen.data.polygons: p.use_smooth = True
for o in (pole, ball, pen): o["assembly"] = "flag"

# ---------------- trees + rocks ----------------


def tree(name, x, y, h, m):
    z0 = CAP_T + hill(x, y)
    tr = cyl(f"{name}_trunk", 0.006 * h / 0.1, h * 0.25, (x, y, z0), wood, segs=16)
    finish(tr, 0.0008, 2, 40)
    o = [tr]
    for k in range(3):
        c = cyl(f"{name}_c{k}", h * (0.30 - 0.07 * k), h * 0.40, (x, y, z0 + h * (0.14 + 0.24 * k)), m, segs=24, r2=0.0)
        finish(c, 0.0012, 2, 40)
        o.append(c)
    for q in o: q["assembly"] = name


tree("treeA", -0.30, 0.05, 0.14, pine)
tree("treeB", -0.22, 0.20, 0.11, pine2)
tree("treeC", 0.30, -0.10, 0.12, pine2)
tree("treeD", 0.25, 0.03, 0.09, pine)
tree("treeE", -0.12, -0.05, 0.07, pine2)


def stone(name, x, y, r):
    bmm = bmesh.new()
    bmesh.ops.create_icosphere(bmm, subdivisions=2, radius=r)
    rr = random.Random(hash(name) % 1000)
    for v in bmm.verts:
        v.co.x *= 1.2 * (1 + rr.uniform(-0.1, 0.1)); v.co.y *= 0.9 * (1 + rr.uniform(-0.1, 0.1)); v.co.z *= 0.65 * (1 + rr.uniform(-0.1, 0.1))
        v.co.z += r * 0.5
    o = from_bm(name, bmm, white)
    o.location = (x, y, CAP_T + hill(x, y) - 0.0002)
    for p in o.data.polygons: p.use_smooth = True
    return o


stone("stoneA", 0.17, -0.22, 0.016)
stone("stoneB", -0.17, -0.18, 0.012)
stone("stoneC", 0.27, 0.12, 0.014)

# ---------------- ground (shadow only), lights, camera ----------------
catcher(-0.50)
area_light("key", (-2.4, -2.0, 2.6), (0, 0, 0.0), 1.8, 190, 5300, sy=1.4)
area_light("fill", (2.4, -2.4, 1.0), (0, 0, 0.0), 2.4, 45, 7000)
rim = area_light("rim", (1.6, 2.6, 1.3), (0, 0, 0.0), 1.2, 230, 6000)
rim.data.use_shadow = False
under = area_light("under", (0.0, -1.6, -0.25), (0, 0, -0.1), 1.8, 55, 7500)
under.data.use_shadow = False

cam = camera((0.0, -3.62, 1.93), (0.0, 0.03, -0.14), 70)
cam.data.shift_x = 0.09
cam.data.shift_y = 0.025
for nm, p in (("summit", (HC[0], HC[1], TOPZ + 0.2)), ("L", (-0.42, 0, 0.03)), ("R", (0.42, 0, 0.03)), ("front", (0, -0.38, 0.03)), ("tip", (0, 0, -0.52)), ("sign1", (s1.x, s1.y, 0.1))):
    print("FRAC", nm, proj_frac(cam, p))

clipcheck()
save_blend(os.path.join(HERE, "r2.blend"))
if A["cam"]:
    cx = {"hi": ((0, -1.2, 3.8), (0, 0, 0.0), 50), "side": ((3.6, -0.2, 0.25), (0, 0, -0.05), 50), "low": ((0.4, -2.2, -0.2), (0, 0, -0.1), 40)}[A["cam"]]
    camera(*cx)
    sc.render.resolution_x, sc.render.resolution_y = 960, 600
render(A["out"], A["noren"])
