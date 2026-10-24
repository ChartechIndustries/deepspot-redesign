import re,sys
P='source/_next/static/chunks/page-C89T775K-v51.js'
s=open(P,encoding='utf8').read()
def rep(old,new,count=1):
    global s
    assert s.count(old)==count,(old[:60],s.count(old))
    s=s.replace(old,new)
slugs={'Oya History Museum':'tochigi-underground-quarry','Xwejni Salt Pans':'the-place-in-malta-where-people-have-been-making-salt-for-centuries','Musée Mécanique':'coin-operated-grandmas-and-opium-den-dioramas-are-hidden-in-this-san-francisco-museum','Maishima Incineration Plant':'osaka-s-candy-colored-garbage-palace','Tomb of Christ':'tomb-of-christ-in-aomori','Rummu Quarry':'a-soviet-prison-doubles-as-a-swimming-hole','The Sand-Covered Church':'700-year-old-church-devoured-by-sand','Chiatura Cable Cars':'the-city-of-cable-cars-frozen-in-time','Teufelsberg':'berlin-s-hill-of-nazi-rubble-cold-war-spies-and-graffiti','Singing Ringing Tree':'a-melodic-sculpture-in-the-lancashire-countryside'}
for n,sl in slugs.items():
    rep("    name: `%s`,\n"%n,"    name: `%s`,\n    slug: `%s`,\n"%(n,sl))
# yaw: centre the pin on phone/tablet
rep("let e = bo[act].lon + 45;","""let e = bo[act].lon + 45;
              if (compact()) {
                const g0 = geometry(), la0 = bo[act].lat * Math.PI / 180,
                  sd = (n * 0.5 - g0.cx) / ((g0.radius + 22) * Math.cos(la0)),
                  dd = Math.asin(Math.max(-1, Math.min(1, sd))) * 180 / Math.PI;
                e = bo[act].lon - Math.max(-40, Math.min(-12, dd));
              }""")
# desktop card: centred on the pin, above it or below if no room
rep("""                let e = x,
                  t = S,
                  r = Math.max(16, Math.min(n - e - 16, p + 34)),
                  a = Math.max(12, Math.min(i - t - 65, g - t - 34));
                ((u.current.style.left = r + `px`),
                  (u.current.style.top = a + `px`));""","""                const cw = x, ch = S, ph = r.offsetHeight || 56;
                let cl = Math.max(16, Math.min(n - cw - 16, p - cw / 2)),
                  ct = g - ph - ch - 12;
                if (ct < 12) ct = g + 40;
                ct = Math.max(12, Math.min(i - ch - 40, ct));
                ((u.current.style.left = cl + `px`),
                  (u.current.style.top = ct + `px`));""")
# explore -> link to the map
rep("  let d = bo[e];\n  return (0, Y.jsxs)(`main`","""  let d = bo[e];
  const exploreGo = (ev) => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    const href = ev.currentTarget.getAttribute(`href`);
    if (window.matchMedia(`(prefers-reduced-motion: reduce)`).matches) { window.location.assign(href); return; }
    const pin = document.querySelectorAll(`.globe-stage .map-pin:not(.decorative-pin)`)[e];
    if (pin) { pin.classList.remove(`is-dropping`); void pin.offsetWidth; pin.classList.add(`is-dropping`); }
    setTimeout(() => window.location.assign(href), 240);
  };
  return (0, Y.jsxs)(`main`""")
rep("""(0, Y.jsxs)(`button`, {
                className: `explore-bar`,
                onClick: () => c(!0),""","""(0, Y.jsxs)(`a`, {
                className: `explore-bar`,
                href: `/map/?spot=` + d.slug,
                onClick: exploreGo,""")
open(P,'w',encoding='utf8',newline='').write(s)
print('ok')
