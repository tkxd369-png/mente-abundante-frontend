(function () {
  const API_BASE = "https://mente-abundante-api-1.onrender.com";

  function getAdminToken() {
    return localStorage.getItem("ma_admin_token") || "";
  }

  function setAdminSession(token, admin) {
    localStorage.setItem("ma_admin_token", token);
    localStorage.setItem("ma_admin_user", JSON.stringify(admin));
  }

  function clearAdminSession() {
    localStorage.removeItem("ma_admin_token");
    localStorage.removeItem("ma_admin_user");
  }

  function getAdminUser() {
    const raw = localStorage.getItem("ma_admin_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function apiGet(path) {
    const token = getAdminToken();
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }

    return res.json();
  }

  async function apiPost(path, body) {
    const token = getAdminToken();
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error("UNAUTHORIZED");
    }

    return res.json();
  }

  // --- Página: admin-login.html ---
  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    const emailInput = document.getElementById("adminEmail");
    const passInput = document.getElementById("adminPassword");
    const errorEl = document.getElementById("adminLoginError");

    adminLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      errorEl.style.display = "none";
      errorEl.textContent = "";

      const email = emailInput.value.trim();
      const password = passInput.value;

      if (!email || !password) {
        errorEl.textContent = "Ingresa tu correo y contraseña.";
        errorEl.style.display = "block";
        return;
      }

      try {
        const res = await fetch(API_BASE + "/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!data.ok) {
          errorEl.textContent = data.error || "No se pudo iniciar sesión.";
          errorEl.style.display = "block";
          return;
        }

        setAdminSession(data.token, data.admin);

        window.location.href = "admin-monitor.html";
      } catch (err) {
        console.error(err);
        errorEl.textContent = "Error de conexión. Inténtalo de nuevo.";
        errorEl.style.display = "block";
      }
    });

    // Si ya hay sesión admin, ir directo al panel
    if (getAdminToken() && getAdminUser()) {
      window.location.href = "admin-monitor.html";
    }
  }

  // --- Página: admin-monitor.html ---
  const adminMonitorRoot = document.querySelector(".ma-admin-monitor");
  if (adminMonitorRoot) {
    const adminUser = getAdminUser();
    const token = getAdminToken();

    if (!adminUser || !token) {
      clearAdminSession();
      window.location.href = "admin-login.html";
      return;
    }

    const adminNameLabel = document.getElementById("adminNameLabel");
    const logoutBtn = document.getElementById("adminLogoutBtn");

    if (adminNameLabel) {
      adminNameLabel.textContent = adminUser.full_name || adminUser.email || "Admin";
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearAdminSession();
        window.location.href = "admin-login.html";
      });
    }

    const statTotalUsers = document.getElementById("statTotalUsers");
    const statTotalReferrals = document.getElementById("statTotalReferrals");
    const statUsersLast7 = document.getElementById("statUsersLast7");
    const topReferrersBody = document.getElementById("topReferrersBody");

    const searchInput = document.getElementById("adminUserSearch");
    const searchBtn = document.getElementById("adminSearchBtn");
    const usersBody = document.getElementById("adminUsersBody");
    const prevPageBtn = document.getElementById("adminPrevPage");
    const nextPageBtn = document.getElementById("adminNextPage");
    const pageInfo = document.getElementById("adminPageInfo");

    let currentPage = 1;
    let lastTotalPages = 1;
    let currentSearch = "";

    function formatDate(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    async function loadStats() {
      try {
        const data = await apiGet("/admin/stats");

        if (!data.ok) return;

        const stats = data.stats || {};
        if (statTotalUsers) statTotalUsers.textContent = stats.total_users ?? "0";
        if (statTotalReferrals)
          statTotalReferrals.textContent = stats.total_referrals ?? "0";
        if (statUsersLast7)
          statUsersLast7.textContent = stats.users_last_7_days ?? "0";

        if (topReferrersBody) {
          const list = data.topReferrers || [];
          if (list.length === 0) {
            topReferrersBody.innerHTML =
              '<tr><td colspan="4">Sin datos de patrocinadores aún.</td></tr>';
          } else {
            topReferrersBody.innerHTML = list
              .map(
                (u) => `
              <tr>
                <td>${u.full_name || ""}</td>
                <td>${u.email || ""}</td>
                <td>${u.refid || ""}</td>
                <td>${u.referrals || 0}</td>
              </tr>
            `
              )
              .join("");
          }
        }
      } catch (err) {
        console.error("Error loading stats:", err);
        if (err.message === "UNAUTHORIZED") {
          clearAdminSession();
          window.location.href = "admin-login.html";
        }
      }
    }

    async function loadUsers(page, search) {
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        if (search) params.set("search", search);

        const data = await apiGet("/admin/users?" + params.toString());

        if (!data.ok) return;

        currentPage = data.page;
        lastTotalPages = data.totalPages || 1;

        if (usersBody) {
          const list = data.users || [];
          if (list.length === 0) {
            usersBody.innerHTML =
              '<tr><td colspan="8">No se encontraron usuarios.</td></tr>';
          } else {
            usersBody.innerHTML = list
              .map(
                (u) => `
              <tr>
                <td>${u.full_name || ""}</td>
                <td>${u.email || ""}</td>
                <td>${u.phone || ""}</td>
                <td>${u.refid || ""}</td>
                <td>${u.referredby || ""}</td>
                <td>${u.referrals || 0}</td>
                <td>${u.is_admin ? "Sí" : "No"}</td>
                <td>${formatDate(u.created_at)}</td>
              </tr>
            `
              )
              .join("");
          }
        }

        if (pageInfo) {
          pageInfo.textContent = `Página ${currentPage} de ${lastTotalPages}`;
        }
        if (prevPageBtn) {
          prevPageBtn.disabled = currentPage <= 1;
        }
        if (nextPageBtn) {
          nextPageBtn.disabled = currentPage >= lastTotalPages;
        }
      } catch (err) {
        console.error("Error loading users:", err);
        if (err.message === "UNAUTHORIZED") {
          clearAdminSession();
          window.location.href = "admin-login.html";
        }
      }
    }

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", function () {
        currentSearch = searchInput.value.trim();
        loadUsers(1, currentSearch);
      });

      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          currentSearch = searchInput.value.trim();
          loadUsers(1, currentSearch);
        }
      });
    }

    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", function () {
        if (currentPage > 1) {
          loadUsers(currentPage - 1, currentSearch);
        }
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", function () {
        if (currentPage < lastTotalPages) {
          loadUsers(currentPage + 1, currentSearch);
        }
      });
    }

    loadStats();
    loadUsers(1, "");
  }
})();
