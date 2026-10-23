"""H1 gem in ground.  blender -b -P h1.py -- <out_rgba.png> [samples] [w] [h]"""
import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
import mathutils.noise as mn

a = args()
OUT = a[0]
SAMPLES = int(a[1]) if len(a) > 1 else 192
W = int(a[2]) if len(a) > 2 else 1600
Hh = int(a[3]) if len(a) > 3 else 1600

s = reset()
setup_render(s, samples=SAMPLES, w=W, h=Hh)
world_hdri(s, strength=0.3, rot=math.radians(200))
s.view_settings.exposure = -0.6

# ---------------------------------------------------------------- dimensions (metres)
CW, CD, CH = 0.25, 0.19, 0.10          # chunk
GX, GY = 0.0, -0.004                    # gem centre xy
GR = 0.062                              # gem radius (6.8 cm wide)


def height(x, y):
    d = math.hypot(x - GX, y - GY)
    crater = -0.034 * math.exp(-(d / 0.06) ** 2)
    rim = 0.007 * math.exp(-((d - 0.09) / 0.018) ** 2)
    n = 0.0035 * mn.noise(Vector((x * 22, y * 22, 1.3))) + 0.0014 * mn.noise(Vector((x * 70, y * 70, 4.1)))
    edge = min(1, max(0, (min(CW / 2 - abs(x), CD / 2 - abs(y)) - 0.006) / 0.02))
    return CH + (crater + rim + n) * (0.25 + 0.75 * edge) if d < 0.13 else CH + n * edge


# ---------------------------------------------------------------- chunk
bm = bmesh.new()
bmesh.ops.create_cube(bm, size=1.0)
for v in bm.verts:
    v.co = (v.co.x * CW, v.co.y * CD, (v.co.z + 0.5) * CH)
bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=70, use_grid_fill=True)
for v in bm.verts:
    if v.co.z > CH - 1e-6:
        v.co.z = height(v.co.x, v.co.y)
me = bpy.data.meshes.new('SoilChunk')
bm.to_mesh(me)
bm.free()
chunk = bpy.data.objects.new('SoilChunk', me)
link(chunk)
smooth(chunk, bevel=0.0035, seg=3, angle=35)

m = bpy.data.materials.new('SoilGrass')
m.use_nodes = True
nt = m.node_tree
nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial')
pb = nt.nodes.new('ShaderNodeBsdfPrincipled')
scol, srough, snorm = soil_nodes(nt, 0.10, (1.25, 1.0, 0.85, 1))
tc = nt.nodes.new('ShaderNodeTexCoord')
sep = nt.nodes.new('ShaderNodeSeparateXYZ')
nt.links.new(tc.outputs['Object'], sep.inputs['Vector'])
nz = nt.nodes.new('ShaderNodeTexNoise')
nz.inputs['Scale'].default_value = 90
nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
# strata bands
nb = nt.nodes.new('ShaderNodeTexNoise')
nb.inputs['Scale'].default_value = 25
nt.links.new(tc.outputs['Object'], nb.inputs['Vector'])
wz = nt.nodes.new('ShaderNodeMath'); wz.operation = 'MULTIPLY_ADD'
nt.links.new(nb.outputs['Fac'], wz.inputs[0]); wz.inputs[1].default_value = 0.012
nt.links.new(sep.outputs['Z'], wz.inputs[2])
sn = nt.nodes.new('ShaderNodeMath'); sn.operation = 'MULTIPLY'; sn.inputs[1].default_value = 2 * math.pi / 0.026
nt.links.new(wz.outputs['Value'], sn.inputs[0])
sn2 = nt.nodes.new('ShaderNodeMath'); sn2.operation = 'SINE'
nt.links.new(sn.outputs['Value'], sn2.inputs[0])
band = nt.nodes.new('ShaderNodeMapRange')
band.inputs['From Min'].default_value = -1; band.inputs['To Min'].default_value = 0.72; band.inputs['To Max'].default_value = 1.12
nt.links.new(sn2.outputs['Value'], band.inputs['Value'])
cb = nt.nodes.new('ShaderNodeCombineColor')
for k in ('Red', 'Green', 'Blue'):
    nt.links.new(band.outputs['Result'], cb.inputs[k])
