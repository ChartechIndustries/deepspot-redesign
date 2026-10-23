"""Crop test: python -I crops.py <final.png> <outprefix> [px,py per layout as desktop=0.3,0.5 ...]"""
import sys
from PIL import Image, ImageDraw, ImageFont
src, outp = sys.argv[1], sys.argv[2]
pos = {"desktop": (0.3, 0.5), "tablet": (0.2, 1.0), "phone": (0.2, 0.5), "phone2": (0.2, 0.5), "cta": (0.3, 0.5), "cta2": (0.3, 0.5)}
for a in sys.argv[3:]:
    k, v = a.split("="); pos[k] = tuple(float(x) for x in v.split(","))
layouts = [("desktop", 431, 331), ("tablet", 714, 301), ("phone", 328, 331), ("phone2", 328, 371), ("cta", 707, 413), ("cta2", 360, 413)]
im = Image.open(src).convert("RGB")
F = r"C:\Windows\Fonts\arialbd.ttf"
NAVY = (11, 26, 46)
tiles = []
for name, w, h in layouts:
    s = max(w / im.width, h / im.height)
    rw, rh = round(im.width * s), round(im.height * s)
    r = im.resize((rw, rh), Image.LANCZOS)
    px, py = pos[name]
    ox, oy = round((rw - w) * px), round((rh - h) * py)
    c = r.crop((ox, oy, ox + w, oy + h)).copy()
    d = ImageDraw.Draw(c)
    k = 0.8 if w < 400 else 1.0
    big = ImageFont.truetype(F, round(138 * k))
    mid = ImageFont.truetype(F, round(19 * k))
    sm = ImageFont.truetype(F, round(16 * k))
    d.text((w - 14, 6 * k), "$300", font=big, fill=NAVY, anchor="ra")
    d.text((w - 28, 150 * k), "for your curiosity.", font=mid, fill=NAVY, anchor="ra")
    t = "the competition " + chr(0x2192)
    d.text((w - 26, h - 38 * k), t, font=sm, fill=NAVY, anchor="ra")
    tw = d.textlength(t, font=sm)
    d.line((w - 26 - tw, h - 38 * k + 20 * k, w - 26, h - 38 * k + 20 * k), fill=NAVY, width=1)
    c.save(f"{outp}_{name}.png")
    tiles.append((name, c))
W = sum(t[1].width for t in tiles[:3]) + 40
sheet = Image.new("RGB", (max(W, 720 + 360 + 60), 331 + 413 + 301 + 80), (30, 30, 30))
x = 10
for n, c in tiles[:3] + []:
    sheet.paste(c, (x, 10)); x += c.width + 10
x = 10
sheet.paste(tiles[3][1], (x, 351)); x += 338
sheet.paste(tiles[4][1], (x, 351)); x += 717
sheet.paste(tiles[5][1], (10, 351 + 381 + 10)) if False else None
sheet.save(f"{outp}_sheet.png")
# phone-width downscale check
im.resize((328, round(328 * 1200 / 1920)), Image.LANCZOS).save(f"{outp}_328.png")
