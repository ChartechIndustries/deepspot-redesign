import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
from common import *
s=reset(); setup_render(s,samples=48,w=500,h=500); world_hdri(s,strength=0.3,rot=math.radians(200)); s.view_settings.exposure=-0.4
objs=load_mole('Hard Hat')
for o in objs: o.hide_render=False; o.hide_viewport=False
tune_mole()
hat=bpy.data.objects['Hard Hat']
V=[float(x) for x in args()[1:4]]
pose_hat(hat,V[0],V[1],V[2])
catcher(20,-1.1574)
area('Key',(-4,-6,6),(0,0,0.5),5,2200); area('Fill',(5,-5,2),(0,0,0.5),6,500)
for nm,az in (('a',-35),('b',-60)):
    a=math.radians(az)
    # model faces +X; camera sits in front-left quadrant
    d=Vector((math.cos(a),math.sin(a),0))
    camera((0.2+d.x*14,d.y*14,0.4+5.5),(0.2,0,0.3),lens=85)
    render(args()[0].replace('.png','_%s.png'%nm))
