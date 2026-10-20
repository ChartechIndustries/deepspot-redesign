import sys,json
from playwright.sync_api import sync_playwright
JS="""()=>{
const out=[];const items=[];
document.querySelectorAll('.gv-rc').forEach((li,i)=>{
 for(const [k,sel] of [['name','.gv-name'],['mole','.gv-mole'],['pts','.gv-ovp,.gv-chip'],['base','.gv-base,.gv-stall,.gv-end']]){
  li.querySelectorAll(sel).forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0)items.push({i,k,x:r.left,y:r.top,w:r.width,h:r.height,t:e.textContent.slice(0,14)});});
 }});
const f=document.querySelector('.gv-flag b');if(f){const r=f.getBoundingClientRect();items.push({i:-1,k:'flag',x:r.left,y:r.top,w:r.width,h:r.height,t:'flag'});}
for(let a=0;a<items.length;a++)for(let b=a+1;b<items.length;b++){const p=items[a],q=items[b];if(p.i===q.i&&p.i!==-1)continue;
 if(p.k==='base'&&q.k==='base')continue;
 const ox=Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x),oy=Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y);
 if(ox>1&&oy>1)out.push(`${p.k}:${p.t}/${q.k}:${q.t} ${ox.toFixed(0)}x${oy.toFixed(0)}`);}
const gv=document.querySelector('.gv');const ov=document.documentElement.scrollWidth-document.documentElement.clientWidth;
return {ov,out};}"""
def main(vs,ws):
    with sync_playwright() as p:
        b=p.chromium.launch()
        for w in ws:
            for v in vs:
                pg=b.new_page(viewport={'width':w,'height':900});pg.goto(f'http://localhost:8766/community/?giveaway={v}&race=final');pg.wait_for_timeout(1200)
                r=pg.evaluate(JS);print(v,w,'overflow',r['ov'],r['out'][:8]);pg.close()
        b.close()
if __name__=='__main__':
    main(sys.argv[1].split(','),[int(x) for x in sys.argv[2].split(',')])
