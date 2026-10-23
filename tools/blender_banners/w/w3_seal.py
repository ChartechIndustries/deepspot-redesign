import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *

args = sys.argv[sys.argv.index("--") + 1:]
out = args[0]
SEAL_ONLY = "--seal" in args
PREV = "prev" in args
clear()
W, H = (1200, 1200) if SEAL_ONLY else (1920, 1200)
if PREV:
    W, H = W // 2, H // 2
s = setup_render(W, H, 48 if PREV else 256, transparent=True)
world(NAVY, 0.1)

R = 0.06  # seal radius: 12 cm medallion
m_rim = solid("rim", srgb("#eceee8"), rough=0.28, metal=1.0)
m_enamel = solid("enamel", srgb("#00bf3f"), rough=0.14, coat=1.0)
m_navy = solid("navy", srgb("#0b1a2e"), rough=0.22, coat=0.6)
m_tuff = tex_mat("tuff", "old_sandstone_02", 0.5, tint=(0.9, 0.72, 0.55), tint_mix=0.6, val=0.75, bump=1.8)
m_tuff2 = tex_mat("tuff2", "old_sandstone_02", 0.4, tint=(0.9, 0.7, 0.52), tint_mix=0.6, val=0.7, bump=1.4)
m_bg = solid("bg", (*NAVY, 1), rough=1.0)


def mesh_obj(name, verts, faces, mat):
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], faces)
    me.update()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(mat)
    return o


def solid_ring(name, rfn, r_in, z0, z1, mat, seg=360):
    """Closed solid: outer radius rfn(theta); inner hole r_in (0 = disc)."""
    v, f = [], []
    th = [2 * math.pi * i / seg for i in range(seg)]
    for z in (z0, z1):
        for t in th:
            r = rfn(t)
            v.append((r * math.cos(t), r * math.sin(t), z))
    if r_in > 0:
        for z in (z0, z1):
            for t in th:
                v.append((r_in * math.cos(t), r_in * math.sin(t), z))
    for i in range(seg):
        j = (i + 1) % seg
        f.append((i, j, seg + j, seg + i))  # outer wall
    if r_in > 0:
        b = 2 * seg
        for i in range(seg):
            j = (i + 1) % seg
            f.append((b + seg + i, b + seg + j, b + j, b + i))  # inner wall
            f.append((seg + i, seg + j, b + seg + j, b + seg + i))  # top
            f.append((j, i, b + i, b + j))  # bottom
    else:
        K = 12
        for z, top in ((z0, False), (z1, True)):
            base_i = len(v)
            for k in range(1, K):
                fr = k / K
                for tt in th:
                    r = rfn(tt) * fr
                    v.append((r * math.cos(tt), r * math.sin(tt), z))
            c = len(v)
            v.append((0, 0, z))
            outer0 = (seg if top else 0)
            rings = [outer0] + [base_i + (K - 2 - k) * seg for k in range(0, K - 1)]  # outer, then inward
            for q in range(len(rings) - 1):
                a0, a1 = rings[q], rings[q + 1]
                for i in range(seg):
                    j = (i + 1) % seg
                    f.append((a0 + i, a0 + j, a1 + j, a1 + i) if top else (a0 + j, a0 + i, a1 + i, a1 + j))
            last = rings[-1]
            for i in range(seg):
                j = (i + 1) % seg
                f.append((last + i, last + j, c) if top else (last + j, last + i, c))
    o = mesh_obj(name, v, f, mat)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    o.select_set(False)
    return o


LOBES, AMP = 20, 0.018
base_thick = 0.18 * R
base = solid_ring("seal_base", lambda t: R * (1 + AMP * math.cos(LOBES * t)), 0, 0, base_thick, m_rim)
bevel(base, 0.035 * R, 3)
smooth(base)
# raised metal ring around enamel
ring_in, ring_out = 0.84 * R, 0.90 * R
ring_h = 0.06 * R
ring = solid_ring("seal_ring", lambda t: ring_out, ring_in, base_thick, base_thick + ring_h, m_rim, seg=240)
bevel(ring, 0.012 * R, 2)
smooth(ring)
# enamel disc fills inside the ring, flush with ring top minus a hair
en_h = 0.045 * R
enamel = solid_ring("seal_enamel", lambda t: ring_in, 0, base_thick, base_thick + en_h, m_enamel, seg=240)
bevel(enamel, 0.008 * R, 2)
smooth(enamel)
ztop = base_thick + en_h
# asterisk (3 crossing bars) navy relief
ast_parts = []
for i, ang in enumerate((0, 60, 120)):
    b = box(f"seal_ast{i}", (1.0 * R, 0.17 * R, 0.05 * R), (0, 0, ztop + 0.025 * R), m_navy, bev=0.018 * R, rot=(0, 0, math.radians(ang + 90)))
    b["assembly"] = "seal_ast"
    ast_parts.append(b)
