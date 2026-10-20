import sys
from PIL import Image
f,y0,y1=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]); w=int(sys.argv[4]) if len(sys.argv)>4 else None
im=Image.open(f); im=im.crop((0,y0,im.size[0],min(y1,im.size[1])))
if w and im.size[0]>w: im=im.resize((w,int(im.size[1]*w/im.size[0])))
im.save('../_crop.png'); print(Image.open(f).size)
