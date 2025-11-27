// app.js – Mente Abundante 2.0
// Flujo completo + dashboard estilo Noé

(function () {
  const API_BASE = "https://mente-abundante-api-1.onrender.com";

  // ---------------------------
  // Utilidades de sesión
  // ---------------------------
  function getToken() {
    return localStorage.getItem("ma_token") || "";
  }

  function setSession(token, user) {
    if (token) localStorage.setItem("ma_token", token);
    if (user) localStorage.setItem("ma_user", JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem("ma_token");
    localStorage.removeItem("ma_user");
  }

  function getStoredUser() {
    const raw = localStorage.getItem("ma_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
  }

  async function apiGet(path) {
    const token = getToken();
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await safeJson(res);

    if (!res.ok || !data.ok) {
      const error =
        (data && data.error) || `Error (${res.status}) al conectar con el servidor`;
      throw new Error(error);
    }

    return data;
  }

  async function apiPost(path, body) {
    const token = getToken();
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body || {}),
    });

    const data = await safeJson(res);

    if (!res.ok || !data.ok) {
      const error =
        (data && data.error) ||
        `Error (${res.status}) al conectar con el servidor`;
      throw new Error(error);
    }

    return data;
  }

  // ---------------------------
  // Frases motivacionales "AI"
  // ---------------------------
  const AI_PHRASES = [
    "Tu decisión de hoy abre puertas que aún no imaginas.",
    "Cada ‘sí’ a la verdad es una semilla de abundancia futura.",
    "No estás empezando de cero, estás empezando desde tu experiencia.",
    "La abundancia no llega por accidente, se construye con decisiones diarias.",
    "Lo que compartes desde el corazón, regresa multiplicado.",
    "Cuando ayudas a otros a avanzar, tu camino también se abre.",
  ];

  function pickDailyPhrase() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem("ma_phrase_date");
    const storedText = localStorage.getItem("ma_phrase_text");

    if (storedDate === todayKey && storedText) {
      return storedText;
    }

    const idx = Math.floor(Math.random() * AI_PHRASES.length);
    const phrase = AI_PHRASES[idx];
    localStorage.setItem("ma_phrase_date", todayKey);
    localStorage.setItem("ma_phrase_text", phrase);
    return phrase;
  }

  // ---------------------------
  // Routing por página
  // ---------------------------
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("ma-landing")) {
      initLanding();
    }

    if (document.getElementById("membershipForm")) {
      initMembership();
    }

    if (document.getElementById("goToMainVideoBtn")) {
      initPuenteVideo();
    }

    if (document.getElementById("videoQuizForm")) {
      initVideoQuiz();
    }

    if (document.getElementById("signupForm")) {
      initSignup();
    }

    if (document.getElementById("loginForm")) {
      initLogin();
    }

    if (
      document.body.classList.contains("ma-dashboard") ||
      document.getElementById("dashboardHeader")
    ) {
      initDashboard();
    }

    if (
      document.getElementById("profileForm") ||
      document.getElementById("passwordForm")
    ) {
      initSettings();
    }
  });

  // ---------------------------
  // INDEX / LANDING
  // ---------------------------
  function initLanding() {
    const ctaBtn =
      document.getElementById("indexCtaBtn") ||
      document.querySelector("[data-role='index-cta']");

    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get("ref");
    if (refFromUrl) {
      localStorage.setItem("ma_ref_code", refFromUrl.toUpperCase());
    }

    if (ctaBtn) {
      ctaBtn.addEventListener("click", () => {
        window.location.href = "membresia.html";
      });
    }
  }

  // ---------------------------
  // MEMBRESÍA (pago simulado)
  // ---------------------------
  function initMembership() {
    const form = document.getElementById("membershipForm");
    if (!form) return;

    const fullNameInput = document.getElementById("memFullName");
    const emailInput = document.getElementById("memEmail");
    const phoneInput = document.getElementById("memPhone");
    const countryInput = document.getElementById("memCountry");
    const refInput = document.getElementById("memRefCode");
    const termsInput = document.getElementById("memTerms");
    const errorEl = document.getElementById("membershipError");

    const params = new URLSearchParams(window.location.search);
    const refFromUrl = params.get("ref");
    const storedRef = localStorage.getItem("ma_ref_code");

    if (refInput) {
      refInput.value =
        (refFromUrl && refFromUrl.toUpperCase()) ||
        (storedRef && storedRef.toUpperCase()) ||
        "";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }

      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const country = countryInput ? countryInput.value.trim() : "";
      const refCode = refInput ? refInput.value.trim() : "";
      const termsOk = termsInput ? termsInput.checked : true;

      if (!fullName || !email || !phone || !country) {
        showError(errorEl, "Por favor completa todos los campos requeridos.");
        return;
      }
      if (!termsOk) {
        showError(errorEl, "Debes aceptar los términos para continuar.");
        return;
      }

      localStorage.setItem("ma_pre_fullName", fullName);
      localStorage.setItem("ma_pre_email", email);
      localStorage.setItem("ma_pre_phone", phone);
      localStorage.setItem("ma_pre_country", country);
      if (refCode) {
        localStorage.setItem("ma_ref_code", refCode.toUpperCase());
      }

      window.location.href = "puente-video.html";
    });
  }

  // ---------------------------
  // PUENTE VIDEO
  // ---------------------------
  function initPuenteVideo() {
    const btn = document.getElementById("goToMainVideoBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      window.location.href = "video-quiz.html";
    });
  }

  // ---------------------------
  // VIDEO + QUIZ
  // ---------------------------
  function initVideoQuiz() {
    const form = document.getElementById("videoQuizForm");
    if (!form) return;

    const errorEl = document.getElementById("quizError");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }

      const passed = true; // simulado

      if (!passed) {
        showError(
          errorEl,
          "Por favor revisa tus respuestas y vuelve a intentarlo."
        );
        return;
      }

      window.location.href = "signup.html";
    });
  }

  // ---------------------------
  // SIGNUP
  // ---------------------------
  function initSignup() {
    const form = document.getElementById("signupForm");
    if (!form) return;

    const fullNameInput = document.getElementById("signupFullName");
    const emailInput = document.getElementById("signupEmail");
    const phoneInput = document.getElementById("signupPhone");
    const usernameInput = document.getElementById("signupUsername");
    const passwordInput = document.getElementById("signupPassword");
    const password2Input = document.getElementById("signupPassword2");
    const refInput = document.getElementById("signupRefCode");
    const errorEl = document.getElementById("signupError");

    if (fullNameInput) {
      const v = localStorage.getItem("ma_pre_fullName");
      if (v) fullNameInput.value = v;
    }
    if (emailInput) {
      const v = localStorage.getItem("ma_pre_email");
      if (v) emailInput.value = v;
    }
    if (phoneInput) {
      const v = localStorage.getItem("ma_pre_phone");
      if (v) phoneInput.value = v;
    }
    if (refInput) {
      const params = new URLSearchParams(window.location.search);
      const refFromUrl = params.get("ref");
      const storedRef = localStorage.getItem("ma_ref_code");
      refInput.value =
        (refFromUrl && refFromUrl.toUpperCase()) ||
        (storedRef && storedRef.toUpperCase()) ||
        "";
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }

      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";
      const username = usernameInput ? usernameInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const password2 = password2Input ? password2Input.value : "";
      const refCode = refInput ? refInput.value.trim() : "";

      if (!fullName || !email || !phone || !password || !password2) {
        showError(errorEl, "Por favor completa todos los campos requeridos.");
        return;
      }
      if (password !== password2) {
        showError(errorEl, "Las contraseñas no coinciden.");
        return;
      }

      try {
        const data = await apiPost("/auth/create-account", {
          fullName,
          email,
          phone,
          username: username || undefined,
          password,
          refCode: refCode || undefined,
        });

        setSession(data.token, data.user);

        localStorage.removeItem("ma_pre_fullName");
        localStorage.removeItem("ma_pre_email");
        localStorage.removeItem("ma_pre_phone");
        localStorage.removeItem("ma_pre_country");

        window.location.href = "dashboard.html";
      } catch (err) {
        console.error(err);
        showError(errorEl, err.message || "Error al crear la cuenta.");
      }
    });
  }

  // ---------------------------
  // LOGIN
  // ---------------------------
  function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const errorEl = document.getElementById("loginError");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
      }

      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";

      if (!email || !password) {
        showError(errorEl, "Ingresa tu correo y contraseña.");
        return;
      }

      try {
        const res = await fetch(API_BASE + "/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await safeJson(res);

        if (!res.ok || !data.ok) {
          const msg = data && data.error ? data.error : "Credenciales inválidas";
          throw new Error(msg);
        }

        setSession(data.token, data.user);
        window.location.href = "dashboard.html";
      } catch (err) {
        console.error(err);
        showError(errorEl, err.message || "No se pudo iniciar sesión.");
      }
    });
  }

 // ---------------------------
