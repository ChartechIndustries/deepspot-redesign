import sys
from PIL import Image
# mont.py out.png f1 f2 ...
out=sys.argv[1]; ims=[Image.open(f).convert('RGB') for f in sys.argv[2:]]
W=sum(i.width for i in ims)+12*(len(ims)-1); H=max(i.height for i in ims)
c=Image.new('RGB',(W,H),(128,128,128)); x=0
for i in ims: c.paste(i,(x,0)); x+=i.width+12
c.save(out)
