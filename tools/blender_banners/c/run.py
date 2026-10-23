import subprocess, sys, os
script, out = sys.argv[1], sys.argv[2]
extra = sys.argv[3:]
p = subprocess.Popen([r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe", "-b", "-P", script, "--", out] + extra,
                     stdout=subprocess.PIPE, stderr=subprocess.STDOUT, creationflags=0x00004000, text=True, encoding="utf8", errors="replace")
for l in p.stdout:
    if any(k in l for k in ("MOLE", "CLIP", "RENDER", "DEVICES", "Error", "Traceback", "File \"", "rror", "VIEW", "Warning:")) or l.startswith("  "):
        print(l.rstrip())
p.wait()
