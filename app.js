// ⚠️ IMPORTANTE: pon aquí tu URL real de la API en Render
const API_BASE = "https://mente-abundante-api.onrender.com";
 
// ------- Helpers de token -------
function getToken() {
  return localStorage.getItem("ma_token");
}

function setToken(token) {
  if (token) {
    localStorage.setItem("ma_token", token);
  }
}

function clearToken() {
  localStorage.removeItem("ma_token");
}

// ------- LOGIN -------
async function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const msg = document.getElementById("loginMessage");
  if (msg) msg.textContent = "Conectando…";

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.ok) {
      if (msg) {
        msg.textContent = data.error || "No se pudo iniciar sesión.";
      }
      return;
    }

    setToken(data.token);
    if (msg) {
      msg.textContent = "Listo. Redirigiendo a tu espacio…";
    }
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    if (msg) {
      msg.textContent = "Error de conexión. Intenta de nuevo.";
    }
  }
}

// ------- CARGAR DASHBOARD -------
async function loadDashboard() {
  const token = getToken();
  if (!token) {
    // Si no hay token, lo mandamos al login
    window.location.href = "login.html";
    return;
  }

  const nameEl = document.getElementById("dashName");
  const usernameEl = document.getElementById("dashUsername");
  const emailEl = document.getElementById("dashEmail");
  const phoneEl = document.getElementById("dashPhone");
  const refBadge = document.getElementById("dashRefBadge");
  const referralsEl = document.getElementById("dashReferrals");
  const msgEl = document.getElementById("dashMessage");

  if (msgEl) {
    msgEl.textContent = "Cargando tu información…";
  }

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.ok) {
      if (msgEl) {
        msgEl.textContent = data.error || "No se pudo cargar tu perfil.";
      }
      // Si el problema es de token, limpiamos y redirigimos
      if (data.error && data.error.toLowerCase().includes("token")) {
        clearToken();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
      return;
    }

    const user = data.user;

    if (nameEl) nameEl.textContent = user.full_name || "Miembro Mente Abundante";
    if (usernameEl) usernameEl.textContent = user.username || "—";
    if (emailEl) emailEl.textContent = user.email || "—";
    if (phoneEl) phoneEl.textContent = user.phone || "—";
    if (referralsEl) referralsEl.textContent = user.referrals ?? 0;
    if (refBadge) refBadge.textContent = `REF: ${user.refid || "—"}`;
    if (msgEl) {
      msgEl.textContent = "Tu nueva vida ya empezó. Recuerda: Tú decides ser abundante.";
    }

    // ---- Enlace personal de invitación + QR ----
    const referralInput = document.getElementById("referralLink");
    const copyMsg = document.getElementById("copyMessage");
    const qrCanvas = document.getElementById("qrCanvas");

    const refId = user.refid || "";

    if (refId && referralInput) {
      // Construimos el enlace con el dominio actual del frontend
      const referralUrl = `${window.location.origin}/?ref=${encodeURIComponent(refId)}`;

      referralInput.value = referralUrl;
      referralInput.dataset.url = referralUrl;

      // Guardamos también en localStorage por si se usa en otra parte
      localStorage.setItem("ma_ref_code", refId);

      // Generar QR si la librería está disponible
      if (qrCanvas && window.QRious) {
        new QRious({
          element: qrCanvas,
          value: referralUrl,
          size: 140,
        });
      } else if (!window.QRious) {
        console.warn("QRious no está disponible. Revisa que el script de qrious esté cargado en dashboard.html");
        if (copyMsg) {
          copyMsg.textContent = "No se pudo generar el QR (falta librería).";
        }
      }
    }
  } catch (err) {
    console.error(err);
    if (msgEl) {
      msgEl.textContent = "Error al conectar con el servidor.";
    }
  }
}

// ------- LOGOUT -------
function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    clearToken();
    window.location.href = "login.html";
  });
}

// ------- INIT POR PÁGINA -------
document.addEventListener("DOMContentLoaded", () => {
  // Si estamos en la página de login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Si estamos en el dashboard
  if (window.location.pathname.endsWith("dashboard.html")) {
    loadDashboard();
    setupLogout();
  }

  // Botón "Copiar enlace" en el dashboard
  const copyBtn = document.getElementById("copyLinkBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const input = document.getElementById("referralLink");
      const msg = document.getElementById("copyMessage");
      if (!input || !input.value) return;

      const text = input.value;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback para navegadores más viejos
          input.focus();
          input.select();
          document.execCommand("copy");
        }
        if (msg) {
          msg.textContent = "Enlace copiado. ¡Compártelo por mensaje, WhatsApp o redes! ✨";
        }
      } catch (err) {
        console.error(err);
        if (msg) {
          msg.textContent = "No se pudo copiar automáticamente, pero puedes seleccionar y copiar el link.";
        }
      }
    });
  }
});
