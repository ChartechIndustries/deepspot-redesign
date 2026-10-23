import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy, bmesh
from mathutils import Vector
from common import *

A = args()
sc = reset()
setup_render(sc, A["spl"], A["scale"])
sc.view_settings.exposure = -0.2

# ---------------- terrain model ----------------
N = 12           # terrace levels
T = 0.030        # slab thickness (m)
BAND = 0.005     # white contour band on top of each slab
R0 = 0.36        # base radius
NS = 160         # samples per outline
YS = 0.88        # ellipse squash
rng = random.Random(11)
P1, P2, P3 = [rng.uniform(0, 6.28) for _ in range(3)]


def outline_r(k, th):
    t = k / N
    base = R0 * (1 - t) ** 1.0 + 0.03 * (1 - t)
    amp = 0.4 + 0.6 * (1 - t)
    n = 1 + amp * (0.10 * math.sin(2 * th + P1 + 0.25 * k) + 0.065 * math.sin(3 * th + P2 - 0.2 * k) + 0.035 * math.sin(5 * th + P3 + 0.45 * k))
    return base * n


thetas = [2 * math.pi * i / NS for i in range(NS)]
R = [[outline_r(k, th) for th in thetas] for k in range(N)]
# enforce nesting
for k in range(1, N):
    for i in range(NS):
        R[k][i] = min(R[k][i], R[k - 1][i] - 0.022)
        R[k][i] = max(R[k][i], 0.012)


def pt(k, i, dr=0.0):
    r = R[k][i % NS] + dr
    th = thetas[i % NS]
    return (r * math.cos(th), YS * r * math.sin(th))


def interp_r(k, th):
    th %= 2 * math.pi
    f = th / (2 * math.pi) * NS
    i = int(f) % NS
    u = f - int(f)
    return R[k][i] * (1 - u) + R[k][(i + 1) % NS] * u


