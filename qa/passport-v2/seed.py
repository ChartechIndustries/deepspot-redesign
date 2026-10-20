import base64,json,io,random
from PIL import Image,ImageDraw
def art():
    im=Image.new('RGBA',(512,256),(0,0,0,0));d=ImageDraw.Draw(im)
    d.line([(30,200),(120,60),(200,190),(280,50),(360,200)],fill='#e5302d',width=9,joint='curve')
    d.ellipse([380,40,470,130],outline='#2a5bd7',width=8);d.rectangle([400,150,460,210],fill='#3fb44a')
    for x in range(40,200,16): d.rectangle([x,220,x+8,228],fill='#111111')
    b=io.BytesIO();im.save(b,'PNG',optimize=True);return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def mole():
    b=open('../../source/community-assets/moles/sixbacteria.webp','rb').read()
    return 'data:image/webp;base64,'+base64.b64encode(b).decode()
SEEDED=json.dumps({'name':'Maya Okafor','username':'mayaroams','bio':'Chasing quiet places: drained pools, closed funiculars, bakeries that open at 4am. Collecting stamps and strange signs.','style':'poet','avatarMode':'mole','mole':{'png':mole(),'traits':{},'rolledAt':1},'signatureArt':art(),'instagram':'mayaroams','website':'https://example.com/'})
EMPTY='{}'
if __name__=='__main__': print(len(SEEDED))