# halftone dot ring
dots = []
N = 44
for i in range(N):
    a = 2 * math.pi * i / N
    rr = (0.034 + 0.026 * (0.5 + 0.5 * math.cos(a - math.radians(35)))) * R
    c = cyl(f"seal_dot{i:02d}", rr, 0.03 * R, (0.70 * R * math.cos(a), 0.70 * R * math.sin(a), ztop + 0.015 * R), m_navy, bev=0.006 * R, verts=24)
    dots.append(c)
# assembly tags: whole seal is one object
seal_parts = [base, ring, enamel] + ast_parts + dots
for o in seal_parts:
    o["assembly"] = "seal"
seal = bpy.data.objects.new("seal_root", None)
bpy.context.collection.objects.link(seal)
for o in seal_parts:
    o.parent = seal

if SEAL_ONLY:
    seal.rotation_euler = (math.radians(-62), 0, math.radians(0))
    seal.location = (0, 0, 0)
    seal.rotation_euler = (math.radians(74), math.radians(0), math.radians(-16))
    camera((0, -0.62, 0.0), (0, 0, 0), 120)
    s.camera.data.dof.use_dof = False
    s.view_settings.exposure = -0.45
    area_light("key", (-0.75, -0.35, 0.12), (0, 0, 0), 0.5, 45, kelvin(5400), size_y=0.5)
    area_light("fill", (0.3, -0.3, 0.8), (0, 0, 0), 0.8, 8, kelvin(6500), size_y=0.8)
    area_light("rim", (0.1, 0.5, 0.5), (0, 0, 0), 0.4, 30, kelvin(6000), size_y=0.4)
    area_light("under", (0.0, -0.4, -0.5), (0, 0, 0), 0.5, 4, (1, 0.8, 0.6), size_y=0.5)
else:
    # stone: pedestal slab + plinth blocks
    slab = box("stone_slab", (1.2, 0.8, 0.10), (0, 0.0, -0.05), m_tuff, bev=0.006)
    m_ped = solid("ped", srgb("#2c2623"), rough=0.45, coat=0.3)
    ped = cyl("stone_pedestal", 1.28 * R, 0.012, (0, 0, 0.006), m_ped, bev=0.002, verts=96)
    # raise seal onto pedestal
    seal.location = (0, 0, 0.012)
    seal.rotation_euler = (0, 0, math.radians(8))
    # carved step blocks behind/left (recede into dark)
    b1 = box("stone_block1", (0.5, 0.16, 0.14), (-0.30, 0.34, 0.07), m_tuff2, bev=0.006)
    b2 = box("stone_block2", (0.4, 0.2, 0.26), (0.20, 0.50, 0.13), m_tuff, bev=0.006)
    b3 = box("stone_block3", (0.5, 0.2, 0.32), (-0.55, 0.52, 0.16), m_tuff, bev=0.006)
    # chisel groove strips on slab front (tiny blocks) -> relief
    for i in range(5):
        g = box(f"stone_groove{i}", (0.9 - 0.06 * i, 0.012, 0.004), (0.02 * i - 0.04, -0.18 - 0.07 * i, 0.002), m_tuff2, bev=0.001)
    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.1001))
    gp = bpy.context.active_object; gp.name = "ground_bg"; gp.data.materials.append(m_bg); gp.is_shadow_catcher = True
    cam = camera((0.12, -0.80, 0.78), (0.0, 0.05, 0.02), 85, shift=(-0.10, -0.13))
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = (Vector(cam.location) - Vector((0, 0.0, 0.02))).length
    cam.data.dof.aperture_fstop = 1.6
    flag = box("flag", (0.01, 0.7, 0.4), (-0.55, -0.62, 0.2), m_bg, bev=0)  # gobo: shadow only, keeps the lower-left (text zone) dark
    flag.visible_camera = False
    # raking key from low left, cool rim from right-behind, warm bounce
    spot_light("rake", (-0.85, -0.22, 0.2), (0.06, 0.0, 0.01), 330, kelvin(4400), spot_deg=11, blend=1.0, radius=0.06)
    spot_light("rim", (0.45, 0.5, 0.30), (0, 0, 0.02), 90, kelvin(8000), spot_deg=11, blend=1.0, radius=0.05)
    spot_light("fill", (0.3, -0.7, 0.4), (0, 0, 0.0), 6, kelvin(5500), spot_deg=12, blend=1.0, radius=0.1)

bpy.context.view_layer.update()
if "--noclip" not in args:
    print("CLIP", clipcheck())
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "w3_seal%s.blend" % ("_alone" if SEAL_ONLY else "")))
s.render.filepath = out
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER_TIME", time.time() - t)
if "--qa" in args and not SEAL_ONLY:
    qa_cams((0, 0, 0.02), 0.5, 50, os.path.join(HERE, "qa", "w3"))
