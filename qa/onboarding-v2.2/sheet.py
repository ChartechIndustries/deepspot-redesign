import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
ims=[Image.open(f).convert('RGB') for f in files]
h=max(i.height for i in ims); w=sum(i.width for i in ims)+6*(len(ims)-1)
sh=Image.new('RGB',(w,h),'red'); x=0
for i in ims: sh.paste(i,(x,0)); x+=i.width+6
sh.save(out)
