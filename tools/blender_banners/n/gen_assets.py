"""Procedural PIL textures (no text, no AI). Run with system python."""
import math, os, random
from PIL import Image, ImageDraw, ImageFilter

A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
os.makedirs(A, exist_ok=True)
W, H = 1480, 1050
CREAM = (243, 239, 228)
GREEN = (7, 214, 83)
COBALT = (60, 96, 255)
NAVY = (19, 33, 58)
YEL = (255, 212, 0)
random.seed(7)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def halftone(img, box, color, pitch=22, maxr=9, direction="down"):
    """dot gradient inside box, dots grow along direction"""
    d = ImageDraw.Draw(img)
    x0, y0, x1, y1 = box
    row = 0
    y = y0
    while y < y1:
        x = x0 + (pitch / 2 if row % 2 else 0)
        while x < x1:
            t = (y - y0) / (y1 - y0) if direction == "down" else 1 - (y - y0) / (y1 - y0)
            r = maxr * t
            if r > 0.8:
                d.ellipse((x - r, y - r, x + r, y + r), fill=color)
            x += pitch
        y += pitch * 0.866
        row += 1


def frame(art):
    """white card margin around a picture"""
    card = Image.new("RGB", (W, H), CREAM)
    m = 62
    card.paste(art.resize((W - 2 * m, H - 2 * m)), (m, m))
    return card


def sunset():
    im = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(im)
    for y in range(H):
        t = y / H
        d.line((0, y, W, y), fill=lerp((255, 120, 90), (255, 214, 90), t) if t < 0.62 else (255, 214, 90))
    d.ellipse((W * 0.58 - 170, H * 0.38 - 170, W * 0.58 + 170, H * 0.38 + 170), fill=(255, 245, 210))
    halftone(im, (0, 0, W, int(H * 0.5)), (255, 160, 100), 26, 9, "up")
    for i, (c, base, amp) in enumerate([((60, 96, 255), 0.62, 0.12), ((38, 64, 190), 0.74, 0.1), (NAVY, 0.86, 0.08)]):
        pts = [(0, H)]
        for x in range(0, W + 40, 40):
            pts.append((x, H * base - amp * H * (0.5 + 0.5 * math.sin(x / (170 + 60 * i) + i * 2))))
        pts.append((W, H))
        d.polygon(pts, fill=c)
    return frame(im)


def tunnel():
    im = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(im)
    cx, cy = W * 0.5, H * 0.55
    for i in range(14):
        t = i / 13
        rx, ry = 640 * (1 - t) ** 1.25 + 8, 520 * (1 - t) ** 1.25 + 8
        c = lerp((60, 96, 255), (7, 214, 83), t) if i % 2 == 0 else lerp((24, 40, 80), (14, 120, 70), t)
        d.ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=c)
    d.ellipse((cx - 28, cy - 22, cx + 28, cy + 22), fill=(255, 245, 210))
    halftone(im, (0, 0, W, int(H * 0.35)), (40, 64, 120), 24, 8, "up")
    return frame(im)


def skyline():
    im = Image.new("RGB", (W, H), COBALT)
    d = ImageDraw.Draw(im)
    for y in range(H):
        d.line((0, y, W, y), fill=lerp((40, 64, 190), (120, 150, 255), y / H))
    d.ellipse((W * 0.2 - 90, 150 - 90, W * 0.2 + 90, 150 + 90), fill=YEL)
    x = 0
    while x < W:
        bw = random.randint(110, 210)
        bh = random.randint(260, 640)
        d.rectangle((x, H - bh, x + bw, H), fill=NAVY)
        for wx in range(x + 18, x + bw - 30, 44):
            for wy in range(H - bh + 24, H - 40, 64):
                if random.random() < 0.45:
                    d.rectangle((wx, wy, wx + 20, wy + 30), fill=YEL)
        x += bw + random.randint(4, 24)
    return frame(im)


def cavern():
    im = Image.new("RGB", (W, H), (40, 28, 30))
    d = ImageDraw.Draw(im)
    for y in range(H):
        d.line((0, y, W, y), fill=lerp((30, 22, 28), (120, 70, 50), y / H))
    for i in range(4):
        cx = W * (0.14 + 0.24 * i)
        d.rounded_rectangle((cx - 110, 330, cx + 110, H), radius=110, fill=lerp((255, 190, 90), (255, 120, 50), i / 3))
        d.rounded_rectangle((cx - 70, 400, cx + 70, H), radius=70, fill=(255, 235, 170))
    d.rectangle((0, H - 170, W, H), fill=(34, 24, 28))
    halftone(im, (0, 0, W, 300), (80, 50, 44), 24, 8, "up")
    return frame(im)


