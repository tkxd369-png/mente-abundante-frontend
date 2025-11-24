// app.js - Frontend Mente Abundante

const API_BASE = "https://mente-abundante-api-1.onrender.com";

// --------------------------
// Helpers de sesión
// --------------------------
function getToken() {
  return localStorage.getItem("ma_token");
}

function saveUser(user) {
  if (user) {
    localStorage.setItem("ma_user", JSON.stringify(user));
  }
}

function loadUser() {
  try {
    const raw = localStorage.getItem("ma_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem("ma_token");
  localStorage.removeItem("ma_user");
}

function logout() {
  clearSession();
  window.location.href = "index.html";
}

// --------------------------
// Llamadas a API
// --------------------------
async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (!res.ok) {
    // si el backend devuelve 401, 403, etc.
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data.ok || !data.user) {
    throw new Error(data.error || "No se pudo obtener el usuario.");
  }
  return data.user;
}

// --------------------------
// Dashboard
// --------------------------
async function initDashboard() {
  const token = getToken();

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  let user;
  try {
    user = await fetchMe(token);
    saveUser(user);
  } catch (err) {
    console.error("Error al cargar /me:", err);
    logout();
    return;
  }

  // Referencias a elementos del DOM
  const dashName = document.getElementById("dashName");
  const dashUsername = document.getElementById("dashUsername");
  const dashEmail = document.getElementById("dashEmail");
  const dashPhone = document.getElementById("dashPhone");
  const dashReferrals = document.getElementById("dashReferrals");
  const dashRefBadge = document.getElementById("dashRefBadge");
  const refLinkInput = document.getElementById("referralLink");
  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMessage = document.getElementById("copyMessage");
  const logoutBtn = document.getElementById("logoutBtn");
  const qrCanvas = document.getElementById("qrCanvas");

  // Link personal de invitación (se mantiene igual)
  const baseUrl = window.location.origin + "/index.html";
  const personalLink = `${baseUrl}?ref=${encodeURIComponent(user.refid || "")}`;

  // Rellenar datos del usuario
  if (dashName) dashName.textContent = user.full_name || "Miembro Mente Abundante";
  if (dashUsername) dashUsername.textContent = user.username || "—";
  if (dashEmail) dashEmail.textContent = user.email || "—";
  if (dashPhone) dashPhone.textContent = user.phone || "—";
  if (dashReferrals) dashReferrals.textContent = user.referrals ?? 0;

  if (dashRefBadge) {
    dashRefBadge.textContent = "REF: " + (user.refid || "—");
    dashRefBadge.title = "Toca para copiar tu enlace de invitación";
  }

  if (refLinkInput) {
    refLinkInput.value = personalLink;
  }

  // Función para copiar link (con fallback)
  function copyLink() {
    if (!refLinkInput) return;

    const linkValue = refLinkInput.value;

    // navegador moderno
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(linkValue)
        .then(() => showCopyMessage(true))
        .catch(() => fallbackCopy(linkValue));
    } else {
      // fallback directo
      fallbackCopy(linkValue);
    }
  }

  function fallbackCopy(text) {
    try {
      const temp = document.createElement("textarea");
      temp.value = text;
      temp.style.position = "fixed";
      temp.style.left = "-9999px";
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      showCopyMessage(true);
    } catch (err) {
      console.error("No se pudo copiar con fallback:", err);
      showCopyMessage(false);
    }
  }

  function showCopyMessage(success) {
    if (!copyMessage) return;
    copyMessage.textContent = success
      ? "Enlace copiado."
      : "No se pudo copiar el enlace.";
    setTimeout(() => {
      copyMessage.textContent = "";
    }, 1800);
  }

  if (copyBtn) copyBtn.addEventListener("click", copyLink);
  if (dashRefBadge) dashRefBadge.addEventListener("click", copyLink);

  // Generar QR
  if (qrCanvas && window.QRious) {
    new QRious({
      element: qrCanvas,
      value: personalLink,
      size: 120,
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// --------------------------
// Init según la página
// --------------------------
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const isDashboard = body.classList.contains("ma-dashboard");

  if (isDashboard) {
    initDashboard();
  }
});
