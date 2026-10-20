const designs=[
 ['quiet panels','Three low-contrast panels. Small imagery, generous spacing, and a fine blue rule.'],
 ['editorial index','A compact numbered list. The globe remains the dominant image.'],
 ['night photographs','Wide photographic crops, subdued to the same blue-black range as the Earth.'],
 ['feature + footnotes','One weekly discovery leads; competition and development sit alongside as smaller notes.'],
 ['open columns','No card backgrounds. Type, thin dividers, and small circular images sit directly on the page.'],
 ['halftone windows','Softly fading image windows and a sparse dot screen echo the globe’s treatment.'],
 ['the bulletin','A restrained paper-colored strip, like a small editorial insert beneath the dark hero.'],
 ['wide dispatches','A horizontal, scrollable sequence with large type and a cropped next panel.'],
 ['contact sheet','Small images above structured captions, borrowing the rhythm of an editorial photo archive.'],
 ['one continuous band','A single dark surface split into three concise announcements with subtle green markers.']
];
const items=[{type:'competition',label:'community competition',title:'a good find. a $300 reward.',desc:'Share your curiosity. Compete for the cash prize.',img:'/camera-giveaway.png',alt:'Silver travel camera',detail:'Compete for a $300 cash prize. Entry dates and competition rules are still to be announced.'},{type:'weekly',label:'deepspot of the week',title:'a cathedral beneath your feet.',desc:'Inside the extraordinary Oya History Museum, Japan.',img:'/spots/oya.jpg',alt:'Underground stone chambers at Oya History Museum',detail:'Explore the monumental underground chambers of Oya History Museum in Utsunomiya, Japan.'},{type:'roadmap',label:'in development',title:'where we go from here.',desc:'Follow the next chapter of DeepSpot.',img:'/roadmap-mountain.png',alt:'Mountain ridge with a route to its summit',detail:'Upcoming features, improvements and community ideas. The detailed development map is being prepared.'}];
function art(x){if(x.type==='competition')return '<div class="prize-art" aria-label="300 dollar competition prize"><span>$</span>300<span class="prize-caption">a little further<br>from the usual.</span></div>';return '<img src="'+x.img+'" alt="'+x.alt+'" loading="lazy">';}
const root=document.querySelector('#studies');
designs.forEach(([name,desc],i)=>{const section=document.createElement('section');section.className='study v'+(i+1);section.id='direction-'+(i+1);section.innerHTML='<header class="study-heading"><span>'+String(i+1).padStart(2,'0')+' / '+name+'</span><p>'+desc+'</p></header><div class="banners">'+items.map((x,j)=>'<article class="banner '+x.type+'"><div class="visual">'+art(x)+'</div><div class="copy"><span class="kicker"><b>'+String(j+1).padStart(2,'0')+'</b> '+x.label+'</span><h2>'+x.title+'</h2><p>'+x.desc+'</p><button data-item="'+j+'">read more <span aria-hidden="true">↗</span></button></div></article>').join('')+'</div>';root.append(section);});
const select=document.querySelector('#choice');designs.forEach(([name],i)=>select.add(new Option(String(i+1).padStart(2,'0')+' / '+name,i+1)));
let all=false;function show(){document.querySelectorAll('.study').forEach((s,i)=>s.hidden=!all&&i!==Number(select.value)-1);document.querySelector('#all').textContent=all?'view one at a time':'view all ten';history.replaceState(null,'','#'+select.value);}
select.value=Math.max(1,Math.min(10,Number(location.hash.slice(1))||1));select.onchange=()=>{all=false;show();};document.querySelector('#all').onclick=()=>{all=!all;show();};show();
root.onclick=e=>{const b=e.target.closest('button[data-item]');if(!b)return;const x=items[Number(b.dataset.item)];document.querySelector('#category').textContent=x.label;document.querySelector('#headline').textContent=x.title;document.querySelector('#body').textContent=x.detail;document.querySelector('#detail').showModal();};document.querySelector('#close').onclick=()=>document.querySelector('#detail').close();
const hero=document.querySelector('#hero');hero.onload=()=>{const d=hero.contentDocument;const style=d.createElement('style');style.textContent='.homepage-news,main>footer{display:none!important}html,body{overflow:hidden!important}.hero{height:650px!important;min-height:650px!important;max-height:none!important}@media(max-width:759px){.hero{height:870px!important;min-height:870px!important}}';d.head.append(style);hero.style.height=(window.innerWidth<760?1005:792)+'px';};

window.addEventListener('resize',()=>{hero.style.height=(window.innerWidth<760?1005:792)+'px';});
