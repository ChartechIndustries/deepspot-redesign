"""Post for the transparent cut-outs. Straight-alpha PNG in -> straight-alpha PNG out.
Shadow pixels get a navy tint, glow + sparkles are added with alpha, light grain on opaque pixels."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BG = (0x3a, 0x5b, 0xef)
NAVY = np.array([0x0b, 0x1a, 0x5e], np.float32) / 255.0


def _add(prem, a, f, col):
    add = np.clip(f, 0, 1) * col
    prem = 1 - (1 - prem) * (1 - add)
    a = 1 - (1 - a) * (1 - np.clip(add.max(-1, keepdims=True), 0, 1))
    return prem, a


def stars(prem, a, items, w, h):
    for (sx, sy, size, st) in items:
        m = Image.new('L', (w, h), 0)
        d = ImageDraw.Draw(m)
        cx, cy, L, t = sx * w, sy * h, size * w, size * w * 0.09
        d.polygon([(cx, cy - L), (cx + t, cy - t), (cx + L, cy), (cx + t, cy + t), (cx, cy + L), (cx - t, cy + t), (cx - L, cy), (cx - t, cy - t)], fill=255)
        core = np.asarray(m.filter(ImageFilter.GaussianBlur(max(0.6, L * 0.02)))).astype(np.float32) / 255.0
        halo = np.asarray(m.filter(ImageFilter.GaussianBlur(L * 0.5))).astype(np.float32) / 255.0
        f = (np.clip(core * 1.2, 0, 1) * st + halo * 0.7 * st)[..., None]
        prem, a = _add(prem, a, f, np.array([0.95, 1.0, 0.95], np.float32))
    return prem, a


def comp(src, dst, glows=(), sparks=(), grain=0.008, seed=3):
    im = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32) / 255.0
    rgb, a = im[..., :3], im[..., 3:4]
    h, w = a.shape[:2]
    lum = rgb.sum(-1, keepdims=True)
    sh = np.clip(1 - lum * 20, 0, 1) * np.sqrt(np.clip(1 - a, 0, 1))   # shadow pixels only (dark AND translucent): keeps near-black fur black
    rgb = rgb * (1 - sh) + NAVY * sh
    xs = np.minimum(np.arange(w), w - 1 - np.arange(w)) / w
    ys = np.minimum(np.arange(h), h - 1 - np.arange(h)) / h
    win = np.clip(np.minimum(xs[None, :], ys[:, None]) / 0.07, 0, 1)
    win = win * win * (3 - 2 * win)
    a = a * win[..., None]            # soft shadow tail never reaches the frame edge
    prem = rgb * a
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    for (gx, gy, rad, st, cr, cg, cb) in glows:
        d2 = ((xx - gx * w) ** 2 + (yy - gy * h) ** 2) / (rad * w) ** 2
        prem, a = _add(prem, a, np.exp(-d2 * 2.2)[..., None] * st, np.array([cr, cg, cb], np.float32))
    prem, a = stars(prem, a, sparks, w, h)
    rgb = np.where(a > 1e-4, prem / np.maximum(a, 1e-4), 0)
    rng = np.random.default_rng(seed)
    rgb = np.clip(rgb + rng.normal(0, grain, (h, w, 1)).astype(np.float32) * (a > 0.5), 0, 1)
    out = np.concatenate([rgb, a], -1)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA').save(dst)


def over_bg(src, bg=BG):
    im = Image.open(src).convert('RGBA')
    b = Image.new('RGBA', im.size, bg + (255,))
    b.alpha_composite(im)
    return b