def lines(d, x0, y0, x1, n, gap, col=(150, 150, 160), w=5):
    for i in range(n):
        xx = x1 - (0 if i < n - 1 else (x1 - x0) * 0.35)
        d.line((x0, y0 + i * gap, xx, y0 + i * gap), fill=col, width=w)


def stamp(d, x0, y0, w, h, col=GREEN):
    # scalloped (perforated) edge
    d.rectangle((x0, y0, x0 + w, y0 + h), fill=(250, 248, 240))
    step = 22
    for x in range(int(x0), int(x0 + w) + 1, step):
        d.ellipse((x - 7, y0 - 7, x + 7, y0 + 7), fill=CREAM)
        d.ellipse((x - 7, y0 + h - 7, x + 7, y0 + h + 7), fill=CREAM)
    for y in range(int(y0), int(y0 + h) + 1, step):
        d.ellipse((x0 - 7, y - 7, x0 + 7, y + 7), fill=CREAM)
        d.ellipse((x0 + w - 7, y - 7, x0 + w + 7, y + 7), fill=CREAM)
    p = 22
    d.rectangle((x0 + p, y0 + p, x0 + w - p, y0 + h - p), fill=col)
    cx, cy = x0 + w / 2, y0 + h / 2
    for a in range(3):
        ang = math.radians(a * 60 + 90)
        dx, dy = math.cos(ang) * w * 0.3, math.sin(ang) * w * 0.3
        d.line((cx - dx, cy - dy, cx + dx, cy + dy), fill=(250, 248, 240), width=14)
    d.ellipse((cx - 11, cy - 11, cx + 11, cy + 11), fill=(250, 248, 240))


def postmark(d, cx, cy, r, col=(70, 80, 110)):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=col, width=6)
    d.ellipse((cx - r * 0.72, cy - r * 0.72, cx + r * 0.72, cy + r * 0.72), outline=col, width=3)
    for i in range(5):
        y = cy - 40 + i * 20
        d.line((cx - r * 0.5, y, cx + r * 0.5, y), fill=col, width=4)
    for i in range(5):
        y = cy - 50 + i * 24
        pts = [(cx + r + 30 + k * 14, y + 8 * math.sin(k * 0.9)) for k in range(18)]
        d.line(pts, fill=col, width=5)


def back():
    im = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(im)
    d.line((W * 0.52, 120, W * 0.52, H - 120), fill=(190, 188, 180), width=5)
    lines(d, W * 0.58, H * 0.52, W - 120, 4, 90)
    stamp(d, W - 120 - 270, 110, 270, 330)
    postmark(d, W * 0.62, 250, 105)
    # left: message lines + small illustration block
    for i in range(6):
        d.line((120, 160 + i * 86, W * 0.46 - (80 if i % 3 == 2 else 0), 160 + i * 86), fill=(190, 188, 180), width=5)
    d.rectangle((120, 700, W * 0.46, H - 120), fill=(228, 233, 245))
    halftone(im, (120, 700, int(W * 0.46), H - 120), (60, 96, 255), 20, 8, "down")
    return im


def letter(base, tint=None, stamp_col=GREEN):
    LW, LH = 1500, 1100
    im = Image.new("RGB", (LW, LH), base)
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, LW - 1, LH - 1), outline=tint or (205, 200, 190), width=8)
    # airmail stripes border
    for i in range(0, LW, 70):
        d.polygon([(i, 0), (i + 40, 0), (i + 15, 36), (i - 25, 36)], fill=COBALT)
        d.polygon([(i + 40, LH), (i + 80, LH), (i + 55, LH - 36), (i + 15, LH - 36)], fill=(235, 70, 70))
    stamp(d, LW - 330, 80, 230, 280, stamp_col)
    lines(d, 330, 520, LW - 460, 4, 100, (150, 150, 165), 7)
    return im


def cobalt_env():
    return Image.new("RGB", (64, 64), COBALT)


if __name__ == "__main__":
    sunset().save(os.path.join(A, "pc_sunset.png"))
    tunnel().save(os.path.join(A, "pc_tunnel.png"))
    skyline().save(os.path.join(A, "pc_skyline.png"))
    cavern().save(os.path.join(A, "pc_cavern.png"))
    back().save(os.path.join(A, "pc_back.png"))
    letter((246, 243, 234)).save(os.path.join(A, "let_cream.png"))
    letter((255, 232, 140), (220, 190, 70), COBALT).save(os.path.join(A, "let_yellow.png"))
    letter((222, 232, 255), (150, 170, 230), GREEN).save(os.path.join(A, "let_blue.png"))
    print("ok")
    for nme in ("let_cream", "let_yellow", "let_blue", "pc_sunset"):
        Image.open(os.path.join(A, nme + ".png")).rotate(-90, expand=True).save(os.path.join(A, nme + "_p.png"))
    print("portrait ok")
