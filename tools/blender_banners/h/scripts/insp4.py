import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s=reset(); objs=load_mole('Hard Hat')
for o in objs:
    if o.type!='MESH': continue
    c=[o.matrix_world@Vector(x) for x in o.bound_box]
    mn=Vector(map(min,*[(v.x,v.y,v.z) for v in c])); mx=Vector(map(max,*[(v.x,v.y,v.z) for v in c]))
    print('BB',o.name,[round(x,2) for x in mn],[round(x,2) for x in mx],'origin',[round(x,2) for x in o.location])
