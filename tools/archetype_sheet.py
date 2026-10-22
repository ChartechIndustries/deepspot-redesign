"""Contact sheets for the archetype icons (resvg, no browser).
Run: python tools/archetype_sheet.py [round-tag]
Writes qa/archetype-icons/<tag>-cream.png, <tag>-ink.png, <tag>-grid.png
"""
import io, sys, pathlib, importlib.util
import psutil, resvg_py
from PIL import Image, ImageDraw, ImageFont

try:
    psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)
except Exception:
    pass

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('arch', ROOT / 'tools' / 'archetypes.py')
arch = importlib.util.module_from_spec(spec); spec.loader.exec_module(arch)
OUT = ROOT / 'qa' / 'archetype-icons'; OUT.mkdir(parents=True, exist_ok=True)
tag = sys.argv[1] if len(sys.argv) > 1 else 'r1'
only = sys.argv[2].split(',') if len(sys.argv) > 2 else None
CREAM, INK = '#fbfaf5', '#0b1b27'
try:
    FONT = ImageFont.truetype('arial.ttf', 13)
except Exception:
    FONT = ImageFont.load_default()


def svg(body, color, grid=False):
    g = ''
    if grid:
        g = ''.join(f'<path d="M{i} 0V24M0 {i}H24" stroke="#c43" stroke-opacity=".18" stroke-width=".05"/>' for i in range(25))
        g += '<path d="M2 2h20v20H2Z" stroke="#c43" stroke-opacity=".6" stroke-width=".08" fill="none"/>'
    body = body.replace('currentColor', color)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">{g}<g fill="none" stroke="{color}" '
            f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>')


def png(s, px, bg):
    return Image.open(io.BytesIO(resvg_py.svg_to_bytes(svg_string=s, width=px, height=px, background=bg))).convert('RGB')


items = [a for a in arch.A if not only or a[1] in only]


def sheet(fg, bg, name):
    sizes = [96, 48, 24, 16]
    cw, ch, cols = 232, 128, 6
    rows = (len(items) + cols - 1) // cols
    im = Image.new('RGB', (cols * cw + 20, rows * ch + 20), bg); d = ImageDraw.Draw(im)
    for k, (g, i, n, desc, body) in enumerate(items):
        x0, y0 = 10 + (k % cols) * cw, 10 + (k // cols) * ch
        x = x0
        for s in sizes:
            im.paste(png(svg(body, fg), s, bg), (x, y0 + (96 - s) // 2)); x += s + 12
        d.text((x0, y0 + 102), f'{k+1}. {i}', fill=fg, font=FONT)
    im.save(OUT / f'{tag}-{name}.png')


def grid():
    px, cols = 168, 6
    rows = (len(items) + cols - 1) // cols
    im = Image.new('RGB', (cols * (px + 16) + 16, rows * (px + 30) + 16), '#ffffff'); d = ImageDraw.Draw(im)
    for k, (g, i, n, desc, body) in enumerate(items):
        x0, y0 = 16 + (k % cols) * (px + 16), 16 + (k // cols) * (px + 30)
        im.paste(png(svg(body, INK, True), px, '#ffffff'), (x0, y0))
        d.text((x0, y0 + px + 4), f'{k+1}. {i}', fill=INK, font=FONT)
    im.save(OUT / f'{tag}-grid.png')


def small():
    # 16 and 24 px renders, blown up 4x (nearest) to judge real pixels; cream and ink side by side
    cols, z = 5, 4
    cw, ch = (16 + 24) * z * 2 + 60, 24 * z + 26
    rows = (len(items) + cols - 1) // cols
    im = Image.new('RGB', (cols * cw + 10, rows * ch + 10), '#888888'); d = ImageDraw.Draw(im)
    for k, (g, i, n, desc, body) in enumerate(items):
        x, y0 = 10 + (k % cols) * cw, 6 + (k // cols) * ch
        for fg, bg in ((INK, CREAM), (CREAM, INK)):
            for s in (16, 24):
                t = png(svg(body, fg), s, bg).resize((s * z, s * z), Image.NEAREST)
                im.paste(t, (x, y0)); x += s * z + 6
            x += 12
        d.text((10 + (k % cols) * cw, y0 + 24 * z + 4), f'{k+1}. {i}', fill='#000', font=FONT)
    im.save(OUT / f'{tag}-small.png')


sheet(INK, CREAM, 'cream'); sheet(CREAM, INK, 'ink'); grid(); small()
print('wrote', OUT / f'{tag}-*.png')


def bounds():
    # ink bbox at 240px (10px per unit): geometry must stay inside 2..22, so ink must stay inside 1..23 units
    bad = []
    for g, i, n, desc, body in items:
        im = Image.open(io.BytesIO(resvg_py.svg_to_bytes(svg_string=svg(body, '#000'), width=240, height=240))).getchannel('A')
        x0, y0, x1, y1 = im.getbbox()
        if min(x0, y0) < 10 or max(x1, y1) > 230:
            bad.append((i, [round(v / 10, 1) for v in (x0, y0, x1, y1)]))
    print('edge check:', bad or 'all inside 1..23')


bounds()
