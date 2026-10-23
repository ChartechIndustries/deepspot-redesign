import sys, json, os
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
import post
from PIL import Image
R = r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\renders" + "\\"
SRC = r"C:\Users\CharD\Desktop\DeepSpot Globe\source\banners" + "\\"
vid = sys.argv[1]
raw = R + vid + '_raw.png'
out = R + vid + '.png'
m = json.load(open(R + vid + '_meta.json'))
gx, gy = m['gem']
G = (0.15, 1.0, 0.4)
if vid == 'h2':
    glows = [(gx, gy, 0.07, 0.22, *G)]
    sparks = [(gx + 0.06, gy - 0.07, 0.035, 0.9), (gx - 0.08, gy - 0.02, 0.02, 0.7), (gx + 0.1, gy + 0.04, 0.016, 0.6)]
elif vid == 'h3':
    glows = [(gx, gy, 0.12, 0.2, *G)]
    sparks = [(gx - 0.02, gy - 0.2, 0.04, 0.9), (gx - 0.14, gy - 0.1, 0.022, 0.7), (gx + 0.1, gy - 0.1, 0.014, 0.6)]
else:
    glows = [(gx, gy, 0.12, 0.24, *G), (gx, gy, 0.2, 0.06, *G)]
    sparks = [(gx + 0.07, gy - 0.16, 0.04, 0.9), (gx - 0.12, gy - 0.07, 0.022, 0.7), (gx + 0.15, gy - 0.02, 0.016, 0.6), (gx - 0.03, gy - 0.24, 0.014, 0.5)]
post.comp(raw, out, glows=glows, sparks=sparks)
im = Image.open(out)
bb = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
print(vid, im.size, 'alpha bbox', bb, 'margins', bb[0], bb[1], im.size[0] - bb[2], im.size[1] - bb[3])
os.makedirs(SRC, exist_ok=True)
w = im.resize((1000, 1000), Image.LANCZOS)
for q in (80, 72, 64, 56, 48):
    w.save(SRC + vid.replace('h', 'h') + '.webp', 'WEBP', quality=q, method=6)
    if os.path.getsize(SRC + vid + '.webp') <= 150 * 1024:
        break
print('webp', q, os.path.getsize(SRC + vid + '.webp') // 1024, 'KB')
