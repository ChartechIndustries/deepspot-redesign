import bpy, bmesh, math, os, sys, random, runpy
from mathutils import Vector, Matrix, Euler
ROOT = r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h"
A = ROOT + "\\assets"


def srgb(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1,)


GREEN = srgb('07d653'); COBALT = srgb('3c60ff'); NAVY = srgb('182a43'); YELLOW = srgb('ffd400'); OFFW = srgb('eceee8')


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def setup_render(scene, samples=192, w=1920, h=1200, gpu=True):
    s = scene
    s.render.engine = 'CYCLES'
    p = bpy.context.preferences.addons['cycles'].preferences
    p.compute_device_type = 'OPTIX'
    p.get_devices()
    for d in p.devices:
        d.use = (d.type == 'OPTIX')
    s.cycles.device = 'GPU' if gpu else 'CPU'
    s.cycles.samples = samples
    s.cycles.use_denoising = True
    s.cycles.max_bounces = 12
    s.cycles.transmission_bounces = 16
    s.cycles.glossy_bounces = 8
    s.cycles.sample_clamp_indirect = 6
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.render.resolution_x = w
    s.render.resolution_y = h
    s.render.resolution_percentage = 100
    s.render.film_transparent = True
    s.render.image_settings.file_format = 'PNG'
    s.render.image_settings.color_mode = 'RGBA'
    vt = [i.identifier for i in s.view_settings.bl_rna.properties['view_transform'].enum_items if 'AgX' in i.identifier]
    if vt:
        s.view_settings.view_transform = vt[0]
    looks = [i.identifier for i in s.view_settings.bl_rna.properties['look'].enum_items]
    ml = [l for l in looks if 'Medium High' in l]
    if ml:
        s.view_settings.look = ml[0]


def world_hdri(scene, name='photo_studio_01_1k.hdr', strength=0.5, rot=0.0):
    w = bpy.data.worlds.new('W')
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    env = nt.nodes.new('ShaderNodeTexEnvironment')
    env.image = bpy.data.images.load(A + '\\hdri\\' + name)
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Rotation'].default_value = (0, 0, rot)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.inputs['Strength'].default_value = strength
    out = nt.nodes.new('ShaderNodeOutputWorld')
    nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], env.inputs['Vector'])
    nt.links.new(env.outputs['Color'], bg.inputs['Color'])
    nt.links.new(bg.outputs['Background'], out.inputs['Surface'])


def catcher(size=6, z=0.0):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 0, z))
    o = bpy.context.object
    o.name = 'ShadowCatcher'
    o.is_shadow_catcher = True
    return o


def kelvin_rgb(k):
    t = k / 100
    r = 255 if t <= 66 else 329.7 * ((t - 60) ** -0.1332)
    g = 99.47 * math.log(t) - 161.1 if t <= 66 else 288.1 * ((t - 60) ** -0.0755)
    b = 255 if t >= 66 else (0 if t <= 19 else 138.5 * math.log(t - 10) - 305.0)
    c = lambda x: max(0, min(255, x)) / 255
    return (c(r), c(g), c(b))


def aim(o, target):
    d = Vector(target) - o.location
    o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def area(name, loc, target, size, energy, kelvin=5400, color=None, sy=None):
    d = bpy.data.lights.new(name, 'AREA')
    d.shape = 'RECTANGLE'
    d.size = size
    d.size_y = sy or size
    d.energy = energy
    d.color = color or kelvin_rgb(kelvin)
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    aim(o, target)
    return o


def point(name, loc, energy, color, radius=0.02):
    d = bpy.data.lights.new(name, 'POINT')
    d.energy = energy
    d.color = color[:3]
    d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    return o


def camera(loc, target, lens=85, shift=(0, 0)):
    cd = bpy.data.cameras.new('Cam')
    cd.lens = lens
    cd.sensor_width = 36
    cd.sensor_fit = 'HORIZONTAL'
    cd.shift_x, cd.shift_y = shift
    cd.clip_start = 0.01
    cd.clip_end = 50
    o = bpy.data.objects.new('Cam', cd)
    bpy.context.scene.collection.objects.link(o)
    o.location = loc
    aim(o, target)
    bpy.context.scene.camera = o
    return o


