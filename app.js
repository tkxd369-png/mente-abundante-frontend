 
 // ⚠️ IMPORTANTE: pon aquí tu URL real de la API en Render
const API_BASE = "https://mente-abundante-api.onrender.com";

// ----------------------------------------------------------
//  MANEJO DE TOKEN
// ----------------------------------------------------------

function getToken() {
  return localStorage.getItem("ma_token");
}

function setToken(token) {
  if (token) localStorage.setItem("ma_token", token);
}

function clearToken() {
  localStorage.removeItem("ma_token");
}

// ----------------------------------------------------------
//  LOGIN
// ----------------------------------------------------------

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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.ok) {
      if (msg) msg.textContent = data.error || "Credenciales incorrectas";
      return;
    }

    setToken(data.token);

    if (msg) msg.textContent = "Listo. Redirigiendo…";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);
  } catch (err) {
    console.error(err);
    if (msg) msg.textContent = "Error de conexión.";
  }
}

// ----------------------------------------------------------
//  DASHBOARD
// ----------------------------------------------------------

async function loadDashboard() {
  const token = getToken();
  if (!token) return (window.location.href = "login.html");

  const nameEl = document.getElementById("dashName");
  const usernameEl = document.getElementById("dashUsername");
  const emailEl = document.getElementById("dashEmail");
  const phoneEl = document.getElementById("dashPhone");
  const referralsEl = document.getElementById("dashReferrals");
  const refBadge = document.getElementById("dashRefBadge");
  const msgEl = document.getElementById("dashMessage");

  if (msgEl) msgEl.textContent = "Cargando…";

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      if (msgEl) msgEl.textContent = "Error cargando información";
      return;
    }

    const user = data.user;

    if (nameEl) nameEl.textContent = user.full_name;
    if (usernameEl) usernameEl.textContent = user.username;
    if (emailEl) emailEl.textContent = user.email;
    if (phoneEl) phoneEl.textContent = user.phone;
    if (referralsEl) referralsEl.textContent = user.referrals ?? 0;
    if (refBadge) refBadge.textContent = `REF: ${user.refid}`;

    msgEl.textContent = "Tu nueva vida ya empezó. Recuerda: Tú decides ser abundante.";

    // -----------------------------
    //   GENERAR LINK Y QR
    // -----------------------------
    const referralUrl = `${window.location.origin}/?ref=${user.refid}`;

    const referralInput = document.getElementById("referralLink");
    if (referralInput) {
      referralInput.value = referralUrl;
      referralInput.dataset.url = referralUrl;
    }

    if (refBadge) {
      refBadge.dataset.url = referralUrl;
    }

    // Generar QR
    const qrCanvas = document.getElementById("qrCanvas");
    if (qrCanvas && window.QRious) {
      new QRious({
        element: qrCanvas,
        value: referralUrl,
        size: 140,
      });
    }
  } catch (err) {
    console.error(err);
    if (msgEl) msgEl.textContent = "Error de conexión.";
  }
}

// ----------------------------------------------------------
//  SETTINGS – CARGAR DATOS
// ----------------------------------------------------------

async function loadSettings() {
  const token = getToken();
  if (!token) return (window.location.href = "login.html");

  const emailInput = document.getElementById("settingsEmail");
  const phoneInput = document.getElementById("settingsPhone");
  const profileMsg = document.getElementById("profileMessage");

  if (profileMsg) profileMsg.textContent = "Cargando…";

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.ok) {
      if (profileMsg) profileMsg.textContent = "Error cargando datos.";
      return;
    }

    const user = data.user;

    emailInput.value = user.email;
    phoneInput.value = user.phone;

    profileMsg.textContent = "";
  } catch (err) {
    console.error(err);
    profileMsg.textContent = "Error de conexión.";
  }
}

// ----------------------------------------------------------
//  SETTINGS – ACTUALIZAR EMAIL Y TELÉFONO
// ----------------------------------------------------------

