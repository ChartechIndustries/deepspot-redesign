import sys,os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from common import *
reset(); sc=setup_render(48,50,False); setup_world(1.0)
obs=load_mole(("Partyhat","Tux"))
for o in obs: o.hide_render=False; o.hide_viewport=False
bpy.context.scene.frame_set(1)
dg=bpy.context.evaluated_depsgraph_get()
for o in obs:
    if o.type!="MESH": continue
    ev=o.evaluated_get(dg); me=ev.to_mesh()
    zs=[(o.matrix_world@v.co).z for v in me.vertices]
    print("MZ",o.name,len(zs),round(min(zs),3),round(max(zs),3),[m.name for m in o.modifiers],[ (m.type) for m in o.modifiers])
    ev.to_mesh_clear()
