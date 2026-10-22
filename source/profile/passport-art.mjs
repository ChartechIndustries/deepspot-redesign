export const awards=[
 {id:'first-find',name:'first find',description:'Every explorer starts somewhere. A first contribution to the DeepSpot collection.',color:'#3c60ff'},
 {id:'off-the-grid',name:'off the grid',description:'For following curiosity beyond the obvious. An achievement for discoveries off the usual path.',color:'#176972'},
 {id:'deep-spot-choice',name:'deep spot choice',description:'A discovery worth a closer look. An editorial pick from the DeepSpot community.',color:'#14713d'}
];
export function stampArt(index){
 const shapes=[
  '<circle cx="60" cy="60" r="53"/><circle cx="60" cy="60" r="47" stroke-dasharray="1 4"/><path d="M60 83c-7-11-21-25-21-37a21 21 0 0 1 42 0c0 12-14 26-21 37Z"/><circle cx="60" cy="46" r="7"/><path d="M30 85h10m40 0h10"/><text class="pp-stamp-word" x="60" y="100" text-anchor="middle">FIRST FIND</text>',
  '<rect x="13" y="13" width="94" height="94" rx="5"/><rect x="19" y="19" width="82" height="82" rx="2" stroke-dasharray="2 3"/><circle cx="60" cy="55" r="27"/><path d="m74 39-8 23-20 9 9-23Z"/><path d="m74 39-19 9 11 14Z" fill="currentColor" stroke="none"/><path d="M60 23v6m0 52v6M28 55h6m52 0h6"/><text class="pp-stamp-word" x="60" y="99" text-anchor="middle">OFF THE GRID</text>',
  '<path d="m60 5 11 10 15-2 5 14 14 5-2 15 10 13-10 12 2 15-14 5-5 14-15-2-11 10-12-10-15 2-5-14-14-5 2-15L5 60l11-13-2-15 14-5 5-14 15 2Z"/><circle cx="60" cy="60" r="36"/><path d="m60 34 6 17 18 1-14 12 4 18-14-10-15 10 5-18-15-12 19-1Z"/><path d="M39 99h42"/>'
 ];
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${shapes[index]}</svg>`;
}
export const signatureMark='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2v36M2 20h36M7 7l26 26M7 33 26-26"/></svg>';

// Head-and-shoulders crop of the square mole render, as fractions of the source (x, y, width).
export const moleCrop={x:.17,y:0,w:.66};

// The own mole comes from the reveal snapshot (data: URL, camera ~1.11x closer, shifted down by ~19px of 512 vs the community renders).
// Landmark match (helmet/glasses) against /community-assets/moles/wayfarer.webp, same traits: scale 0.9, offset (26,-17).
// This crop shows the same head + shirt as `moleCrop` does on the community renders.
export const ownMoleCrop={x:.132,y:.037,w:.734};
export const cropFor=src=>/^(data:|blob:)/.test(String(src||''))?ownMoleCrop:moleCrop;
