"""Shared helpers for banner C scenes (headless Blender 5.x). Import with sys.path insert."""
import bpy, bmesh, math, sys, os, runpy, time
from mathutils import Vector, Matrix, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
HDRI = os.path.join(HERE, "assets", "photo_studio_01_1k.hdr")
ARIALBD = r"C:\Windows\Fonts\arialbd.ttf"
BG_HEX = "#07d653"


def argv():
    a = sys.argv
    return a[a.index("--") + 1:] if "--" in a else []


def srgb_to_lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexlin(h, a=1.0):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return (srgb_to_lin(r), srgb_to_lin(g), srgb_to_lin(b), a)


def kelvin_rgb(k):
    t = k / 100.0
    r = 255 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    cl = lambda v: max(0, min(255, v)) / 255
    return tuple(srgb_to_lin(cl(v)) for v in (r, g, b))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


# ---------------------------------------------------------------- materials
def _set(bsdf, names, value):
    for n in names if isinstance(names, (list, tuple)) else [names]:
        if n in bsdf.inputs:
            bsdf.inputs[n].default_value = value
            return True
    return False


def pbr(name, color, metallic=0.0, rough=0.5, coat=0.0, coat_rough=0.05, sheen=0.0, emit=None, emit_strength=0.0, spec=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    col = hexlin(color) if isinstance(color, str) else color
    _set(b, "Base Color", col)
    _set(b, "Metallic", metallic)
    _set(b, "Roughness", rough)
    if coat:
        _set(b, ["Coat Weight", "Clearcoat"], coat)
        _set(b, ["Coat Roughness", "Clearcoat Roughness"], coat_rough)
    if sheen:
        _set(b, ["Sheen Weight", "Sheen"], sheen)
        _set(b, ["Sheen Roughness"], 0.5)
    if spec is not None:
        _set(b, ["Specular IOR Level", "Specular"], spec)
    if emit:
        _set(b, ["Emission Color", "Emission"], hexlin(emit) if isinstance(emit, str) else emit)
        _set(b, "Emission Strength", emit_strength)
    return m


def gold(name="gold", rough=0.2):
    return pbr(name, (1.0, 0.735, 0.26, 1), metallic=1.0, rough=rough)


# ---------------------------------------------------------------- mesh helpers
def finish_obj(ob, bevel=None, smooth=True, split=30, assembly=None):
    me = ob.data
    if smooth:
        try:
            me.shade_smooth()
        except Exception:
            me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    if bevel:
        w, seg = bevel
        mod = ob.modifiers.new("Bevel", "BEVEL")
        mod.width = w
        mod.segments = seg
        mod.limit_method = "ANGLE"
        mod.angle_limit = math.radians(30)
    if split:
        es = ob.modifiers.new("EdgeSplit", "EDGE_SPLIT")
        es.split_angle = math.radians(split)
    if assembly:
        ob["assembly"] = assembly
    return ob


def obj_from_bm(name, bm, mats=None, loc=(0, 0, 0), rot=(0, 0, 0), bevel=None, smooth=True, split=30, assembly=None, parent=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = rot
    for m in (mats or []):
        me.materials.append(m)
    if parent is not None:
        ob.parent = parent
    return finish_obj(ob, bevel, smooth, split, assembly)


def bm_box(sx, sy, sz):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    return bm


def bm_cyl(r1, r2, h, seg=48, cap=True):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, cap_tris=False, segments=seg, radius1=r1, radius2=r2, depth=h)
    return bm


def bm_sphere(r, seg=48, rings=24):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    return bm


def bm_ico(r, sub=2):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    return bm


def bm_lathe(profile, seg=64, tol=1e-7):
    """profile: list of (r, z) from axis to axis (closed solid). Returns bmesh."""
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    for a, b in zip(vs[:-1], vs[1:]):
        bm.edges.new((a, b))
    bmesh.ops.spin(bm, geom=list(bm.verts) + list(bm.edges), cent=(0, 0, 0), axis=(0, 0, 1), dvec=(0, 0, 0),
                   angle=2 * math.pi, steps=seg, use_merge=False, use_normal_flip=False, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=tol)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def rounded_rect_profile(r_in, r_out, z0, z1, b, n=3):
    """Closed ring profile (r,z) with rounded corners radius b; r_in may be 0 (solid disc handled by caller)."""
    pts = []
    def corner(cx, cz, a0, a1):
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append((cx + b * math.cos(a), cz + b * math.sin(a)))
    corner(r_out - b, z0 + b, -90, 0)
    corner(r_out - b, z1 - b, 0, 90)
    corner(r_in + b, z1 - b, 90, 180)
    corner(r_in + b, z0 + b, 180, 270)
    pts.append(pts[0])
    return pts


def bake(ob):
    """Return a new mesh datablock with modifiers applied (world scale/loc untouched)."""
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    return bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=dg)


def bake_in_place(ob):
    me = bake(ob)
    for m in list(ob.modifiers):
        ob.modifiers.remove(m)
    old = ob.data
    ob.data = me
    if old.users == 0:
        bpy.data.meshes.remove(old)
    return ob


