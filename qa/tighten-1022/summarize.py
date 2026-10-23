import json,sys
for v in ['d390','d360','d320','d1440','l390','l1440']:
    try: d=json.load(open(f'res_{v}.json'))
    except Exception as e: print(v,'missing'); continue
    ax=sum(len(r['axe']) for r in d if r.get('axe') and r['route']!='/nope-404/')
    errs=[(r['route'],[e for e in r['errs'] if not ('GPU stall' in e or 'swiftshader' in e.lower() or 'GL Driver' in e)]) for r in d if r['route']!='/nope-404/']
    errs=[e for e in errs if e[1]]
    ov=[(r['route'],r['sw'],r['vw']) for r in d if r['sw']>r['vw']]
    sm=[(r['route'],r['small']) for r in d if r.get('small')]
    sb=[(r['route'],r['smallBody']) for r in d if r.get('smallBody')]
    fl=[(r['route'],r['fails']) for r in d if r.get('fails') and r['route']!='/nope-404/']
    mb={r['route']:r['mb'] for r in d if r['route'] in ('/','/browse/','/map/','/stories/')}
    print('==',v,'axe',ax,'errs',errs[:3],'overflow',ov,'fails',fl[:3]); print('  mb',mb)
    for x in sm: print('  small',x[0],json.dumps(x[1])[:200])
    for x in sb: print('  smallBody',x[0],json.dumps(x[1])[:200])
