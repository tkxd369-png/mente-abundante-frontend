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

    if (refId) {
      // Construimos el enlace con el dominio actual del frontend
      const referralUrl = `${window.location.origin}/?ref=${encodeURIComponent(refId)}`;

      // Input de enlace
      if (referralInput) {
        referralInput.value = referralUrl;
        referralInput.dataset.url = referralUrl;
      }

      // Badge de REF también conoce el enlace
      if (refBadge) {
        refBadge.textContent = `REF: ${refId}`;
        refBadge.dataset.url = referralUrl;
      }

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

// ------- CARGAR SETTINGS (datos actuales) -------
async function loadSettings() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const emailInput = document.getElementById("settingsEmail");
  const phoneInput = document.getElementById("settingsPhone");
  const profileMsg = document.getElementById("profileMessage");

  if (profileMsg) {
    profileMsg.textContent = "Cargando tus datos…";
  }

  try {
    const res = await fetch(`${API_BASE}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.ok) {
      if (profileMsg) {
        profileMsg.textContent = data.error || "No se pudieron cargar tus datos.";
      }
      if (data.error && data.error.toLowerCase().includes("token")) {
        clearToken();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }
      return;
    }

    const user = data.user;
    if (emailInput) emailInput.value = user.email || "";
    if (phoneInput) phoneInput.value = user.phone || "";
    if (profileMsg) {
      profileMsg.textContent = "";
    }
  } catch (err) {
    console.error(err);
    if (profileMsg) {
      profileMsg.textContent = "Error al conectar con el servidor.";
    }
  }
}

 // ✅ Actualizar perfil (email y/o teléfono)
app.post('/account/update-profile', authMiddleware, async (req, res) => {
  try {
    const { email, phone } = req.body;
    const userId = req.user.id;

    if (!email && !phone) {
      return res
        .status(400)
        .json({ ok: false, error: 'Debes enviar al menos email o teléfono.' });
    }

    // Construimos dinámicamente los campos a actualizar
    const fields = [];
    const values = [];
    let index = 1;

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }
    if (phone) {
      fields.push(`phone = $${index++}`);
      values.push(phone);
    }

    values.push(userId);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING id, full_name, email, phone, username, refId, referredBy, referrals, created_at;
    `;

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado.' });
    }

    const updatedUser = result.rows[0];

    return res.json({
      ok: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    if (err.code === '23505') {
      return res
        .status(400)
        .json({ ok: false, error: 'El email ya está en uso por otra cuenta.' });
    }
    return res
      .status(500)
      .json({ ok: false, error: 'Error interno al actualizar el perfil.' });
  }
});

// ------- CAMBIAR CONTRASEÑA -------
async function handlePasswordChange(event) {
  event.preventDefault();
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const form = event.target;
  const current = form.currentPassword.value;
  const newPass = form.newPassword.value;
  const confirm = form.confirmPassword.value;
  const passwordMsg = document.getElementById("passwordMessage");

  if (newPass !== confirm) {
    if (passwordMsg) {
      passwordMsg.textContent = "La nueva contraseña y la confirmación no coinciden.";
    }
    return;
  }

  if (!current || !newPass) {
    if (passwordMsg) {
      passwordMsg.textContent = "Por favor completa todos los campos.";
    }
    return;
  }

  if (passwordMsg) {
    passwordMsg.textContent = "Actualizando contraseña…";
  }

  try {
    const res = await fetch(`${API_BASE}/account/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    });

    const data = await res.json();

    if (!data.ok) {
      if (passwordMsg) {
        passwordMsg.textContent = data.error || "No se pudo actualizar la contraseña.";
      }
      return;
    }

    if (passwordMsg) {
      passwordMsg.textContent = data.message || "Contraseña actualizada correctamente. ✅";
    }

    form.currentPassword.value = "";
    form.newPassword.value = "";
    form.confirmPassword.value = "";
  } catch (err) {
    console.error(err);
    if (passwordMsg) {
      passwordMsg.textContent = "Error al conectar con el servidor.";
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
  // Login
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLoginSubmit);
  }

  // Dashboard
  if (window.location.pathname.endsWith("dashboard.html")) {
    loadDashboard();
    setupLogout();
  }

  // Settings
  if (window.location.pathname.endsWith("settings.html")) {
    loadSettings();

    const profileForm = document.getElementById("profileForm");
    if (profileForm) {
      profileForm.addEventListener("submit", handleProfileUpdate);
    }

    const passwordForm = document.getElementById("passwordForm");
    if (passwordForm) {
      passwordForm.addEventListener("submit", handlePasswordChange);
    }
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

  // Clic en REF (arriba) para copiar también el enlace
  const refBadge = document.getElementById("dashRefBadge");
  if (refBadge) {
    refBadge.addEventListener("click", async () => {
      const urlFromBadge = refBadge.dataset.url;
      const linkInput = document.getElementById("referralLink");
      const fallbackUrl = linkInput && linkInput.value;
      const text = urlFromBadge || fallbackUrl;
      const msg =
        document.getElementById("copyMessage") || document.getElementById("dashMessage");

      if (!text) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          if (linkInput) {
            linkInput.focus();
            linkInput.select();
            document.execCommand("copy");
          }
        }
        if (msg) {
          msg.textContent = "Enlace de invitación copiado desde tu código REF. ✨";
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
