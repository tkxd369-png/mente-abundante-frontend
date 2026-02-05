/* media-protect.js  (v1)
   Protege /media/media.html (y cualquier página que lo incluya)
   Requiere:
   - login activo (según tu llave de login en localStorage)
   - pase temporal emitido desde dashboard (sessionStorage)
*/
(() => {
  // ===== EDITAR SOLO ESTO =====
  // 1) La misma llave que ya usas en ebook-protect.js para indicar "logueado"
  const LOGIN_KEY = "REEMPLAZA_CON_TU_LLAVE_DE_LOGIN";
  // 2) A dónde mandar al usuario si NO está logueado (normalmente tu start o dashboard)
  // Como media.html está dentro de /media/, para ir a la raíz usa ../
  const LOGIN_REDIRECT = "../dashboard.html";
  // ===========================
  // Pase temporal: evita entrar por URL directo
  const PASS_KEY = "ma_media_pass_until"; // sessionStorage
  const NOW = Date.now();
  function redirect(url) {
    window.location.replace(url);
  }
  function isLoggedIn() {
    // Convención simple: guardas "1" o "true" en localStorage cuando hay sesión
    const v = localStorage.getItem(LOGIN_KEY);
    return v === "1" || v === "true" || v === "yes";
  }
  function hasValidPass() {
    const until = Number(sessionStorage.getItem(PASS_KEY) || "0");
    return Number.isFinite(until) && until > NOW;
  }
  // 1) Requiere login
  if (!isLoggedIn()) {
    redirect(LOGIN_REDIRECT);
    return;
  }
  // 2) Requiere pase (emitido desde dashboard)
  // Nota: si quieres permitir acceso directo en desarrollo, comenta este bloque.
  if (!hasValidPass()) {
    redirect(LOGIN_REDIRECT);
    return;
  }
  // Limpieza opcional: si ya entró, no necesita el pase para siempre
  // (queda valido solo para esta navegación)
  // sessionStorage.removeItem(PASS_KEY);
})();
