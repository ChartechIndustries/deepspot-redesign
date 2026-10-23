import bpy
with bpy.data.libraries.load(r"C:\Users\CharD\Downloads\BLOOD1.blend",link=False) as (s,d):
    print('COLS',s.collections); print('OBJS',len(s.objects),'MATS',len(s.materials))
    d.collections=s.collections; d.objects=s.objects
for c in bpy.data.collections:
    print('COL',c.name,[ (o.name,o.type) for o in c.objects][:60])
