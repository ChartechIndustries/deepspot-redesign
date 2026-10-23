"""python qa_crops.py renders/r1.png qa/r1_crops.png [px py]  -- cover-crop sheet with mock HTML copy."""
import sys
from PIL import Image, ImageDraw, ImageFont
src, out = sys.argv[1], sys.argv[2]
px = [float(v) for v in sys.argv[3].split('/')] if len(sys.argv) > 3 else [50, 50, 50]  # desktop/tablet/phone object-position x %
pos = (px[0], 50.0)
im = Image.open(src).convert("RGB")
F = r"C:\Windows\Fonts\arialbd.ttf"
SIZES = [("desktop 431x331", 431, 331, 38), ("tablet 357x301", 357, 301, 30), ("wide 714x301", 714, 301, 44),
         ("phone 328x331", 328, 331, 32), ("cta 707x413", 707, 413, 46), ("cta 360x413", 360, 413, 34)]
def cover(w, h, pos):
    s = max(w / im.width, h / im.height)
    nw, nh = round(im.width * s), round(im.height * s)
    r = im.resize((nw, nh), Image.LANCZOS)
    x = round((nw - w) * pos[0] / 100); y = round((nh - h) * pos[1] / 100)
    return r.crop((x, y, x + w, y + h))
tiles = []
for label, w, h, fs in SIZES:
    pp = {'desktop': px[0], 'tablet': px[1], 'phone': px[2]}.get(label.split()[0], 50.0)
    c = cover(w, h, (pp, 50.0)); d = ImageDraw.Draw(c)
    f = ImageFont.truetype(F, fs); fb = ImageFont.truetype(F, max(12, int(fs * 0.36)))
    m = 24
    d.text((w - m, m + 4), "the way", font=f, fill="white", anchor="ra")
    d.text((w - m, m + 4 + fs * 1.0), "forward.", font=f, fill="#9bf5b9", anchor="ra")
    t = "view our roadmap \u2197"
    d.text((w - m, h - 36), t, font=fb, fill="white", anchor="ra")
    tw = d.textlength(t, font=fb); d.line((w - m - tw, h - 26, w - m, h - 26), fill="white", width=1)
    tiles.append((label, c))
W = 20 + sum(t[1].width + 20 for t in tiles[:3]); 
rows = [tiles[:3], tiles[3:]]
sheet_w = max(sum(t[1].width + 20 for t in r) for r in rows) + 20
sheet_h = sum(max(t[1].height for t in r) + 44 for r in rows) + 10
sh = Image.new("RGB", (sheet_w, sheet_h), (20, 20, 24)); d = ImageDraw.Draw(sh)
y = 8
for r in rows:
    x = 20
    for label, c in r:
        d.text((x, y), label, fill="white", font=ImageFont.truetype(F, 14))
        sh.paste(c, (x, y + 22)); x += c.width + 20
    y += max(t[1].height for t in r) + 44
sh.save(out); print("saved", out, sh.size)
# 328px-wide downscale
im.resize((328, round(328 * im.height / im.width)), Image.LANCZOS).save(out.replace(".png", "_328.png"))
