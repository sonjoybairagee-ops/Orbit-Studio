/* ============================================================
   ORBIT RAIL NAV — keep the active tab in view

   The rail tabs scroll on short panels (css/orbit-railnav.css). When a
   tab is activated by anything other than a click on it — the saved tab
   restored at start-up, Quick Find, a shortcut — it could sit below the
   fold, so this scrolls the rail just enough to show it. It only moves
   the rail's own scroller, never the page.
   ============================================================ */
(function () {
  "use strict";

  function reveal() {
    var nav = document.getElementById("railNav");
    if (!nav) return;
    var tab = nav.querySelector(".app-tab.active");
    if (!tab) return;
    var top = tab.offsetTop - nav.offsetTop;
    var bottom = top + tab.offsetHeight;
    if (top < nav.scrollTop) nav.scrollTop = Math.max(0, top - 6);
    else if (bottom > nav.scrollTop + nav.clientHeight - 14) nav.scrollTop = bottom - nav.clientHeight + 20;
  }

  function init() {
    var nav = document.getElementById("railNav");
    if (!nav) return;
    // The active class is set by main.js; watch for it rather than for clicks,
    // so every way of switching tabs is covered.
    if (window.MutationObserver) {
      new MutationObserver(function () { window.requestAnimationFrame(reveal); })
        .observe(nav, { attributes: true, attributeFilter: ["class"], subtree: true });
    }
    window.addEventListener("resize", reveal);
    setTimeout(reveal, 600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
