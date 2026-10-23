import sys, os, shutil
from PIL import Image
H = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(H, "..", "..", "..", "source", "banners"))
os.makedirs(OUT, exist_ok=True)
for n, src in (("1", "r1_v8"), ("2", "r2_v8"), ("3", "r3_v8")):
    shutil.copy(os.path.join(H, "renders", src + ".png"), os.path.join(H, "renders", f"r{n}.png"))
    im = Image.open(os.path.join(H, "renders", f"r{n}.png")).convert("RGB").resize((1600, 1000), Image.LANCZOS)
    for q in (82, 78, 74, 70, 66, 62):
        p = os.path.join(OUT, f"r{n}.webp")
        im.save(p, "WEBP", quality=q, method=6)
        sz = os.path.getsize(p)
        if sz <= 180 * 1024: break
    print(p, im.size, "q", q, sz // 1024, "KB")
