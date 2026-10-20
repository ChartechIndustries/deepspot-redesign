import math,itertools
D=[('Kris',6800),('Wayfarer',2100),('kisekikana',925),('NumberOne',700),('Joelle',700),('Annebelle',350),('Lana Velkov',350),('SAZ',325),('Lydia',300),('Six',250)]
mx=6800
P=[math.sqrt(v/mx) for _,v in D]
def geo(n):
    return dict(w=360,h=540,cx=180,cy=268,rx=150,ry=222,mu=38) if n else dict(w=1000,h=560,cx=500,cy=285,rx=470,ry=236,mu=42)
def boxes(g,u,off,step,lab,spiral=0):
    m=max(36,g['mu']*u);fs=max(11.5,11*u);bs=[]
    for i,(nm,v) in enumerate(D):
        d=1-P[i];a=math.radians(off+i*step) if i else 0
        x=(g['cx']+g['rx']*d*math.cos(a))*u;y=(g['cy']+g['ry']*d*math.sin(a))*u
        nw=len(nm)*fs*.62+16;nh=fs*1.15+4
        bs.append((i,x-m/2,y-m/2,m,m)); bs.append((i,x-nw/2,y-m/2-5-nh,nw,nh))
        pw=len(f'{v:,}')*fs*.62+14;bs.append((i,x-pw/2,y+m/2+3,pw,fs*1.15+2))
    fx=g['cx']*u+m/2+12;bs.append((-1,fx,g['cy']*u-70*u,m*1.9,28))
    # contour labels
    for k,vv in enumerate([500,2000,5000]):
        s=1-math.sqrt(vv/mx);x=(g['cx']+g['rx']*s*math.cos(lab))*u;y=(g['cy']+g['ry']*s*math.sin(lab))*u
        bs.append((100+k,x,y-12,len(f'{vv:,} pts')*7.4,14))
    return bs
def overlap(bs):
    t=0
    for a,b in itertools.combinations(bs,2):
        if a[0]==b[0]:continue
        ox=min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1]);oy=min(a[2]+a[4],b[2]+b[4])-max(a[2],b[2])
        if ox>-3 and oy>-3:t+=max(ox+3,0)*max(oy+3,0)+50
    return t
import sys
def geo2(ry,h):return dict(w=360,h=h,cx=180,cy=h/2,rx=152,ry=ry,mu=36)
res=[]
for ry,h in ((250,600),(270,640)):
    g=geo2(ry,h);best=[]
    for off in range(0,360,6):
        for step in [x/2 for x in range(180,360,4)]:
            for lab in [math.radians(l) for l in range(0,360,45)]:
                sc=sum(overlap(boxes(g,u,off,step,lab)) for u in (.92,.81,1.3))
                best.append((sc,off,step,round(math.degrees(lab))))
    best.sort();print(ry,h,best[:4],flush=True)
