 /* media-protect.js — simple login check (same as ebook) */

(function () {

  // ⚠️ CAMBIA ESTA KEY por la MISMA que usa ebook-protect.js
  const LOGIN_KEY = "MA_LOGGED_IN_KEY_AQUI";

  const isLoggedIn = localStorage.getItem(LOGIN_KEY) === "1";

  // Si NO está logueado → start.html
  if (!isLoggedIn) {
    window.location.replace("../start.html");
  }

  // Si SÍ está logueado → no hace nada (entra normal)
})();
