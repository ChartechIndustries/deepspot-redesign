import sys,glob
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]; H=520
ims=[]
for f in files:
  im=Image.open(f).convert('RGB'); w=int(im.width*H/im.height); ims.append(im.resize((w,H)))
W=sum(i.width for i in ims)+8*(len(ims)-1); s=Image.new('RGB',(W,H),'#888'); x=0
for i in ims: s.paste(i,(x,0)); x+=i.width+8
s.save(out)