def col_lerp(c0, c1, t):
    a, b = [int(c0[i:i + 2], 16) for i in (1, 3, 5)], [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    return "#%02x%02x%02x" % tuple(int(a[j] + (b[j] - a[j]) * t) for j in range(3))


white = mat("band", PAL["white"], 0.55, coat=0.2)
green = mat("path", PAL["green"], 0.4, coat=0.3, emit=PAL["green"], emit_strength=0.8)
yellow = mat("yellow", "#ffb300", 0.45, coat=0.2)
navy = mat("navy", PAL["navy"], 0.6)
plate_m = mat("plate", PAL["white"], 0.55, coat=0.15)

# plinth plate
plate = prism("plate", [pt(0, i, 0.05) for i in range(NS)], 0.0, 0.012, plate_m)
finish(plate, 0.003, 3)

for k in range(N):
    z0 = k * T + 0.012
    tcol = col_lerp("#3556e8", "#93a8ff", k / (N - 1))
    body = prism(f"slab{k}", [pt(k, i) for i in range(NS)], z0, z0 + T,
                 mat(f"slab_m{k}", tcol, 0.45, coat=0.25))
    finish(body, 0.0015, 2, 30)
    RW, RH = 0.0055, 0.0022
    band = ring_prism(f"band{k}", [pt(k, i) for i in range(NS)], [pt(k, i, -RW) for i in range(NS)], z0 + T, z0 + T + RH, white)
    finish(band, 0.0009, 2, 30)

Z = lambda k: k * T + 0.012  # bottom of slab k  (top of tread k-1)

# ---------------- path (switchbacks on the front face) ----------------
# angular waypoints per level boundary (degrees, front = -90)
swing = [-152, -108, -64, -30, -62, -100, -142, -162, -124, -88, -52, -78]
th_k = [math.radians(a) for a in swing]  # th_k[k] = angle where path enters tread k


OFF = 0.003      # ribbon bottom above surface
RIB_T = 0.0028
HW = 0.0105
FC = 0.48         # ribbon centre as fraction of tread width (0 = inner edge)
TOP = Z(N)


def rpos(k, th, f):
    """Point on tread k (between outline k and k+1) at angle th, fraction f from inner edge."""
    ro, ri = interp_r(k, th), interp_r(k + 1, th)
    r = ri + (ro - ri) * f
    return Vector((r * math.cos(th), YS * r * math.sin(th), 0.0))


def wallpos(k, th, off=OFF):
    r = interp_r(k, th) + off
    return Vector((r * math.cos(th), YS * r * math.sin(th), 0.0))


def outn(k, th):
    v = Vector((math.cos(th), YS * math.sin(th), 0)).normalized()
    return v


ZV = Vector((0, 0, 1))
ctrl = []   # (pos, normal)


def addp(p, z, n):
    ctrl.append((Vector((p.x, p.y, z)), n.normalized()))


def climb(k, th, z_low):
    """Climb the outer wall of slab k at angle th from z_low (tread below) to the top of slab k."""
    w = wallpos(k, th)
    ou = outn(k, th)
    addp(w, z_low + OFF, ZV)
    addp(w, z_low + T * 0.5, ou)
    addp(w, Z(k + 1) + OFF * 0.6, ou + ZV)
    # land on the tread (inward)
    return w


# start on the plate in front of slab 0
th0 = th_k[0]
r_pl = interp_r(0, th0) + 0.05
addp(Vector((r_pl * math.cos(th0), YS * r_pl * math.sin(th0), 0)), 0.012 + OFF, ZV)
climb(0, th0, 0.012)
for k in range(N - 1):
    zt = Z(k + 1) + OFF
    # inward onto tread k centre
    a0, a1 = th_k[k], th_k[k + 1]
    p = rpos(k, a0, FC)
    addp(p, zt, ZV)
    n = max(3, int(abs(a1 - a0) / math.radians(4)))
    for j in range(1, n + 1):
        a = a0 + (a1 - a0) * j / n
        addp(rpos(k, a, FC), zt, ZV)
    # climb wall k+1 at a1: first move to the wall base (outer edge of tread k = inner side is r_{k+1})
    wb = wallpos(k + 1, a1)
    addp(wb, zt, ZV)
    addp(wb, Z(k + 1) + T * 0.5, outn(k + 1, a1))
    addp(wb, Z(k + 2) + OFF * 0.6, outn(k + 1, a1) + ZV)
# plateau: inward to the pole
ath = th_k[N - 1]
zt = Z(N) + OFF
r_in = interp_r(N - 1, ath) * 0.5
addp(Vector((r_in * math.cos(ath), YS * r_in * math.sin(ath), 0)), zt, ZV)
addp(Vector((0.012 * math.cos(ath), 0.012 * YS * math.sin(ath), 0)), zt, ZV)


def chaikin(pts, it=2):
    for _ in range(it):
        out = [pts[0]]
        for (p0, n0), (p1, n1) in zip(pts, pts[1:]):
            out.append((p0.lerp(p1, 0.25), n0.lerp(n1, 0.25).normalized()))
            out.append((p0.lerp(p1, 0.75), n0.lerp(n1, 0.75).normalized()))
        out.append(pts[-1])
        pts = out
    return pts


# resample long straight pieces so Chaikin acts on short segments
dense = [ctrl[0]]
for (p0, n0), (p1, n1) in zip(ctrl, ctrl[1:]):
    L_ = (p1 - p0).length
    m = max(1, int(L_ / 0.012))
    for j in range(1, m + 1):
        dense.append((p0.lerp(p1, j / m), n0.lerp(n1, j / m).normalized()))
sm = chaikin(dense, 2)
bm = bmesh.new()
tops, bots, = [], []
for i, (p, n) in enumerate(sm):
    t = (sm[min(i + 1, len(sm) - 1)][0] - sm[max(i - 1, 0)][0]).normalized()
    wv = t.cross(n)
    if wv.length < 1e-6:
        wv = Vector((1, 0, 0))
    wv.normalize()
    for sgn, lst in ((1, 0), (-1, 1)):
        pass
    l = p + wv * HW
    r = p - wv * HW
    tops.append((bm.verts.new(l + n * RIB_T), bm.verts.new(r + n * RIB_T)))
    bots.append((bm.verts.new(l), bm.verts.new(r)))
for i in range(len(sm) - 1):
    (tl, tr), (tl2, tr2) = tops[i], tops[i + 1]
    (bl, br), (bl2, br2) = bots[i], bots[i + 1]
    bm.faces.new((tl, tl2, tr2, tr))
    bm.faces.new((bl, br, br2, bl2))
    bm.faces.new((tl, bl, bl2, tl2))
    bm.faces.new((tr, tr2, br2, br))
bm.faces.new((tops[0][0], tops[0][1], bots[0][1], bots[0][0]))
bm.faces.new((tops[-1][0], bots[-1][0], bots[-1][1], tops[-1][1]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
ribbon = from_bm("pathRibbon", bm, green)
for p_ in ribbon.data.polygons: p_.use_smooth = True
ribbon.modifiers.new("Sub", "SUBSURF")
ribbon.modifiers["Sub"].levels = 1; ribbon.modifiers["Sub"].render_levels = 1
ribbon.modifiers["Sub"].subdivision_type = "CATMULL_CLARK"
ribbon["assembly"] = "ribbon"

# ---------------- pins ----------------


def tread_pos(k, frac_a=0.5, fr=FC):
    a = th_k[k] + (th_k[k + 1] - th_k[k]) * frac_a
    ro, ri = interp_r(k, a), interp_r(k + 1, a)
    r = ri + (ro - ri) * fr
    return (r * math.cos(a), YS * r * math.sin(a), Z(k + 1) + OFF + RIB_T)


def pin(name, k, kind, frac_a=0.5):
    x, y, z = tread_pos(k, frac_a)
    stem_h = 0.10
    st = cyl(f"{name}_stem", 0.0045, stem_h, (x, y, z), mat(f"{name}_sm", PAL["white"], 0.3, metal=0.6))
    finish(st, 0.0008, 2, 40)
    foot = cyl(f"{name}_foot", 0.008, 0.003, (x, y, z), mat(f"{name}_fm", PAL["navy"], 0.4))
    finish(foot, 0.0008, 2, 40)
    hz = z + stem_h + 0.036
    if kind == "done":
        h = sphere(f"{name}_head", 0.044, (x, y, hz), mat(f"{name}_hm", PAL["green"], 0.25, coat=0.5, emit=PAL["green"], emit_strength=0.25))
        # inner white dot (check mark stand-in): small flattened sphere front
    elif kind == "now":
        h = sphere(f"{name}_head", 0.044, (x, y, hz), mat(f"{name}_hm", "#ffb300", 0.25, coat=0.4, emit="#ffb300", emit_strength=0.12))
        ring = torus(f"{name}_halo", 0.074, 0.0034, (x, y, hz), mat(f"{name}_ring", "#ffb300", 0.3, emit="#ffb300", emit_strength=0.8), rot=(math.radians(90 - 33), 0, 0))
        ring["assembly"] = f"{name}_head"
        h["assembly"] = f"{name}_head"
    else:
        h = torus(f"{name}_head", 0.032, 0.012, (x, y, hz), mat(f"{name}_hm", PAL["white"], 0.3, coat=0.5), rot=(math.radians(90 - 33), 0, 0))
    for o in (st, foot, h):
        o["assembly"] = name
    h["assembly"] = name
    return (x, y, hz)


p_done = pin("pinDone", 2, "done", 0.55)
p_now = pin("pinNow", 5, "now", 0.55)
p_next = pin("pinNext", 8, "next", 0.5)

# ---------------- summit flag ----------------
pole = cyl("pole", 0.0032, 0.17, (0, 0, TOP), mat("pole", PAL["white"], 0.3, metal=0.5), segs=24)
finish(pole, 0.0008, 2, 40)
ball = sphere("pole_ball", 0.0058, (0, 0, TOP + 0.17 + 0.002), mat("ball", PAL["yellow"], 0.3, metal=0.5))
# pennant: tapered, waved sheet
L, H = 0.10, 0.065
bm = bmesh.new()
nu, nv = 14, 6
grid = []
for iu in range(nu + 1):
    u = iu / nu
    row = []
    for iv in range(nv + 1):
        v = iv / nv
        hh = H * (1 - 0.82 * u)
        x = 0.0035 + u * L
        z = TOP + 0.17 - 0.004 - v * hh
        y = 0.008 * math.sin(u * 5.2) * (0.25 + u)
        row.append(bm.verts.new((x, y, z)))
    grid.append(row)
for iu in range(nu):
    for iv in range(nv):
        bm.faces.new((grid[iu][iv], grid[iu + 1][iv], grid[iu + 1][iv + 1], grid[iu][iv + 1]))
pen = from_bm("pennant", bm, mat("pennant", "#ffb300", 0.5, coat=0.15))
sol = pen.modifiers.new("Solid", "SOLIDIFY")
sol.thickness = 0.0025
for p in pen.data.polygons: p.use_smooth = True
for o in (pole, ball, pen): o["assembly"] = "flag"

# ---------------- ground + lights + camera ----------------
catcher(0.0)
area_light("key", (-2.6, -1.9, 2.2), (0, 0, 0.1), 1.8, 190, 5300, sy=1.4)
area_light("fill", (2.4, -2.4, 1.4), (0, 0, 0.1), 2.4, 45, 7000)
rim = area_light("rim", (1.6, 2.6, 1.7), (0, 0, 0.12), 1.2, 230, 6000)
rim.data.use_shadow = False
area_light("top", (0.0, -0.4, 3.2), (0, 0, 0.1), 1.6, 40, 5600)

cam = camera((0.0, -4.15, 2.08), (0.0, 0.0, 0.14), 85)
cam.data.shift_x = 0.085
cam.data.shift_y = 0.0
for nm, p in (("summit", (0, 0, TOP + 0.20)), ("plateL", (-R0, 0, 0.012)), ("plateR", (R0, 0, 0.012)), ("front", (0, -R0 * YS, 0.012)),
              ("done", p_done), ("now", p_now), ("next", p_next)):
    print("FRAC", nm, proj_frac(cam, p))

res = clipcheck()
save_blend(os.path.join(HERE, "r1.blend"))
if A["cam"]:
    cx = {"hi": ((0, -1.0, 4.4), (0, 0, 0.1), 50), "side": ((3.4, -0.2, 0.35), (0, 0, 0.12), 50), "back": ((0, 3.6, 1.8), (0, 0, 0.1), 60)}[A["cam"]]
    camera(*cx)
    sc.render.resolution_x, sc.render.resolution_y = 960, 600
render(A["out"], A["noren"])