// DASHBOARD
// ---------------------------
async function initDashboard() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Botón logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  }

  // Frase del día
  const phraseEl = document.getElementById("aiPhraseText");
  if (phraseEl) {
    phraseEl.textContent = pickDailyPhrase();
  }

  // Usuario desde localStorage, luego refrescamos con /me
  let user = getStoredUser();

  try {
    const data = await apiGet("/me");
    if (data && data.ok && data.user) {
      user = data.user;
      setSession(token, user);
    }
  } catch (err) {
    console.error("Error al cargar /me:", err);
    if (!user) {
      clearSession();
      window.location.href = "login.html";
      return;
    }
  }

  if (!user) {
    clearSession();
    window.location.href = "login.html";
    return;
  }

  // Elementos del DOM
  const nameEl = document.getElementById("dashName");
  const refBadge = document.getElementById("dashRefBadge");
  const refTextEl = document.getElementById("dashReferralsText");
  const estTextEl = document.getElementById("dashEstimateText");
  const refInput = document.getElementById("referralLink");
  const copyLinkBtn = document.getElementById("copyLinkBtn");
  const footerRefIdEl = document.getElementById("footerRefId");
  const qrCanvas = document.getElementById("qrCanvas");
  const ebookTile = document.getElementById("ebookTile");

  // Nombre (solo el primer nombre)
  if (nameEl) {
    const fullName = user.full_name || "";
    const firstName = fullName.split(" ")[0] || fullName || "Bienvenido";
    nameEl.textContent = firstName;
  }

  // REFERIDOS + ESTIMADO
  const referrals = Number(user.referrals) || 0;
  const rewardPerReferral = 177;
  const estimated = referrals * rewardPerReferral;

  if (refTextEl) {
    refTextEl.textContent =
      referrals === 1 ? "1 REFERIDO" : `${referrals} REFERIDOS`;
  }

  if (estTextEl) {
    estTextEl.textContent =
      `$${estimated.toLocaleString()} USD ESTIMADO`;
  }

  // Enlace personal
  let personalLink = "";
  if (user.refid) {
    const baseUrl = window.location.origin + "/index.html";
    personalLink = `${baseUrl}?ref=${encodeURIComponent(user.refid)}`;
  }

  if (refInput && personalLink) {
    refInput.value = personalLink;
  }

  // QR pequeño
  if (qrCanvas && window.QRious && personalLink) {
    new QRious({
      element: qrCanvas,
      value: personalLink,
      size: 100,
    });
  }

  // Código en el footer
  if (footerRefIdEl && user.refid) {
    footerRefIdEl.textContent = "CÓDIGO: " + user.refid;
  }

  // Botón copiar link
  if (copyLinkBtn && personalLink) {
    copyLinkBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(personalLink);
        showToast("Enlace personal copiado");
      } catch {
        alert("No se pudo copiar el enlace.");
      }
    });
  }

  // Tocar el nombre = copiar link
  if (nameEl && personalLink) {
    nameEl.style.cursor = "pointer";
    nameEl.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(personalLink);
        showToast("Enlace personal copiado");
      } catch {
        alert("No se pudo copiar el enlace.");
      }
    });
  }

  // Tocar badge = copiar código
  if (refBadge && user.refid) {
    refBadge.style.cursor = "pointer";
    refBadge.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(user.refid);
        showToast("Código copiado");
      } catch {
        alert("Tu código: " + user.refid);
      }
    });
  }

  // Click E-Book
  if (ebookTile) {
    ebookTile.addEventListener("click", () => {
      alert(
        "Aquí abriremos tu E-Book 'Yo Decido Ser Abundante' (falta definir URL)."
      );
    });
  }

  // Popup QR grande
  if (personalLink) {
    setupQrModal(user, personalLink);
  }
}
 

  // ---------------------------
  // SETTINGS
  // ---------------------------
  function initSettings() {
    const token = getToken();
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    const profileForm = document.getElementById("profileForm");
    const passwordForm = document.getElementById("passwordForm");

    if (profileForm) {
      const emailInput = document.getElementById("profileEmail");
      const phoneInput = document.getElementById("profilePhone");
      const errorEl = document.getElementById("profileError");
      const okEl = document.getElementById("profileOk");

      const user = getStoredUser();
      if (user) {
        if (emailInput) emailInput.value = user.email || "";
        if (phoneInput) phoneInput.value = user.phone || "";
      }

      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = "";
          errorEl.style.display = "none";
        }
        if (okEl) {
          okEl.textContent = "";
          okEl.style.display = "none";
        }

        const email = emailInput ? emailInput.value.trim() : "";
        const phone = phoneInput ? phoneInput.value.trim() : "";

        if (!email && !phone) {
          showError(
            errorEl,
            "Debes ingresar al menos un campo para actualizar."
          );
          return;
        }

        try {
          const data = await apiPost("/account/update-profile", {
            email: email || undefined,
            phone: phone || undefined,
          });

          if (data.user) {
            setSession(token, data.user);
          }

          if (okEl) {
            okEl.textContent = "Perfil actualizado correctamente.";
            okEl.style.display = "block";
          }
        } catch (err) {
          console.error(err);
          showError(errorEl, err.message || "No se pudo actualizar el perfil.");
        }
      });
    }

    if (passwordForm) {
      const currentInput = document.getElementById("currentPassword");
      const newInput = document.getElementById("newPassword");
      const new2Input = document.getElementById("newPassword2");
      const errorEl = document.getElementById("passwordError");
      const okEl = document.getElementById("passwordOk");

      passwordForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (errorEl) {
          errorEl.textContent = "";
          errorEl.style.display = "none";
        }
        if (okEl) {
          okEl.textContent = "";
          okEl.style.display = "none";
        }

        const currentPassword = currentInput ? currentInput.value : "";
        const newPassword = newInput ? newInput.value : "";
        const newPassword2 = new2Input ? new2Input.value : "";

        if (!currentPassword || !newPassword || !newPassword2) {
          showError(
            errorEl,
            "Completa la contraseña actual y la nueva contraseña."
          );
          return;
        }
        if (newPassword !== newPassword2) {
          showError(errorEl, "Las nuevas contraseñas no coinciden.");
          return;
        }

        try {
          await apiPost("/account/change-password", {
            currentPassword,
            newPassword,
          });

          if (okEl) {
            okEl.textContent = "Contraseña actualizada correctamente.";
            okEl.style.display = "block";
          }
          if (currentInput) currentInput.value = "";
          if (newInput) newInput.value = "";
          if (new2Input) new2Input.value = "";
        } catch (err) {
          console.error(err);
          showError(
            errorEl,
            err.message || "No se pudo actualizar la contraseña."
          );
        }
      });
    }
  }

  // ---------------------------
  // Helpers visuales
  // ---------------------------
  function showError(el, msg) {
    if (!el) {
      alert(msg);
      return;
    }
    el.textContent = msg;
    el.style.display = "block";
  }

  function showToast(msg) {
    const toast = document.getElementById("maToast");
    if (!toast) return;

    toast.textContent = msg;
    toast.classList.add("visible");

    setTimeout(() => {
      toast.classList.remove("visible");
    }, 1800);
  }
 // === Acciones extra del dashboard: copiar link, copiar REF, popup de QR ===