def text_mesh(text, size, depth, bevel_depth=0.0, mat=None, name="txt", assembly=None):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = text
    cu.font = bpy.data.fonts.load(ARIALBD)
    cu.size = size
    cu.extrude = depth / 2
    cu.bevel_depth = bevel_depth
    cu.bevel_resolution = 2
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), depsgraph=dg)
    bpy.data.objects.remove(ob)
    bpy.data.curves.remove(cu)
    ob2 = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob2)
    if mat:
        me.materials.append(mat)
    finish_obj(ob2, None, True, 30, assembly)
    return ob2


# ---------------------------------------------------------------- render / world / lights
def setup_render(samples=160, pct=100, transparent=True):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    pr = bpy.context.preferences.addons["cycles"].preferences
    pr.compute_device_type = "OPTIX"
    pr.get_devices()
    used = []
    for d in pr.devices:
        d.use = d.type == "OPTIX"
        if d.use:
            used.append(d.name)
    print("DEVICES", used)
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = "OPTIX"
    except Exception:
        pass
    sc.cycles.max_bounces = 10
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.sample_clamp_indirect = 8
    sc.render.resolution_x = 1920
    sc.render.resolution_y = 1200
    sc.render.resolution_percentage = pct
    sc.render.film_transparent = transparent
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    sc.render.use_motion_blur = False
    vs = sc.view_settings
    vs.view_transform = "AgX"
    vs.look = "AgX - Medium High Contrast"
    print("VIEW", vs.view_transform, vs.look)
    return sc


def setup_world(strength=1.0, rot_z=0.0):
    w = bpy.data.worlds.new("World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    env = nt.nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(HDRI)
    mp = nt.nodes.new("ShaderNodeMapping")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp.inputs["Rotation"].default_value = (0, 0, rot_z)
    nt.links.new(tc.outputs["Generated"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    nt.links.new(env.outputs["Color"], bg.inputs["Color"])
    bg.inputs["Strength"].default_value = strength
    nt.links.new(bg.outputs["Background"], out.inputs["Surface"])


def add_floor(color="#07d653", size=60.0, catcher=True, name="floor"):
    bm = bm_box(size, size, 0.2)
    m = pbr("floor_mat", color, rough=0.9)
    ob = obj_from_bm(name, bm, [m], loc=(0, 0, -0.1), smooth=False, split=0)
    if catcher:
        ob.is_shadow_catcher = True
    return ob


def area_light(name, loc, target, size, energy, kelvin=5300, shape="RECTANGLE", size_y=None, color=None):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = shape
    ld.size = size
    if shape == "RECTANGLE":
        ld.size_y = size_y or size
    ld.energy = energy
    ld.color = color or kelvin_rgb(kelvin)[:3]
    ob = bpy.data.objects.new(name, ld)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    return ob


def make_camera(loc, target, lens, shift=(0, 0), name="cam"):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_width = 36
    cd.sensor_fit = "HORIZONTAL"
    cd.shift_x, cd.shift_y = shift
    cd.clip_start = 0.01
    cd.clip_end = 200
    ob = bpy.data.objects.new(name, cd)
    bpy.context.scene.collection.objects.link(ob)
    ob.location = loc
    d = Vector(target) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = ob
    return ob


def clipcheck(tol=0.004):
    return runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"](tol=tol)


def render_to(path):
    sc = bpy.context.scene
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print("RENDERED", path, round(time.time() - t, 1), "s")


def bounds_of(obs):
    """World bounds from evaluated vertices (modifiers included; meshes only)."""
    dg = bpy.context.evaluated_depsgraph_get()
    lo = Vector((1e9,) * 3)
    hi = Vector((-1e9,) * 3)
    for o in obs:
        if o.type != "MESH":
            continue
        ev = o.evaluated_get(dg)
        me = ev.to_mesh()
        mw = o.matrix_world
        for v in me.vertices:
            w = mw @ v.co
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
        ev.to_mesh_clear()
    return lo, hi


def qa_views(prefix, center, dist, lens, outdir, pct=50, samples=64):
    """Extra QA cameras: 3/4 high, low side, top. Renders each (opaque green so reading is easy)."""
    sc = bpy.context.scene
    sc.render.film_transparent = False
    sc.cycles.samples = samples
    sc.render.resolution_percentage = pct
    c = Vector(center)
    views = {"hi34": (dist * 0.7, -dist * 0.7, dist * 0.7), "lowside": (dist, 0.0, dist * 0.08), "back34": (-dist * 0.7, dist * 0.7, dist * 0.5)}
    for k, off in views.items():
        cam = make_camera(c + Vector(off), c, lens, name="qa_" + k)
        render_to(os.path.join(outdir, f"{prefix}_{k}.png"))


MOLE_BLEND = r"C:\Users\CharD\Downloads\BLOOD1.blend"
MOLE_BASE = ["Body", "Legs", "Claw1", "Claw 2", "Claw 3", "Notes", "Whisker1", "Whisker2", "Whisker3", "Whisker4", "Head", "Body2", "Sphere.001"]


def load_mole(extra=("Partyhat",), shirt=None):
    """Append the mole base + chosen extras (names of objects). Returns (list of objects, empty parent)."""
    want = set(MOLE_BASE) | set(extra) | ({shirt} if shirt else set())
    with bpy.data.libraries.load(MOLE_BLEND, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n in want]
    sc = bpy.context.scene
    obs = []
    for o in dst.objects:
        if o is None:
            continue
        sc.collection.objects.link(o)
        obs.append(o)
    return obs
