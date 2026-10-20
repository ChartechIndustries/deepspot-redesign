// Tours: under construction (2026-10-20). A blurred tour page sits under the construction mole;
// redesign-colored tape bands cross the stage and scroll slowly. The tape text is decorative; the h1 below carries it.
import {action} from './core.mjs';

const STAR='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg>';
const PHOTOS=['oya','chiatura','teufelsberg','rummu','maishima','sandchurch'];
const TAPES=[
 {c:'green',top:17,rot:-8,dur:140,dir:1},
 {c:'cobalt',top:41,rot:5,dur:170,dir:-1},
 {c:'cream',top:90,rot:-3,dur:125,dir:1}
];

const run=()=>Array.from({length:6},()=>`<span>under construction</span>${STAR}`).join('');
const tape=t=>`<div class="tr-tape tr-${t.c}" style="--top:${t.top}%;--rot:${t.rot}deg;--dur:${t.dur}s"><div class="tr-run${t.dir<0?' tr-rev':''}"><div>${run()}</div><div>${run()}</div></div></div>`;

/* the page that is being built: real spot photos, text as bars, all blurred and inert */
function fakePage(){
 const card=(p,i)=>`<div class="tr-f-card"><img src="/spots/${p}.jpg" alt="" loading="${i<3?'eager':'lazy'}" decoding="async"><i style="width:${62+i*5%30}%"></i><i style="width:${40+i*7%25}%"></i><b></b></div>`;
 return `<div class="tr-fake" aria-hidden="true" inert><div class="tr-f-head"><div><i class="tr-f-h1"></i><i class="tr-f-h2"></i></div><i class="tr-f-p"></i></div><div class="tr-f-chips">${'<b></b>'.repeat(5)}</div><div class="tr-f-grid">${PHOTOS.map(card).join('')}</div></div>`;
}

export function renderTours(root){
 document.title='Tours — DeepSpot';
 root.classList.add('tr-root');
 root.innerHTML=`<section class="tr-stage" aria-label="Tours, under construction">${fakePage()}<div class="tr-mole"><picture><source srcset="/tours/mole-construction-still.webp" media="(prefers-reduced-motion: reduce)"><img src="/tours/mole-construction.webp" alt="The DeepSpot mole in a hard hat and safety vest, holding a hammer" width="585" height="720" fetchpriority="high"></picture></div><div class="tr-tapes" aria-hidden="true">${TAPES.map(tape).join('')}</div></section>
 <section class="tr-copy"><div><p class="tr-k"><span aria-hidden="true"></span>status · under construction</p><h1>tours are <span>under construction.</span></h1></div><div><p>Guided trips to deep spots are on the way. Until they open, plan your own route from the spots you save.</p><div class="ds-actions">${action('plan a trip','/plan-trip/')}${action('browse guides','/guides/','secondary')}</div></div></section>
 <section class="ds-wide-cta"><div><h2>want a say in what we build?</h2><p>The roadmap shows what is in progress. Vote on it in the community.</p></div>${action('see the roadmap','/roadmap/')}</section>`;
}
