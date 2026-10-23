"""python run.py r1 [--spl N] [--scale S] [--tag name]  -> builds, renders (below-normal), composites."""
import subprocess, sys, os, time
HERE = os.path.dirname(os.path.abspath(__file__))
BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
name = sys.argv[1]
rest = sys.argv[2:]
tag = ""
if "--tag" in rest:
    i = rest.index("--tag"); tag = rest[i + 1]; del rest[i:i + 2]
raw = os.path.join(HERE, "renders", f"{name}{tag}_raw.png")
cmd = [BL, "-b", "-P", os.path.join(HERE, f"build_{name}.py"), "--", "--out", raw] + rest
t = time.time()
p = subprocess.Popen(cmd, creationflags=0x00004000, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace")
out = p.communicate()[0]
open(os.path.join(HERE, "qa", f"{name}{tag}_log.txt"), "w", encoding="utf-8").write(out)
for l in out.splitlines():
    if any(k in l for k in ("CLIP", "FRAC", "YELLOW", "Error", "Traceback", "RuntimeError", "TIME", "File \"", "smooth_by")):
        print(l)
print("exit", p.returncode, "secs", round(time.time() - t))
if os.path.exists(raw) and "--noren" not in rest:
    import post
    post.composite(raw, os.path.join(HERE, "renders", f"{name}{tag}.png"))
