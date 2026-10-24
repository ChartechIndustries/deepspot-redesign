from lib import *
async def main():
  async with async_playwright() as p:
    b=await launch(p)
    ctx,pg=await newpage(b,sys.argv[1])
    await pg.goto(BASE+'/?raf=timer&snap=1&theme=dark',wait_until='load'); await pg.wait_for_timeout(3500)
    for k in range(3):
      r=await pg.evaluate("""()=>{const out=[];document.querySelectorAll('.map-pin:not(.decorative-pin)').forEach((e,i)=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);out.push([i,e.className,r.left|0,r.top|0,r.width|0,r.height|0,cs.visibility,(+cs.opacity).toFixed(2)])});const c=document.querySelector('.pin-preview');const cr=c&&c.getBoundingClientRect();return [out.filter(o=>o[6]=='visible'),cr&&[cr.left|0,cr.top|0,cr.width|0,cr.height|0,c.className]]}""")
      print(r); await pg.wait_for_timeout(1500)
    await b.close()
asyncio.run(main())
