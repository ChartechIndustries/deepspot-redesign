import sys
from PIL import Image
fs=sys.argv[2:];out=sys.argv[1]
ims=[Image.open(f) for f in fs]
sh=Image.new('RGB',(sum(i.width for i in ims)+8*(len(ims)-1),max(i.height for i in ims)),(60,60,60))
x=0
for i in ims: sh.paste(i,(x,0)); x+=i.width+8
sh.save(out)
