/* ============================================================
   ORBIT ICON LIBRARY  (Tools tab → ASSETS → Icons)

   A browser for the bundled Lucide icon set (ISC licensed). Click an
   icon and it lands in the active comp as a native, editable shape
   layer — through the same SVG engine the Figma bridge and SVG import
   use, so the icon keeps its colour, size and stroke and every path is
   editable afterwards.

   Nothing here touches the network: the icons ship inside the
   extension at assets/icons/lucide-icons.json. The host call is
   ae_importSvgAsShapes({ text, name, scale, centre }).
   ============================================================ */
(function () {
  "use strict";

  var STORE = "compXIcons.";
  // The grid can hold 2,000+ icons; rendering them all at once janks the
  // panel, so we cap what is drawn and tell the user to narrow by search.
  var MAX_RENDER = 400;

  var data = null;        // { icons: {name: body}, index: {name: "words"} }
  var names = [];         // all icon names, sorted
  var loading = false;
  var loadError = "";

  function el(id) { return document.getElementById(id); }

  function nodeRequire(name) {
    try { if (typeof require === "function") return require(name); } catch (e) { /* no CEP Node */ }
    return null;
  }

  function extensionRoot() {
    try {
      if (window.CompXLocalAI && typeof window.CompXLocalAI.extensionRoot === "function") {
        return window.CompXLocalAI.extensionRoot();
      }
    } catch (e) { /* fall through */ }
    try {
      if (window.CSInterface && window.SystemPath) {
        return new window.CSInterface().getSystemPath(window.SystemPath.EXTENSION);
      }
    } catch (e2) { /* fall through */ }
    return "";
  }

  // Load the bundle. Node fs first (reliable in CEP), fetch as a fallback
  // for any environment where require is not available.
  function loadData(done) {
    if (data) { done(null, data); return; }
    if (loading) { setTimeout(function () { loadData(done); }, 120); return; }
    loading = true;

    function finish(err, parsed) {
      loading = false;
      if (err) { loadError = String(err); done(err); return; }
      try {
        data = parsed;
        names = Object.keys(data.icons || {}).sort();
        done(null, data);
      } catch (e) { loadError = String(e); done(e); }
    }

    var fs = nodeRequire("fs"), path = nodeRequire("path");
    if (fs && path) {
      try {
        var file = path.join(extensionRoot(), "assets", "icons", "lucide-icons.json");
        var text = fs.readFileSync(file, "utf8");
        finish(null, JSON.parse(text));
        return;
      } catch (e) { /* try fetch */ }
    }
    try {
      window.fetch("assets/icons/lucide-icons.json")
        .then(function (r) { return r.json(); })
        .then(function (j) { finish(null, j); })
        .catch(function (e) { finish(e || "Could not load the icon set.", null); });
    } catch (e3) {
      finish("Could not load the icon set.", null);
    }
  }

  // Build the SVG a preview or an insert uses from an icon's path body.
  function svgOf(body, stroke, strokeWidth) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="' + stroke + '" stroke-width="' + strokeWidth + '" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + body + "</svg>";
  }

  function readNumber(id, fallback, low, high) {
    var node = el(id);
    var v = node ? parseFloat(node.value) : NaN;
    if (!isFinite(v)) v = fallback;
    return Math.max(low, Math.min(high, v));
  }

  function matches(query) {
    if (!query) return names.slice(0);
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var out = [];
    for (var i = 0; i < names.length; i++) {
      var hay = names[i] + " " + (data.index[names[i]] || "");
      var ok = true;
      for (var t = 0; t < terms.length; t++) {
        if (hay.indexOf(terms[t]) < 0) { ok = false; break; }
      }
      if (ok) out.push(names[i]);
    }
    return out;
  }

  function init() {
    var card = el("iconLibraryModal");
    if (!card) return;

    var trigger = el("btnIconLibraryOpen");
    var closeBtn = el("btnIconLibraryClose");
    var grid = el("iconLibraryGrid");
    var search = el("iconLibrarySearch");
    var status = el("iconLibraryStatus");
    var busy = false;
    var searchTimer = 0;

    function say(message, state) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-error", state === "error");
      status.classList.toggle("is-ok", state === "ok");
    }

    function host() {
      var h = window.CompXHostBridge;
      return (h && typeof h.call === "function") ? h : null;
    }

    function renderGrid(query) {
      if (!grid || !data) return;
      var list = matches(query);
      var total = list.length;
      var shown = Math.min(MAX_RENDER, total);
      // Preview stroke is a light tint so every icon reads on the dark grid,
      // whatever colour it will actually be inserted with.
      var preview = "#cfeeda";
      var frag = document.createDocumentFragment();
      for (var i = 0; i < shown; i++) {
        var name = list[i];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "icon-lib-item";
        btn.setAttribute("data-icon", name);
        btn.title = name;
        btn.setAttribute("role", "option");
        btn.innerHTML = svgOf(data.icons[name], preview, 2);
        frag.appendChild(btn);
      }
      grid.innerHTML = "";
      grid.appendChild(frag);
      if (!total) say("No icon matches “" + query + "”.", "error");
      else if (total > shown) say(shown + " of " + total + " — keep typing to narrow it down.");
      else say(total + (total === 1 ? " icon" : " icons"));
    }

    function insert(name) {
      if (busy) return;
      var h = host();
      if (!h) { say("After Effects is not connected yet.", "error"); return; }
      var body = data.icons[name];
      if (!body) { say("That icon could not be found.", "error"); return; }

      var colour = (el("iconLibraryColor") || {}).value || "#35c8ff";
      var sizePx = readNumber("iconLibrarySize", 300, 8, 4000);
      var strokeW = readNumber("iconLibraryStroke", 2, 0.5, 8);
      var options = {
        text: svgOf(body, colour, strokeW),
        name: name,
        centre: true,
        // The icon art is a 24-unit box; scale it up to the size in pixels.
        scale: sizePx / 24
      };

      busy = true;
      card.classList.add("is-busy");
      say("Inserting “" + name + "”…");
      h.call("ae_importSvgAsShapes(" + h.arg(JSON.stringify(options)) + ")", function (parsed) {
        busy = false;
        card.classList.remove("is-busy");
        if (parsed && parsed.success) say("“" + name + "” added.", "ok");
        else say((parsed && (parsed.message || parsed.detail)) || "After Effects could not place that icon.", "error");
      });
    }

    if (grid) grid.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".icon-lib-item");
      if (btn) insert(btn.getAttribute("data-icon"));
    });

    if (search) search.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { renderGrid(search.value.trim()); }, 140);
    });

    function open() {
      card.style.display = "flex";
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      loadData(function (err) {
        if (err) { say("Could not load the icon set: " + loadError, "error"); return; }
        renderGrid(search ? search.value.trim() : "");
        if (search) { try { search.focus(); } catch (e) { /* hidden */ } }
      });
    }

    function close() {
      card.style.display = "none";
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
        try { trigger.focus(); } catch (e) { /* detached */ }
      }
    }

    if (trigger) trigger.addEventListener("click", open);
    if (closeBtn) closeBtn.addEventListener("click", close);
    card.addEventListener("click", function (ev) { if (ev.target === card) close(); });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && card.style.display === "flex") { ev.preventDefault(); close(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
