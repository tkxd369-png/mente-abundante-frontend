 // TMK WebBook — Light Protection (A)
// - disables selection + copy
// - blocks right-click
// - adds subtle watermark using localStorage user/refid when available

(function () {
  // ---- 1) Disable text selection (CSS class on body)
  document.documentElement.classList.add("ebook-no-select");

  // ---- 2) Block right-click (context menu)
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  // ---- 3) Block common copy shortcuts (soft block)
  document.addEventListener("keydown", function (e) {
    const key = (e.key || "").toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;

    // Copy / Cut / Select all / Print / Save
    if (ctrl && (key === "c" || key === "x" || key === "a" || key === "p" || key === "s")) {
      e.preventDefault();
    }
  });

  // ---- 4) Block copy event (soft block)
  document.addEventListener("copy", function (e) {
    e.preventDefault();
  });

  // ---- 5) Watermark (subtle, repeating)
  function getUserStamp() {
    try {
      const u = JSON.parse(localStorage.getItem("ma_user") || "{}");
      const name = (u.name || u.nombre || u.fullname || "").toString().trim();
      const refid = (u.refid || u.refId || "").toString().trim();
      const who = name ? name : "TMK Member";
      const code = refid ? ` · ${refid}` : "";
      return `${who}${code} · TMK`;
    } catch (e) {
      return "TMK Member · TMK";
    }
  }

  function addWatermark() {
    // Avoid duplicates
    if (document.getElementById("tmkWatermark")) return;

    const wm = document.createElement("div");
    wm.id = "tmkWatermark";
    wm.setAttribute("aria-hidden", "true");
    wm.className = "ebook-watermark";
    wm.textContent = getUserStamp();

    document.body.appendChild(wm);
  }

  // Add after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addWatermark);
  } else {
    addWatermark();
  }
})();
