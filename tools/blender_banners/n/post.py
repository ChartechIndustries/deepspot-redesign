import numpy as np
from PIL import Image

BG = (0x13, 0x21, 0x3a)


def composite(raw, out, glow=(0.76, 0.30)):
    im = Image.open(raw).convert("RGBA")
    w, h = im.size
    a = np.asarray(im).astype(np.float32) / 255.0
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # faint radial glow behind the subject (stays near brand navy)
    d = np.sqrt(((xx / w - glow[0]) * 1.2) ** 2 + ((yy / h - glow[1]) * 1.2) ** 2)
    g = np.clip(1 - d / 0.42, 0, 1) ** 2 * 0.22
    bg = np.array(BG, np.float32)[None, None, :] / 255.0
    lite = np.array((0x2a, 0x45, 0x78), np.float32)[None, None, :] / 255.0
    base = bg * (1 - g[..., None]) + lite * g[..., None]
    al = a[..., 3:4]
    rgb = a[..., :3] * al + base * (1 - al)
    rng = np.random.default_rng(3)
    rgb = rgb + rng.normal(0, 0.006, (h, w, 1))
    rgb = np.clip(rgb, 0, 1)
    Image.fromarray((rgb * 255 + 0.5).astype(np.uint8)).save(out)


def bbox(raw, thr=0.6):
    a = np.asarray(Image.open(raw).convert("RGBA"))[..., 3] / 255.0
    ys, xs = np.where(a > thr)
    h, w = a.shape
    return [round(100 * xs.min() / w, 1), round(100 * ys.min() / h, 1), round(100 * xs.max() / w, 1), round(100 * ys.max() / h, 1)]


def over_bg(rgba, size_h, bg=BG):
    """composite cut-out over bg colour, scaled to height size_h"""
    im = Image.open(rgba).convert("RGBA")
    return im
