"""usage: python run.py n1 [preview] -> renders RGBA raw; full run also writes renders/<id>.png (cut-out)"""
import subprocess, sys, os, time
HERE = os.path.dirname(os.path.abspath(__file__))


def render(name, preview=False):
    raw = os.path.join(HERE, "renders", name + ("_prev_raw.png" if preview else ".png"))
    cmd = [r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe", "-b", "-P", os.path.join(HERE, name + ".py"), "--", raw] + (["preview"] if preview else [])
    p = subprocess.Popen(cmd, creationflags=0x00004000, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    out = p.communicate()[0]
    print("\n".join(l for l in out.splitlines() if any(k in l for k in ("CLIP", "RESULT", "Error", "Traceback", "File ", "error")))[-3000:])
    return raw


if __name__ == "__main__":
    t = time.time()
    render(sys.argv[1], len(sys.argv) > 2 and sys.argv[2] == "preview")
    print("took", round(time.time() - t))
