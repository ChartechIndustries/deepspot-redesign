(()=>{
 const root=document.documentElement;
 const storageKey='deepspot-panel-colors';
 let enabled=true;
 try{enabled=localStorage.getItem(storageKey)!=='off'}catch{}
 root.dataset.panelColor=enabled?'on':'off';
 class ColorToggle extends HTMLElement{
  connectedCallback(){
   root.dataset.panelColor=enabled?'on':'off';
   if(this.button)return;
   this.innerHTML='<button class="color-toggle" type="button" aria-label="Color accents"><span class="color-toggle-swatch" aria-hidden="true"></span><span class="color-toggle-label"></span></button>';
   this.button=this.querySelector('button');
   this.sync=()=>{
    const on=root.dataset.panelColor==='on';
    this.button.setAttribute('aria-pressed',String(on));
    this.button.title=on?'Turn panel colors off':'Turn panel colors on';
    this.querySelector('.color-toggle-label').textContent=on?'color on':'color off';
   };
   this.button.addEventListener('click',()=>{
    const value=root.dataset.panelColor==='on'?'off':'on';
    enabled=value==='on';
    root.dataset.panelColor=value;
    try{localStorage.setItem(storageKey,value)}catch{}
    this.sync();
   });
   this.sync();
  }
 }
 customElements.define('deepspot-color-toggle',ColorToggle);
})();
