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
setup_world(0.5, rot_z=math.radians(170))
sc.view_settings.exposure = -0.5
floor = add_floor()


def floor_glossy_tint(floor, rgb):
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


floor_glossy_tint(floor, (0.17, 0.10, 0.012, 1))

CREAM, NAVY, COBALT = "#eceee8", "#0b1a2e", "#3c60ff"
gold_m = pbr("gold", (1.0, 0.74, 0.07, 1), metallic=1.0, rough=0.23)
navy_gl = pbr("navy_enamel", "#0f2140", rough=0.12, coat=0.8, coat_rough=0.03)
cream_m = pbr("cream_enamel", CREAM, rough=0.22, coat=0.5, coat_rough=0.06)
cobalt_m = pbr("cobalt_satin", COBALT, rough=0.4, sheen=0.4)
navy_sat = pbr("navy_satin", "#16294a", rough=0.42, sheen=0.4)

# ------------------------------------------------------------ felt card
CW, CD, CH = 1.62, 1.12, 0.05
felt = pbr("felt", "#05601f", rough=1.0, sheen=0.0)
nt = felt.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
noise = nt.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 900
noise.inputs["Detail"].default_value = 6
tcn = nt.nodes.new("ShaderNodeTexCoord")
nt.links.new(tcn.outputs["Object"], noise.inputs["Vector"])
bump = nt.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.35
bump.inputs["Distance"].default_value = 0.002
nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
card = obj_from_bm("card", bm_box(CW, CD, CH), [felt], loc=(0, 0, CH / 2), bevel=(0.016, 3), assembly="card")
# stitches (one mesh, dashed cream line inset from the border)
sb = bmesh.new()
inset, step, sl = 0.085, 0.075, 0.042
hx, hy = CW / 2 - inset, CD / 2 - inset
zst = CH + 0.0012
def stitch(x, y, ang):
    bm1 = bm_box(sl, 0.0085, 0.004)
    bmesh.ops.rotate(bm1, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, 'Z'), verts=bm1.verts)
    bmesh.ops.translate(bm1, vec=(x, y, zst), verts=bm1.verts)
    tmp = bpy.data.meshes.new("t")
    bm1.to_mesh(tmp)
    bm1.free()
    sb.from_mesh(tmp)
    bpy.data.meshes.remove(tmp)
nx = int(2 * hx / step)
for i in range(nx + 1):
    x = -hx + i * (2 * hx / nx)
    stitch(x, hy, 0)
    stitch(x, -hy, 0)
ny = int(2 * hy / step)
for i in range(1, ny):
    y = -hy + i * (2 * hy / ny)
    stitch(hx, y, math.pi / 2)
    stitch(-hx, y, math.pi / 2)
stitch_ob = obj_from_bm("stitches", sb, [cream_m], bevel=(0.0012, 2), assembly="card")

# ------------------------------------------------------------ plinth disc (cream) with gold ring
PX, PY = 0.12, 0.12
PZ0 = CH
disc_prof = rounded_rect_profile(0.0, 0.25, 0.0, 0.034, 0.008, 3)
disc_prof = [(max(r, 0.0), z) for r, z in disc_prof]
# solid disc: lathe from axis; build manually
dprof = [(0.0, 0.0), (0.262, 0.0)]
for i in range(1, 4):
    a = math.radians(-90 + 90 * i / 3)
    dprof.append((0.262 + 0.008 * math.cos(a), 0.008 + 0.008 * math.sin(a)))
for i in range(1, 4):
    a = math.radians(90 * i / 3)
    dprof.append((0.262 + 0.008 * math.cos(a), 0.026 + 0.008 * math.sin(a)))
dprof += [(0.262, 0.034), (0.0, 0.034)]
dprof2 = []
for p in dprof:
    if not dprof2 or abs(p[0] - dprof2[-1][0]) + abs(p[1] - dprof2[-1][1]) > 1e-9:
        dprof2.append(p)
plinth = obj_from_bm("plinth", bm_lathe(dprof2, 96), [cream_m], loc=(PX, PY, PZ0), assembly="plinth")
ring = obj_from_bm("plinth_ring", bm_lathe(rounded_rect_profile(0.195, 0.225, 0.0, 0.01, 0.0035, 2), 96), [gold_m],
                   loc=(PX, PY, PZ0 + 0.034 - 0.0015), assembly="plinth")
TOPZ = PZ0 + 0.034

# ------------------------------------------------------------ pin
R, Dd = 0.38, 1.08
phi = math.acos(R / Dd)
th_p = math.pi - phi
prof = []
N = 40
for i in range(N + 1):
    t = th_p * i / N
    prof.append((R * math.sin(t), R * math.cos(t)))
prof.append((0.0, -Dd))
prof[0] = (0.0, R)
pbm = bm_lathe(prof, 96, 1e-6)
pin_tmp = obj_from_bm("pin_raw", pbm, [gold_m, navy_gl], smooth=True, split=0)
# recess cut on the -y side of the head
cut = bm_cyl(0.215, 0.215, 0.5, 64)
cutter = obj_from_bm("cutter", cut, [gold_m], loc=(0, -0.48, 0.0), rot=(math.pi / 2, 0, 0), smooth=False, split=0)
bo = pin_tmp.modifiers.new("cut", "BOOLEAN")
bo.operation = "DIFFERENCE"
bo.object = cutter
bo.solver = "EXACT"
bpy.context.view_layer.update()
me = bake(pin_tmp)
bpy.data.objects.remove(cutter)
bpy.data.objects.remove(pin_tmp)
FLOOR_Y = -0.2
for p in me.polygons:
    c = p.center
    if abs(c.y - (-0.48 + 0.25)) < 2e-4 and p.normal.y < -0.9:
        p.material_index = 1
    else:
        p.material_index = 0
