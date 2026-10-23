"""H3 dig + mole.  blender -b -P h3.py -- <out_rgba.png> [samples] [w] [h]"""
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
s.view_settings.exposure = -0.4

R0, TOP = 0.20, 0.05            # dig-site slab radius / height
PIT = Vector((-0.03, -0.015))   # pit centre
PIT_R, PIT_D = 0.056, 0.028
HEAP = Vector((-0.095, 0.09))   # spoil heap centre
GR = 0.042


def sstep(e0, e1, x):
    t = min(1, max(0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def height(x, y):
    r = math.hypot(x, y)
    h = TOP
    d = math.hypot(x - PIT.x, y - PIT.y)
    h -= PIT_D * (1 - sstep(PIT_R * 0.75, PIT_R * 1.05, d))          # pit with steep walls
    h += 0.006 * math.exp(-((d - PIT_R * 1.25) / 0.018) ** 2)        # lip
    dh = math.hypot(x - HEAP.x, y - HEAP.y)
    h += 0.052 * math.exp(-(dh / 0.062) ** 2) + 0.012 * math.exp(-(dh / 0.11) ** 2)   # spoil heap
    h += 0.0022 * mn.noise(Vector((x * 40, y * 40, 2.0))) + 0.001 * mn.noise(Vector((x * 120, y * 120, 5.0)))
    return h


# ---------------------------------------------------------------- slab (polar grid)
NR, NS = 130, 288
bm = bmesh.new()
rows = []
def rad_edge(t):
    return R0 * (1 + 0.025 * mn.noise(Vector((math.cos(t) * 2.2, math.sin(t) * 2.2, 7.0))))
center = bm.verts.new((0, 0, height(0, 0)))
for i in range(1, NR + 1):
    row = []
    for j in range(NS):
        t = 2 * math.pi * j / NS
        r = rad_edge(t) * i / NR
        x, y = r * math.cos(t), r * math.sin(t)
        row.append(bm.verts.new((x, y, height(x, y))))
    rows.append(row)
for j in range(NS):
    bm.faces.new((center, rows[0][(j + 1) % NS], rows[0][j]))
for i in range(NR - 1):
    for j in range(NS):
        k = (j + 1) % NS
        bm.faces.new((rows[i][j], rows[i][k], rows[i + 1][k], rows[i + 1][j]))
bot = []
for j in range(NS):
    v = rows[-1][j]
    bot.append(bm.verts.new((v.co.x, v.co.y, 0.0)))
for j in range(NS):
    k = (j + 1) % NS
    bm.faces.new((rows[-1][j], rows[-1][k], bot[k], bot[j]))
bc = bm.verts.new((0, 0, 0))
for j in range(NS):
    k = (j + 1) % NS
    bm.faces.new((bc, bot[j], bot[k]))
bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
me = bpy.data.meshes.new('DigSite')
bm.to_mesh(me)
bm.free()
site = bpy.data.objects.new('DigSite', me)
link(site)
smooth(site, bevel=0.0035, seg=3, angle=50)
sm_ = soil_material(0.055, (1.0, 0.8, 0.66, 1), 'DugSoil')
site.data.materials.append(sm_)

# ---------------------------------------------------------------- gem in the pit
gz = height(PIT.x, PIT.y) + 0.004
gem = add_gem('Gem', GR, (PIT.x, PIT.y, gz + 0.02), rot=(math.radians(58), math.radians(-6), math.radians(28)), n=8,
              material=gem_material('Gem', GREEN, emit=0.55))

# ---------------------------------------------------------------- clods + pebbles
random.seed(5)
bpy.ops.import_scene.gltf(filepath=A + r'\stone_01\stone_01_1k.gltf')
stone = [o for o in bpy.context.scene.objects if o.name.startswith('stone_01')][0]
spots = [(-0.14, 0.06, 0.020, 30), (0.01, -0.14, 0.018, 90), (-0.1, -0.12, 0.016, 200), (0.16, 0.0, 0.015, 300), (-0.03, 0.15, 0.014, 20), (0.1, 0.09, 0.012, 140)]
for x, y, sz, rz in spots:
    o = stone.copy(); o.data = stone.data.copy(); link(o)
    k = sz / max(stone.dimensions)
    o.scale = (k, k, k * 0.9)
    o.rotation_euler = (0, 0, math.radians(rz))
    for p in o.data.polygons:
        p.use_smooth = True
    bpy.context.view_layer.update()
    cs = [o.matrix_world @ Vector(c) for c in o.bound_box]
    cxy = sum(c.x for c in cs) / 8, sum(c.y for c in cs) / 8
    o.location += Vector((x - cxy[0], y - cxy[1], height(x, y) - 0.0004 - min(c.z for c in cs)))
bpy.data.objects.remove(stone)

# loose clods of soil (organic lumps)
clod_mat = soil_material(0.05, (0.95, 0.75, 0.6, 1), 'Clod')
for x, y, sz in [(-0.09, 0.015, 0.011), (-0.075, -0.06, 0.008), (0.07, -0.02, 0.009), (0.03, 0.03, 0.007), (-0.11, -0.03, 0.006)]:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=sz)
    o = bpy.context.object
    for v in o.data.vertices:
        v.co *= 1 + 0.25 * mn.noise(v.co * 160 + Vector((x * 50, y * 50, 0)))
    for p in o.data.polygons:
        p.use_smooth = True
    o.scale.z = 0.75
    o.location = (x, y, height(x, y) + sz * 0.75 - 0.0015)
    o.data.materials.append(clod_mat)

# ---------------------------------------------------------------- spade (Poly Haven rusted_spade_01), stuck in heap
before = set(bpy.data.objects.keys())
bpy.ops.import_scene.gltf(filepath=A + r'\rusted_spade_01\rusted_spade_01_2k.gltf')
spade = [bpy.data.objects[n] for n in set(bpy.data.objects.keys()) - before if bpy.data.objects[n].type == 'MESH'][0]
for p in spade.data.polygons:
    p.use_smooth = True
bb = [Vector(c) for c in spade.bound_box]
print('SPADE_BB', min(v.z for v in bb), max(v.z for v in bb), min(v.x for v in bb), max(v.x for v in bb), min(v.y for v in bb), max(v.y for v in bb))
SC = 0.235
spade.scale = (SC,) * 3
SP_TILT = math.radians(28)
spade.rotation_euler = (math.radians(-SP_TILT * 0 + 0), 0, 0)
# pivot at the lowest point of the model; tilt away from camera/right
ZMIN = min(v.z for v in bb)
spade_root = bpy.data.objects.new('SpadeRoot', None)
link(spade_root)
spade_root.location = (HEAP.x + 0.012, HEAP.y - 0.006, height(HEAP.x, HEAP.y) - 0.03)
spade_root.rotation_euler = (math.radians(-10), math.radians(34), math.radians(0))
spade.parent = spade_root
spade.location = (0, 0, -ZMIN * SC)
spade['assembly'] = 'spade'

# ---------------------------------------------------------------- mole
mole = load_mole('Hard Hat')
for o in mole:
    o.hide_render = False
    o.hide_viewport = False
tune_mole(0.2, 0.45, 1.0)
pose_hat(bpy.data.objects['Hard Hat'], -14, 0.0, 1.07)
MS = 0.056
FOOT = -1.1574
mole_root = bpy.data.objects.new('MoleRoot', None)
link(mole_root)
mx_, my_ = 0.085, -0.07
mole_root.location = (mx_, my_, height(mx_, my_))
face = math.atan2(PIT.y - my_, PIT.x - mx_)   # model faces +X
mole_root.rotation_euler = (0, 0, math.radians(222))
mole_root.scale = (MS, MS, MS)
for o in mole:
    o.parent = mole_root
    o.matrix_parent_inverse = Matrix.Translation((0, 0, -FOOT)).inverted() if False else Matrix.Identity(4)
    o['assembly'] = 'mole'
bpy.context.view_layer.update()
zmin = min((o.matrix_world @ Vector(c)).z for o in mole if o.type == 'MESH' for c in o.bound_box)
mole_root.location.z += height(mx_, my_) - zmin - 0.0003

# ---------------------------------------------------------------- floor, lights, camera
catcher(8, 0.0)
T = Vector((0.0, 0.0, 0.085))
area('Key', (-0.9, -1.2, 1.1), T, 0.9, 85, 5400, sy=0.7)
area('Fill', (1.1, -1.0, 0.5), T, 1.2, 22, 6800)
area('Rim', (0.7, 1.2, 0.9), T, 0.8, 60, 5600)
point('GemGlow', (PIT.x, PIT.y, gz + 0.045), 0.25, GREEN, radius=0.02)
az, el, dist = math.radians(-18), math.radians(25), 4.2
camera((T.x + dist * math.cos(el) * math.sin(az), T.y - dist * math.cos(el) * math.cos(az), T.z + dist * math.sin(el)), T,
       lens=135, shift=(-0.27, -0.025))

frame_all()
bpy.context.view_layer.update()
print('CLIP', post_clip())
if len(a) > 4 and a[4] == 'debug':
    s.render.film_transparent = False
    w_ = s.world.node_tree
    w_.nodes.clear()
    bgn = w_.nodes.new('ShaderNodeBackground'); bgn.inputs['Color'].default_value = (1, 0, 1, 1); bgn.inputs['Strength'].default_value = 3
    wo = w_.nodes.new('ShaderNodeOutputWorld'); w_.links.new(bgn.outputs['Background'], wo.inputs['Surface'])
save_meta(ROOT + '/renders/h3_meta.json', gem=gem.matrix_world.translation, mole=mole_root.location + Vector((0, 0, 0.08)))
bpy.ops.wm.save_as_mainfile(filepath=ROOT + r'\h3.blend')
render(OUT)
