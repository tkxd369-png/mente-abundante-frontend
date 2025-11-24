 // app.js – Mente Abundante
// Versión 2.0 con dashboard estilo Noé + flujo completo

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

  async function apiGet(path) {
    const token = getToken();
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      const data = await safeJson(res);
      const error = data && data.error ? data.error : "Error de servidor";
      throw new Error(error || "ERROR");
    }

    return res.json();
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

  async function safeJson(res) {
    try {
      return await res.json();
    } catch {
      return {};
    }
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
    "Cuando ayudas a otros a avanzar, tu camino también se abre."
  ];

  function pickDailyPhrase() {
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const stored = localStorage.getItem("ma_phrase_date");
    const storedText = localStorage.getItem("ma_phrase_text");

    if (stored === todayKey && storedText) {
      return storedText;
    }

    const idx = Math.floor(Math.random() * AI_PHRASES.length);
    const phrase = AI_PHRASES[idx];
    localStorage.setItem("ma_phrase_date", todayKey);
    localStorage.setItem("ma_phrase_text", phrase);
    return phrase;
  }

  // ---------------------------
  // Inicializar por página
  // ---------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // INDEX (landing)
    if (document.body.classList.contains("ma-landing")) {
      initLanding();
    }

    // Membresía / pago simulado
    if (document.getElementById("membershipForm")) {
      initMembership();
    }

    // Puente video
    if (document.getElementById("goToMainVideoBtn")) {
      initPuenteVideo();
    }

    // Video + Quiz
    if (document.getElementById("videoQuizForm")) {
      initVideoQuiz();
    }

    // SIGNUP
    if (document.getElementById("signupForm")) {
      initSignup();
    }

    // LOGIN
    if (document.getElementById("loginForm")) {
      initLogin();
    }

    // DASHBOARD
    if (
      document.body.classList.contains("ma-dashboard") ||
      document.getElementById("dashboardHeader")
    ) {
      initDashboard();
    }

    // SETTINGS
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

    // Capturar ?ref= y guardar en localStorage
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

    // Prefill refCode
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

      // Guardar en localStorage para el signup
      localStorage.setItem("ma_pre_fullName", fullName);
      localStorage.setItem("ma_pre_email", email);
      localStorage.setItem("ma_pre_phone", phone);
      localStorage.setItem("ma_pre_country", country);
      if (refCode) {
        localStorage.setItem("ma_ref_code", refCode.toUpperCase());
      }

      // Simulación de pago: redirigir al puente-video
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

      // Por ahora no validamos respuestas reales, solo simulamos aprobación
      const passed = true;

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

    // Prefill desde localStorage
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

        if (!data.ok) {
          throw new Error(data.error || "No se pudo crear la cuenta.");
        }

        setSession(data.token, data.user);

        // Limpiar pre-datos
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

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        clearSession();
        window.location.href = "index.html";
      });
    }

    // Frase AI
    const phraseEl = document.getElementById("aiPhraseText");
    if (phraseEl) {
      phraseEl.textContent = pickDailyPhrase();
    }

    // Usuario desde localStorage
    let user = getStoredUser();

    // Refrescar desde /me
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

    // ----- ELEMENTOS DEL DASHBOARD -----
    const nameEl = document.getElementById("dashName");
    const referralsEl = document.getElementById("dashReferrals");
    const refBadge = document.getElementById("dashRefBadge");
    const refInput = document.getElementById("referralLink");
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    const footerRefIdEl = document.getElementById("footerRefId");
    const qrCanvas = document.getElementById("qrCanvas");
    const ebookTile = document.getElementById("ebookTile");

    // Nombre (primer nombre)
    if (nameEl) {
      const fullName = user.full_name || "";
      const firstName = fullName.split(" ")[0] || fullName || "Bienvenido";
      nameEl.textContent = firstName;
    }

    // Número de referidos
    if (referralsEl) {
      referralsEl.textContent = user.referrals || 0;
    }

    // Construir LINK personal desde refid
    let personalLink = "";
    if (user.refid) {
      const baseUrl = window.location.origin + "/index.html";
      personalLink = `${baseUrl}?ref=${encodeURIComponent(user.refid)}`;
    }

    // Input con link
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

    // Código en el footer (si tienes ese span)
    if (footerRefIdEl && user.refid) {
      footerRefIdEl.textContent = "CÓDIGO: " + user.refid;
    }

    // ----- COMPORTAMIENTOS DE COPIADO -----

    // 1) Botón "Copiar" -> copia LINK completo
    if (copyLinkBtn && personalLink) {
      copyLinkBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(personalLink);
          showToast("Enlace personal copiado");
        } catch (e) {
          alert("No se pudo copiar el enlace.");
        }
      });
    }

    // 2) Nombre -> copia LINK completo
    if (nameEl && personalLink) {
      nameEl.style.cursor = "pointer";
      nameEl.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(personalLink);
          showToast("Enlace personal copiado");
        } catch (e) {
          alert("No se pudo copiar el enlace.");
        }
      });
    }

    // 3) Píldora "X REFERIDOS" -> copia SOLO el código refid
    if (refBadge && user.refid) {
      refBadge.style.cursor = "pointer";
      refBadge.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(user.refid);
          showToast("Código copiado");
        } catch (e) {
          alert("Tu código de referencia: " + user.refid);
        }
      });
    }

    // Tile del E-Book (placeholder)
    if (ebookTile) {
      ebookTile.addEventListener("click", () => {
        alert(
          "Aquí abriremos tu E-Book 'Yo Decido Ser Abundante' (falta definir URL)."
        );
      });
    }

    // Popup de QR grande
    if (personalLink) {
      setupQrModal(user, personalLink);
    }
  }

function setupQrModal(user, personalLink) {
  const qrCanvasSmall = document.getElementById("qrCanvas");
  const qrModal = document.getElementById("qrModal");
  const qrBackdrop = document.getElementById("qrModalBackdrop");
  const qrClose = document.getElementById("qrModalClose");
  const qrModalCanvas = document.getElementById("qrModalCanvas");
  const qrModalRefText = document.getElementById("qrModalRefText");

  if (!qrCanvasSmall || !qrModal || !qrModalCanvas) return;

  let modalQr = null;

  function openQrModal() {
    qrModal.classList.add("is-visible");
    if (qrModalRefText && user.refid) {
      qrModalRefText.textContent = `CÓDIGO: ${user.refid}`;
    }
    if (!modalQr) {
      modalQr = new QRious({
        element: qrModalCanvas,
        value: personalLink,
        size: 220,
      });
    } else {
      modalQr.set({ value: personalLink });
    }
  }

  function closeQrModal() {
    qrModal.classList.remove("is-visible");
  }

  // Al tocar el QR pequeño -> abre popup
  qrCanvasSmall.style.cursor = "pointer";
  qrCanvasSmall.addEventListener("click", openQrModal);

  // Cerrar tocando fondo o botón
  if (qrBackdrop) qrBackdrop.addEventListener("click", closeQrModal);
  if (qrClose) qrClose.addEventListener("click", closeQrModal);
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

    // Actualizar perfil (email / phone)
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

    // Cambiar contraseña
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
  // Helper para mostrar errores
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
 // ---------------------------
// HEADER STICKY – se esconde al bajar y aparece al subir
// ---------------------------
(function () {
  const header = document.getElementById("dashboardHeader");
  if (!header) return;

  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > lastScroll && current > 40) {
      // Bajando → esconder
      header.classList.add("ma-header-hidden");
    } else {
      // Subiendo → mostrar
      header.classList.remove("ma-header-hidden");
    }

    lastScroll = current;
  });
})();
 
