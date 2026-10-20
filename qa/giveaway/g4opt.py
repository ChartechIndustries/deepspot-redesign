import math,random,itertools
D=[('Kris',6800),('Wayfarer',2100),('kisekikana',925),('NumberOne',700),('Joelle',700),('Annebelle',350),('Lana Velkov',350),('SAZ',325),('Lydia',300),('Six',250)]
def stad(f,R,g):
    a=g['a'];L=4*a+2*math.pi*R;d=(f%1)*L
    if d<a:x=d;y=-R
    elif d<a+math.pi*R:q=(d-a)/R;x=a+R*math.sin(q);y=-R*math.cos(q)
    elif d<3*a+math.pi*R:x=a-(d-a-math.pi*R);y=R
    elif d<3*a+2*math.pi*R:q=(d-3*a-math.pi*R)/R;x=-a-R*math.sin(q);y=R*math.cos(q)
    else:x=-a+(d-3*a-2*math.pi*R);y=-R
    return (g['cx']+(y if g.get('v') else x),g['cy']+(x if g.get('v') else y))
g=dict(v=1,cx=180,cy=305,a=128,R=96,lanes=[-40,0,40],mu=38)
def bx(fs,ln,u):
    m=max(36,g['mu']*u);fz=max(11.5,11*u);bs=[]
    for i,(nm,v) in enumerate(D):
        x,y=stad(fs[i],g['R']+g['lanes'][ln[i]],g);x*=u;y*=u
        nw=len(nm)*fz*.62+16;nh=fz*1.15+4;pw=len(f'{v:,}')*fz*.62+14
        bs+= [(i,x-m/2,y-m/2,m,m),(i,x-nw/2,y-m/2-5-nh,nw,nh),(i,x-pw/2,y+m/2+3,pw,fz*1.15+2)]
    return bs
def ov(bs):
    t=0
    for a,b in itertools.combinations(bs,2):
        if a[0]==b[0]:continue
        ox=min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1]);oy=min(a[2]+a[4],b[2]+b[4])-max(a[2],b[2])
        if ox>-3 and oy>-3:t+=max(ox+3,0)*max(oy+3,0)+50
    return t
us=(.92,.72,.8,1.3)
def sc(fs,ln):return sum(ov(bx(fs,ln,u)) for u in us)
best=None
for sd in range(30):
    random.seed(sd);fs=[.985]+[.9-.08*i for i in range(9)];ln=[random.randint(0,2) for _ in range(10)];cur=sc(fs,ln)
    for it in range(1500):
        i=random.randint(0,9);of,ol=fs[i],ln[i]
        if random.random()<.5:ln[i]=random.randint(0,2)
        else:
            fs[i]=min(.985,max(.08,fs[i]+random.uniform(-.04,.04)))
        ok=all(fs[k]>fs[k+1]+.02 for k in range(9)) if True else True
        s2=sc(fs,ln) if ok else 1e9
        if s2<=cur:cur=s2
        else:fs[i],ln[i]=of,ol
        if cur==0:break
    if best is None or cur<best[0]:best=(cur,[round(x,3) for x in fs],list(ln))
    if cur==0:break
print(best)
