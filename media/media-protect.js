 /* media-protect.js — TMK access gate (matches your system)
   Goal:
   - If NOT logged in -> redirect to start.html
   - If logged in -> allow access (do NOT clear/reset anything)
   Login marker used in your project: localStorage "ma_user"
*/
(function () {
  function hasUserSession() {
    try {
      const raw = localStorage.getItem("ma_user");
      if (!raw) return false;
      const u = JSON.parse(raw);
      // accept if it looks like a user object
      return !!(u && (u.email || u.mail || u.name || u.nombre || u.refid || u.refId));
    } catch (e) {
      return false;
    }
  }
  if (!hasUserSession()) {
    // NOTE: media/ is one folder deep, so go up one level to reach start.html
    window.location.replace("../start.html");
  }
})();