print("RECESS floor polys", sum(1 for p in me.polygons if p.material_index == 1))
pin = bpy.data.objects.new("pin", me)
bpy.context.scene.collection.objects.link(pin)
pin.parent = None
finish_obj(pin, (0.005, 3), True, 35, "pin")
# asterisk in the recess
fy = -0.23
for k in range(3):
    bar = bm_box(0.33, 0.03, 0.056)
    ob = obj_from_bm(f"pin_bar{k}", bar, [gold_m], loc=(0, fy - 0.015 + 0.002, 0), rot=(0, math.radians(60 * k + 90), 0),
                     bevel=(0.0095, 3), assembly="pin")
    ob.parent = pin
pin_z = TOPZ - 0.003 + Dd
pin.location = (PX, PY, pin_z)
pin.rotation_euler = (0, 0, math.radians(28))

# ------------------------------------------------------------ rosette (ribbon prize)
RX, RY = -0.46, -0.12
RZ = CH + 0.0135


def pleated(name, r_in, r_out, npl, amp, base_z, dome, mat, wob=0.05, thick=0.005, asm="rosette", na=300, nr=8):
    bm = bmesh.new()
    rows = []
    for i in range(nr + 1):
        s = i / nr
        row = []
        for j in range(na):
            th = 2 * math.pi * j / na
            ro = r_out * (1 + wob * math.cos(npl * th))
            r = r_in + (ro - r_in) * s
            z = base_z + amp * math.cos(npl * th) * (0.35 + 0.65 * s) + dome * (1 - s) ** 1.5 * 0 + dome * s * s
            row.append(bm.verts.new((r * math.cos(th), r * math.sin(th), z)))
        rows.append(row)
    for i in range(nr):
        for j in range(na):
            a, b = rows[i][j], rows[i][(j + 1) % na]
            c, d = rows[i + 1][(j + 1) % na], rows[i + 1][j]
            bm.faces.new((a, b, c, d))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    ob = obj_from_bm(name, bm, [mat], loc=(RX, RY, RZ), bevel=None, smooth=True, split=0, assembly=asm)
    sm = ob.modifiers.new("Solid", "SOLIDIFY")
    sm.thickness = thick
    sm.offset = -1
    return ob


pleated("rosette_outer", 0.0, 0.27, 22, 0.009, 0.0, 0.035, cobalt_m, wob=0.045, thick=0.006)
pleated("rosette_inner", 0.0, 0.17, 16, 0.007, 0.03, 0.025, navy_sat, wob=0.04, thick=0.006)
boss = obj_from_bm("rosette_boss", bm_lathe([(0, 0.0), (0.078, 0.0), (0.083, 0.01), (0.078, 0.022), (0.056, 0.04), (0.0, 0.05)], 64),
                   [gold_m], loc=(RX, RY, RZ + 0.062), bevel=None, assembly="rosette")


def tail(name, ang_deg, length, mat, offx=0.0):
    w = 0.1
    bm = bmesh.new()
    pts = [(-w / 2, 0), (w / 2, 0), (w / 2, -length), (0, -length + 0.06), (-w / 2, -length)]
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    r = bmesh.ops.extrude_face_region(bm, geom=[f])
    bmesh.ops.translate(bm, vec=(0, 0, 0.0045), verts=[v for v in r["geom"] if isinstance(v, bmesh.types.BMVert)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(name, bm, [mat], loc=(RX + offx, RY, CH + 0.0006), rot=(0, 0, math.radians(ang_deg)), bevel=(0.0011, 2), assembly="rosette")


tail("tail1", 14, 0.31, cobalt_m, -0.01)
tail("tail2", -16, 0.27, navy_sat, 0.03)

# ------------------------------------------------------------ camera + lights
az = math.radians(26)
Rr, EL = 11.2, math.radians(30)
TARGET = (0.0, 0.0, 0.55)
cam_loc = (TARGET[0] + Rr * math.cos(EL) * math.sin(az), TARGET[1] - Rr * math.cos(EL) * math.cos(az), TARGET[2] + Rr * math.sin(EL))
CSX, CSY = 0.19, 0.105
make_camera(cam_loc, TARGET, 62, shift=(CSX, CSY))
area_light("key", (-3.2, -4.2, 5.2), (0, 0, 0.6), 3.2, 520, 5400)
area_light("fill", (5.0, -3.0, 2.0), (0, 0, 0.5), 3.5, 160, 6000)
area_light("rim", (-1.0, 4.5, 3.2), (0, 0, 0.7), 2.5, 600, 6200)
area_light("pinkick", (3.0, -1.5, 2.0), (0, 0, 0.9), 1.2, 160, 5200)

bpy.context.view_layer.update()
if CLIP:
    bad = clipcheck(0.004)
    print("CLIP_PAIRS", len(bad), bad[:20])
if QA:
    qa_views("c3", (0, 0, 0.55), 5.0, 55, os.path.join(HERE, "qa"))
    sc.render.film_transparent = True
    sc.render.resolution_percentage = PCT
    sc.cycles.samples = SAMPLES
    sc.camera = bpy.data.objects["cam"]
render_to(OUT)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "c3_pin.blend"))
