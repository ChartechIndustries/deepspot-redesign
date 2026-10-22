"""v2 flow moved: run qa/onboarding-v2/flow.py (account -> issue -> every slot -> finish -> passport). v1 shots.py in this folder is the old 8-step flow."""
import runpy,os,sys
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","onboarding-v2"))
runpy.run_path(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","onboarding-v2","flow.py"),run_name="__main__")
