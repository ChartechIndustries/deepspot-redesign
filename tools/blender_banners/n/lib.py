import bpy, bmesh, math, os, sys, runpy
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "assets")


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hexcol(h, a=1.0):
    h = h.lstrip("#")
    return (lin(int(h[0:2], 16) / 255), lin(int(h[2:4], 16) / 255), lin(int(h[4:6], 16) / 255), a)


def args():
    return sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for c in list(bpy.data.collections):
        bpy.data.collections.remove(c)


def setup_render(w=1600, h=1600, samples=160):
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    p = bpy.context.preferences.addons["cycles"].preferences
    p.compute_device_type = "OPTIX"
    p.get_devices()
    for d in p.devices:
        d.use = d.type == "OPTIX"
    s.cycles.device = "GPU"
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    s.cycles.tile_size = 1024 if hasattr(s.cycles, "tile_size") else 1024
    s.render.resolution_x, s.render.resolution_y = w, h
    s.render.resolution_percentage = 100
    s.render.film_transparent = True
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGBA"
    s.render.image_settings.color_depth = "16"
    vs = s.view_settings
    vs.view_transform = "AgX"
    vs.exposure = -0.45
    items = [i.identifier for i in vs.bl_rna.properties["look"].enum_items]
    for i in items:
        if "Medium High Contrast" in i:
            vs.look = i
    s.cycles.max_bounces = 8
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    # world: cool dim ambient
    wd = bpy.data.worlds.new("W")
    wd.use_nodes = True
    bg = next(n for n in wd.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs["Color"].default_value = hexcol("#3a5388")
    bg.inputs["Strength"].default_value = 0.35
    s.world = wd


def mat(name, color, rough=0.5, metal=0.0, coat=0.0, emit=None, emit_strength=0.0, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Base Color"].default_value = hexcol(color) if isinstance(color, str) else color
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if coat:
        b.inputs["Coat Weight"].default_value = coat
        b.inputs["Coat Roughness"].default_value = 0.08
    if emit:
        b.inputs["Emission Color"].default_value = hexcol(emit)
        b.inputs["Emission Strength"].default_value = emit_strength
    for k, v in kw.items():
        b.inputs[k.replace("_", " ")].default_value = v
    return m


def image_mat(name, path, size_xy, rough=0.6, flip_v=False):
    """Top-projected image on a thin box built at real size (object coords in metres)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Roughness"].default_value = rough
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / size_xy[0], (-1 if flip_v else 1) / size_xy[1], 1)
    mp.inputs["Location"].default_value = (0.5, 0.5 if not flip_v else 0.5, 0)
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(path)
    img.image.colorspace_settings.name = "sRGB"
    img.extension = "EXTEND"
    img.interpolation = "Cubic"
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], img.inputs["Vector"])
    nt.links.new(img.outputs["Color"], b.inputs["Base Color"])
    add_bump(m, 900.0, 0.12, 6.0, (1, 1, 1))
    return m


def link(o):
    bpy.context.scene.collection.objects.link(o)
    return o


def from_bm(name, bm, material=None, loc=(0, 0, 0), rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    link(o)
    o.location = loc
    o.rotation_euler = rot
    if material:
        o.data.materials.append(material)
    return o


def apply_mods(o):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = o.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(ev)
    old = o.data
    o.modifiers.clear()
    o.data = me
    if old.users == 0:
        bpy.data.meshes.remove(old)
    return o


def smooth_angle(o, deg=32):
    bm = bmesh.new()
    bm.from_mesh(o.data)
    for e in bm.edges:
        e.smooth = True
        if len(e.link_faces) == 2 and e.calc_face_angle(0) > math.radians(deg):
            e.smooth = False
        if len(e.link_faces) != 2:
            e.smooth = False if len(e.link_faces) == 1 else e.smooth
    for f in bm.faces:
        f.smooth = True
    bm.to_mesh(o.data)
    bm.free()


def bevel(o, w=0.002, seg=3, angle=35):
    m = o.modifiers.new("Bevel", "BEVEL")
    m.width = w
    m.segments = seg
    m.limit_method = "ANGLE"
    m.angle_limit = math.radians(angle)
    apply_mods(o)
    smooth_angle(o)
    return o


def rbox(name, size, loc=(0, 0, 0), rot=(0, 0, 0), material=None, bev=0.002, seg=3, assembly=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector(size), verts=bm.verts)
    o = from_bm(name, bm, material, loc, rot)
    if bev:
        bevel(o, min(bev, min(size) * 0.45), seg)
    else:
        smooth_angle(o)
    if assembly:
        o["assembly"] = assembly
    return o


def cyl(name, r, h, loc=(0, 0, 0), rot=(0, 0, 0), material=None, bev=0.002, seg=3, verts=64, assembly=None, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=verts, radius1=r, radius2=(r if r2 is None else r2), depth=h)
    o = from_bm(name, bm, material, loc, rot)
    if bev:
        bevel(o, min(bev, r * 0.45, h * 0.45), seg)
    else:
        smooth_angle(o)
    if assembly:
        o["assembly"] = assembly
    return o


def sphere(name, r, loc=(0, 0, 0), material=None, seg=64, rings=32, assembly=None):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=r)
    o = from_bm(name, bm, material, loc)
    for f in o.data.polygons:
        f.use_smooth = True
    if assembly:
        o["assembly"] = assembly
    return o


def floor(material=None, size=6.0, z=0.0):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=size)
    o = from_bm("floor", bm, material, (0, 0, z))
    o.is_shadow_catcher = True
    return o


def look_at(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def camera(loc, target, lens, shift=(0, 0)):
    cd = bpy.data.cameras.new("cam")
    cd.lens = lens
    cd.sensor_width = 36
    cd.shift_x, cd.shift_y = shift
    c = bpy.data.objects.new("cam", cd)
    link(c)
    c.location = loc
    look_at(c, target)
    bpy.context.scene.camera = c
    return c


def area(name, loc, target, energy, size, color="#ffffff", kelvin=None, shape="RECTANGLE"):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy = energy
    ld.size = size
    ld.shape = "SQUARE"
    ld.color = hexcol(color)[:3]
    o = bpy.data.objects.new(name, ld)
    link(o)
    o.location = loc
    look_at(o, target)
    return o


def kelvin_rgb(k):
    t = k / 100.0
    r = 255 if t <= 66 else max(0, min(255, 329.698727446 * ((t - 60) ** -0.1332047592)))
    g = max(0, min(255, 99.4708025861 * math.log(t) - 161.1195681661)) if t <= 66 else max(0, min(255, 288.1221695283 * ((t - 60) ** -0.0755148492)))
    b = 255 if t >= 66 else (0 if t <= 19 else max(0, min(255, 138.5177312231 * math.log(t - 10) - 305.0447927307)))
    return "#%02x%02x%02x" % (int(r), int(g), int(b))


def std_lights(center, scale=1.0, key=260, fill=70, rim=140):
    cx, cy, cz = center
    area("key", (cx - 0.9 * scale, cy - 0.9 * scale, cz + 1.1 * scale), center, key * scale * scale, 0.42 * scale, kelvin_rgb(5300))
    area("fill", (cx + 1.0 * scale, cy - 0.7 * scale, cz + 0.5 * scale), center, fill * scale * scale, 1.2 * scale, "#bcd0ff")
    r = area("rim", (cx + 0.6 * scale, cy + 1.1 * scale, cz + 0.8 * scale), center, rim * scale * scale, 0.5 * scale, "#7f9bff")
    r.data.use_shadow = False
    r2 = area("rim2", (cx - 1.0 * scale, cy + 0.8 * scale, cz + 0.6 * scale), center, rim * 0.8 * scale * scale, 0.5 * scale, "#9fb4ff")
    r2.data.use_shadow = False


def finish(out_png, blend_path, render=True, preview=False):
    from_check = runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"]()
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    s = bpy.context.scene
    if preview:
        s.render.resolution_x, s.render.resolution_y = 480, 480
        s.cycles.samples = 24
    s.render.filepath = out_png
    if render:
        bpy.ops.render.render(write_still=True)
    return from_check


def params(name, d, sx, sy):
    import json
    p = os.path.join(HERE, "params_%s.json" % name)
    if os.path.exists(p):
        j = json.load(open(p))
        return j["d"], j["sx"], j["sy"]
    return d, sx, sy


def add_bump(m, scale=300.0, strength=0.15, detail=8.0, stretch=(1, 1, 1), coord="Object", rough_var=0.0):
    nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = stretch
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = detail
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = strength
    bp.inputs["Distance"].default_value = 0.001
    nt.links.new(tc.outputs[coord], mp.inputs["Vector"])
    nt.links.new(mp.outputs["Vector"], nz.inputs["Vector"])
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    if rough_var:
        base = b.inputs["Roughness"].default_value
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["To Min"].default_value = max(0.0, base - rough_var)
        mr.inputs["To Max"].default_value = min(1.0, base + rough_var)
        nt.links.new(nz.outputs["Fac"], mr.inputs["Value"])
        nt.links.new(mr.outputs["Result"], b.inputs["Roughness"])
    return m