strata = nt.nodes.new('ShaderNodeMix'); strata.data_type = 'RGBA'; strata.blend_type = 'MULTIPLY'; strata.inputs['Factor'].default_value = 1.0
# three real strata (pale stone / clay / loam) by height, wobbly boundaries
zn = nt.nodes.new('ShaderNodeMath'); zn.operation = 'MULTIPLY_ADD'; zn.inputs[1].default_value = 0.012
nt.links.new(nb.outputs['Fac'], zn.inputs[0]); nt.links.new(sep.outputs['Z'], zn.inputs[2])
zr = nt.nodes.new('ShaderNodeMapRange'); zr.inputs['From Min'].default_value = 0.0; zr.inputs['From Max'].default_value = CH
nt.links.new(zn.outputs['Value'], zr.inputs['Value'])
sr = nt.nodes.new('ShaderNodeValToRGB'); sr.color_ramp.interpolation = 'CONSTANT'
sr.color_ramp.elements[0].position = 0.0; sr.color_ramp.elements[0].color = srgb('d9cfbd')
e1 = sr.color_ramp.elements.new(0.30); e1.color = srgb('cf8040')
e2 = sr.color_ramp.elements.new(0.56); e2.color = srgb('6a4a33')
nt.links.new(zr.outputs['Result'], sr.inputs['Fac'])
smix = nt.nodes.new('ShaderNodeMix'); smix.data_type = 'RGBA'; smix.inputs['Factor'].default_value = 0.55
nt.links.new(scol, smix.inputs['A']); nt.links.new(sr.outputs['Color'], smix.inputs['B'])
nt.links.new(smix.outputs['Result'], strata.inputs['A']); strata.inputs['B'].default_value = (1, 1, 1, 1)
# grass mask
lenv = nt.nodes.new('ShaderNodeCombineXYZ')
nt.links.new(sep.outputs['X'], lenv.inputs['X']); nt.links.new(sep.outputs['Y'], lenv.inputs['Y'])
ln = nt.nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
nt.links.new(lenv.outputs['Vector'], ln.inputs[0])
rw = nt.nodes.new('ShaderNodeMath'); rw.operation = 'MULTIPLY_ADD'; rw.inputs[1].default_value = 0.016
nt.links.new(nz.outputs['Fac'], rw.inputs[0]); nt.links.new(ln.outputs['Value'], rw.inputs[2])
rmask = nt.nodes.new('ShaderNodeMapRange'); rmask.inputs['From Min'].default_value = 0.088; rmask.inputs['From Max'].default_value = 0.094
nt.links.new(rw.outputs['Value'], rmask.inputs['Value'])
zt = nt.nodes.new('ShaderNodeMath'); zt.operation = 'MULTIPLY_ADD'; zt.inputs[1].default_value = 0.016
nz2 = nt.nodes.new('ShaderNodeTexNoise'); nz2.inputs['Scale'].default_value = 38
nt.links.new(tc.outputs['Object'], nz2.inputs['Vector'])
nt.links.new(nz2.outputs['Fac'], zt.inputs[0]); zt.inputs[2].default_value = CH - 0.022
zd = nt.nodes.new('ShaderNodeMath'); zd.operation = 'SUBTRACT'
nt.links.new(sep.outputs['Z'], zd.inputs[0]); nt.links.new(zt.outputs['Value'], zd.inputs[1])
zmask = nt.nodes.new('ShaderNodeMapRange'); zmask.inputs['From Min'].default_value = -0.002; zmask.inputs['From Max'].default_value = 0.002
nt.links.new(zd.outputs['Value'], zmask.inputs['Value'])
gm = nt.nodes.new('ShaderNodeMath'); gm.operation = 'MULTIPLY'
nt.links.new(zmask.outputs['Result'], gm.inputs[0]); nt.links.new(rmask.outputs['Result'], gm.inputs[1])
# grass colour: brand green, slightly deeper, noise variation
gnz = nt.nodes.new('ShaderNodeTexNoise'); gnz.inputs['Scale'].default_value = 260
nt.links.new(tc.outputs['Object'], gnz.inputs['Vector'])
gr = nt.nodes.new('ShaderNodeValToRGB')
gr.color_ramp.elements[0].color = srgb('2a6a1c'); gr.color_ramp.elements[1].color = srgb('6aa828')
nt.links.new(gnz.outputs['Fac'], gr.inputs['Fac'])
fin = nt.nodes.new('ShaderNodeMix'); fin.data_type = 'RGBA'
nt.links.new(gm.outputs['Value'], fin.inputs['Factor'])   # mossy olive grass lip, darker than the brand-green gem
nt.links.new(strata.outputs['Result'], fin.inputs['A']); nt.links.new(gr.outputs['Color'], fin.inputs['B'])
rr = nt.nodes.new('ShaderNodeMix'); rr.data_type = 'FLOAT'
nt.links.new(gm.outputs['Value'], rr.inputs['Factor'])
rsep = nt.nodes.new('ShaderNodeSeparateColor'); nt.links.new(srough, rsep.inputs['Color'])
nt.links.new(rsep.outputs['Red'], rr.inputs['A']); rr.inputs['B'].default_value = 0.9
inv = nt.nodes.new('ShaderNodeMath'); inv.operation = 'SUBTRACT'; inv.inputs[0].default_value = 1.0
nt.links.new(rmask.outputs['Result'], inv.inputs[1])
dk = nt.nodes.new('ShaderNodeMix'); dk.data_type = 'RGBA'; dk.inputs['B'].default_value = srgb('3a2616')
nt.links.new(inv.outputs['Value'], dk.inputs['Factor']); nt.links.new(fin.outputs['Result'], dk.inputs['A'])
nt.links.new(dk.outputs['Result'], pb.inputs['Base Color'])
nt.links.new(rr.outputs['Result'], pb.inputs['Roughness'])
nt.links.new(snorm, pb.inputs['Normal'])
nt.links.new(pb.outputs['BSDF'], out.inputs['Surface'])
chunk.data.materials.append(m)

