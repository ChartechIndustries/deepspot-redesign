import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s = reset(); setup_render(s, samples=32, w=640, h=640)
world_hdri(s, strength=1.0)
objs = load_mole()
for o in objs:
    o.hide_render=False; o.hide_viewport=False
import mathutils
mn=Vector((1e9,)*3); mx=Vector((-1e9,)*3)
for o in objs:
    if o.type=='MESH':
        for c in o.bound_box:
            w=o.matrix_world@Vector(c); mn=Vector(map(min,mn,w)); mx=Vector(map(max,mx,w))
print('BOUNDS',mn,mx)
catcher(20, mn.z)
area('key', (3, -5, 6), (0, 0, 0.6), 4, 1500)
cx=(mn+mx)/2
for nm,d in (('f',(0,-1)),('b',(0,1)),('r',(1,0)),('l',(-1,0))):
    camera((cx.x+d[0]*12,cx.y+d[1]*12,cx.z+2),cx,lens=70)
    render(ROOT+r"\renders\_mole_%s.png"%nm)
