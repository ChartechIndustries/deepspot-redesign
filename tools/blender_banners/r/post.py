import numpy as np
from PIL import Image
BG = np.array([0x3c, 0x60, 0xff], dtype=np.float32)
def composite(raw, out, grain=2.2, vig=0.035, mask=None):
    im = Image.open(raw).convert("RGBA")
    a = np.asarray(im).astype(np.float32)
    al = a[..., 3:4] / 255.0
    rgb = a[..., :3] * al + BG * (1 - al)
    h, w = rgb.shape[:2]
    import os
    mask = mask or raw.replace("_raw.png", "_mask.png")
    if os.path.exists(mask):
        mk = np.asarray(Image.open(mask).convert("L")).astype(np.float32)[..., None] / 255.0
        core = mk[..., 0] > 0.9
        if core.sum() > 20:
            lum = (rgb * np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)).sum(-1)
            ref = np.percentile(lum[core], 92)
            shade = 0.38 + 0.62 * np.clip(lum / ref, 0, 1.0)
            tgt = np.array([255, 212, 0], dtype=np.float32)[None, None, :] * shade[..., None]
            rgb = rgb * (1 - mk) + tgt * mk
            hi = core & (lum >= np.percentile(lum[core], 85))
            print("YELLOW px mean (top 15 %% lit):", rgb[hi].mean(0).round(0), "target (255,212,0), pixels", int(core.sum()))
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    rgb *= (1 - vig * np.clip(r - 0.6, 0, 1.2) ** 2)[..., None]
    rng = np.random.default_rng(7)
    rgb += rng.normal(0, grain, (h, w, 1))
    Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8)).save(out)
    print("wrote", out)
if __name__ == "__main__":
    import sys; composite(sys.argv[1], sys.argv[2])
