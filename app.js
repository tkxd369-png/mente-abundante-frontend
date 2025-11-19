// ⚠️ IMPORTANTE: pon aquí tu URL real de la API en Render
const API_BASE = "https://mente-abundante-api.onrender.com";

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
  msg.textContent = "Conectando…";

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
      msg.textContent = data.error || "No se pudo iniciar sesión.";
      return;
    }

    setToken(data.token);
    msg.textContent = "Listo. Redirigiendo a tu espacio…";
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    msg.textContent = "Error de conexión. Intenta de nuevo.";
  }
}

// ------- CARGAR DASHBOARD -------
async function loadDashboard() {
  const token = getToken();
  if (!token) {
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

  msgEl.textContent = "Cargando tu información…";

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.ok) {
      msgEl.textContent = data.error || "No se pudo cargar tu perfil.";
      if (data.error && data.error.toLowerCase().includes("token")) {
        clearToken();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
      return;
    }

    const user = data.user;
    nameEl.textContent = user.full_name || "Miembro Mente Abundante";
    usernameEl.textContent = user.username || "—";
    emailEl.textContent = user.email || "—";
    phoneEl.textContent = user.phone || "—";
    referralsEl.textContent = user.referrals ?? 0;
    refBadge.textContent = `REF: ${user.refid || "—"}`;
    msgEl.textContent = "Tu nueva vida ya empezó. Recuerda: Tú decides ser abundante.";
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Error al conectar con el servidor.";
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
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  if (window.location.pathname.endsWith("dashboard.html")) {
    loadDashboard();
    setupLogout();
  }
});
