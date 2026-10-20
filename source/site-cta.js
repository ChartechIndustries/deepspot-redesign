(()=>{
 class DeepSpotCTA extends HTMLElement{
  connectedCallback(){
   if(this.dataset.ready)return;
   this.dataset.ready='true';
   this.innerHTML=`<section class="ds-cta" aria-label="Join the DeepSpot community">
    <div class="ds-cta-contribute">
     <h2>know a<br><span>hidden gem?</span></h2>
     <p>Help us map the unmapped. Share your favorite obscure spots and become part of our community of explorers worldwide.</p>
     <a class="ds-cta-button" href="/contribute/">contribute a spot <span aria-hidden="true">↗</span></a>
    </div>
    <div class="ds-cta-newsletter">
     <h3>new stories<br>every week.</h3>
     <p>Get the latest deep spots delivered to your inbox.</p>
     <div class="ds-cta-signup" role="group" aria-label="Newsletter signup preview" aria-describedby="ds-newsletter-status">
      <label class="ds-sr-only" for="ds-newsletter-email">Email address</label>
      <input id="ds-newsletter-email" type="email" placeholder="enter your email" disabled>
      <button type="button" disabled>subscribe <span aria-hidden="true">↗</span></button>
     </div>
     <small id="ds-newsletter-status">newsletter signup coming soon.</small>
    </div>
   </section>
   <footer class="ds-footer" aria-label="DeepSpot footer">
    <div class="ds-footer-main">
     <div class="ds-footer-brand">
      <a class="ds-footer-logo" href="/" aria-label="DeepSpot home"><span>DEEP<br>SPOT</span><svg class="ds-footer-star" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M24 2v44M2 24h44M8.5 8.5l31 31m0-31-31 31"/></svg></a>
      <p>Discovering the obscure, the weird, and the wonderful side of the world that you won't find in guidebooks.</p>
      <div class="ds-footer-socials" aria-label="Follow DeepSpot">
       <a href="https://x.com/deepspotjapan" target="_blank" rel="noopener" aria-label="DeepSpot on X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 3 16 18h-4L0 3h4Zm16 0L4 21" transform="translate(2 0) scale(.9 1)"/></svg></a>
       <a href="https://www.instagram.com/deep_spot_/" target="_blank" rel="noopener" aria-label="DeepSpot on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" class="ds-social-dot"/></svg></a>
       <a href="https://youtube.com/@deepspotjapan" target="_blank" rel="noopener" aria-label="DeepSpot on YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 6 3-6 3Z"/></svg></a>
      </div>
     </div>
     <nav class="ds-footer-nav" aria-labelledby="ds-footer-explore">
      <h2 id="ds-footer-explore">explore</h2>
      <ul>
       <li><a href="/">home</a></li>
       <li><a href="/browse/">browse</a></li><li><a href="/stories/">stories</a></li><li><a href="/guides/">guides</a></li><li><a href="/community/">community</a></li><li><a href="/saved/">your fieldbook</a></li><li><a href="/membership/">membership</a></li><li><a href="/account/">your account</a></li>
       <li><a href="/map/">interactive map</a></li>
       <li><a href="/mission/">our mission</a></li>
       <li><a href="/faq/">faq</a></li>
      </ul>
     </nav>
     <nav class="ds-footer-nav" aria-labelledby="ds-footer-legal">
      <h2 id="ds-footer-legal">legal</h2>
      <ul>
       <li><a href="/privacy/">privacy policy</a></li>
       <li><a href="/terms/">terms of service</a></li>
       <li><a href="/cookies/">cookie policy</a></li>
       <li><button type="button" data-cookie-settings>manage cookies</button></li>
      </ul>
     </nav>
    </div>
    <div class="ds-footer-bottom"><span>© ${new Date().getFullYear()} DeepSpot. All rights reserved.</span><span>Designed for Explorers.</span></div>
   </footer>
   <dialog class="ds-cookie-dialog" aria-labelledby="ds-cookie-heading">
    <button class="ds-cookie-close" type="button" aria-label="Close cookie settings">×</button>
    <h2 id="ds-cookie-heading">cookie settings</h2>
    <p>This preview remembers display preferences and saved spots on your device. Optional analytics and advertising cookies are not used.</p>
    <a href="/cookies/" target="_blank" rel="noopener">read the DeepSpot cookie policy ↗</a>
    <button class="ds-cta-button ds-cookie-done" type="button">done</button>
   </dialog>`;
   const focusedPages=new Set(['account','inbox','invites','contribute','plan-trip','saved','map','faq','privacy','terms','cookies','membership','competition','community','sponsored']);
   if(focusedPages.has(document.body.dataset.page))this.querySelector('.ds-cta')?.remove();
   const cookieDialog=this.querySelector('.ds-cookie-dialog');
   this.querySelector('[data-cookie-settings]').addEventListener('click',()=>cookieDialog.showModal());
   this.querySelector('.ds-cookie-close').addEventListener('click',()=>cookieDialog.close());
   this.querySelector('.ds-cookie-done').addEventListener('click',()=>cookieDialog.close());
   cookieDialog.addEventListener('click',event=>{if(event.target===cookieDialog){const bounds=cookieDialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)cookieDialog.close()}});
  }
 }
 customElements.define('deepspot-cta',DeepSpotCTA);
})();