# ---------------------------------------------------------------- gem
gem = add_gem('Gem', GR, (GX, GY, CH + 0.012), rot=(math.radians(62), math.radians(-8), math.radians(14)),
              n=8, material=gem_material('Gem', GREEN, absorb=10, emit=0.55))
bpy.context.view_layer.update()

# ---------------------------------------------------------------- pebbles (Poly Haven stone_01)
bpy.ops.import_scene.gltf(filepath=A + r'\stone_01\stone_01_1k.gltf')
src = [o for o in bpy.context.scene.objects if o.name.startswith('stone_01')][0]
random.seed(11)
spots = [(-0.085, -0.05, 0.012, 20), (0.08, 0.05, 0.016, 140), (0.07, -0.06, 0.010, 80), (-0.095, 0.04, 0.009, 200),
         (0.098, -0.01, 0.008, 300), (-0.04, 0.066, 0.011, 10)]
pebbles = []
for i, (x, y, sz, rz) in enumerate(spots):
    o = src.copy(); o.data = src.data.copy(); link(o)
    k = sz / max(src.dimensions)
    o.scale = (k * 1.8, k * 1.8, k * 1.5)
    o.rotation_euler = (0, 0, math.radians(rz))
    bpy.context.view_layer.update()
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    cxy = sum((c.x for c in cs)) / 8, sum((c.y for c in cs)) / 8
    o.location += Vector((x - cxy[0], y - cxy[1], height(x, y) - 0.0004 - min(c.z for c in cs)))
    for p in o.data.polygons:
        p.use_smooth = True
    pebbles.append(o)
