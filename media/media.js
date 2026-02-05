// TMK — Media Vault logic
// - language (ma_lang) ES/EN
// - open WebBook by language
// - gate for Truth Path (lock/unlock)
// - light protection + watermark (same style as ebook/ttps)
(function () {
  // --------- Language
  var LANG_KEY = "ma_lang";
  var DEFAULT_LANG = "es";
  var I18N = {
    es: {
      "brand.vault": "Media Vault",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Cerrar sesión",
      "quote.kicker": "FRASE",
      "quote.default": "Tu decisión de hoy abre puertas que aún no imaginas.",
      "chip.available": "Disponible",
      "chip.soon": "Próximamente",
      "book.kicker": "WEBBOOK",
      "book.title": "Yo Decido Ser Abundante",
      "book.sub": "4 leyes. 1 decisión. Un nuevo comienzo.",
      "book.cta": "Leer ahora",
      "book.how": "¿Cómo desbloquear más?",
      "book.metric1": "Leyes",
      "book.metric2": "Decisión",
      "book.metric3": "Camino",
      "ttp.kicker": "The Truth Path",
      "ttp.title": "Devocional de 40 días",
      "ttp.text": "Este camino se desbloquea cuando terminas el libro y completas el quiz. Aquí lo personal se vuelve práctico: silencio,
  verdad, y dirección.",
      "ttp.cta": "Entrar",
      "ttp.back": "Volver arriba",
      "ttp.cardTitle": "Acceso protegido",
      "ttp.cardText": "Completa el libro + quiz para desbloquear el Sendero.",
      "ttp.step1": "1 · Libro",
      "ttp.step2": "2 · Quiz",
      "ttp.step3": "3 · Acceso",
      "ttp.lockedMsg": "Aún no está desbloqueado. Termina el libro y completa el quiz.",
      "ttp.unlockedMsg": "Acceso desbloqueado ",
      "audio.kicker": "AUDIOBOOK",
      "audio.title": "Audiolibro",
      "audio.text": "Estamos preparando el audio con una experiencia premium.",
      "audio.cta": "Notificarme",
      "audio.dash": "Ir al Dashboard"
    },
    en: {
      "brand.vault": "Media Vault",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Log out",
      "quote.kicker": "QUOTE",
      "quote.default": "Your decision today opens doors you can't yet imagine.",
      "chip.available": "Available",
      "chip.soon": "Coming soon",
      "book.kicker": "WEBBOOK",
      "book.title": "I Decide To Be Abundant",
      "book.sub": "4 laws. 1 decision. A new beginning.",
      "book.cta": "Read now",
      "book.how": "How do I unlock more?",
      "book.metric1": "Laws",
      "book.metric2": "Decision",
      "book.metric3": "Path",
      "ttp.kicker": "The Truth Path",
      "ttp.title": "40 Day Devotional",
      "ttp.text": "This path unlocks once you finish the book and complete the quiz. Here, the personal becomes practical: silence, truth,
  and direction.",
      "ttp.cta": "Enter",
      "ttp.back": "Back to top",
      "ttp.cardTitle": "Protected access",
      "ttp.cardText": "Complete the book + quiz to unlock the Path.",
      "ttp.step1": "1 · Book",
      "ttp.step2": "2 · Quiz",
      "ttp.step3": "3 · Access",
      "ttp.lockedMsg": "Not unlocked yet. Finish the book and complete the quiz.",
      "ttp.unlockedMsg": "Unlocked ",
      "audio.kicker": "AUDIOBOOK",
      "audio.title": "Audiobook",
      "audio.text": "We’re preparing a premium listening experience.",
      "audio.cta": "Notify me",
      "audio.dash": "Go to Dashboard"
    }
  };
  function getLang(){
    try {
      var v = localStorage.getItem(LANG_KEY);
      if (v === "es" || v === "en") return v;
    } catch (e) {}
    return DEFAULT_LANG;
  }
  function setLang(lang){
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
  function applyLang(){
    var lang = getLang();
    var dict = I18N[lang] || I18N.es;
    // data-i18n nodes
    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i=0; i<nodes.length; i++){
      var k = nodes[i].getAttribute("data-i18n");
      if (dict[k]) nodes[i].textContent = dict[k];
    }
    // quote text
    var qt = document.getElementById("mvQuoteText");
    if (qt) qt.textContent = dict["quote.default"];
    // button label
    var lab = document.getElementById("mvLangLabel");
    if (lab) lab.textContent = (lang === "en") ? "EN" : "ES";
    // footer meta (name + ref)
    var meta = document.getElementById("mvFooterMeta");
    if (meta){
      var u = {};
      try { u = JSON.parse(localStorage.getItem("ma_user") || "{}"); } catch (e) {}
      var name = (u.name || u.nombre || "").toString().trim();
      var ref = (u.refid || u.refId || "").toString().trim();
      var left = name ? name : (lang === "en" ? "TMK Member" : "Miembro TMK");
      var codeLabel = (lang === "en") ? "CODE: " : "CÓDIGO: ";
      meta.textContent = left + " · " + codeLabel + (ref || "—");
    }
  }
  // Optional: quick toggle language (for testing)
  function wireLangToggle(){
    var btn = document.getElementById("mvLangBtn");
    if (!btn) return;
    btn.addEventListener("click", function(){
      var next = (getLang() === "en") ? "es" : "en";
      setLang(next);
      applyLang();
    });
  }
  // --------- Resource routes
  function openWebBook(){
    var lang = getLang();
    // Matches your dashboard logic: ebook/index.html and ebook.en/index.html
    var target = (lang === "en") ? "/ebook.en/index.html" : "/ebook/index.html";
    window.location.href = target;
  }
  // --------- Truth Path gate (safe + flexible)
  // Preferred key (you can set this when quiz is passed):
  // localStorage.setItem("ma_ttp_unlocked","1")
  function isTtpUnlocked(){
    try {
      var v = localStorage.getItem("ma_ttp_unlocked");
      if (v === "1" || v === "true") return true;
      // Optional: if you store it inside ma_user
      var u = JSON.parse(localStorage.getItem("ma_user") || "{}");
      if (u && (u.ttpUnlocked === true || u.ttp_unlocked === true)) return true;
      // Optional: if you store quiz completion
      var q = localStorage.getItem("ma_quiz_passed");
      if (q === "1" || q === "true") return true;
    } catch (e) {}
    return false;
  }
  function openTtp(){
    // Your folder is /media/ttps/
    // First page can be day01.html
    window.location.href = "/media/ttps/day01.html";
  }
  function renderTtpLockState(){
    var unlocked = isTtpUnlocked();
    var note = document.getElementById("ttpNote");
    var icon = document.getElementById("ttpLockIcon");
    var card = document.getElementById("ttpCard");
    var lang = getLang();
    var dict = I18N[lang] || I18N.es;
    if (unlocked){
      if (note) note.textContent = dict["ttp.unlockedMsg"];
      if (icon) icon.textContent = " ";
      if (card){
        card.style.borderColor = "rgba(214,179,106,.32)";
        card.style.background = "rgba(214,179,106,.10)";
      }
    } else {
      if (note) note.textContent = dict["ttp.lockedMsg"];
      if (icon) icon.textContent = " ";
      if (card){
        card.style.borderColor = "rgba(255,255,255,.10)";
        card.style.background = "rgba(255,255,255,.06)";
      }
    }
    return unlocked;
  }
  // --------- How to unlock modal (simple)
  function wireHowUnlock(){
    var btn = document.getElementById("howUnlockBtn");
    if (!btn) return;
    btn.addEventListener("click", function(){
      var lang = getLang();
      var msg = (lang === "en")
        ? "Finish the WebBook and pass the Quiz to unlock The Truth Path."
        : "Termina el WebBook y pasa el Quiz para desbloquear The Truth Path.";
      alert(msg);
    });
  }
  // --------- Notify placeholder
  function wireNotify(){
    var btn = document.getElementById("notifyBtn");
    if (!btn) return;
    btn.addEventListener("click", function(){
      var lang = getLang();
      alert(lang === "en" ? "Noted. (Placeholder)" : "Listo. (Placeholder)");
    });
  }
  // --------- Light protection + watermark
  function getUserStamp(){
    try {
      var u = JSON.parse(localStorage.getItem("ma_user") || "{}");
      var name = (u.name || u.nombre || u.fullname || "").toString().trim();
      var refid = (u.refid || u.refId || "").toString().trim();
      var who = name ? name : "TMK Member";
      var code = refid ? (" · " + refid) : "";
      return (who + code + " · TMK").toUpperCase();
    } catch (e) {
      return "TMK MEMBER · TMK";
    }
  }
  function addWatermark(){
    var root = document.getElementById("mvWatermark");
    if (!root) return;
    root.innerHTML = "";
    var stamp = getUserStamp();
    for (var i=0; i<8; i++){
      var s = document.createElement("span");
      s.textContent = stamp;
      root.appendChild(s);
    }
  }
  function applyProtection(){
    document.documentElement.classList.add("mv-no-select");
    document.addEventListener("contextmenu", function (e){ e.preventDefault(); });
    document.addEventListener("keydown", function (e){
      var key = (e.key || "").toLowerCase();
      var ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && (key === "c" || key === "x" || key === "a" || key === "p" || key === "s")) {
        e.preventDefault();
      }
    });
    document.addEventListener("copy", function (e){ e.preventDefault(); });
  }
  // --------- Wire buttons
  function wireButtons(){
    var openBookBtn = document.getElementById("openBookBtn");
    if (openBookBtn) openBookBtn.addEventListener("click", openWebBook);
    var openTtpBtn = document.getElementById("openTtpBtn");
    if (openTtpBtn) openTtpBtn.addEventListener("click", function(){
      var ok = renderTtpLockState();
      if (ok) openTtp();
      else {
        var lang = getLang();
        var dict = I18N[lang] || I18N.es;
        alert(dict["ttp.lockedMsg"]);
      }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    applyLang();
    wireLangToggle();
    wireHowUnlock();
    wireNotify();
    wireButtons();
    applyProtection();
    addWatermark();
    renderTtpLockState();
  });
})();
