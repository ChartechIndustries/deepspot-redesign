import asyncio,json
from playwright.async_api import async_playwright
URL='http://localhost:8766/profile/?user=preview'
AXE='C:/Users/CharD/Desktop/DeepSpot Globe/qa/passport-v3/axe.min.js'
async def newpg(b,w=1440,h=900,theme=''):
  ctx=await b.new_context(viewport={'width':w,'height':h}); pg=await ctx.new_page(); errs=[]
  pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None); pg.on('pageerror',lambda e: errs.append(str(e)))
  await pg.goto(URL+theme,wait_until='load'); await pg.wait_for_timeout(2200); pg.errs=errs; return pg
OPEN="document.querySelector('[data-edit]').click()"
async def state(pg):
  return await pg.evaluate("""()=>({open:!!document.querySelector('#pp-editdlg')?.open,focus:document.activeElement?.hasAttribute('data-edit'),name:document.querySelector('.pp-bio-name')?.textContent,bg:document.querySelector('.pp-biosec')?.dataset.bg,font:document.querySelector('.pp-biosec')?.dataset.font,foil:document.querySelector('.pp-passobj-in')?.dataset.foil,field:document.querySelector('.pp-field')?.dataset.bg,stamp:document.querySelector('.pp-id9-stamp b')?.textContent,htmlOpen:document.documentElement.classList.contains('ed-open'),ls:[localStorage.getItem('deepspot-passport-style-v1'),localStorage.getItem('deepspot-bio-look-v1')]})""")
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-angle=swiftshader'])
    # A: save flow
    pg=await newpg(b); print('A0',await state(pg))
    await pg.evaluate(OPEN); await pg.wait_for_timeout(600)
    print('A open',await state(pg))
    await pg.fill('#pp-edit [name=name]','Test Nomad')
    print('preview name',await pg.evaluate("document.querySelector('.ed-pobj .pp-rows dd').textContent"), 'dirty',await pg.evaluate("document.querySelector('.ed-dirty b').textContent"))
    await pg.evaluate("""()=>{const q=s=>document.querySelector(s);q('[name=pp-arch][value=pirate]').click();q('[name=pp-look-bg][value=cobalt]').click();q('[name=pp-look-font][value=serif]').click();q('[name=cz-bg][value=aurora]').click();q('[name=cz-foil][value=gold]').click();}""")
    print('preview stamp',await pg.evaluate("[document.querySelector('.ed-pobj .pp-id9-stamp b').textContent,document.querySelector('.ed-stage').dataset.bg,document.querySelector('.ed-pobj').dataset.foil,document.querySelector('.ed-biop').dataset.bg]"))
    await pg.click('.ed-save'); await pg.wait_for_timeout(1200)
    print('A saved',await state(pg),'toast',await pg.evaluate("document.querySelector('.br-toast').dataset.open+' '+document.querySelector('.br-toast').textContent"))
    # B: escape
    await pg.evaluate(OPEN); await pg.wait_for_timeout(500)
    await pg.fill('#pp-edit [name=name]','Changed Name'); await pg.evaluate("document.querySelector('[name=cz-foil][value=chrome]').click();document.querySelector('[name=cz-bg][value=dusk]').click()")
    await pg.wait_for_timeout(300); print('B mid page foil/bg',await pg.evaluate("[document.querySelector('.pp-passobj-in').dataset.foil,document.querySelector('.pp-field').dataset.bg]"))
    await pg.keyboard.press('Escape'); await pg.wait_for_timeout(500)
    print('B esc',await state(pg))
    print('B form reset',await pg.evaluate("[document.querySelector('#pp-edit [name=name]').value,document.querySelector('[name=cz-foil]:checked').value]"))
    # X, cancel, backdrop
    for how in ('x','cancel','backdrop'):
      await pg.evaluate(OPEN); await pg.wait_for_timeout(500)
      if how=='x': await pg.click('.ed-x')
      elif how=='cancel': await pg.click('[data-cancel]')
      else: await pg.mouse.click(30,450)
      await pg.wait_for_timeout(400); s=await state(pg); print(how,s['open'],s['focus'],s['htmlOpen'])
    # draw
    await pg.evaluate(OPEN); await pg.wait_for_timeout(400); await pg.click('[data-draw]'); await pg.wait_for_timeout(500)
    print('draw',await pg.evaluate("[document.querySelector('#pp-editdlg').open,document.querySelector('.pp-book').dataset.tab,!document.querySelector('#pp-pane-mark').hidden]"))
    await pg.click('[data-mark-done]'); await pg.wait_for_timeout(300)
    # roll
    await pg.evaluate(OPEN); await pg.wait_for_timeout(400)
    await pg.evaluate("document.querySelector('#pp-edit [data-set-roll]').click()"); await pg.wait_for_timeout(1500)
    print('roll',await pg.evaluate("[document.querySelector('#pp-editdlg').open,[...document.querySelectorAll('dialog[open]')].map(d=>d.className||d.tagName)]"))
    print('errs',pg.errs)
    await pg.context.close()
    # axe
    for (w,h,th,name) in [(1440,900,'','dark1440'),(1440,900,'&theme=light','light1440'),(390,844,'','dark390')]:
      pg=await newpg(b,w,h,th); await pg.evaluate(OPEN); await pg.wait_for_timeout(900)
      await pg.add_script_tag(path=AXE)
      r=await pg.evaluate("axe.run('#pp-editdlg',{resultTypes:['violations']}).then(r=>r.violations.map(v=>[v.id,v.impact,v.nodes.length,v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||n.all[0]?.message||''))]))")
      print('axe',name,len(r),json.dumps(r)[:1500]); print('errs',pg.errs); await pg.context.close()
    await b.close()
asyncio.run(main())
