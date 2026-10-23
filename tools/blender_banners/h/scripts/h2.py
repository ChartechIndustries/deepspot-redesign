"""H2 pin + gem.  blender -b -P h2.py -- <out_rgba.png> [samples] [w] [h]"""
import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *

a = args()
OUT = a[0]
SAMPLES = int(a[1]) if len(a) > 1 else 192
W = int(a[2]) if len(a) > 2 else 1600
Hh = int(a[3]) if len(a) > 3 else 1600

s = reset()
setup_render(s, samples=SAMPLES, w=W, h=Hh)
world_hdri(s, strength=0.3, rot=math.radians(200))
s.view_settings.exposure = -0.4

RG = 0.10          # globe radius
PR, PH = 0.13, 0.016   # plinth radius / height
RING_R, RING_T = 0.05, 0.0085
OFFW_M = mat('OffWhite', OFFW, rough=0.45)


def cyl(name, r, h, z, segs=96, material=None, bevel=0.003):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segs, radius=r, depth=h, location=(0, 0, z))
    o = bpy.context.object
    o.name = name
    smooth(o, bevel=bevel, seg=3, angle=35)
    if material:
        o.data.materials.append(material)
    return o


# plinth + cradle ring
plinth = cyl('Plinth', PR, PH, PH / 2, material=OFFW_M, bevel=0.004)
bpy.ops.mesh.primitive_torus_add(major_radius=RING_R, minor_radius=RING_T, major_segments=96, minor_segments=24, location=(0, 0, PH + RING_T))
ring = bpy.context.object
ring.name = 'Cradle'
smooth(ring)
ring.data.materials.append(mat('Brass', srgb('ffc21a'), rough=0.28, metal=1.0))
cz = PH + RING_T + math.sqrt((RG + RING_T) ** 2 - RING_R ** 2)   # globe centre, resting on the ring
G0 = Vector((0, 0, cz))

# globe
bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=RG, location=G0)
globe = bpy.context.object
globe.name = 'Globe'
for p in globe.data.polygons:
    p.use_smooth = True
bpy.ops.mesh.primitive_cube_add(size=1, location=G0 + Vector((-RG * 1.0, -RG * 1.0, 0)))
cut = bpy.context.object
cut.name = 'WedgeCutter'
cut.scale = (RG * 2, RG * 2, RG * 3)
cut.hide_render = True
cut.display_type = 'WIRE'
bo = globe.modifiers.new('Cut', 'BOOLEAN')
bo.operation = 'DIFFERENCE'
bo.object = cut
bo.solver = 'EXACT'
bv = globe.modifiers.new('Bevel', 'BEVEL')
bv.width = 0.0018
bv.segments = 3
bv.limit_method = 'ANGLE'
bv.angle_limit = math.radians(30)
bv.harden_normals = True
# material
m = bpy.data.materials.new('GlobeMat')
m.use_nodes = True
nt = m.node_tree
nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial')
pb = nt.nodes.new('ShaderNodeBsdfPrincipled')
tc = nt.nodes.new('ShaderNodeTexCoord')
# surface: land / ocean + halftone dots
sc = nt.nodes.new('ShaderNodeVectorMath'); sc.operation = 'SCALE'; sc.inputs['Scale'].default_value = 1 / RG
nt.links.new(tc.outputs['Object'], sc.inputs[0])
nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.7; nz.inputs['Detail'].default_value = 5; nz.inputs['Distortion'].default_value = 0.4
nt.links.new(sc.outputs['Vector'], nz.inputs['Vector'])
land = nt.nodes.new('ShaderNodeMapRange'); land.inputs['From Min'].default_value = 0.52; land.inputs['From Max'].default_value = 0.545
nt.links.new(nz.outputs['Fac'], land.inputs['Value'])
vr = nt.nodes.new('ShaderNodeTexVoronoi'); vr.feature = 'F1'; vr.inputs['Scale'].default_value = 170
nt.links.new(tc.outputs['Object'], vr.inputs['Vector'])
dots = nt.nodes.new('ShaderNodeMapRange'); dots.inputs['From Min'].default_value = 0.22; dots.inputs['From Max'].default_value = 0.30
dots.inputs['To Min'].default_value = 1.0; dots.inputs['To Max'].default_value = 0.0
nt.links.new(vr.outputs['Distance'], dots.inputs['Value'])
ocean = nt.nodes.new('ShaderNodeMix'); ocean.data_type = 'RGBA'
ocean.inputs['A'].default_value = srgb('14284a'); ocean.inputs['B'].default_value = srgb('2e5aa8')
nt.links.new(dots.outputs['Result'], ocean.inputs['Factor'])
landc = nt.nodes.new('ShaderNodeMix'); landc.data_type = 'RGBA'
landc.inputs['A'].default_value = srgb('0bb844'); landc.inputs['B'].default_value = srgb('0fe05a')
nt.links.new(dots.outputs['Result'], landc.inputs['Factor'])
surf = nt.nodes.new('ShaderNodeMix'); surf.data_type = 'RGBA'
nt.links.new(land.outputs['Result'], surf.inputs['Factor'])
nt.links.new(ocean.outputs['Result'], surf.inputs['A']); nt.links.new(landc.outputs['Result'], surf.inputs['B'])
# cut faces: concentric layers by radius
ln = nt.nodes.new('ShaderNodeVectorMath'); ln.operation = 'LENGTH'
nt.links.new(tc.outputs['Object'], ln.inputs[0])
ramp = nt.nodes.new('ShaderNodeValToRGB'); ramp.color_ramp.interpolation = 'CONSTANT'
ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = srgb('fff3c4')
ramp.color_ramp.elements[1].position = 0.28 * RG * 1.0; ramp.color_ramp.elements[1].color = srgb('ff6a10')
e = ramp.color_ramp.elements.new(0.58 * RG); e.color = srgb('ffd400')
e = ramp.color_ramp.elements.new(0.92 * RG); e.color = srgb('eceee8')
# ramp fac is 0..1 -> feed radius directly (metres <= 0.1)
nt.links.new(ln.outputs['Value'], ramp.inputs['Fac'])
# surface mask: normal parallel to radial dir
vt = nt.nodes.new('ShaderNodeVectorTransform'); vt.vector_type = 'NORMAL'; vt.convert_from = 'WORLD'; vt.convert_to = 'OBJECT'
ge = nt.nodes.new('ShaderNodeNewGeometry')
nt.links.new(ge.outputs['Normal'], vt.inputs['Vector'])
nm = nt.nodes.new('ShaderNodeVectorMath'); nm.operation = 'NORMALIZE'
nt.links.new(tc.outputs['Object'], nm.inputs[0])
dp = nt.nodes.new('ShaderNodeVectorMath'); dp.operation = 'DOT_PRODUCT'
nt.links.new(vt.outputs['Vector'], dp.inputs[0]); nt.links.new(nm.outputs['Vector'], dp.inputs[1])
sm = nt.nodes.new('ShaderNodeMapRange'); sm.inputs['From Min'].default_value = 0.93; sm.inputs['From Max'].default_value = 0.985
nt.links.new(dp.outputs['Value'], sm.inputs['Value'])
fin = nt.nodes.new('ShaderNodeMix'); fin.data_type = 'RGBA'
nt.links.new(sm.outputs['Result'], fin.inputs['Factor'])
nt.links.new(ramp.outputs['Color'], fin.inputs['A']); nt.links.new(surf.outputs['Result'], fin.inputs['B'])
nt.links.new(fin.outputs['Result'], pb.inputs['Base Color'])
pb.inputs['Roughness'].default_value = 0.6
pb.inputs['Specular IOR Level'].default_value = 0.2
nt.links.new(pb.outputs['BSDF'], out.inputs['Surface'])
globe.data.materials.append(m)
bpy.ops.object.select_all(action='DESELECT')
globe.select_set(True)
bpy.context.view_layer.objects.active = globe
for md in ('Cut', 'Bevel'):
    bpy.ops.object.modifier_apply(modifier=md)
