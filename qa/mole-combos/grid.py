import sys,glob,os
from PIL import Image,ImageDraw
fs=sorted(glob.glob(sys.argv[1])); cols=int(sys.argv[3]); W=240
rows=(len(fs)+cols-1)//cols; s=Image.new('RGB',(cols*W,rows*(W+14)),'white'); d=ImageDraw.Draw(s)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').crop((40,20,320,300)).resize((W,W)); x,y=(i%cols)*W,(i//cols)*(W+14)
  s.paste(im,(x,y+14)); d.text((x+3,y+1),os.path.basename(f)[6:-4],fill='black')
s.save(sys.argv[2],quality=82); print(len(fs))
