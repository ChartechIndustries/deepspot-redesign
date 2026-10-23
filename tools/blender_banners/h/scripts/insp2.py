import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s=reset(); objs=load_mole('Hard Hat')
for o in objs:
    print('OBJ',o.name,o.type,'hide',o.hide_render,'holdout',getattr(o,'is_holdout',None))
    if o.type!='MESH': continue
    for sl in o.material_slots:
        m=sl.material
        if not m: continue
        print('  MAT',m.name,'blend',getattr(m,'blend_method',None),'render_method',getattr(m,'surface_render_method',None))
        if m.use_nodes:
            for n in m.node_tree.nodes:
                extra=''
                if n.type=='TEX_IMAGE': extra=(n.image.name if n.image else None, n.image.alpha_mode if n.image else None)
                if n.type=='BSDF_PRINCIPLED': extra=('alpha',round(n.inputs['Alpha'].default_value,2),'linked',n.inputs['Alpha'].is_linked,'base',tuple(round(x,2) for x in n.inputs['Base Color'].default_value))
                print('     ',n.type,n.name,extra)
            for l in m.node_tree.links:
                if l.to_socket.name in('Alpha','Fac','Factor','Surface'): print('      LINK',l.from_node.name,l.from_socket.name,'->',l.to_node.name,l.to_socket.name)
