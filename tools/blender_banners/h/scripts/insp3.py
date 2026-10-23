import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s=reset(); objs=load_mole('Hard Hat')
for nm in ('Body.png','headmolemannew.png','headmoleman.png','HardHat.png.001'):
    im=bpy.data.images.get(nm)
    if not im: print('noimg',nm); continue
    print('IMG',nm,im.size,im.alpha_mode,im.colorspace_settings.name,im.file_format, 'packed',bool(im.packed_file))
    im.filepath_raw=ROOT+'/renders/_tex_'+nm.replace('.png','').replace('.','_')+'.png'; im.file_format='PNG'; im.save()
m=bpy.data.objects['Body2'].material_slots[0].material
for l in m.node_tree.links: print('LK',l.from_node.name,l.from_socket.name,'->',l.to_node.name,l.to_socket.name)
m=bpy.data.objects['Head'].material_slots[0].material
for l in m.node_tree.links: print('LKH',l.from_node.name,l.from_socket.name,'->',l.to_node.name,l.to_socket.name)
for o in objs: print('P',o.name,o.parent.name if o.parent else None, [md.type for md in o.modifiers] if o.type=='MESH' else '')
