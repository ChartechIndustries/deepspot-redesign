"""Composite RGBA render over brand navy, add vignette-free subtle grain. usage: post.py in.png out.png"""
import sys, numpy as np
from PIL import Image
NAVY = (0x0b, 0x1a, 0x2e)
def finalize(src, dst, grain=1.6, seed=3):
    im = Image.open(src).convert("RGBA")
    bg = Image.new("RGBA", im.size, NAVY + (255,))
    out = Image.alpha_composite(bg, im).convert("RGB")
    a = np.asarray(out).astype(np.float32)
    rng = np.random.default_rng(seed)
    n = rng.normal(0, grain, a.shape[:2])[..., None]
    a = np.clip(a + n, 0, 255).astype(np.uint8)
    Image.fromarray(a).save(dst)
if __name__ == "__main__":
    finalize(sys.argv[1], sys.argv[2])
