import subprocess, sys
for v in '123':
    subprocess.call([sys.executable, 'run.py', 'h%s.py' % v, r"C:/Users/CharD/Desktop/DeepSpot Globe/tools/blender_banners/h/renders/h%s_raw.png" % v, '256', '1600', '1600'])
    subprocess.call([sys.executable, 'finish.py', 'h%s' % v])
print('ALLDONE')
