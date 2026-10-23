"""Run a blender script headless at below-normal priority, one at a time. usage: python run.py script.py out.png [mode ...]"""
import subprocess, sys, os
BL = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
here = os.path.dirname(os.path.abspath(__file__))
script = sys.argv[1]
p = subprocess.Popen([BL, "-b", "-P", os.path.join(here, script), "--"] + sys.argv[2:],
                     creationflags=0x00004000, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
out, _ = p.communicate()
lines = [l for l in out.splitlines() if any(k in l for k in ("CLIP", "RENDER_TIME", "Error", "Traceback", "File ", "fail", "Warn")) or l.startswith(("    ", "  File"))]
print("\n".join(lines[-60:]))
print("EXIT", p.returncode)
