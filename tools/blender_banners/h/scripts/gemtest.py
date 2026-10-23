import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s=reset(); setup_render(s,samples=64,w=1200,h=400); world_hdri(s,strength=0.3,rot=math.radians(200)); s.view_settings.exposure=-0.4
variants=[(0.0,0.1,0.02,0.1,1.0),(0.0,0.18,0.5,0.1,0.55),(0.25,0.12,0.5,0.25,0.7),(0.6,0.08,0.4,0.3,0.5)]
for i,(met,rough,spec,_,em) in enumerate(variants):
    m=gem_material(emit=em)
    b=principled(m); b.inputs['Metallic'].default_value=met; b.inputs['Roughness'].default_value=rough; b.inputs['Specular IOR Level'].default_value=spec
    b.inputs['Base Color'].default_value=srgb('0a9a35') if met>0 else srgb('003a12')
    add_gem('G%d'%i,0.05,(i*0.13-0.2,0,0.05),rot=(math.radians(60),0,math.radians(14)),n=8,material=m)
catcher(2,0)
area('k',(-0.9,-1.2,1.1),(0,0,0.05),0.9,85); area('f',(1.1,-1.0,0.5),(0,0,0.05),1.2,22); area('r',(0.7,1.2,0.9),(0,0,0.05),0.8,60)
camera((-0.2,-1.3,0.7),(0,0,0.05),lens=70)
render(args()[0])
