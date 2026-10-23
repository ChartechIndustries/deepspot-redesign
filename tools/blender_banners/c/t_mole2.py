import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
reset(); sc=setup_render(48,50,False); setup_world(1.0)
obs=load_mole(("Partyhat","Tux"))
for o in obs: o.hide_render=False; o.hide_viewport=False
bpy.context.scene.frame_set(1)
for o in obs:
    if o.type=="MESH":
        lo,hi=bounds_of([o]); print("MB",o.name,[round(x,2) for x in lo],[round(x,2) for x in hi])
make_camera((12,0,0.3),(0,0,0.0),50)
area_light("k",(6,-4,5),(0,0,0),4,1500)
render_to(os.path.join(HERE,"qa","mole_test2.png"))
