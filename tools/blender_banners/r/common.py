"""Shared helpers for banner R scenes. Import with sys.path insert of this folder."""
import bpy, bmesh, math, sys, os, random
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))

PAL = dict(cobalt="#3c60ff", green="#07d653", yellow="#ffd400", navy="#0b1a2e", navy2="#182a43", white="#eceee8")


def lin(c):
    c = c.lstrip("#")
    v = [int(c[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in v]


def args():
    a = sys.argv
    a = a[a.index("--") + 1:] if "--" in a else []
    d = dict(out=os.path.join(HERE, "renders", "tmp.png"), spl=192, scale=1.0, cam=None, noren=False)
    i = 0
    while i < len(a):
        if a[i] == "--out": d["out"] = a[i + 1]; i += 2
        elif a[i] == "--spl": d["spl"] = int(a[i + 1]); i += 2
        elif a[i] == "--scale": d["scale"] = float(a[i + 1]); i += 2
        elif a[i] == "--cam": d["cam"] = a[i + 1]; i += 2
        elif a[i] == "--noren": d["noren"] = True; i += 1
        else: i += 1
    return d


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def setup_render(scene, spl=192, scale=1.0, ambient=("#7f93ff", 0.35)):
    scene.render.engine = "CYCLES"
    cp = bpy.context.preferences.addons["cycles"].preferences
    cp.compute_device_type = "OPTIX"
    cp.get_devices()
    for d in cp.devices:
        d.use = (d.type == "OPTIX")
    scene.cycles.device = "GPU"
    scene.cycles.samples = spl
    scene.cycles.use_denoising = True
    try:
        scene.cycles.denoiser = "OPTIX"
    except TypeError:
        scene.cycles.denoiser = "OPENIMAGEDENOISE"
    scene.cycles.max_bounces = 6
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.sample_clamp_indirect = 8
    scene.render.resolution_x = int(1920 * scale)
    scene.render.resolution_y = int(1200 * scale)
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "16"
    vs = scene.view_settings
    vs.view_transform = "AgX"
    for cand in ("AgX - Medium High Contrast", "Medium High Contrast"):
        try:
            vs.look = cand
            break
        except TypeError as e:
            last = str(e)
    else:
        print("LOOK-FAIL", last[:300])
    print("LOOK", vs.look, vs.view_transform)
    vs.exposure = 0.0
    w = bpy.data.worlds.new("W")
    scene.world = w
    w.use_nodes = True
    bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[0].default_value = lin(ambient[0]) + [1]
    bg.inputs[1].default_value = ambient[1]


def mat(name, color, rough=0.5, metal=0.0, emit=None, emit_strength=0.0, coat=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = lin(color) + [1]
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Coat Weight" in b.inputs: b.inputs["Coat Weight"].default_value = coat
    if "Coat Roughness" in b.inputs: b.inputs["Coat Roughness"].default_value = 0.15
    if color.lower() in ("#ffb300", "#c47400", "#ffd400", "#f09a00", "#ffc400"):
        m["yellow"] = True
    if emit:
        b.inputs["Emission Color"].default_value = lin(emit) + [1]
        b.inputs["Emission Strength"].default_value = emit_strength
    return m


def link(obj, collection=None):
    (collection or bpy.context.scene.collection).objects.link(obj)
    return obj


def from_bm(name, bm, material=None, assembly=None):
    me = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    link(o)
    if material: o.data.materials.append(material)
    if assembly: o["assembly"] = assembly
    return o


def finish(o, bevel=0.002, seg=2, angle=35, sub=0, smooth=True):
    """Bevel modifier + smooth-by-angle shading."""
    if bevel:
        m = o.modifiers.new("Bevel", "BEVEL")
        m.width = bevel
        m.segments = seg
        m.limit_method = "ANGLE"
        m.angle_limit = math.radians(angle)
    if sub:
        s = o.modifiers.new("Sub", "SUBSURF")
        s.levels = sub
        s.render_levels = sub
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        try:
            bpy.ops.object.shade_smooth_by_angle(angle=math.radians(50))
        except Exception as e:
            print("smooth_by_angle failed", e)
        o.select_set(False)
    return o


def prism(name, pts, z0, z1, material=None, assembly=None):
    """Closed extruded polygon (pts: list of (x,y), counter-clockwise)."""
    bm = bmesh.new()
    bot = [bm.verts.new((x, y, z0)) for x, y in pts]
    top = [bm.verts.new((x, y, z1)) for x, y in pts]
    bm.faces.new(top)
    bm.faces.new(list(reversed(bot)))
    n = len(pts)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((bot[i], bot[j], top[j], top[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return from_bm(name, bm, material, assembly)


def box(name, size, loc, material=None, rot=(0, 0, 0), assembly=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= size[0]; v.co.y *= size[1]; v.co.z *= size[2]
    o = from_bm(name, bm, material, assembly)
    o.location = loc
    o.rotation_euler = rot
    return o


def cyl(name, r, h, loc, material=None, segs=48, r2=None, rot=(0, 0, 0), assembly=None, base_at_loc=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r, radius2=(r if r2 is None else r2), depth=h)
    if base_at_loc:
        for v in bm.verts: v.co.z += h / 2
    o = from_bm(name, bm, material, assembly)
    o.location = loc
    o.rotation_euler = rot
    return o


def sphere(name, r, loc, material=None, assembly=None, seg=48):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=seg // 2, radius=r)
    o = from_bm(name, bm, material, assembly)
    o.location = loc
    for p in o.data.polygons: p.use_smooth = True
    return o


def torus(name, R, r, loc, material=None, rot=(0, 0, 0), assembly=None, seg=64, rseg=20):
    bm = bmesh.new()
    verts = []
    for i in range(seg):
        a = 2 * math.pi * i / seg
        ring = []
        for j in range(rseg):
            b = 2 * math.pi * j / rseg
            ring.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        verts.append(ring)
    for i in range(seg):
        for j in range(rseg):
            i2, j2 = (i + 1) % seg, (j + 1) % rseg
            bm.faces.new((verts[i][j], verts[i2][j], verts[i2][j2], verts[i][j2]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    o = from_bm(name, bm, material, assembly)
    o.location = loc
    o.rotation_euler = rot
    for p in o.data.polygons: p.use_smooth = True
    return o


def area_light(name, loc, target, size, watts, kelvin=5300, color=None, shape="RECTANGLE", sy=None):
    d = bpy.data.lights.new(name, "AREA")
    d.shape = shape
    d.size = size
    if shape == "RECTANGLE": d.size_y = sy or size
    d.energy = watts
    if color: d.color = lin(color)
    else:
        # simple kelvin -> rgb (Tanner Helland)
        t = kelvin / 100
        r = 255 if t <= 66 else max(0, min(255, 329.698727446 * ((t - 60) ** -0.1332047592)))
        g = max(0, min(255, 99.4708025861 * math.log(t) - 161.1195681661)) if t <= 66 else max(0, min(255, 288.1221695283 * ((t - 60) ** -0.0755148492)))
        b = 255 if t >= 66 else (0 if t <= 19 else max(0, min(255, 138.5177312231 * math.log(t - 10) - 305.0447927307)))
        d.color = lin("#%02x%02x%02x" % (int(r), int(g), int(b)))
    o = bpy.data.objects.new(name, d)
    link(o)
    o.location = loc
    aim(o, target)
    return o


def aim(o, target):
    d = Vector(target) - Vector(o.location)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens, name="Cam"):
    c = bpy.data.cameras.new(name)
    c.lens = lens
    c.sensor_width = 36
    c.sensor_fit = "HORIZONTAL"
    c.clip_start = 0.05
    c.clip_end = 100
    o = bpy.data.objects.new(name, c)
    link(o)
    o.location = loc
    aim(o, target)
    bpy.context.scene.camera = o
    return o


def catcher(z=0.0, size=40.0):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size / 2)
    o = from_bm("ground", bm, mat("catcher", PAL["cobalt"], 1.0))
    o.location = (0, 0, z)
    o.is_shadow_catcher = True
    return o


def proj_frac(cam, p):
    """Return (x,y) fractions of frame (0..1, y from top) for a world point."""
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()
    v = world_to_camera_view(bpy.context.scene, cam, Vector(p))
    return round(v.x, 3), round(1 - v.y, 3)


def clipcheck():
    import runpy
    return runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"]()


def render(path, noren=False):
    s = bpy.context.scene
    s.render.filepath = path
    if not noren:
        bpy.ops.render.render(write_still=True)
        render_mask(path.replace("_raw.png", "_mask.png"))


def render_mask(path):
    """White where an object has a material flagged yellow, black elsewhere (Standard view, no light)."""
    s = bpy.context.scene
    wm = bpy.data.materials.new("mask_w"); wm.use_nodes = True
    bk = bpy.data.materials.new("mask_b"); bk.use_nodes = True
    for m_, v in ((wm, 1.0), (bk, 0.0)):
        n = next(x for x in m_.node_tree.nodes if x.type == "BSDF_PRINCIPLED")
        n.inputs["Base Color"].default_value = (0, 0, 0, 1)
        n.inputs["Emission Color"].default_value = (v, v, v, 1)
        n.inputs["Emission Strength"].default_value = 1.0
        n.inputs["Roughness"].default_value = 1.0
        if "Specular IOR Level" in n.inputs: n.inputs["Specular IOR Level"].default_value = 0.0
    for o in s.objects:
        if o.type != "MESH": continue
        o.is_shadow_catcher = False
        for sl in o.material_slots:
            sl.material = wm if (sl.material and sl.material.get("yellow")) else bk
    w = s.world.node_tree.nodes
    next(n for n in w if n.type == "BACKGROUND").inputs[1].default_value = 0.0
    s.view_settings.view_transform = "Standard"
    try: s.view_settings.look = "None"
    except TypeError: pass
    s.view_settings.exposure = 0.0
    s.render.film_transparent = False
    s.cycles.samples = 24
    s.cycles.use_denoising = False
    s.render.image_settings.color_mode = "RGB"
    s.render.image_settings.color_depth = "8"
    s.render.filepath = path
    bpy.ops.render.render(write_still=True)


def save_blend(path):
    bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)


def ring_prism(name, outer, inner, z0, z1, material=None, assembly=None):
    """Annulus extruded: outer/inner are equal-length point lists in the same winding."""
    bm = bmesh.new()
    n = len(outer)
    ob = [bm.verts.new((x, y, z0)) for x, y in outer]
    ot = [bm.verts.new((x, y, z1)) for x, y in outer]
    ib = [bm.verts.new((x, y, z0)) for x, y in inner]
    it = [bm.verts.new((x, y, z1)) for x, y in inner]
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((ot[i], ot[j], it[j], it[i]))   # top
        bm.faces.new((ib[i], ib[j], ob[j], ob[i]))   # bottom
        bm.faces.new((ob[i], ob[j], ot[j], ot[i]))   # outer wall
        bm.faces.new((it[i], it[j], ib[j], ib[i]))   # inner wall
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return from_bm(name, bm, material, assembly)


def strip(name, left, right, thick, material=None, assembly=None):
    """Ribbon between two 3D polylines (same length), top at given z, bottom = top - thick. Closed solid."""
    bm = bmesh.new()
    n = len(left)
    L = [bm.verts.new(p) for p in left]
    Rr = [bm.verts.new(p) for p in right]
    Lb = [bm.verts.new((p[0], p[1], p[2] - thick)) for p in left]
    Rb = [bm.verts.new((p[0], p[1], p[2] - thick)) for p in right]
    for i in range(n - 1):
        bm.faces.new((L[i], L[i + 1], Rr[i + 1], Rr[i]))      # top
        bm.faces.new((Lb[i], Rb[i], Rb[i + 1], Lb[i + 1]))     # bottom
        bm.faces.new((L[i], Lb[i], Lb[i + 1], L[i + 1]))       # left wall
        bm.faces.new((Rr[i], Rr[i + 1], Rb[i + 1], Rb[i]))     # right wall
    bm.faces.new((L[0], Rr[0], Rb[0], Lb[0]))
    bm.faces.new((L[-1], Lb[-1], Rb[-1], Rr[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return from_bm(name, bm, material, assembly)


def catmull(pts, n=300):
    """Smooth 2D/3D polyline through pts, resampled evenly by arc length -> list of tuples."""
    P = [Vector(p) for p in pts]
    P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
    dense = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for s in range(40):
            t = s / 40
            dense.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    dense.append(P[-2])
    cum = [0.0]
    for a, b in zip(dense, dense[1:]): cum.append(cum[-1] + (b - a).length)
    out = []
    j = 0
    for k in range(n + 1):
        d = cum[-1] * k / n
        while j < len(cum) - 2 and cum[j + 1] < d: j += 1
        u = (d - cum[j]) / max(1e-9, cum[j + 1] - cum[j])
        out.append(dense[j].lerp(dense[j + 1], u))
    return out, cum[-1]


def z_gradient(m, z0, z1, c0, c1, rough=None):
    """Drive Principled base colour from object-space Z (z0 -> c0, z1 -> c1)."""
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sp = nt.nodes.new("ShaderNodeSeparateXYZ")
    mr = nt.nodes.new("ShaderNodeMapRange")
    cr = nt.nodes.new("ShaderNodeValToRGB")
    nt.links.new(tc.outputs["Object"], sp.inputs[0])
    nt.links.new(sp.outputs["Z"], mr.inputs["Value"])
    mr.inputs["From Min"].default_value = z0
    mr.inputs["From Max"].default_value = z1
    nt.links.new(mr.outputs["Result"], cr.inputs["Fac"])
    cr.color_ramp.elements[0].color = lin(c0) + [1]
    cr.color_ramp.elements[1].color = lin(c1) + [1]
    nt.links.new(cr.outputs["Color"], b.inputs["Base Color"])
