import json,urllib.request as u,os,sys
H={'User-Agent':'x'}
for a in sys.argv[1:]:
    f=json.load(u.urlopen(u.Request('https://api.polyhaven.com/files/'+a,headers=H)))
    os.makedirs(a,exist_ok=True)
    for m,k in (('diff','Diffuse'),('nor','nor_gl'),('rough','Rough'),('disp','Displacement')):
        try:
            e=f[k]['2k'] if False else f[k]['1k']
            fmt='jpg' if 'jpg' in e else list(e)[0]
            url=e[fmt]['url']
            p=f'{a}/{m}.{url.split(".")[-1]}'
            if not os.path.exists(p): open(p,'wb').write(u.urlopen(u.Request(url,headers=H)).read())
            print(a,m,p)
        except Exception as ex: print('skip',a,k,ex)
