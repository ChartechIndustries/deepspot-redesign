import sys
from PIL import Image, ImageDraw, ImageFont
F = r"C:\Windows\Fonts\arialbd.ttf"
SIZES = [("desk", 431, 331), ("tab", 357, 301), ("wide", 714, 301), ("phone", 328, 331), ("cta707", 707, 413), ("cta360", 360, 413)]
def cover(im, w, h, ox, oy):
    s = max(w / im.width, h / im.height)
    nw, nh = round(im.width * s), round(im.height * s)
    im2 = im.resize((nw, nh), Image.LANCZOS)
    x = round((nw - w) * ox); y = round((nh - h) * oy)
    return im2.crop((x, y, x + w, y + h))
def copy(d, w, h):
    f1 = ImageFont.truetype(F, max(14, round(h * 0.17))); f2 = ImageFont.truetype(F, max(10, round(h * 0.045)))
    d.text((w * 0.055, h * 0.07), "oya history museum · utsunomiya, japan", font=f2, fill="white")
    y = h * 0.52
    d.text((w * 0.055, y), "go", font=f1, fill="white")
    d.text((w * 0.055, y + f1.size * 1.0), "underground.", font=f1, fill=(7, 214, 83))
    d.text((w * 0.055, h * 0.88), "spot of the week ↗", font=f2, fill="white")
    # seal placeholder (top-right circle)
    r = w * 0.17
    d.ellipse((w - r * 2 - w * 0.04, h * 0.04, w - w * 0.04, h * 0.04 + r * 2), outline=(7, 214, 83), width=2)
def sheet(name, pos, seal_overlay=None):
    im = Image.open(f"renders/{name}.png").convert("RGB")
    tiles = []
    for lab, w, h in SIZES[:4]:
        key = lab if lab in pos else "desk"
        t = cover(im, w, h, *pos[key]); d = ImageDraw.Draw(t); copy(d, w, h); tiles.append(t)
        t.save(f"qa/{name}_crop_{lab}.png")
    W = sum(t.width for t in tiles) + 10 * (len(tiles) + 1); H = max(t.height for t in tiles) + 20
    sh = Image.new("RGB", (W, H), (30, 30, 30)); x = 10
    for t in tiles: sh.paste(t, (x, 10)); x += t.width + 10
    sh.save(f"qa/{name}_cropsheet.png")
    # 328px wide
    im.resize((328, round(328 * im.height / im.width)), Image.LANCZOS).save(f"qa/{name}_328.png")
if __name__ == "__main__":
    import json
    name = sys.argv[1]; pos = json.loads(sys.argv[2])
    sheet(name, pos)
