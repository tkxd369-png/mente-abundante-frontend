/* Media Vault — FIXED background quote + floating cards
   - Language: localStorage.ma_lang ('es'/'en')
   - TTPS unlock: localStorage.ma_ttp_unlocked === '1'
   - Login gate: adjust isLoggedIn() keys to match YOUR system
*/
(function(){
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));
  function isLoggedIn(){
    const v1 = localStorage.getItem('ma_logged_in');
    const v2 = localStorage.getItem('ma_auth_ok');
    const v3 = localStorage.getItem('ma_session');
    return (v1==='1' || v2==='1' || (v3 && v3.length>10));
  }
  function requireLogin(){
    if(!isLoggedIn()){
      window.location.href = '../start.html';
      return false;
    }
    return true;
  }
  function lang(){
    const raw=(localStorage.getItem('ma_lang')||'es').toLowerCase();
    return raw.startsWith('en') ? 'en' : 'es';
  }
  function setBgFromSection(section, L){
    const q = section.getAttribute('data-quote-'+L) || '';
    const s = section.getAttribute('data-sub-'+L) || '';
    $('#bgQuote').textContent = q;
    $('#bgSub').textContent = s;
    $('#footerLang').textContent = L.toUpperCase();
  }
  function applyLanguage(L){
    if(L==='en'){
      $('#heroKicker').textContent='WELCOME';
      $('#heroDesc').textContent='Your private library. Scroll to reveal each section.';
      $('#ctaBook').textContent='Enter WebBook';
      $('#ctaTtp').textContent='View Truth Path';
      $('#bookTitle').textContent='I Decide To Be Abundant';
      $('#bookDesc').textContent='Main reading. Protected with watermark and copy lock.';
      $('#bookNote').textContent='Tip: when you finish, you unlock Truth Path.';
      $('#ttpDesc').textContent='40-day devotional. Unlocks after completing the book and quiz.';
      $('#ttpWarn').textContent='Still locked. Finish the book + quiz to continue.';
      $('#soonTitle').textContent='Audiobook + Resources';
      $('#soonDesc').textContent='This section is ready to grow without changing the design.';
      $('#soonNote').textContent='We keep the same fixed background + floating cards style.';
      $('#dashLink').textContent='Dashboard';
    }
  }
  function setupUnlock(){
    const unlocked = localStorage.getItem('ma_ttp_unlocked')==='1';
    const ttpMeta = $('#ttpMeta');
    const ttpWarn = $('#ttpWarn');
    const ttpEs = $('#ttpEs');
    const ttpEn = $('#ttpEn');
    if(unlocked){
      ttpMeta.textContent = (lang()==='en') ? 'Available' : 'Disponible';
      ttpWarn.style.display='none';
      ttpEs.classList.remove('ma-locked');
      ttpEn.classList.remove('ma-locked');
      ttpEs.href = '../media/ttps/index.html';
      ttpEn.href = '../media/ttps-en/index.html';
    }else{
      ttpMeta.textContent = (lang()==='en') ? 'Locked' : 'Bloqueado';
      ttpWarn.style.display='block';
      ttpEs.addEventListener('click',(e)=>e.preventDefault());
      ttpEn.addEventListener('click',(e)=>e.preventDefault());
    }
  }
  function setupSmoothAnchors(){
    $$('.ma-link').forEach(a=>{
      const h=a.getAttribute('href')||'';
      if(h.startsWith('#')){
        a.addEventListener('click',(e)=>{
          e.preventDefault();
          const el=document.querySelector(h);
          if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
      }
        });
    });
  }
  function setupObservers(){
    const L = lang();
    const panels = $$('.ma-panel');
    const reveal = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const card = e.target.querySelector('.ma-float');
          if(card) card.classList.add('is-in');
        }
      });
    }, { threshold: 0.30 });
    panels.forEach(p=>reveal.observe(p));
    const quote = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          setBgFromSection(e.target, L);
        }
      });
    }, { rootMargin: '-35% 0px -45% 0px', threshold: 0.01 });
    panels.forEach(p=>quote.observe(p));
    if(panels[0]) setBgFromSection(panels[0], L);
  }
  function init(){
    if(!requireLogin()) return;
    const L = lang();
    applyLanguage(L);
    setupUnlock();
    setupSmoothAnchors();
    setupObservers();
  }
  document.addEventListener('DOMContentLoaded', init);
})(); 
