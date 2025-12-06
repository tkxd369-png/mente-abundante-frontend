 // app.js – The Master Key (antes Mente Abundante 2.0)

(function () {
  const API_BASE = "https://mente-abundante-api-1.onrender.com";

  // ---------------------------
  // Idioma global ES / EN
  // ---------------------------
  function detectLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get("lang");
      if (fromUrl === "en" || fromUrl === "es") {
        localStorage.setItem("ma_lang", fromUrl);
        return fromUrl;
      }

      const fromStorage = localStorage.getItem("ma_lang");
      if (fromStorage === "en" || fromStorage === "es") {
        return fromStorage;
      }
    } catch (e) {
      // ignore
    }
    return "es";
  }

  const MA_LANG = detectLang();

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
  // Frases motivacionales "AI" (bilingüe suave)
  // ---------------------------
  const AI_PHRASES_ES = [
    "Tu decisión de hoy abre puertas que aún no imaginas.",
    "Cada ‘sí’ a la verdad es una semilla de abundancia futura.",
    "No estás empezando de cero, estás empezando desde tu experiencia.",
    "La abundancia no llega por accidente, se construye con decisiones diarias.",
    "Lo que compartes desde el corazón, regresa multiplicado.",
    "Cuando ayudas a otros a avanzar, tu camino también se abre.",
  ];

  const AI_PHRASES_EN = [
    "Your decision today opens doors you can’t yet imagine.",
    "Every ‘yes’ to truth is a seed of future abundance.",
    "You’re not starting from zero, you’re starting from experience.",
    "Abundance doesn’t arrive by accident; it’s built with daily decisions.",
    "What you share from the heart returns multiplied.",
    "When you help others move forward, your path opens too.",
  ];

  function pickDailyPhrase() {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem("ma_phrase_date");
    const storedText = localStorage.getItem("ma_phrase_text");

    if (storedDate === todayKey && storedText) {
      return storedText;
    }

    const pool = MA_LANG === "en" ? AI_PHRASES_EN : AI_PHRASES_ES;
    const idx = Math.floor(Math.random() * pool.length);
    const phrase = pool[idx];

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

    // Frase del día (luego la pisa el sistema de idioma si hace falta)
    const phraseEl = document.getElementById("aiPhraseText");
    if (phraseEl && typeof pickDailyPhrase === "function") {
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

    // Idioma actual
    const currentLang =
      typeof MA_LANG !== "undefined" && MA_LANG ? MA_LANG : "es";

    // Nombre (solo el primer nombre)
    if (nameEl) {
      const fullName = user.full_name || "";
      const defaultName = currentLang === "en" ? "Welcome" : "Bienvenido";
      const firstName =
        fullName.trim().split(" ")[0] || fullName || defaultName;
      nameEl.textContent = firstName;
    }

    // REFERIDOS + ESTIMADO (desde backend)
    const referrals = Number(user.referrals) || 0;
    const rewardPerReferral = 177; // neto después de fee
    const estimated = referrals * rewardPerReferral;

    if (refTextEl) {
      if (currentLang === "en") {
        refTextEl.textContent =
          referrals === 1
            ? "1 REFERRAL"
            : `${referrals} REFERRALS`;
      } else {
        refTextEl.textContent =
          referrals === 1
            ? "1 REFERIDO"
            : `${referrals} REFERIDOS`;
      }
    }

    if (estTextEl) {
      const label = currentLang === "en" ? "ESTIMATED" : "ESTIMADO";
      estTextEl.textContent = `$${estimated.toLocaleString()} USD ${label}`;
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

    // === QR pequeño en tarjeta "TU QR" ===
    const qrSmallCanvas = document.getElementById("dashQrSmall");
    if (qrSmallCanvas && typeof QRious !== "undefined" && personalLink) {
      try {
        new QRious({
          element: qrSmallCanvas,
          value: personalLink,
          size: 80,
        });
      } catch (e) {
        console.warn("No se pudo generar el QR pequeño:", e);
      }
    }

    // === MODAL QR GRANDE (diseño nuevo) ===
    const qrQuickButton = document.querySelector(".ma-quick-card-qr");
    const qrModal = document.getElementById("qrModal");
    const qrModalClose = document.getElementById("qrModalClose");
    const qrBigCanvas = document.getElementById("dashQrBig");
    const qrModalCode = document.getElementById("qrModalCode");

    if (
      qrQuickButton &&
      qrModal &&
      qrBigCanvas &&
      typeof QRious !== "undefined" &&
      personalLink
    ) {
      try {
        new QRious({
          element: qrBigCanvas,
          value: personalLink,
          size: 220,
        });
      } catch (e) {
        console.warn("No se pudo generar el QR grande:", e);
      }

      if (qrModalCode) {
        qrModalCode.textContent = user.refid || "";
      }

      const openQrModal = () => {
        qrModal.classList.add("is-open");
      };

      const closeQrModal = () => {
        qrModal.classList.remove("is-open");
      };

      qrQuickButton.addEventListener("click", openQrModal);
      if (qrModalClose) qrModalClose.addEventListener("click", closeQrModal);
      qrModal.addEventListener("click", (e) => {
        if (
          e.target === qrModal ||
          e.target.classList.contains("ma-modal-backdrop")
        ) {
          closeQrModal();
        }
      });
    }

    // Código en el footer
    if (footerRefIdEl && user.refid) {
      footerRefIdEl.textContent =
        (currentLang === "en" ? "CODE: " : "CÓDIGO: ") + user.refid;
    }

    // Botón copiar link (si existe)
    if (copyLinkBtn && personalLink) {
      copyLinkBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(personalLink);
          showToast(
            currentLang === "en"
              ? "Personal link copied"
              : "Enlace personal copiado"
          );
        } catch {
          alert(
            currentLang === "en"
              ? "Could not copy the link."
              : "No se pudo copiar el enlace."
          );
        }
      });
    }

    // Tocar el nombre = copiar link
    if (nameEl && personalLink) {
      nameEl.style.cursor = "pointer";
      nameEl.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(personalLink);
          showToast(
            currentLang === "en"
              ? "Personal link copied"
              : "Enlace personal copiado"
          );
        } catch {
          alert(
            currentLang === "en"
              ? "Could not copy the link."
              : "No se pudo copiar el enlace."
          );
        }
      });
    }

    // Botón de referidos: solo abrir la página de Referral Program
    if (refBadge) {
      refBadge.addEventListener("click", function () {
        const lang =
          window.maGetLang ? window.maGetLang() : currentLang;

        // Construimos los textos de la badge igual que en el dashboard
        const refText =
          lang === "en"
            ? referrals === 1
              ? "1 REFERRAL"
              : `${referrals} REFERRALS`
            : referrals === 1
            ? "1 REFERIDO"
            : `${referrals} REFERIDOS`;

        const amountText = `$${estimated.toLocaleString()} USD ${
          lang === "en" ? "ESTIMATED" : "ESTIMADO"
        }`;

        const payload = {
          lang,
          refText,
          estText: amountText,
          referrals,
          estimated,
        };

        try {
          localStorage.setItem("ma_ref_summary", JSON.stringify(payload));
        } catch (e) {
          console.warn("No se pudo guardar ma_ref_summary:", e);
        }

        window.location.href = "referrals.html";
      });
    }

    // Click E-Book (placeholder)
    const ebookTile = document.getElementById("ebookTile");
    if (ebookTile) {
      ebookTile.addEventListener("click", () => {
        alert(
          "Aquí abriremos tu E-Book 'Yo Decido Ser Abundante' (falta definir URL)."
        );
      });
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

    // ============================
    // TEMA VISUAL: CLÁSICO / BLACK EDITION
    // ============================
    (function () {
      const THEME_KEY = "ma_theme";
      const body = document.body;
      const styleBtn = document.getElementById("styleToggleBtn");

      function applyTheme(theme) {
        if (theme === "dark") {
          body.classList.add("ma-theme-dark");
          if (styleBtn) {
            styleBtn.textContent = "ESTILO: BLACK EDITION";
          }
        } else {
          body.classList.remove("ma-theme-dark");
          if (styleBtn) {
            styleBtn.textContent = "ESTILO: CLÁSICO";
          }
          theme = "classic";
        }

        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch (e) {}
      }

      // Leer tema guardado
      let savedTheme = "classic";
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === "dark" || stored === "classic") {
          savedTheme = stored;
        }
      } catch (e) {}

      applyTheme(savedTheme);

      // Click en el botón del footer para alternar
      if (styleBtn) {
        styleBtn.addEventListener("click", () => {
          const current =
            body.classList.contains("ma-theme-dark") ? "dark" : "classic";
          const next = current === "dark" ? "classic" : "dark";
          applyTheme(next);
        });
      }
    })();

  }
})();
