"""Make small card variants of every local photo: source/editorial-assets/cards/<stem>.webp (800 wide) and <stem>-400.webp.
Originals are never touched. Sources: spots/*, editorial-assets/*(+ext/*), site/assets/*, banners are skipped (already webp art).
Run:  python tools/make_card_images.py     (safe to re-run; existing 800 files are kept unless --force)"""
import os,sys
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','source')
OUT=os.path.join(ROOT,'editorial-assets','cards')
SRC=['spots','editorial-assets','editorial-assets/ext','site/assets']
force='--force' in sys.argv
os.makedirs(OUT,exist_ok=True)
seen={};made=0
for d in SRC:
    full=os.path.join(ROOT,d)
    for f in sorted(os.listdir(full)):
        p=os.path.join(full,f)
        if not os.path.isfile(p) or not f.lower().endswith(('.jpg','.jpeg','.png','.webp')): continue
        stem=os.path.splitext(f)[0]
        if stem in seen and seen[stem]!=p: print('STEM COLLISION',stem,seen[stem],p); continue
        seen[stem]=p
        im=Image.open(p).convert('RGB')
        for w,suffix in ((800,''),(400,'-400')):
            o=os.path.join(OUT,stem+suffix+'.webp')
            if os.path.exists(o) and not force: continue
            if im.width<=w and suffix=='' : r=im
            else: r=im.resize((w,max(1,round(im.height*w/im.width))),Image.LANCZOS) if im.width>w else im
            r.save(o,'WEBP',quality=78,method=6); made+=1
print('stems',len(seen),'files made',made)
