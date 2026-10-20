import sys
sys.path.insert(0,'qa/giveaway')
from shot import run
mode=sys.argv[1]; w=int(sys.argv[2]); theme=sys.argv[3] if len(sys.argv)>3 else 'dark'; panel=sys.argv[4] if len(sys.argv)>4 else 'on'
vs=sys.argv[5].split(',') if len(sys.argv)>5 else [f'g{i}' for i in range(1,11)]
race='final' if mode in('final','') else mode
run([(f"{v}-{w}-{theme}{'-off' if panel=='off' else ''}-{mode}",f"/community/?giveaway={v}&race={race}",w,theme,panel) for v in vs])
