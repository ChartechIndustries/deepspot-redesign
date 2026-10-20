import math,random,itertools,sys
s=open('qa/giveaway/g8search.py').read();i=s.index("for n,us in");exec(s[:i])
def bx(g,u,angs,lab):
    m=max(36,g['mu']*u);fs=max(11.5,11*u);bs=[]
    for i,(nm,v) in enumerate(D):
        d=1-P[i];a=math.radians(angs[i]) if i else 0
        x=(g['cx']+g['rx']*d*math.cos(a))*u;y=(g['cy']+g['ry']*d*math.sin(a))*u
        nw=len(nm)*fs*.62+16;nh=fs*1.15+4
        bs.append((i,x-m/2,y-m/2,m,m));bs.append((i,x-nw/2,y-m/2-5-nh,nw,nh));pw=len(f'{v:,}')*fs*.62+14;bs.append((i,x-pw/2,y+m/2+3,pw,fs*1.15+2))
    fx=g['cx']*u+m/2+12;bs.append((-1,fx,g['cy']*u-70*u,m*1.9,28))
    for k,vv in enumerate([500,2000,5000]):
        sx=1-math.sqrt(vv/mx);x=(g['cx']+g['rx']*sx*math.cos(lab))*u;y=(g['cy']+g['ry']*sx*math.sin(lab))*u
        bs.append((100+k,x,y-12,len(f'{vv:,} pts')*7.4,14))
    return bs
def score(g,angs,lab,us):return sum(overlap(bx(g,u,angs,lab)) for u in us)
def opt(g,us,seed):
    random.seed(seed);angs=[0]+[random.uniform(0,360) for _ in range(9)];lab=random.choice([0,45,90,135,180,225,270,315]);lab=math.radians(lab)
    cur=score(g,angs,lab,us)
    for it in range(1500):
        i=random.randint(1,9);old=angs[i];angs[i]=(old+random.uniform(-40,40))%360
        sc=score(g,angs,lab,us)
        if sc<=cur:cur=sc
        else:angs[i]=old
        if it%300==0:
            for l in range(0,360,45):
                sc=score(g,angs,math.radians(l),us)
                if sc<cur:cur=sc;lab=math.radians(l)
        if cur==0:break
    return cur,[round(a,1) for a in angs],round(math.degrees(lab))
g=dict(w=360,h=600,cx=180,cy=300,rx=152,ry=250,mu=36)
best=None
for sd in range(12):
    r=opt(g,(.92,.81,1.3),sd);print(sd,r,flush=True)
    if best is None or r[0]<best[0]:best=r
    if r[0]==0:break
print('BEST',best)
