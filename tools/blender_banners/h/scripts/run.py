import subprocess,sys
BL=r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
a=sys.argv[1:]
p=subprocess.Popen([BL,'-b','-P',a[0],'--']+a[1:],creationflags=0x00004000)
sys.exit(p.wait())
