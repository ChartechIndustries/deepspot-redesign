import sys
from PIL import Image
# sheet.py out cols h pattern names...
out=sys.argv[1];h=int(sys.argv[2]);names=sys.argv[3:]
ims=[Image.open(n).convert('RGB') for n in names]
W=sum(i.width for i in ims)+8*(len(ims)-1);H=min(h,max(i.height for i in ims))
s=Image.new('RGB',(W,H),(60,60,60));x=0
for i in ims:
    s.paste(i.crop((0,0,i.width,min(H,i.height))),(x,0));x+=i.width+8
s.save(out)
