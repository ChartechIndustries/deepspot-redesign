import sys
from PIL import Image
ref=Image.open(r"C:\Users\CharD\Downloads\download (22).png").convert('RGB')
ours=Image.open(sys.argv[1]).convert('RGB')
# ours: chrome screenshot 1568 wide of a 2560 viewport -> upscale factor to device px ~1.63; crop a globe region
rc=ref.crop((700,250,860,370)).resize((640,480),Image.NEAREST)
oc=ours.crop(tuple(int(v) for v in sys.argv[2:6])).resize((640,480),Image.NEAREST)
out=Image.new('RGB',(1290,480),(0,0,0)); out.paste(rc,(0,0)); out.paste(oc,(650,0)); out.save("compare.png"); print("ok")
