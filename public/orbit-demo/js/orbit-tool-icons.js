/* ============================================================
 * ORBIT TOOL ICONS — user-controllable fill & stroke
 *
 * The Tools-tab buttons use data-orbit-icon="xyz". Each one has
 * its SVG baked into a CSS data URI with hardcoded colours. This
 * module rewrites those URIs at panel load with the user's chosen
 * fill + stroke colours (persisted in localStorage) and re-applies
 * whenever the colours change in Plugin Settings.
 *
 * Nothing else about the icons is touched — same shapes, same
 * sizes, same CSS layout. Only the colour attrs inside the SVG
 * get swapped so the buttons can respond to a user preference.
 * ============================================================ */
(function () {
  "use strict";

  var STORE_STROKE = "compXToolIcon.stroke";
  var STORE_FILL   = "compXToolIcon.fill";
  var STORE_ENABLE = "compXToolIcon.enabled";

  // Original defaults baked into the CSS — we match the stroke so a user
  // who never visits Settings sees the same look as before.
  var DEFAULT_STROKE = "#3cff5f";
  var DEFAULT_FILL   = "none";

  var cachedOriginals = null;   // selector → original --orbit-icon data URI

  /* ---------- small helpers ---------- */
  function readPref(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function writePref(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }
  function parseEnabled() {
    var v = readPref(STORE_ENABLE, "");
    return v === "1" || v === "true";
  }

  // Decode the %-escapes used by the CSS to store an inline SVG.
  function decodeDataUri(uri) {
    if (!uri) return "";
    // Strip the data:image/svg+xml, prefix and the enclosing quotes.
    var m = String(uri).match(/url\(["']?data:image\/svg\+xml,([\s\S]+?)["']?\)/i);
    if (!m) return "";
    try { return decodeURIComponent(m[1]); }
    catch (e) {
      // Some CSS escapes are not %-encoded — return as-is.
      return m[1];
    }
  }

  function encodeToDataUri(svg) {
    var encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    return 'url("data:image/svg+xml,' + encoded + '")';
  }

  // Rewrite colour attrs on the SVG string. Keeps stroke-width and shape
  // attrs intact; only swaps every stroke="#xxxxxx" and fill="#xxxxxx"
  // (plus the colour="…" convenience attr Lucide uses) for the user's
  // chosen values.
  function recolorSvg(svg, stroke, fill) {
    if (!svg) return svg;
    var out = svg;
    // Swap `stroke="…hex…"` / `color="…hex…"` → user stroke.
    out = out.replace(/stroke\s*=\s*"[^"]*"/gi, 'stroke="' + stroke + '"');
    out = out.replace(/color\s*=\s*"[^"]*"/gi,  'color="'  + stroke + '"');
    // Swap `fill="…"` (including fill="none") → user fill.
    out = out.replace(/fill\s*=\s*"[^"]*"/gi,   'fill="'   + fill   + '"');
    // Also swap inline style="fill:… ; stroke:…"
    out = out.replace(/style\s*=\s*"([^"]*)"/gi, function (_, body) {
      var s = body
        .replace(/stroke\s*:\s*[^;"]+/gi, "stroke:" + stroke)
        .replace(/fill\s*:\s*[^;"]+/gi,   "fill:"   + fill);
      return 'style="' + s + '"';
    });
    return out;
  }

  // Pull the current CSS values of --orbit-icon for every registered icon
  // selector; stash them once so recolour can start from the originals
  // each time (we never read mutated values back).
  function snapshotOriginals() {
    if (cachedOriginals) return cachedOriginals;
    cachedOriginals = {};
    // Walk every stylesheet rule looking for `[data-orbit-icon="…"]`
    // declarations that set `--orbit-icon`. CEP's Chromium exposes
    // cssRules on same-origin sheets, which all of ours are.
    var i, j, sheet, rules, rule, sel, name, val;
    for (i = 0; i < document.styleSheets.length; i++) {
      try { rules = document.styleSheets[i].cssRules; }
      catch (eCors) { continue; }
      if (!rules) continue;
      for (j = 0; j < rules.length; j++) {
        rule = rules[j];
        if (!rule || rule.type !== 1) continue;    // STYLE_RULE
        sel = rule.selectorText || "";
        if (sel.indexOf("[data-orbit-icon=") < 0) continue;
        val = rule.style && rule.style.getPropertyValue("--orbit-icon");
        if (!val) continue;
        // Extract the icon name from the selector.
        var mName = sel.match(/\[data-orbit-icon\s*=\s*["']?([^"'\]]+)/);
        if (!mName) continue;
        name = mName[1];
        if (!cachedOriginals[name]) cachedOriginals[name] = val.trim();
      }
    }
    return cachedOriginals;
  }

  // Write user-coloured icon URIs to every matching button as an INLINE
  // style, so the specificity wins over the CSS rule's --orbit-icon.
  function applyColors() {
    var enabled = parseEnabled();
    var stroke = readPref(STORE_STROKE, DEFAULT_STROKE);
    var fill   = readPref(STORE_FILL,   DEFAULT_FILL);
    var map    = snapshotOriginals();
    var btns   = document.querySelectorAll("[data-orbit-icon]");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var name = btn.getAttribute("data-orbit-icon");
      if (!name || !map[name]) continue;
      if (!enabled) {
        // User turned it off → clear overrides, let the stock CSS win.
        btn.style.removeProperty("--orbit-icon");
        continue;
      }
      var svg = decodeDataUri(map[name]);
      if (!svg) continue;
      var recoloured = recolorSvg(svg, stroke, fill);
      btn.style.setProperty("--orbit-icon", encodeToDataUri(recoloured));
    }
  }

  // Watch for buttons added later (tool-sections built on tab switch).
  function watchForNewButtons() {
    if (!window.MutationObserver) return;
    var obs = new MutationObserver(function (changes) {
      var needsApply = false, i, j;
      for (i = 0; i < changes.length; i++) {
        var added = changes[i].addedNodes;
        for (j = 0; j < (added && added.length); j++) {
          var node = added[j];
          if (node && node.nodeType === 1) {
            if (node.hasAttribute && node.hasAttribute("data-orbit-icon")) { needsApply = true; break; }
            if (node.querySelector && node.querySelector("[data-orbit-icon]")) { needsApply = true; break; }
          }
        }
        if (needsApply) break;
      }
      if (needsApply) applyColors();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- Plugin Settings UI ---------- */
  function buildSettingsCard() {
    var modal = document.getElementById("lgSettingsModal");
    if (!modal) return;
    var body = modal.querySelector(".modal-body");
    if (!body) return;
    if (document.getElementById("toolIconColorsCard")) return;  // already built

    var card = document.createElement("div");
    card.className = "lg-plugin-card";
    card.id = "toolIconColorsCard";
    card.innerHTML =
      '<div class="lg-plugin-card-top">' +
        '<div class="lg-plugin-card-icon" aria-hidden="true">🎨</div>' +
        '<div class="lg-plugin-card-heading">' +
          '<div class="lg-plugin-card-name">Tool Icon Colours</div>' +
          '<div class="lg-plugin-card-tags">' +
            '<span class="lg-plugin-chip">Tools tab</span>' +
            '<span class="lg-plugin-chip">Docks</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="lg-plugin-card-desc">Tint the Tools-tab and Dock button icons. Fill colours filled shapes; Stroke colours outlines. Turn the toggle off to go back to the stock green.</p>' +
      '<div class="tic-row">' +
        '<label class="tic-toggle"><input type="checkbox" id="toolIconEnable"/><span>Use custom colours</span></label>' +
      '</div>' +
      '<div class="tic-row tic-pickers">' +
        '<label class="tic-field"><span>Stroke</span><input type="color" id="toolIconStroke" value="#3cff5f"/><input type="text" id="toolIconStrokeHex" value="#3cff5f" maxlength="9"/></label>' +
        '<label class="tic-field"><span>Fill</span><input type="color" id="toolIconFill" value="#3cff5f"/><input type="text" id="toolIconFillHex" value="none" maxlength="9" placeholder="none"/></label>' +
      '</div>' +
      '<div class="tic-row tic-actions">' +
        '<button class="tool-btn" type="button" id="btnToolIconReset">Reset to default</button>' +
        '<button class="tool-btn" type="button" id="btnToolIconMono">Outline (fill: none)</button>' +
      '</div>';

    // Insert after the first card (AI Providers lives first). Falls back
    // to append if nothing is there yet.
    var firstCard = body.querySelector(".lg-plugin-card");
    if (firstCard && firstCard.nextSibling) body.insertBefore(card, firstCard.nextSibling);
    else body.appendChild(card);

    // Wire the fields to live state.
    var cbEn    = document.getElementById("toolIconEnable");
    var inStk   = document.getElementById("toolIconStroke");
    var inStkH  = document.getElementById("toolIconStrokeHex");
    var inFill  = document.getElementById("toolIconFill");
    var inFillH = document.getElementById("toolIconFillHex");
    var btnR    = document.getElementById("btnToolIconReset");
    var btnM    = document.getElementById("btnToolIconMono");

    cbEn.checked    = parseEnabled();
    inStk.value     = normaliseHexForColor(readPref(STORE_STROKE, DEFAULT_STROKE));
    inStkH.value    = readPref(STORE_STROKE, DEFAULT_STROKE);
    inFillH.value   = readPref(STORE_FILL, DEFAULT_FILL);
    inFill.value    = (inFillH.value === "none" || !/^#/.test(inFillH.value)) ? "#000000" : normaliseHexForColor(inFillH.value);

    cbEn.addEventListener("change", function () {
      writePref(STORE_ENABLE, cbEn.checked ? "1" : "");
      applyColors();
    });
    function updateStroke(v) {
      writePref(STORE_STROKE, v);
      inStk.value = normaliseHexForColor(v);
      inStkH.value = v;
      if (!cbEn.checked) { cbEn.checked = true; writePref(STORE_ENABLE, "1"); }
      applyColors();
    }
    function updateFill(v) {
      writePref(STORE_FILL, v);
      inFillH.value = v;
      if (/^#/.test(v)) inFill.value = normaliseHexForColor(v);
      if (!cbEn.checked) { cbEn.checked = true; writePref(STORE_ENABLE, "1"); }
      applyColors();
    }
    inStk.addEventListener("input",   function () { updateStroke(inStk.value); });
    inStkH.addEventListener("change", function () { updateStroke(inStkH.value.trim() || DEFAULT_STROKE); });
    inFill.addEventListener("input",  function () { updateFill(inFill.value); });
    inFillH.addEventListener("change",function () { updateFill(inFillH.value.trim() || DEFAULT_FILL); });
    btnR.addEventListener("click", function () {
      writePref(STORE_STROKE, DEFAULT_STROKE);
      writePref(STORE_FILL,   DEFAULT_FILL);
      writePref(STORE_ENABLE, "");
      cbEn.checked = false;
      inStk.value = DEFAULT_STROKE; inStkH.value = DEFAULT_STROKE;
      inFill.value = "#000000";     inFillH.value = DEFAULT_FILL;
      applyColors();
    });
    btnM.addEventListener("click", function () { updateFill("none"); });
  }

  function normaliseHexForColor(hex) {
    // <input type="color"> only accepts #rrggbb (no alpha, no 3-digit)
    var s = String(hex || "").trim();
    if (!/^#/.test(s)) return "#000000";
    s = s.toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(s)) {
      return "#" + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2) + s.charAt(3) + s.charAt(3);
    }
    if (/^#[0-9a-f]{8}$/.test(s)) return s.slice(0, 7);
    if (/^#[0-9a-f]{6}$/.test(s)) return s;
    return "#000000";
  }

  /* ---------- bootstrap ---------- */
  function init() {
    applyColors();
    watchForNewButtons();
    buildSettingsCard();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for the Plugin Settings open hook — the modal is lazy and the
  // card node may not exist until a user opens Settings for the first time.
  window.OrbitToolIcons = {
    reapply: applyColors,
    buildCard: buildSettingsCard
  };

  // Rebuild the card when the Settings modal is opened (safety net).
  document.addEventListener("click", function (ev) {
    if (ev.target && ev.target.closest && ev.target.closest("#cx-settings-btn")) {
      setTimeout(buildSettingsCard, 60);
    }
  });
})();
