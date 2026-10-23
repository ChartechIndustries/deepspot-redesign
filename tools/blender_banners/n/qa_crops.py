import os, sys
from PIL import Image, ImageDraw, ImageFont

H = os.path.dirname(os.path.abspath(__file__))
SIZES = [(431, 331), (714, 301), (328, 331), (707, 413), (360, 413), (632, 413)]
F = r"C:\Windows\Fonts\arialbd.ttf"
FR = r"C:\Windows\Fonts\arial.ttf"
# object-position per size (x%, y%)
POS = {}


def cover(im, w, h, px=0.5, py=0.5):
    s = max(w / im.width, h / im.height)
    r = im.resize((round(im.width * s) + 1, round(im.height * s) + 1), Image.LANCZOS)
    x = round((r.width - w) * px)
    y = round((r.height - h) * py)
    return r.crop((x, y, x + w, y + h))


def copy(d, w, h):
    # approximate CTA copy as in the before screenshot (632x413): heading, paragraph, input row, note
    k = w / 632.0
    kh = h / 413.0
    s = min(k, kh * 1.0) if w >= 600 else 1.0
    fb = ImageFont.truetype(F, int(38 * s))
    fp = ImageFont.truetype(FR, int(17 * s))
    pad = int(56 * s) if w >= 600 else 24
    y = int(78 * kh) if w >= 600 else 22
    for line in ("new stories", "every week."):
        d.text((pad, y), line, font=fb, fill=(184, 192, 255))
        y += int(40 * s)
    y += int(22 * s)
    d.text((pad, y), "Get the latest deep spots delivered to your inbox.", font=fp, fill=(180, 190, 205))
    y += int(56 * s)
    d.rounded_rectangle((pad, y, pad + int((w - 2 * pad) * 0.64), y + int(54 * s)), 3, fill=(17, 27, 42), outline=(50, 62, 85))
    d.rounded_rectangle((pad + int((w - 2 * pad) * 0.66), y, w - pad, y + int(54 * s)), 3, fill=(24, 40, 66), outline=(50, 62, 85))
    d.text((pad + 14, y + int(16 * s)), "enter your email", font=fp, fill=(140, 150, 165))
    d.text((pad + int((w - 2 * pad) * 0.66) + 18, y + int(16 * s)), "subscribe", font=fp, fill=(190, 200, 220))


def run(name, pos):
    im = Image.open(os.path.join(H, "renders", name + ".png")).convert("RGB")
    tiles = []
    for (w, h) in SIZES:
        px, py = pos.get((w, h), pos.get("default", (0.5, 0.5)))
        t = cover(im, w, h, px, py)
        if w in (707, 632, 360):
            d = ImageDraw.Draw(t)
            copy(d, w, h)
        tiles.append(t)
    sheet_w = max(sum(t.width for t in tiles[:3]) + 40, sum(t.width for t in tiles[3:]) + 40)
    rows = [tiles[:3], tiles[3:]]
    sheet = Image.new("RGB", (sheet_w, sum(max(t.height for t in r) + 12 for r in rows) + 8), (60, 60, 60))
    y = 8
    for r in rows:
        x = 8
        for t in r:
            sheet.paste(t, (x, y))
            x += t.width + 12
        y += max(t.height for t in r) + 12
    sheet.save(os.path.join(H, "qa", name + "_crops.png"))
    small = im.resize((328, round(328 * im.height / im.width)), Image.LANCZOS)
    small.save(os.path.join(H, "qa", name + "_328.png"))
    print(name, "ok")


if __name__ == "__main__":
    import json
    pos = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    p = {}
    for k, v in pos.items():
        p[tuple(int(i) for i in k.split("x")) if k != "default" else "default"] = tuple(v)
    run(sys.argv[1], p)
