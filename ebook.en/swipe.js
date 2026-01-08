(function(){
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  window.TMKSwipeReader = function(opts){
    const root = opts.root;
    const pagesEl = root.querySelector(".pages");
    const pageEls = Array.from(root.querySelectorAll(".page"));
    const dotsEl = root.querySelector(".dots");
    const pageCountEl = root.querySelector("[data-pagecount]");
    const prevBtn = root.querySelector("[data-prev]");
    const nextBtn = root.querySelector("[data-next]");

    let index = 0;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    // dots
    dotsEl.innerHTML = "";
    pageEls.forEach((_, i) => {
      const d = document.createElement("div");
      d.className = "dot" + (i===0 ? " active" : "");
      d.addEventListener("click", () => go(i));
      dotsEl.appendChild(d);
    });

    function render(){
      pagesEl.style.transform = `translateX(${-index * 100}%)`;
      const dots = Array.from(dotsEl.querySelectorAll(".dot"));
      dots.forEach((d,i)=> d.classList.toggle("active", i===index));
      if (pageCountEl) pageCountEl.textContent = `${index+1}/${pageEls.length}`;
      if (prevBtn) prevBtn.disabled = index===0;
      if (nextBtn) nextBtn.disabled = index===pageEls.length-1;
    }

    function go(i){
      index = clamp(i, 0, pageEls.length-1);
      render();
      // scroll top of new page
      pageEls[index].scrollTop = 0;
    }

    function next(){ go(index+1); }
    function prev(){ go(index-1); }

    // buttons
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // keyboard
    window.addEventListener("keydown", (e)=>{
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    });
<script>
(function(){
  const nav = document.querySelector(".ebook-bottomnav");
  if(!nav) return;

  function update(){
    const y = window.scrollY || 0;
    if (y <= 30) nav.classList.add("show");  // solo arriba
    else nav.classList.remove("show");
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
</script>

    // swipe
    const body = root.querySelector(".reader-body");
    body.addEventListener("touchstart", (e)=>{
      dragging = true;
      startX = e.touches[0].clientX;
      deltaX = 0;
    }, {passive:true});

    body.addEventListener("touchmove", (e)=>{
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
    }, {passive:true});

    body.addEventListener("touchend", ()=>{
      if (!dragging) return;
      dragging = false;
      const threshold = 55; // px
      if (deltaX < -threshold) next();
      if (deltaX > threshold) prev();
      deltaX = 0;
    });

    render();
    return { go, next, prev };
  };
})();