document.addEventListener("DOMContentLoaded", function () {
  const nameEl = document.getElementById("dashName");
  const refBadgeEl = document.getElementById("dashRefBadge");
  const linkInput = document.getElementById("referralLink");
  const qrCanvas = document.getElementById("qrCanvas");
  const footerQrBtn = document.getElementById("footerQrBtn");

  // Leer usuario desde localStorage para obtener el refid
  let currentUser = null;
  try {
    const raw = localStorage.getItem("ma_user");
    if (raw) {
      currentUser = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error leyendo ma_user:", e);
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => alert("Copiado: " + text),
        () => alert("No se pudo copiar. Copia manualmente.")
      );
    } else {
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      try {
        document.execCommand("copy");
        alert("Copiado: " + text);
      } catch (e) {
        alert("No se pudo copiar. Copia manualmente.");
      }
      document.body.removeChild(temp);
    }
  }

  // ✅ Al tocar el NOMBRE: copia el LINK PERSONAL completo
  function handleNameClick() {
    if (!linkInput || !linkInput.value) return;
    copyText(linkInput.value);
  }

  // ✅ Al tocar el badge de referidos: copia SOLO el código REF
  function handleRefBadgeClick(e) {
    e.stopPropagation();
    if (currentUser && currentUser.refid) {
      copyText(currentUser.refid);
    } else if (linkInput && linkInput.value) {
      try {
        const url = new URL(linkInput.value);
        const ref = url.searchParams.get("ref");
        copyText(ref || linkInput.value);
      } catch (err) {
        copyText(linkInput.value);
      }
    }
  }

  if (nameEl) {
    nameEl.onclick = handleNameClick;
  }
  if (refBadgeEl) {
    refBadgeEl.onclick = handleRefBadgeClick;
  }

  // === Modal QR ===

  // Crear modal solo si no existe aún
  let modal = document.getElementById("qrModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "qrModal";
    modal.className = "ma-modal";
    modal.innerHTML = `
      <div class="ma-modal-overlay"></div>
      <div class="ma-modal-content">
        <h2>Tu código &amp; QR</h2>
        <canvas id="qrModalCanvas"></canvas>
        <p id="modalRefText" class="ma-modal-ref"></p>
        <input id="modalLink" type="text" readonly />
        <button type="button" id="closeModalBtn" class="ma-btn ma-btn-outline">
          Cerrar
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const modalCanvas = document.getElementById("qrModalCanvas");
  const modalRefText = document.getElementById("modalRefText");
  const modalLink = document.getElementById("modalLink");
  const overlay = modal.querySelector(".ma-modal-overlay");
  const closeModalBtn = document.getElementById("closeModalBtn");

  function openQrModal() {
    if (!linkInput || !linkInput.value || !modalCanvas) return;

    modal.classList.add("open");

    // Determinar el código de referencia
    let refCode = "";
    if (currentUser && currentUser.refid) {
      refCode = currentUser.refid;
    } else {
      try {
        const url = new URL(linkInput.value);
        refCode = url.searchParams.get("ref") || "";
      } catch {
        refCode = "";
      }
    }

    if (modalRefText) {
      modalRefText.textContent = refCode ? `Tu código: ${refCode}` : "";
    }

    if (modalLink) {
      modalLink.value = linkInput.value;
    }

    new QRious({
      element: modalCanvas,
      value: linkInput.value,
      size: 260,
      background: "white",
      foreground: "#3b3026",
    });
  }

  function closeQrModal() {
    modal.classList.remove("open");
  }

  // Click en QR pequeño
  if (qrCanvas) {
    qrCanvas.style.cursor = "pointer";
    qrCanvas.onclick = openQrModal;
  }

  // Click en botón de QR del footer (si existe)
  if (footerQrBtn) {
    footerQrBtn.onclick = openQrModal;
  }

  // Cerrar al tocar overlay o botón cerrar
  if (overlay) {
    overlay.addEventListener("click", closeQrModal);
  }
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeQrModal);
  }
});
  
})();
