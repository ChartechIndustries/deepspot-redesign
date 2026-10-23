"""auto-fit camera so the subject bbox is centred and fills TARGET % of the frame"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import run, post
H = os.path.dirname(os.path.abspath(__file__))
name = sys.argv[1]
TARGET = float(sys.argv[2]) if len(sys.argv) > 2 else 86.0
pf = os.path.join(H, "params_%s.json" % name)
P = json.load(open(pf)) if os.path.exists(pf) else {"d": {"n1": 1.0, "n2": 2.8, "n3": 2.3}[name], "sx": -0.05, "sy": -0.05}
for it in range(6):
    json.dump(P, open(pf, "w"))
    raw = run.render(name, True)
    x0, y0, x1, y1 = [float(v) for v in post.bbox(raw, 0.6)]
    w, h = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    print(it, "bbox", x0, y0, x1, y1, "size", round(w, 1), round(h, 1), "centre", round(cx, 1), round(cy, 1), P)
    s = TARGET / max(w, h)
    if abs(s - 1) < 0.015 and abs(cx - 50) < 1 and abs(cy - 50) < 1:
        break
    ppx, ppy = 50 - 100 * P["sx"], 50 + 100 * P["sy"]
    nx = ppx + (cx - ppx) * s
    ny = ppy + (cy - ppy) * s
    P["d"] = P["d"] / s
    P["sx"] += (nx - 50) / 100.0
    P["sy"] -= (ny - 50) / 100.0
json.dump(P, open(pf, "w"))
print("FINAL", P)
