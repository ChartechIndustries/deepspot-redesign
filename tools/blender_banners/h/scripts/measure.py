import bpy,sys
bpy.ops.wm.read_factory_settings(use_empty=True)
for f in (r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\assets\rusted_spade_01\rusted_spade_01_2k.gltf",r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\assets\stone_01\stone_01_1k.gltf"):
    bpy.ops.import_scene.gltf(filepath=f)
for o in bpy.data.objects:
    print('OBJ',o.name,o.type,tuple(round(x,3) for x in o.dimensions),tuple(round(x,3) for x in o.location),[m.name for m in o.data.materials] if o.type=='MESH' else '', len(o.data.vertices) if o.type=='MESH' else '')
m=bpy.data.materials.new('t'); m.use_nodes=True
print([i.name for i in next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs])
print([i.identifier for i in bpy.types.ViewLayer.bl_rna.properties] [:0])
print([i.identifier for i in bpy.types.ViewSettings.bl_rna.properties['look'].enum_items])
