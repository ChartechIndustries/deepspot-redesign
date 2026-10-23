"""Slice a full-page shot into side-by-side columns so one Read shows the whole page.
usage: python sheet.py <shot_full.png> [colh] -> sheets/<name>.jpg (one or more pages)"""
import sys,os
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'sheets'); os.makedirs(OUT,exist_ok=True)
def sheet(path,colh=None,maxcols=None):
  im=Image.open(path).convert('RGB'); w,h=im.size
  mobile=w<800
  colh=colh or (1700 if mobile else 1800)
  maxcols=maxcols or (5 if mobile else 2)
  cols=[im.crop((0,y,w,min(h,y+colh))) for y in range(0,h,colh)]
  base=os.path.splitext(os.path.basename(path))[0].replace('_full','')
  outs=[]
  for pi in range(0,len(cols),maxcols):
    grp=cols[pi:pi+maxcols]; gap=12
    S=Image.new('RGB',(len(grp)*w+(len(grp)-1)*gap,colh),(255,0,255))
    for i,c in enumerate(grp): S.paste(c,(i*(w+gap),0))
    o=os.path.join(OUT,f'{base}_p{pi//maxcols+1}.jpg'); S.save(o,quality=85); outs.append(o)
  return outs
if __name__=='__main__':
  for p in sys.argv[1:]:
    for o in sheet(p): print(o)
