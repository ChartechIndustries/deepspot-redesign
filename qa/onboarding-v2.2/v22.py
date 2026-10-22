"""v2.2 screens + measures for one viewport. usage: python v22.py 390 844 [theme] [color] [tag]
Hover states (desktop), mark drawn edge to edge on the pad + on the card, taller card empty/filled, edit dialog preview, profile page."""
import asyncio,sys,json
from playwright.async_api import async_playwright
from h import *
async def main():
  w,h=int(sys.argv[1]),int(sys.argv[2]); theme=sys.argv[3] if len(sys.argv)>3 else 'dark'; color=sys.argv[4] if len(sys.argv)>4 else 'on'
  pre=sys.argv[5] if len(sys.argv)>5 else 'v'
  tag=f'{pre}-{theme[0]}{w}'+('' if color=='on' else 'off')
  async with async_playwright() as p:
    b=await p.chromium.launch(args=[])
    ctx,pg=await newpage(b,w,h,theme,color)
    async def shot(n,clip=None):
      await pg.evaluate("document.activeElement&&document.activeElement.blur&&document.activeElement.blur()")
      await pg.wait_for_timeout(300); await pg.screenshot(path=f'{OUT}/{tag}-{n}.png',**({'clip':clip} if clip else {}))
    await to_b(pg)
    await pg.wait_for_timeout(500)
    await shot('01-card-empty')
    r=await pg.evaluate("(()=>{const c=document.querySelector('.ob-front').getBoundingClientRect();return {w:Math.round(c.width),h:Math.round(c.height),ratio:+(c.height/c.width).toFixed(3),nat:document.querySelector('.ob-front').offsetHeight/document.querySelector('.ob-front').offsetWidth}})()")
    print('card',r)
    if w>=800:
      # hover each empty slot (mouse) and crop the card
      for sid in ['photo','name','arch','bio','mark','style']:
        bx=await pg.evaluate("id=>{const e=document.querySelector('.ob-b [data-slot=\"'+id+'\"]');const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]}",sid)
        await pg.mouse.move(*bx); await pg.wait_for_timeout(300)
        st=await pg.evaluate("id=>{const e=document.querySelector('.ob-b [data-slot=\"'+id+'\"]');const b=getComputedStyle(e,'::before'),a=getComputedStyle(e,'::after');return {before:b.opacity,pill:a.backgroundColor,ring:b.boxShadow.slice(0,40)}}",sid)
        print('hover',sid,st)
        cr=await pg.evaluate("(()=>{const r=document.querySelector('.ob-front').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()")
        await pg.screenshot(path=f'{OUT}/{tag}-02-hover-{sid}.png',clip=cr)
      await pg.mouse.move(5,5)
    else:
      # phone: :active look via touch press emulation = force the class state through focus-visible on keyboard
      await pg.keyboard.press('Tab'); await pg.wait_for_timeout(300)
      cr=await pg.evaluate("(()=>{const r=document.querySelector('.ob-front').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}})()")
      await pg.screenshot(path=f'{OUT}/{tag}-02-focus.png',clip=cr)
    # mark sheet: edge-to-edge on the pad
    await do_name(pg); await do_mole(pg); await do_arch(pg)
    await slot(pg,'mark'); await draw(pg); await pg.wait_for_timeout(300)
    await shot('03-pad-drawn')
    padbox=await pg.evaluate("(()=>{const r=document.querySelector('#pp-pad canvas').getBoundingClientRect();return [r.width,r.height,r.width/r.height]})()")
    print('pad box',padbox)
    await close_sheet(pg)
    await pg.wait_for_timeout(900)
    m=await pg.evaluate("""(()=>{const box=document.querySelector('.ob-front .pp-id9-sig'),im=box.querySelector('img');if(!im)return null;
      const b=box.getBoundingClientRect(),i=im.getBoundingClientRect(),nw=im.naturalWidth,nh=im.naturalHeight,k=Math.min(i.width/nw,i.height/nh);
      return {box:[Math.round(b.width),Math.round(b.height)],img:[nw,nh],drawnW:Math.round(nw*k),drawnH:Math.round(nh*k),fillW:+(nw*k/b.width).toFixed(2),fillH:+(nh*k/b.height).toFixed(2),src:im.src.length}})()""")
    print('mark on card',m)
    await do_style(pg); await do_bio(pg); await pg.wait_for_timeout(600)
    await shot('04-card-filled')
    print('noscroll',await noscroll(pg))
    # bio extremes: long bio shrinks / fits
    await do_bio(pg,'I chase abandoned quarries, flooded tunnels, night markets, rooftop views and the odd forgotten shrine. Always with a flask of tea, a spare battery and way too many maps. Say hi if you want company on a long walk somewhere strange.')
    await pg.wait_for_timeout(500)
    fit=await pg.evaluate("(()=>{const t=document.querySelector('.ob-front [data-bio]');return {fs:t.style.fontSize,fits:t.scrollHeight<=t.parentElement.clientHeight+1,clamp:t.style.webkitLineClamp}})()")
    print('long bio',fit)
    await shot('05-card-longbio')
    await do_bio(pg,'hi.')
    await pg.wait_for_timeout(300); await shot('05b-card-shortbio')
    await do_bio(pg,'I go looking for abandoned quarries and quiet tunnels.')
    # finish -> profile page, then edit dialog
    await js_click(pg,'#ob-fin'); await pg.wait_for_url('**/profile/**welcome=1**',timeout=10000); await pg.wait_for_timeout(3500)
    await shot('06-profile-issued')
    prof=await pg.evaluate("""(()=>{const box=document.querySelector('.pp-id9 .pp-id9-sig'),im=box&&box.querySelector('img');if(!im)return null;const b=box.getBoundingClientRect(),i=im.getBoundingClientRect(),k=Math.min(i.width/im.naturalWidth,i.height/im.naturalHeight);return {box:[Math.round(b.width),Math.round(b.height)],drawnW:Math.round(im.naturalWidth*k),fillW:+(im.naturalWidth*k/b.width).toFixed(2)}})()""")
    print('profile mark',prof)
    cr=await pg.evaluate("(()=>{const r=document.querySelector('.pp-id9').getBoundingClientRect();return {x:Math.max(0,r.x),y:Math.max(0,r.y),width:Math.min(r.width,innerWidth),height:Math.min(r.height,innerHeight-Math.max(0,r.y))}})()")
    await pg.screenshot(path=f'{OUT}/{tag}-07-profile-card.png',clip=cr)
    await pg.evaluate("document.querySelector('[data-edit]').click()"); await pg.wait_for_timeout(1200)
    await shot('08-edit-dialog')
    ed=await pg.evaluate("""(()=>{const c=document.querySelector('.ed-pobj .pp-id9'),bp=c&&c.querySelector('.pp-id9-bio-t>p'),im=c&&c.querySelector('.pp-id9-sig img');const r=c.getBoundingClientRect();return {tall:c.classList.contains('pp-id9-tall'),h:c.offsetHeight,w:c.offsetWidth,ratio:+(c.offsetHeight/c.offsetWidth).toFixed(3),bio:bp&&bp.textContent.slice(0,40),bioFs:bp&&bp.style.fontSize,bioFits:bp&&bp.scrollHeight<=bp.parentElement.clientHeight+1,sig:!!im}})()""")
    print('edit preview',ed)
    print('noscroll profile',await noscroll(pg))
    real=[e for e in pg.errs if 'favicon' not in e and 'googleapis' not in e and 'ERR_' not in e]
    print('errs',real[:3])
    await b.close()
asyncio.run(main())
