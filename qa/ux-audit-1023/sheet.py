import sys,glob,os,re
from PIL import Image
k=sys.argv[1]; per=int(sys.argv[2]) if len(sys.argv)>2 else 5
os.makedirs('sheets',exist_ok=True)
groups={}
for f in sorted(glob.glob(f'shots/{k}_*.jpg')):
  groups.setdefault(re.sub(r'_\d\d\.jpg$','',os.path.basename(f)),[]).append(f)
for g,fs in groups.items():
  for j in range(0,len(fs),per):
    ims=[Image.open(f) for f in fs[j:j+per]]
    w,h=ims[0].size; S=Image.new('RGB',(w*len(ims)+8*(len(ims)-1),h),(255,0,255))
    for i,im in enumerate(ims): S.paste(im,(i*(w+8),0))
    S.save(f'sheets/{g}_{j//per}.jpg',quality=80)
print(len(groups))
