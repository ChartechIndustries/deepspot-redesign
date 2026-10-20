import {moleCrop} from './passport-art.mjs?v=pad1';
import {travelerStyles} from '../site/account-state.mjs?v=pad1';

// The share image is drawn from the same profile and contribution records as the page.
// It stays self-contained: all photographs are served with the site.
function loadImage(src){if(!src)return Promise.resolve(null);return new Promise(resolve=>{const image=new Image();let settled=false;const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=image.onerror=null;resolve(value);};const timer=setTimeout(()=>finish(null),8000);image.onload=()=>finish(image);image.onerror=()=>finish(null);if(/^https?:/.test(src))image.crossOrigin='anonymous';image.src=src;});}
function cover(ctx,image,x,y,w,h){
 if(!image){ctx.fillStyle='#203249';ctx.fillRect(x,y,w,h);return;}
 const scale=Math.max(w/image.width,h/image.height),sw=w/scale,sh=h/scale;
 ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2,sw,sh,x,y,w,h);
}
function wrap(ctx,value,x,y,width,lineHeight,maxLines=20){
 const words=String(value).split(/\s+/),lines=[];let line='';
 for(const word of words){const candidate=line?`${line} ${word}`:word;if(line&&ctx.measureText(candidate).width>width){lines.push(line);line=word;}else line=candidate;}
 if(line)lines.push(line);
 lines.slice(0,maxLines).forEach((text,i)=>{if(i===maxLines-1&&lines.length>maxLines){while(ctx.measureText(text+'…').width>width)text=text.slice(0,-1);text+='…';}ctx.fillText(text,x,y+i*lineHeight);});
 return y+Math.min(lines.length,maxLines)*lineHeight;
}
export async function createPassportImage(profile,spots,url){
 await document.fonts.ready;
 const earned=(profile.stamps||[]).filter(s=>s.earned);
 const stampImages=earned.map(s=>loadImage('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s.svg().replaceAll('currentColor',s.color).replace('<svg ','<svg width="120" height="120" ').replace('</svg>','<style>.pp-stamp-word{font:8px Arial,sans-serif;letter-spacing:1px;fill:'+s.color+';stroke:none}</style></svg>'))));
 const shown=spots.slice(0,3);
 const [artImage,mole,...rest]=await Promise.all([loadImage(profile.signatureArt),loadImage(profile.mole),...shown.map(s=>loadImage(s.card||s.image).then(i=>i||loadImage(s.image))),...stampImages]);
 const thumbs=rest.slice(0,shown.length),stampArts=rest.slice(shown.length);
 const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=1100;
 const ctx=canvas.getContext('2d');
 const ink='#0b1b27',muted='#45636b',blue='#3c60ff',aqua='#83cdce',paper='#f5f4ee',green='#14713d';
 const text=(value,x,y,size=18,color=ink,weight=400,font='Arial, sans-serif')=>{ctx.fillStyle=color;ctx.font=`${weight} ${size}px ${font}`;ctx.fillText(value,x,y);};
 const mono=(value,x,y,size=13,color=muted,weight=600)=>text(String(value).toUpperCase(),x,y,size,color,weight,'Consolas, monospace');
 const rule=(x1,y1,x2,y2,color='#0b1b2735')=>{ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
 const style=travelerStyles.find(s=>s.id===(profile.type.id||profile.style));
 ctx.fillStyle='#0c101b';ctx.fillRect(0,0,1600,1100);
 ctx.save();ctx.beginPath();ctx.roundRect(50,48,1500,1004,10);ctx.clip();
 ctx.fillStyle=paper;ctx.fillRect(50,48,1500,1004);ctx.fillStyle=aqua;ctx.fillRect(50,48,620,1004);
 mono('deep spot / explorer passport',90,100,15,ink,700);mono(profile.localPreview?'local draft':profile.known?'contributor':'collection author',1290,100,13);
 // identity column: mole avatar, level bubble, name, chips, progress, bio, art, MRZ
 const cx=190,cy=232,r=88;
 ctx.fillStyle=profile.field||'#07d653';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
 if(mole){ctx.save();ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();const sw=moleCrop.w*mole.width;ctx.drawImage(mole,moleCrop.x*mole.width,moleCrop.y*mole.height,sw,sw,cx-r,cy-r,r*2,r*2);ctx.restore();}
 else{ctx.textAlign='center';text(profile.name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase(),cx,cy+22,64,ink,700);ctx.textAlign='left';}
 ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
 if(profile.level){const bx=cx+r*.78,by=cy+r*.72;ctx.fillStyle=blue;ctx.beginPath();ctx.arc(bx,by,40,0,Math.PI*2);ctx.fill();ctx.strokeStyle=aqua;ctx.lineWidth=6;ctx.stroke();ctx.textAlign='center';text(String(profile.level.level),bx,by+8,28,'#fff',800);mono('lvl',bx,by+26,11,'#fff',700);ctx.textAlign='left';}
 ctx.font='800 62px Arial, sans-serif';ctx.fillStyle=ink;const nameBottom=wrap(ctx,profile.name,92,400,540,64,2);
 text(profile.handle?'@'+profile.handle:'DeepSpot contributor',94,nameBottom-28,19,muted);
 let y=nameBottom+16;const chips=[profile.joined?'member since '+profile.joined:'',profile.member].filter(Boolean);let cxp=92;
 ctx.font='700 13px Consolas, monospace';
 for(const c of chips){const w=ctx.measureText(c.toUpperCase()).width+24;ctx.strokeStyle='#0b1b2760';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(cxp,y-19,w,28,14);ctx.stroke();mono(c,cxp+12,y,13,ink,700);cxp+=w+10;}
 if(profile.level){y+=40;ctx.fillStyle='#0b1b2722';ctx.fillRect(92,y,540,8);ctx.fillStyle=ink;ctx.fillRect(92,y,540*profile.level.pct/100,8);mono(`${profile.level.points.toLocaleString('en-US')} / ${profile.level.to.toLocaleString('en-US')} pts to level ${profile.level.level+1}`,92,y+30,12);y+=36;}
 ctx.font='400 21px Arial, sans-serif';ctx.fillStyle=ink;
 y=wrap(ctx,profile.bio||'No bio yet.',92,y+30,540,29,3);
 const ah=Math.max(130,Math.min(250,918-(y+30))),aw=Math.min(540,ah*2),ay=918-ah;
 mono('art',92,ay-12,13,ink,700);
 ctx.save();ctx.beginPath();ctx.rect(92,ay,aw,ah);ctx.fillStyle='#fbf9f2';ctx.fill();ctx.clip();
 ctx.fillStyle='#0b1b2730';for(let gy=ay+8;gy<ay+ah;gy+=12)for(let gx=100;gx<92+aw;gx+=12){ctx.beginPath();ctx.arc(gx,gy,.9,0,Math.PI*2);ctx.fill();}
 if(artImage)ctx.drawImage(artImage,92,ay,aw,ah);else{ctx.textAlign='center';text('no art yet.',92+aw/2,ay+ah/2+6,20,muted);ctx.textAlign='left';}
 ctx.restore();ctx.strokeStyle='#0b1b2760';ctx.lineWidth=1;ctx.strokeRect(92.5,ay+.5,aw-1,ah-1);
 rule(92,966,632,966);ctx.font='15px monospace';ctx.fillStyle=muted;ctx.fillText(`DEEP<SPOT<<${profile.name.toUpperCase().replaceAll(' ','<')}<<<<`,92,1006);
 // right column: traveler type, numbers, postings, stamps
 const X=720;
 mono('traveler type',X,100,13);
 const typeName=style?style.name:'no type yet';
 ctx.font='800 58px Arial, sans-serif';ctx.fillStyle=ink;ctx.fillText(typeName+'.',X,172);
 ctx.font='400 20px Arial, sans-serif';ctx.fillStyle=muted;wrap(ctx,profile.type.postings?`Based on ${profile.type.postings} ${profile.type.postings===1?'posting':'postings'}. ${style?style.description:''}`:(style?style.description:'A type appears after the first posting.'),X,208,780,28,2);
 rule(X,262,1506,262);
 const stats=[[profile.points==null?'—':profile.points.toLocaleString('en-US'),'points'],[profile.level?profile.level.level:'—','level'],[profile.contrib.spots??'—','spots'],[profile.contrib.stories??'—','stories'],[profile.standing?.rankAll?'#'+profile.standing.rankAll:'—','all-time rank']];
 stats.forEach(([v,l],i)=>{const x=X+i*158;text(String(v),x,330,50,i===0?green:ink,700);mono(l,x,360,12);});
 rule(X,392,1506,392);
 mono('postings',X,430,13);
 if(!shown.length){ctx.font='400 22px Arial, sans-serif';ctx.fillStyle=muted;wrap(ctx,'Postings appear here when this account is connected.',X,470,700,30);}
 shown.forEach((spot,i)=>{const w=250,h=190,x=X+i*(w+16),py=448;ctx.save();ctx.beginPath();ctx.rect(x,py,w,h);ctx.clip();cover(ctx,thumbs[i],x,py,w,h);const fade=ctx.createLinearGradient(0,py+50,0,py+h);fade.addColorStop(0,'#07131b00');fade.addColorStop(1,'#07131bec');ctx.fillStyle=fade;ctx.fillRect(x,py,w,h);ctx.fillStyle=paper;ctx.font='600 18px Arial, sans-serif';wrap(ctx,spot.name,x+12,py+h-38,w-24,21,2);ctx.restore();});
 rule(X,670,1506,670);
 mono('stamps',X,708,13);
 if(!earned.length){ctx.font='400 22px Arial, sans-serif';ctx.fillStyle=muted;wrap(ctx,'No stamps earned yet.',X,748,700,30);}
 earned.forEach((s,i)=>{const x=X+i*172;ctx.save();ctx.translate(x+60,800);ctx.rotate([-.1,.07,-.05,.09][i%4]);if(stampArts[i])ctx.drawImage(stampArts[i],-60,-60,120,120);ctx.restore();ctx.textAlign='center';mono(s.name,x+60,886,12,ink,700);ctx.textAlign='left';});
 rule(X,930,1506,930);
 mono('member level',X,966,12);text(profile.member,X,998,24,ink,700);
 const host=new URL(url).hostname;mono(['localhost','127.0.0.1'].includes(host)?'deep spot / profile preview':host,1100,998,12);
 text(profile.localPreview?'Local passport draft. Account activity is not connected.':'Totals from the DeepSpot snapshot and community leaderboard.',X,1030,13,muted);
 ctx.restore();
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(Error('Unable to export passport')),'image/png'));
 return {url:URL.createObjectURL(blob),filename:`deepspot-passport-${profile.id}.png`};
}