def mat(name, color, rough=0.5, metal=0, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    for k, v in kw.items():
        b.inputs[k.replace('_', ' ')].default_value = v
    return m


def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def link(o, coll=None):
    (coll or bpy.context.scene.collection).objects.link(o)
    return o


def smooth(o, bevel=None, seg=3, angle=40):
    for p in o.data.polygons:
        p.use_smooth = True
    if bevel:
        m = o.modifiers.new('Bevel', 'BEVEL')
        m.width = bevel
        m.segments = seg
        m.limit_method = 'ANGLE'
        m.angle_limit = math.radians(angle)
        try:
            m.harden_normals = True
        except Exception:
            pass
    return o


def gem_mesh(name, R=1.0, n=8, crown=0.42, pav=0.95, table=0.6, mid=0.9):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    st = 2 * math.pi / n
    hf = st / 2

    def ring(r, z, off):
        return [bm.verts.new((r * math.cos(i * st + off), r * math.sin(i * st + off), z)) for i in range(n)]
    gk = 0.05 * R
    T = ring(table * R, crown * R, 0)
    M = ring(mid * R, crown * 0.45 * R, hf)
    G = ring(R, 0, 0)
    G2 = ring(R, -gk, 0)
    P = ring(0.42 * R, -pav * 0.5 * R, hf)
    cul = bm.verts.new((0, 0, -pav * R))
    bm.faces.new(T)
    for i in range(n):
        j = (i + 1) % n
        # table -> mid
        bm.faces.new((T[i], T[j], M[i]))
        bm.faces.new((M[i], T[j], M[j]))
        # mid -> girdle
        bm.faces.new((M[i], G[j], G[i]))
        bm.faces.new((M[i], M[j], G[j]))
        # girdle band
        bm.faces.new((G[i], G[j], G2[j], G2[i]))
        # girdle -> pavilion
        bm.faces.new((G2[i], G2[j], P[i]))
        bm.faces.new((P[i], G2[j], P[j]))
        bm.faces.new((P[i], P[j], cul))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = False
    return me


def gem_material(name='Gem', color=GREEN, absorb=14, emit=1.2, ior=2.4, facet=0.9, lightdir=(0.4, -0.5, 0.75)):
    m = mat(name, srgb('0a9a35'), rough=0.09, metal=0.6)
    b = principled(m)
    b.inputs['Transmission Weight'].default_value = 0.0
    b.inputs['IOR'].default_value = 1.45
    b.inputs['Specular IOR Level'].default_value = 0.3
    nt = m.node_tree
    # per-facet tone: world normal . lightdir -> ramp (dark emerald .. lime)
    ge = nt.nodes.new('ShaderNodeNewGeometry')
    vd = nt.nodes.new('ShaderNodeVectorMath'); vd.operation = 'DOT_PRODUCT'
    vd.inputs[1].default_value = Vector(lightdir).normalized()
    nt.links.new(ge.outputs['Normal'], vd.inputs[0])
    wn = nt.nodes.new('ShaderNodeTexWhiteNoise'); wn.noise_dimensions = '3D'
    nt.links.new(ge.outputs['Normal'], wn.inputs['Vector'])
    mx2 = nt.nodes.new('ShaderNodeMath'); mx2.operation = 'MULTIPLY_ADD'; mx2.inputs[1].default_value = 0.55
    nt.links.new(wn.outputs['Value'], mx2.inputs[0]); nt.links.new(vd.outputs['Value'], mx2.inputs[2])
    mr = nt.nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -0.2; mr.inputs['From Max'].default_value = 1.15
    nt.links.new(mx2.outputs['Value'], mr.inputs['Value'])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = srgb('002a0e'); ramp.color_ramp.elements[1].color = srgb('1cf058')
    nt.links.new(mr.outputs['Result'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = facet * emit
    ab = nt.nodes.new('ShaderNodeVolumeAbsorption')
    ab.inputs['Color'].default_value = color
    ab.inputs['Density'].default_value = absorb
    out = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
    nt.links.new(ab.outputs['Volume'], out.inputs['Volume'])
    return m


def add_gem(name, R, loc, rot=(0, 0, 0), n=8, material=None, **kw):
    o = bpy.data.objects.new(name, gem_mesh(name, R, n, **kw))
    link(o)
    o.location = loc
    o.rotation_euler = rot
    o.data.materials.append(material or gem_material())
    m = o.modifiers.new('Bevel', 'BEVEL')
    m.width = 0.012 * R
    m.segments = 2
    m.limit_method = 'ANGLE'
    m.angle_limit = math.radians(20)
    try:
        m.harden_normals = False
    except Exception:
        pass
    return o


def tex_image(nt, path, cs='sRGB'):
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = bpy.data.images.load(path)
    t.image.colorspace_settings.name = cs
    return t


def soil_nodes(nt, scale=0.12, tint=(1, 1, 1, 1)):
    """returns (color_socket, rough_socket, normal_socket) for farm soil in object space"""
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (1 / scale,) * 3
    d = tex_image(nt, A + '\\farm_soil\\farm_soil_Diffuse_1k.jpg')
    r = tex_image(nt, A + '\\farm_soil\\farm_soil_Rough_1k.jpg', 'Non-Color')
    nrm = tex_image(nt, A + '\\farm_soil\\farm_soil_nor_gl_1k.jpg', 'Non-Color')
    for t in (d, r, nrm):
        t.projection = 'BOX'
        t.projection_blend = 0.2
        nt.links.new(mp.outputs['Vector'], t.inputs['Vector'])
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.blend_type = 'MULTIPLY'
    mix.inputs['Factor'].default_value = 1.0
    nt.links.new(d.outputs['Color'], mix.inputs['A'])
    mix.inputs['B'].default_value = tint
    nm = nt.nodes.new('ShaderNodeNormalMap')
    nm.inputs['Strength'].default_value = 1.0
    nt.links.new(nrm.outputs['Color'], nm.inputs['Color'])
    return mix.outputs['Result'], r.outputs['Color'], nm.outputs['Normal']


def soil_material(scale=0.12, tint=(1, 1, 1, 1), name='Soil'):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    c, r, n = soil_nodes(nt, scale, tint)
    nt.links.new(c, b.inputs['Base Color'])
    nt.links.new(r, b.inputs['Roughness'])
    nt.links.new(n, b.inputs['Normal'])
    nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
    return m


MOLE_OBJS = ['Body', 'Legs', 'Claw1', 'Claw 2', 'Claw 3', 'Notes', 'Whisker1', 'Whisker2', 'Whisker3', 'Whisker4',
             'Head', 'Body2', 'Sphere.001']


def load_mole(hat='Hard Hat'):
    names = MOLE_OBJS + [hat]
    with bpy.data.libraries.load(r"C:\Users\CharD\Downloads\BLOOD1.blend", link=False) as (s, d):
        d.objects = [n for n in names if n in s.objects]
    objs = [o for o in d.objects if o]
    for o in objs:
        bpy.context.scene.collection.objects.link(o)
    return objs


def post_clip():
    return runpy.run_path(r"C:\Users\CharD\.claude\skills\blender-scene\scripts\check_clip.py")["check"]()


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def args():
    return sys.argv[sys.argv.index('--') + 1:]


def proj(co):
    from bpy_extras.object_utils import world_to_camera_view
    sc = bpy.context.scene
    v = world_to_camera_view(sc, sc.camera, Vector(co))
    return [round(v.x, 4), round(1 - v.y, 4)]


def save_meta(path, **pts):
    import json
    json.dump({k: proj(v) for k, v in pts.items()}, open(path, 'w'))


def frame_all(fill=0.82, exclude=('ShadowCatcher', 'WedgeCutter')):
    """Zoom + shift the scene camera so the meshes fill `fill` of a square frame, centred."""
    import numpy as np
    sc = bpy.context.scene
    cam = sc.camera
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in sc.objects:
        if o.type != 'MESH' or o.name in exclude or o.hide_render:
            continue
        eo = o.evaluated_get(dg)
        me = eo.to_mesh()
        n = len(me.vertices)
        co = np.empty(n * 3, np.float32)
        me.vertices.foreach_get('co', co)
        co = co.reshape(n, 3)
        mw = np.array(eo.matrix_world)
        pts.append(co @ mw[:3, :3].T + mw[:3, 3])
        eo.to_mesh_clear()
    P = np.vstack(pts)
    inv = np.array(cam.matrix_world.inverted())
    pc = P @ inv[:3, :3].T + inv[:3, 3]
    u = pc[:, 0] / -pc[:, 2]
    v = pc[:, 1] / -pc[:, 2]
    span = max(u.max() - u.min(), v.max() - v.min())
    L = fill * 36.0 / span
    cam.data.lens = L
    cam.data.shift_x = (L / 36.0) * (u.max() + u.min()) / 2
    cam.data.shift_y = (L / 36.0) * (v.max() + v.min()) / 2
    print('FRAME lens', round(L, 1))


def tune_mole(body2_dark=0.32, head_dark=0.85, hat_yellow=0.65):
    """darken fur to PFP near-black, brand-yellow hard hat. Works on the node trees in place."""
    def mul_before_base(mat_, gain):
        nt = mat_.node_tree
        b = principled(mat_)
        l = [x for x in nt.links if x.to_socket == b.inputs['Base Color']]
        if not l:
            c = b.inputs['Base Color'].default_value
            b.inputs['Base Color'].default_value = (c[0] * gain, c[1] * gain, c[2] * gain, 1)
            return
        src = l[0].from_socket
        mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'
        mx.inputs['Factor'].default_value = 1.0; mx.inputs['B'].default_value = (gain, gain, gain, 1)
        nt.links.new(src, mx.inputs['A']); nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
    for o in bpy.data.objects:
        if o.type != 'MESH':
            continue
        for sl in o.material_slots:
            m = sl.material
            if not m or not m.use_nodes:
                continue
            if o.name == 'Body2':
                mul_before_base(m, body2_dark)
            elif o.name == 'Head':
                mul_before_base(m, head_dark)
            elif o.name == 'Hard Hat':
                nt = m.node_tree; b = principled(m)
                l = [x for x in nt.links if x.to_socket == b.inputs['Base Color']]
                src = l[0].from_socket
                mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'
                mx.inputs['Factor'].default_value = hat_yellow; mx.inputs['B'].default_value = tuple(v * 0.62 for v in YELLOW[:3]) + (1,)
                nt.links.new(src, mx.inputs['A']); nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
                b.inputs['Roughness'].default_value = 0.55
                b.inputs['Specular IOR Level'].default_value = 0.25


def pose_hat(hat, pitch_deg=-18, lift=0.0, scale=1.0, pivot=(-0.6, 0, 0.5)):
    """tilt the hat about a pivot at the back of the head (pitch<0: front rises), optional lift/scale"""
    p = Vector(pivot)
    M = Matrix.Translation(p) @ Matrix.Rotation(math.radians(pitch_deg), 4, 'Y') @ Matrix.Translation(-p)
    M = Matrix.Translation((0, 0, lift)) @ M @ Matrix.Translation(p) @ Matrix.Scale(scale, 4) @ Matrix.Translation(-p)
    hat.matrix_world = M @ hat.matrix_world


def pose_head(head_objs, pitch_deg=14, pivot=(-0.2, 0, -0.2)):
    p = Vector(pivot)
    M = Matrix.Translation(p) @ Matrix.Rotation(math.radians(pitch_deg), 4, 'Y') @ Matrix.Translation(-p)
    for o in head_objs:
        o.matrix_world = M @ o.matrix_world
