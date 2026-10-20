import sys,glob,os
from PIL import Image,ImageDraw
Image.MAX_IMAGE_PIXELS=None
view,W,H,per=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])
fs=sorted(glob.glob(f'shots/{view}_*.png'))
for i in range(0,len(fs),per):
  grp=fs[i:i+per]; sheet=Image.new('RGB',(W*len(grp)+8*(len(grp)-1),H+22),'#777')
  d=ImageDraw.Draw(sheet)
  for j,f in enumerate(grp):
    im=Image.open(f).convert('RGB'); s=W/im.width; im=im.resize((W,int(im.height*s))).crop((0,0,W,H))
    x=j*(W+8); sheet.paste(im,(x,22)); d.text((x+3,4),os.path.basename(f)[len(view)+1:-4][:40],fill='white')
  sheet.save(f'sheets/{view}_{i//per:02d}.jpg',quality=80)
print(len(fs))
