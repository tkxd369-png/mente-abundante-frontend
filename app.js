// app.js - Frontend Mente Abundante

const API_BASE = "https://mente-abundante-api-1.onrender.com";

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

function logout() {
  localStorage.removeItem("ma_token");
  localStorage.removeItem("ma_user");
  window.location.href = "index.html";
}

async function fetchMe(token) {
  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await res.json();
  if (!data.ok || !data.user) {
    throw new Error(data.error || "No se pudo obtener el usuario.");
  }
  return data.user;
}

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

  // Link personal de invitación
 const baseUrl = window.location.origin + "/index.html";
const personalLink = `${baseUrl}?ref=${encodeURIComponent(user.refid)}`;

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

  function copyLink() {
    if (!refLinkInput) return;
    refLinkInput.select();
    refLinkInput.setSelectionRange(0, 99999);

    navigator.clipboard
      .writeText(refLinkInput.value)
      .then(() => {
        if (copyMessage) {
          copyMessage.textContent = "Enlace copiado.";
          setTimeout(() => {
            copyMessage.textContent = "";
          }, 1800);
        }
      })
      .catch(() => {
        if (copyMessage) {
          copyMessage.textContent = "No se pudo copiar el enlace.";
        }
      });
  }

  if (copyBtn) copyBtn.addEventListener("click", copyLink);
  if (dashRefBadge) dashRefBadge.addEventListener("click", copyLink);

  if (qrCanvas && window.QRious) {
    new QRious({
      element: qrCanvas,
      value: personalLink,
      size: 120,
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const isDashboard = body.classList.contains("ma-dashboard");

  if (isDashboard) {
    initDashboard();
  }
});
 
