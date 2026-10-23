"""Shared helpers for W banners (headless Blender 5.2)."""
import bpy, bmesh, math, os, sys, time, runpy
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")
NAVY = (0x0b / 255, 0x1a / 255, 0x2e / 255)


def srgb(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c]
    return (*c, 1.0)


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def setup_render(w=1920, h=1200, samples=160, transparent=False):
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = (d.type == "OPTIX")
    s.cycles.device = "GPU"
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    try:
        s.cycles.denoiser = "OPTIX"
    except Exception:
        pass
    s.cycles.use_adaptive_sampling = True
    s.cycles.max_bounces = 8
    s.cycles.volume_bounces = 2
    s.cycles.tile_size = 1024
    s.render.resolution_x, s.render.resolution_y = w, h
    s.render.resolution_percentage = 100
    s.render.film_transparent = transparent
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    s.view_settings.view_transform = "AgX"
    looks = [i.identifier for i in s.view_settings.bl_rna.properties["look"].enum_items]
    for l in looks:
        if "Medium High Contrast" in l:
            s.view_settings.look = l
    return s


def world(color=NAVY, strength=1.0):
    w = bpy.data.worlds.new("W")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = next(n for n in nt.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = (*color, 1)
    bg.inputs["Strength"].default_value = strength
    return w


def _img(nt, name, srgb_=True):
    n = nt.nodes.new("ShaderNodeTexImage")
    p = os.path.join(ASSETS, name)
    n.image = bpy.data.images.load(p)
    n.image.colorspace_settings.name = "sRGB" if srgb_ else "Non-Color"
    n.projection = "BOX"
    n.projection_blend = 0.25
    return n


def tex_mat(name, folder, tile_m=2.0, tint=None, tint_mix=0.0, sat=1.0, val=1.0,
            bump=0.6, rough_mul=1.0, emission=None):
    """PBR box-projected on object coords; texture covers tile_m metres."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / tile_m,) * 3
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    d = _img(nt, folder + "/diff.jpg")
    r = _img(nt, folder + "/rough.jpg", False)
    nrm = _img(nt, folder + "/nor.jpg", False)
    for t in (d, r, nrm):
        nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
    col = d.outputs["Color"]
    hs = nt.nodes.new("ShaderNodeHueSaturation")
    hs.inputs["Saturation"].default_value = sat
    hs.inputs["Value"].default_value = val
    nt.links.new(col, hs.inputs["Color"])
    col = hs.outputs["Color"]
    if tint is not None and tint_mix > 0:
        mx = nt.nodes.new("ShaderNodeMix")
        mx.data_type = "RGBA"
        mx.blend_type = "MULTIPLY"
        mx.inputs["Factor"].default_value = tint_mix
        nt.links.new(col, mx.inputs["A"])
        mx.inputs["B"].default_value = (*tint, 1)
        col = mx.outputs["Result"]
    nt.links.new(col, bs.inputs["Base Color"])
    rr = nt.nodes.new("ShaderNodeMath")
    rr.operation = "MULTIPLY"
    rr.inputs[1].default_value = rough_mul
    nt.links.new(r.outputs["Color"], rr.inputs[0])
    nt.links.new(rr.outputs["Value"], bs.inputs["Roughness"])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = bump
    nt.links.new(nrm.outputs["Color"], nm.inputs["Color"])
    nt.links.new(nm.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs["BSDF"], out.inputs["Surface"])
    return m


def solid(name, color, rough=0.5, metal=0.0, emission=None, em_strength=0, coat=0.0, spec=0.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bs = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    c = color if len(color) == 4 else (*color, 1)
    bs.inputs["Base Color"].default_value = c
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    if coat:
        bs.inputs["Coat Weight"].default_value = coat
    if emission is not None:
        bs.inputs["Emission Color"].default_value = (*emission, 1)
        bs.inputs["Emission Strength"].default_value = em_strength
    return m


def smooth(o, angle=40):
    for p in o.data.polygons:
        p.use_smooth = True
    try:
        o.data.set_sharp_from_angle(angle=math.radians(angle))
    except Exception:
        pass


def bevel(o, w=0.02, seg=2, angle=35, apply=False):
    m = o.modifiers.new("Bevel", "BEVEL")
    m.width = w
    m.segments = seg
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle)
    if apply:
        bpy.context.view_layer.objects.active = o
        o.select_set(True)
        bpy.ops.object.modifier_apply(modifier=m.name)
    return m


def box(name, size, loc, mat=None, bev=0.02, rot=(0, 0, 0), collection=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        o.data.materials.append(mat)
    if bev:
        bevel(o, bev)
    smooth(o)
    return o


def cyl(name, r, h, loc, mat=None, bev=0.01, verts=48, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=loc, rotation=rot)
    o = bpy.context.active_object
    o.name = name
    if mat:
        o.data.materials.append(mat)
    if bev:
        bevel(o, bev)
    smooth(o)
    return o


def apply_all(o):
    bpy.context.view_layer.objects.active = o
    for ob in bpy.context.selected_objects:
        ob.select_set(False)
    o.select_set(True)
    for m in list(o.modifiers):
        try:
            bpy.ops.object.modifier_apply(modifier=m.name)
        except Exception as e:
            print("apply fail", o.name, m.name, e)


def boolean_diff(o, cutter, apply=True):
    m = o.modifiers.new("Cut", "BOOLEAN")
    m.operation = "DIFFERENCE"
    m.object = cutter
    m.solver = "EXACT"
    if apply:
        bpy.context.view_layer.objects.active = o
        for ob in bpy.context.selected_objects:
            ob.select_set(False)
        o.select_set(True)
        bpy.ops.object.modifier_apply(modifier=m.name)


def area_light(name, loc, target, size, energy, color=(1, 1, 1), shape="RECTANGLE", size_y=None, kelvin=None):
    d = bpy.data.lights.new(name, "AREA")
    d.shape = shape
    d.size = size
    if size_y:
        d.size_y = size_y
    d.energy = energy
    d.color = color
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    aim(o, target)
    return o


def point_light(name, loc, energy, color, radius=0.1):
    d = bpy.data.lights.new(name, "POINT")
    d.energy = energy
    d.color = color
    d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return o


def spot_light(name, loc, target, energy, color, spot_deg=60, blend=0.5, radius=0.1):
    d = bpy.data.lights.new(name, "SPOT")
    d.energy = energy
    d.color = color
    d.spot_size = math.radians(spot_deg)
    d.spot_blend = blend
    d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    aim(o, target)
    return o


def aim(o, target):
    d = Vector(target) - Vector(o.location)
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens=85, ortho=None, shift=(0, 0)):
    d = bpy.data.cameras.new("Cam")
    d.lens = lens
    d.sensor_width = 36
    d.sensor_fit = "HORIZONTAL"
    d.shift_x, d.shift_y = shift
    if ortho:
        d.type = "ORTHO"
        d.ortho_scale = ortho
    o = bpy.data.objects.new("Cam", d)
    bpy.context.collection.objects.link(o)
    o.location = loc
    aim(o, target)
    bpy.context.scene.camera = o
    return o


def kelvin(k):
    """approx blackbody -> linear rgb (0..1)"""
    t = k / 100.0
    r = 255 if t <= 66 else 329.698727446 * ((t - 60) ** -0.1332047592)
    g = 99.4708025861 * math.log(t) - 161.1195681661 if t <= 66 else 288.1221695283 * ((t - 60) ** -0.0755148492)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5177312231 * math.log(t - 10) - 305.0447927307)
    c = [max(0, min(255, v)) / 255 for v in (r, g, b)]
    return tuple((x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c)


def figure(name, loc, height=1.75, rot_z=0.0, jacket=None, skin=None, pants=None, pose="stand"):
    """Stylised mannequin: skin-modifier body (one smooth mesh) + sphere head.
    Feet at loc.z. Returns list of objects."""
    s = height / 1.75
    # skeleton verts (x right, y forward, z up), metres at 1.75 m
    V = {
        "pelvis": (0, 0, 0.95), "chest": (0, 0, 1.38), "neck": (0, 0, 1.52),
        "lhip": (-0.10, 0, 0.92), "rhip": (0.10, 0, 0.92),
        "lknee": (-0.10, 0.02, 0.50), "rknee": (0.10, -0.02, 0.50),
        "lfoot": (-0.10, 0.03, 0.06), "rfoot": (0.10, -0.03, 0.06),
        "lsh": (-0.20, 0, 1.43), "rsh": (0.20, 0, 1.43),
        "lel": (-0.25, 0.04, 1.14), "rel": (0.27, 0.10, 1.18),
        "lhand": (-0.26, 0.10, 0.90), "rhand": (0.30, 0.34, 1.16),
    }
    E = [("pelvis", "chest"), ("chest", "neck"), ("pelvis", "lhip"), ("pelvis", "rhip"),
         ("lhip", "lknee"), ("lknee", "lfoot"), ("rhip", "rknee"), ("rknee", "rfoot"),
         ("chest", "lsh"), ("chest", "rsh"), ("lsh", "lel"), ("lel", "lhand"), ("rsh", "rel"), ("rel", "rhand")]
    R = {"pelvis": .12, "chest": .15, "neck": .045, "lhip": .085, "rhip": .085, "lknee": .06, "rknee": .06,
         "lfoot": .05, "rfoot": .05, "lsh": .055, "rsh": .055, "lel": .045, "rel": .045, "lhand": .04, "rhand": .04}
    me = bpy.data.meshes.new(name + "_m")
    names = list(V)
    me.from_pydata([tuple(c * s for c in V[n]) for n in names], [(names.index(a), names.index(b)) for a, b in E], [])
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    sk = o.modifiers.new("Skin", "SKIN")
    bpy.context.view_layer.objects.active = o
    for i, n in enumerate(names):
        me.skin_vertices[0].data[i].radius = (R[n] * s, R[n] * s * 0.8)
    me.skin_vertices[0].data[names.index("pelvis")].use_root = True
    sb = o.modifiers.new("Sub", "SUBSURF")
    sb.levels = 2
    sb.render_levels = 2
    o.location = loc
    o.rotation_euler = (0, 0, rot_z)
    o.data.materials.append(jacket)
    apply_all(o)
    smooth(o)
    # head
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.105 * s, segments=32, ring_count=16,
                                         location=(0, 0.01 * s, 1.64 * s))
    h = bpy.context.active_object
    h.name = name + "_head"
    h.scale = (0.9, 1.0, 1.08)
    bpy.ops.object.transform_apply(scale=True)
    h.data.materials.append(skin)
    smooth(h)
    h.parent = o
    o["assembly"] = name
    h["assembly"] = name
    return [o, h]


def clipcheck():
    return runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"]()


def qa_cams(target, dist, lens=50, out_prefix=None, size=(960, 600)):
    """Temp cameras: 3/4 high + low side; returns list of (name, path)."""
    res = []
    s = bpy.context.scene
    orig = s.camera
    rx, ry = s.render.resolution_x, s.render.resolution_y
    s.render.resolution_x, s.render.resolution_y = size
    spots = {"qa_high": Vector(target) + Vector((dist * .6, -dist * .6, dist * .7)),
             "qa_low": Vector(target) + Vector((-dist * .9, -dist * .4, dist * .08))}
    for n, p in spots.items():
        c = camera(p, target, lens)
        s.render.filepath = f"{out_prefix}_{n}.png"
        bpy.ops.render.render(write_still=True)
        res.append(s.render.filepath)
        bpy.data.objects.remove(c)
    s.camera = orig
    s.render.resolution_x, s.render.resolution_y = rx, ry
    return res


def load_mole(parts=("Hard Hat",), base_col="Collection"):
    """Append base mole + named accessory objects from BLOOD1.blend (read only). Returns list of objects."""
    path = r"C:\Users\CharD\Downloads\BLOOD1.blend"
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.collections = [c for c in src.collections if c == base_col]
        dst.objects = [o for o in src.objects if o in parts]
    objs = []
    for c in dst.collections:
        for o in c.all_objects:
            objs.append(o)
    objs += [o for o in dst.objects if o not in objs]
    out = []
    for o in set(objs):
        if o.type in ("CAMERA", "LIGHT"):
            continue
        if o.name not in bpy.context.scene.objects:
            bpy.context.collection.objects.link(o)
        o.hide_set(False); o.hide_render = False; o.hide_viewport = False
        out.append(o)
    return out


def world_bounds(objs):
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    dg = bpy.context.evaluated_depsgraph_get()
    for o in objs:
        if o.type != "MESH":
            continue
        for vv in o.data.vertices:
            w = o.matrix_world @ vv.co
            mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    return mn, mx


def toy_tree(n, x, y, s, gz, m_pine, m_trunk):
    a = f"tree_{n}"
    tr = cyl(a + "_trunk", 0.09 * s, 0.5 * s, (x, y, gz + 0.25 * s), m_trunk, bev=0.01, verts=16)
    tr["assembly"] = a
    z = gz + 0.45 * s
    for i, (r, h) in enumerate(((0.55, 0.75), (0.42, 0.65), (0.28, 0.55))):
        bpy.ops.mesh.primitive_cone_add(radius1=r * s, radius2=0, depth=h * s, vertices=24, location=(x, y, z + h * s / 2))
        c = bpy.context.active_object
        c.name = f"{a}_cone{i}"
        c.data.materials.append(m_pine)
        bevel(c, 0.012 * s)
        smooth(c)
        c["assembly"] = a
        z += h * s * 0.55


def toy_rock(n, x, y, r, rz, gz, mat):
    bpy.ops.mesh.primitive_ico_sphere_add(radius=r, subdivisions=2, location=(x, y, gz + r * 0.55))
    o = bpy.context.active_object
    o.name = f"rock_{n}"
    o.scale = (1.0, 0.8, 0.6)
    o.rotation_euler = (0.2, 0.1, rz)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    o.location.z = gz - min(v.co.z for v in o.data.vertices)
    o.data.materials.append(mat)
    bevel(o, 0.02)
    smooth(o, 60)
    return o


# ---------------------------------------------------------------- strata / pick-mark tuff
def _math(nt, op, a=None, b=None, clamp=False):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    n.use_clamp = clamp
    if a is not None:
        if isinstance(a, (int, float)):
            n.inputs[0].default_value = a
        else:
            nt.links.new(a, n.inputs[0])
    if b is not None:
        if isinstance(b, (int, float)):
            n.inputs[1].default_value = b
        else:
            nt.links.new(b, n.inputs[1])
    return n.outputs["Value"]


def _noise(nt, vec_socket, scale_xyz, nscale=1.0, detail=2.0, rough=0.5):
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = scale_xyz
    nt.links.new(vec_socket, mp.inputs["Vector"])
    n = nt.nodes.new("ShaderNodeTexNoise")
    n.noise_dimensions = "3D"
    n.inputs["Scale"].default_value = nscale
    n.inputs["Detail"].default_value = detail
    n.inputs["Roughness"].default_value = rough
    nt.links.new(mp.outputs["Vector"], n.inputs["Vector"])
    return n.outputs["Fac"]


def _mix(nt, fac, a, b):
    m = nt.nodes.new("ShaderNodeMix")
    m.data_type = "RGBA"
    if isinstance(fac, (int, float)):
        m.inputs["Factor"].default_value = fac
    else:
        nt.links.new(fac, m.inputs["Factor"])
    for k, v in (("A", a), ("B", b)):
        if isinstance(v, tuple):
            m.inputs[k].default_value = v
        else:
            nt.links.new(v, m.inputs[k])
    return m.outputs["Result"]


def pick_nodes(nt, vec, base, dark, bands_z=10.0, marks_z=30.0, lateral=1.0):
    """Pale tuff with horizontal pick-mark bands. returns (color, height)."""
    bands = _noise(nt, vec, (0.45 * lateral, 0.45 * lateral, bands_z), 1.0, 3.0, 0.6)
    marks = _noise(nt, vec, (5.0 * lateral, 5.0 * lateral, marks_z), 1.0, 5.0, 0.6)
    fine = _noise(nt, vec, (40.0, 40.0, 40.0), 1.0, 3.0, 0.6)
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.35
    cr.color_ramp.elements[1].position = 0.65
    cr.color_ramp.elements[0].color = (*dark, 1)
    cr.color_ramp.elements[1].color = (*base, 1)
    nt.links.new(bands, cr.inputs["Fac"])
    col = _mix(nt, _math(nt, "MULTIPLY", marks, 0.45), cr.outputs["Color"], (*dark, 1))
    h = _math(nt, "ADD", _math(nt, "MULTIPLY", bands, 0.35), _math(nt, "ADD", _math(nt, "MULTIPLY", marks, 0.55), _math(nt, "MULTIPLY", fine, 0.1)))
    return col, h


def tuff_pick_mat(name, base=(0.80, 0.66, 0.46), dark=(0.45, 0.34, 0.22), bump=1.6, bands_z=10.0, marks_z=30.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    col, h = pick_nodes(nt, tc.outputs["Object"], base, dark, bands_z, marks_z)
    nt.links.new(col, bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.9
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = bump
    bp.inputs["Distance"].default_value = 0.03
    nt.links.new(h, bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs["BSDF"], out.inputs["Surface"])
    return m


def strata_mat(name, top_z, dscale=1.0, amp=0.5):
    """Ground cross-section: dark loam / red clay / rust sandstone band / pale tuff (pick marks) / bedrock, wavy boundaries.
    Uses WORLD z (Geometry.Position) so top_z is world height of the top of the block."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bs = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    nt.links.new(geo.outputs["Position"], sep.inputs["Vector"])
    wave = _math(nt, "MULTIPLY", _math(nt, "SUBTRACT", _noise(nt, geo.outputs["Position"], (0.30, 0.30, 0.55), 1.0, 2.0, 0.5), 0.5), amp * dscale)
    depth = _math(nt, "ADD", _math(nt, "SUBTRACT", top_z, sep.outputs["Z"]), wave)

    def img_layer(folder, tile, tint, val=1.0, sat=1.0):
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (1 / tile,) * 3
        nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
        d = _img(nt, folder + "/diff.jpg")
        hh = _img(nt, folder + "/disp.jpg", False)
        for t in (d, hh):
            nt.links.new(mp.outputs["Vector"], t.inputs["Vector"])
        hs = nt.nodes.new("ShaderNodeHueSaturation")
        hs.inputs["Value"].default_value = val
        hs.inputs["Saturation"].default_value = sat
        nt.links.new(d.outputs["Color"], hs.inputs["Color"])
        c = _mix(nt, 0.5, hs.outputs["Color"], (*tint, 1))
        return c, hh.outputs["Color"]

    loam_c, loam_h = img_layer("forrest_ground_05" if os.path.isdir(os.path.join(ASSETS, "forrest_ground_05")) else "forest_ground_05", 1.2, (0.28, 0.17, 0.10), 0.55)
    clay_c, clay_h = img_layer("red_dirt_mud_01", 1.4, (0.85, 0.35, 0.18), 0.95, 1.2)
    rust_c, rust_h = img_layer("cliff_side", 1.6, (0.95, 0.55, 0.30), 0.85)
    tuff_c, tuff_h = pick_nodes(nt, tc.outputs["Object"], (0.84, 0.70, 0.50), (0.66, 0.53, 0.37), 7.0, 22.0)
    bed_c, bed_h = img_layer("brown_mud_02", 1.5, (0.30, 0.34, 0.42), 0.8)
    bounds = [0.5, 1.35, 1.95, 4.3]
    col, hgt = loam_c, loam_h
    for b, (c2, h2) in zip(bounds, ((clay_c, clay_h), (rust_c, rust_h), (tuff_c, tuff_h), (bed_c, bed_h))):
        f = _math(nt, "GREATER_THAN", depth, b * dscale)
        col = _mix(nt, f, col, c2)
        hgt = _mix(nt, f, hgt, h2)
    # thin dark seam lines at boundaries
    nt.links.new(col, bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.9
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 2.4
    bp.inputs["Distance"].default_value = 0.05
    # height socket is a colour: take its red via RGB->BW
    bw = nt.nodes.new("ShaderNodeRGBToBW")
    nt.links.new(hgt, bw.inputs["Color"])
    nt.links.new(bw.outputs["Val"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], bs.inputs["Normal"])
    nt.links.new(bs.outputs["BSDF"], out.inputs["Surface"])
    return m


def assign_interior(o, boxes, outer_x=None, outer_y=None, slot=1, zmin_exclude_top=None):
    """After a boolean: faces whose centroid is inside any (x0,x1,y0,y1,z0,z1) box and that are not on an outer plane -> material slot."""
    me = o.data
    eps = 0.015
    n = 0
    for p in me.polygons:
        c = p.center
        if any(b[0] - eps <= c.x <= b[1] + eps and b[2] - eps <= c.y <= b[3] + eps and b[4] - eps <= c.z <= b[5] + eps for b in boxes):
            if outer_x is not None and abs(c.x) > outer_x - 0.02 and abs(p.normal.x) > 0.9:
                continue
            if outer_y is not None and c.y < outer_y + 0.02 and abs(p.normal.y) > 0.9:
                continue
            if zmin_exclude_top is not None and c.z > zmin_exclude_top and p.normal.z > 0.9:
                continue
            p.material_index = slot
            n += 1
    return n
