import sys, asyncio, json
from playwright.async_api import async_playwright
# usage: sheet31.py out.png [theme] [mode: real|all]  -- flat contact sheet of every card
out=sys.argv[1]; th=sys.argv[2] if len(sys.argv)>2 else 'dark'; mode=sys.argv[3] if len(sys.argv)>3 else 'real'
JS="""async(mode)=>{
 const pm=document.querySelector('.pm');pm.scrollIntoView({block:'center'});
 let cards=[...document.querySelectorAll('.pm-card')].map(c=>c.cloneNode(true));
 if(mode==='all'){
  const mod=await import('/site/passport-mini.mjs?v=3'),st=await import('/site/account-state.mjs?v=pad1');
  const base=mod.passportModels?null:null;
  cards=st.travelerStyles.map((s,i)=>{const d=document.createElement('div');d.innerHTML=mod.passportHTML({id:'t'+i,name:'Explorer Name',handle:'handle'+i,joined:'Aug 2026',mole:'/community-assets/moles/wayfarer.webp',rank:(i%12)+1,lv:{level:1+(i%14)},member:['newcomer','scout','explorer','pathfinder','trailblazer','cartographer','legend'][i%7],typeId:s.id,arch:s.name,group:s.group,href:'#'},i);return d.querySelector('.pm-card');});
 }
 const g=document.createElement('div');g.id='sheet';g.style.cssText='position:absolute;left:0;top:0;z-index:9999;background:#0b1b27;padding:24px;display:grid;grid-template-columns:repeat(5,320px);gap:24px';
 g.className='pm';
 for(const c of cards){const w=document.createElement('div');w.style.cssText='width:320px;height:448px;position:relative';c.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));w.appendChild(c);g.appendChild(w);}
 document.body.appendChild(g);return cards.length;}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=["--use-angle=swiftshader"])
    ctx=await b.new_context(viewport={"width":1800,"height":1000})
    await ctx.add_init_script(f"try{{localStorage.setItem('deepspot-theme','{th}')}}catch(e){{}}")
    pg=await ctx.new_page()
    await pg.goto(f"http://localhost:8766/community/?theme={th}",wait_until="load"); await pg.wait_for_timeout(3000)
    n=await pg.evaluate(JS,mode); await pg.wait_for_timeout(2500)
    await pg.locator('#sheet').screenshot(path=out)
    print(n)
    # overflow check: any text clipped in cards
    bad=await pg.evaluate("""()=>{const o=[];document.querySelectorAll('#sheet .pm-card').forEach((c,i)=>{c.querySelectorAll('.pm-title b,.pm-rows dd,.pm-stamp b,.pm-sub2,.pm-no').forEach(e=>{if(e.scrollWidth>e.clientWidth+1)o.push(i+':'+e.className+':'+e.textContent)});const t=c.querySelector('.pm-title b');if(t){const lh=parseFloat(getComputedStyle(t).lineHeight);const lines=Math.round(t.getBoundingClientRect().height/lh);if(lines>2)o.push(i+' title lines '+lines+' '+t.textContent)}});return o}""")
    print(json.dumps(bad))
    await b.close()
asyncio.run(main())