async function handleProfileUpdate(event) {
  event.preventDefault();

  const token = getToken();
  if (!token) return (window.location.href = "login.html");

  const email = document.getElementById("settingsEmail").value.trim();
  const phone = document.getElementById("settingsPhone").value.trim();
  const msg = document.getElementById("profileMessage");

  msg.textContent = "Guardando…";

  try {
    const res = await fetch(`${API_BASE}/account/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, phone }),
    });

    const data = await res.json();

    if (!data.ok) {
      msg.textContent = data.error;
      return;
    }

    msg.textContent = "Datos actualizados correctamente. ✅";
  } catch (err) {
    console.error(err);
    msg.textContent = "Error de conexión.";
  }
}

// ----------------------------------------------------------
//  SETTINGS – CAMBIAR CONTRASEÑA
// ----------------------------------------------------------

async function handlePasswordChange(event) {
  event.preventDefault();

  const token = getToken();
  if (!token) return (window.location.href = "login.html");

  const current = event.target.currentPassword.value;
  const newPass = event.target.newPassword.value;
  const confirm = event.target.confirmPassword.value;
  const msg = document.getElementById("passwordMessage");

  if (newPass !== confirm) {
    msg.textContent = "La nueva contraseña no coincide.";
    return;
  }

  msg.textContent = "Actualizando…";

  try {
    const res = await fetch(`${API_BASE}/account/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: current,
        newPassword: newPass,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      msg.textContent = data.error;
      return;
    }

    msg.textContent = "Contraseña actualizada correctamente. ✅";

    event.target.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = "Error de conexión.";
  }
}

// ----------------------------------------------------------
//  COPIAR LINK
// ----------------------------------------------------------

function setupCopyLink() {
  const copyBtn = document.getElementById("copyLinkBtn");
  const input = document.getElementById("referralLink");
  const msg = document.getElementById("copyMessage");

  if (!copyBtn || !input) return;

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(input.value);
      if (msg) msg.textContent = "Enlace copiado ✨";
    } catch {
      msg.textContent = "No se pudo copiar.";
    }
  });
}

// ----------------------------------------------------------
//  COPIAR REF DESDE EL BADGE
// ----------------------------------------------------------

function setupRefBadgeCopy() {
  const badge = document.getElementById("dashRefBadge");
  const msg = document.getElementById("dashMessage");

  if (!badge) return;

  badge.addEventListener("click", () => {
    const url = badge.dataset.url;
    if (!url) return;

    navigator.clipboard.writeText(url);
    msg.textContent = "Enlace de invitación copiado desde REF. ✨";
  });
}

// ----------------------------------------------------------
//  TOGGLE VER CONTRASEÑA NUEVA
// ----------------------------------------------------------

 function setupPasswordToggle() {
  const checkbox = document.getElementById("showNewPassword");
  const current = document.getElementById("currentPassword");
  const newPass = document.getElementById("newPassword");
  const confirm = document.getElementById("confirmPassword");

  if (!checkbox) return;

  checkbox.addEventListener("change", () => {
    const type = checkbox.checked ? "text" : "password";
    if (current) current.type = type;
    if (newPass) newPass.type = type;
    if (confirm) confirm.type = type;
  });
}

// ----------------------------------------------------------
//  LOGOUT
// ----------------------------------------------------------

function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      clearToken();
      window.location.href = "login.html";
    });
  }
}

// ----------------------------------------------------------
//  INICIALIZAR POR PÁGINA
// ----------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLoginSubmit);

  // Dashboard
  if (window.location.pathname.includes("dashboard.html")) {
    loadDashboard();
    setupLogout();
    setupCopyLink();
    setupRefBadgeCopy();
  }

  // Settings
  if (window.location.pathname.includes("settings.html")) {
    loadSettings();
    setupLogout();
    setupPasswordToggle();

    const profileForm = document.getElementById("profileForm");
    if (profileForm) profileForm.addEventListener("submit", handleProfileUpdate);

    const passwordForm = document.getElementById("passwordForm");
    if (passwordForm) passwordForm.addEventListener("submit", handlePasswordChange);
  }
});