bpy.data.objects.remove(cut)

# pin
nvec = Vector((0.24, 0.02, 0.97)).normalized()
P = G0 + nvec * RG
pin_dir = Vector((0.30, -0.22, 0.93)).normalized()
rotq = Vector((0, 0, 1)).rotation_difference(pin_dir)
NEEDLE = 0.05
bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.0024, radius2=0.0014, depth=NEEDLE + 0.002, location=(0, 0, (NEEDLE - 0.002) / 2))
needle = bpy.context.object
needle.name = 'Needle'
smooth(needle, bevel=0.0003, seg=2)
needle.data.materials.append(mat('Steel', (0.8, 0.82, 0.86, 1), rough=0.22, metal=1.0))
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.0155, radius2=0.010, depth=0.016, location=(0, 0, NEEDLE + 0.008))
collar = bpy.context.object
collar.name = 'Collar'
smooth(collar, bevel=0.0016, seg=3)
collar.data.materials.append(mat('PinGold', srgb('ffc21a'), rough=0.25, metal=1.0))
GR2 = 0.036
gem = add_gem('PinGem', GR2, (0, 0, NEEDLE + 0.016 + 0.95 * GR2 + 0.0004), n=8, material=gem_material('PinGem', GREEN, emit=0.55))
grp = bpy.data.objects.new('PinRoot', None)
link(grp)
grp.location = P
grp.rotation_mode = 'QUATERNION'
grp.rotation_quaternion = rotq
for o in (needle, collar, gem):
    o.parent = grp
bpy.context.view_layer.update()

# floor, lights, camera
catcher(8, 0.0)
T = Vector((0.0, 0.0, 0.14))
area('Key', (-0.9, -1.2, 1.1), T, 0.9, 85, 5400, sy=0.7)
area('Fill', (1.1, -1.0, 0.5), T, 1.2, 22, 6800)
area('Rim', (0.7, 1.2, 0.9), T, 0.8, 60, 5600)
point('GemGlow', P + pin_dir * 0.07, 0.25, GREEN, radius=0.015)
az, el, dist = math.radians(-18), math.radians(24), 2.85
camera((T.x + dist * math.cos(el) * math.sin(az), T.y - dist * math.cos(el) * math.cos(az), T.z + dist * math.sin(el)), T,
       lens=135, shift=(-0.285, -0.045))

frame_all()
bpy.context.view_layer.update()
print('CLIP', post_clip())
save_meta(ROOT + '/renders/h2_meta.json', gem=gem.matrix_world.translation, globe=G0)
bpy.ops.wm.save_as_mainfile(filepath=ROOT + r'\h2.blend')
render(OUT)