src.hide_render = True
bpy.data.objects.remove(src)

# small gem shards scattered around the crater
for i, (x, y, r_, rz) in enumerate([(-0.062, -0.052, 0.011, 30), (0.07, -0.04, 0.008, 100), (0.058, 0.062, 0.009, 200)]):
    g2 = add_gem('Shard%d' % i, r_, (x, y, height(x, y) + r_ * 0.7), rot=(math.radians(70), math.radians(8 * i), math.radians(rz)), n=6,
                 material=gem_material('Shard', GREEN, emit=0.55))

# ---------------------------------------------------------------- floor, lights, camera

# ---------------------------------------------------------------- roots and embedded stones on the front face
bpy.ops.import_scene.gltf(filepath=A + r'\stone_01\stone_01_1k.gltf')
st2 = [o for o in bpy.context.scene.objects if o.name.startswith('stone_01') and o.name not in [p.name for p in pebbles]][0]
root_mat = mat('Root', srgb('4a3322'), rough=0.85)
random.seed(4)
for i, (x, z, rz, sz) in enumerate([(-0.07, 0.02, 10, 0.05), (0.075, 0.035, 200, 0.042), (0.0, 0.015, 80, 0.032)]):
    o = st2.copy(); o.data = st2.data.copy(); link(o)
    k = sz / max(st2.dimensions)
    o.scale = (k, k * 0.7, k * 0.85)
    o.rotation_euler = (0, 0, math.radians(rz))
    for p in o.data.polygons:
        p.use_smooth = True
    o.location = (x, -CD / 2 - 0.004, z)
bpy.data.objects.remove(st2)
for i, (x0, z0, dx, dz) in enumerate([(-0.095, 0.075, 0.03, -0.035), (0.03, 0.08, -0.025, -0.04), (0.1, 0.07, 0.02, -0.03)]):
    cd = bpy.data.curves.new('Root%d' % i, 'CURVE')
    cd.dimensions = '3D'
    sp = cd.splines.new('BEZIER')
    sp.bezier_points.add(2)
    pts = [(x0, -CD / 2 + 0.006, z0 + 0.012), (x0 + dx * 0.5, -CD / 2 - 0.004, z0 + dz * 0.4), (x0 + dx, -CD / 2 - 0.002, z0 + dz)]
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cd.bevel_depth = 0.0035
    cd.bevel_resolution = 4
    cd.use_fill_caps = True
    for pt, r_ in zip(sp.bezier_points, (1.0, 0.8, 0.35)):
        pt.radius = r_
    o = bpy.data.objects.new('Root%d' % i, cd)
    link(o)
    o.data.materials.append(root_mat)
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.convert(target='MESH')
    o.select_set(False)

catcher(8, 0.0)
T = Vector((0, 0, 0.055))
area('Key', (-0.9, -1.2, 1.0), T, 0.9, 85, 5400, sy=0.7)
area('Fill', (1.1, -1.0, 0.5), T, 1.2, 22, 6800)
area('Rim', (0.7, 1.2, 0.8), T, 0.8, 60, 5600)
gl = point('GemGlow', (GX, GY, CH + 0.03), 0.35, GREEN, radius=0.02)
az, el, dist = math.radians(-20), math.radians(27), 3.1
cam = camera((T.x + dist * math.cos(el) * math.sin(az), T.y - dist * math.cos(el) * math.cos(az), T.z + dist * math.sin(el)), T,
             lens=135, shift=(-0.28, -0.03))

# ---------------------------------------------------------------- clip check BEFORE effects
frame_all()
bpy.context.view_layer.update()
print('CLIP', post_clip())

save_meta(ROOT + '/renders/h1_meta.json', gem=gem.matrix_world.translation, top=gem.matrix_world @ Vector((0, 0, GR * 0.5)), chunk=(0, 0, 0.05))
bpy.ops.wm.save_as_mainfile(filepath=ROOT + r'\h1.blend')
render(OUT)
