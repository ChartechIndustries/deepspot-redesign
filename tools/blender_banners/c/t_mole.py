import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
reset(); sc=setup_render(48,50,False); setup_world(1.0)
obs=load_mole(("Partyhat",))
for o in obs: o.hide_render=False; o.hide_viewport=False
for o in obs: print("OB",o.name,o.type,[round(x,2) for x in o.dimensions],[round(x,2) for x in o.location],o.parent.name if o.parent else None, o.hide_render,o.hide_viewport, [m.name for m in o.data.materials] if o.type=='MESH' else '')
lo,hi=bounds_of([o for o in obs if o.type=='MESH']); print("BOUNDS",lo,hi)
c=Vector((0,0,0.2)); make_camera(c+Vector((7,-4,1.5)),c,50)
add_floor("#07d653",catcher=False)
area_light("k",(3,-4,5),c,3,800)
render_to(os.path.join(HERE,"qa","mole_test.png"))
