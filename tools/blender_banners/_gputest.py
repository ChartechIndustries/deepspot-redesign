import bpy, sys, time
s=bpy.context.scene; s.render.engine='CYCLES'
p=bpy.context.preferences.addons['cycles'].preferences
for t in ('OPTIX','CUDA'):
    try:
        p.compute_device_type=t; p.get_devices(); [setattr(d,'use',True) for d in p.devices]; print('DEV',t,[d.name for d in p.devices if d.use]); break
    except Exception as e: print('fail',t,e)
s.cycles.device='GPU'; s.cycles.samples=32; s.render.resolution_x=640; s.render.resolution_y=400
s.render.filepath=sys.argv[-1]; t=time.time(); bpy.ops.render.render(write_still=True); print('TIME',time.time()-t)
