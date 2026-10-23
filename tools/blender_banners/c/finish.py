"""Composite RGBA render over brand green, add faint grain on subject, save master + preview. Plain python (-I)."""
import sys, numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
bg = Image.new("RGBA", im.size, (7, 214, 83, 255))
out = Image.alpha_composite(bg, im).convert("RGB")
a = np.asarray(out).astype(np.float32)
al = np.asarray(im)[..., 3:4].astype(np.float32) / 255
rng = np.random.default_rng(3)
a += rng.normal(0, 1.1, a.shape[:2] + (1,)).astype(np.float32) * al
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(dst)
bb = im.getchannel("A").point(lambda v: 255 if v > 200 else 0).getbbox()
W, H = im.size
print("BBOX %", [round(100 * bb[0] / W), round(100 * bb[1] / H), round(100 * bb[2] / W), round(100 * bb[3] / H)])
