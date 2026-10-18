/* ============================================================
   ORBIT EXPRESSION LIBRARY  (Tools tab → ASSETS → Expressions)

   A categorised browser of ready-made After Effects expressions.
   Pick one, preview the code, click Apply — the expression is
   written onto the selected property in the timeline.

   The expressions ship inside the extension at
   assets/expressions/expression-library.json.
   Host call: ae_applyExpression({ code, propertyPath? }).
   ============================================================ */
(function () {
  "use strict";

  var data = null;       // parsed JSON
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

  function loadData(done) {
    if (data) { done(null, data); return; }
    if (loading) { setTimeout(function () { loadData(done); }, 120); return; }
    loading = true;

    function finish(err, parsed) {
      loading = false;
      if (err) { loadError = String(err); done(err); return; }
      try { data = parsed; done(null, data); }
      catch (e) { loadError = String(e); done(e); }
    }

    var fs = nodeRequire("fs"), path = nodeRequire("path");
    if (fs && path) {
      try {
        var file = path.join(extensionRoot(), "assets", "expressions", "expression-library.json");
        var text = fs.readFileSync(file, "utf8");
        finish(null, JSON.parse(text));
        return;
      } catch (e) { /* try fetch */ }
    }
    try {
      window.fetch("assets/expressions/expression-library.json")
        .then(function (r) { return r.json(); })
        .then(function (j) { finish(null, j); })
        .catch(function (e) { finish(e || "Could not load the expression library.", null); });
    } catch (e3) {
      finish("Could not load the expression library.", null);
    }
  }

  /* ---- Lucide icon SVG fragments for category headers ----
     These are tiny inline SVGs so we don't depend on the icon bundle. */
  var ICONS = {
    repeat:     '<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    activity:   '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    clock:      '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    zap:        '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    link:       '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    type:       '<polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>',
    navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    layers:     '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    box:        '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    tool:       '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
  };

  function catIcon(name) {
    var body = ICONS[name] || ICONS.tool;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="expr-cat-icon">' + body + '</svg>';
  }

  function escHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function init() {
    var card = el("expressionLibraryModal");
    if (!card) return;

    var trigger = el("btnExpressionLibraryOpen");
    var closeBtn = el("btnExpressionLibraryClose");
    var catList = el("exprCategoryList");
    var exprList = el("exprExpressionList");
    var preview = el("exprCodePreview");
    var exprTitle = el("exprTitle");
    var exprDesc = el("exprDescription");
    var applyBtn = el("btnExprApply");
    var copyBtn = el("btnExprCopy");
    var search = el("exprSearch");
    var status = el("exprStatus");
    var busy = false;
    var selectedExpr = null;
    var searchTimer = 0;

    function say(msg, state) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle("is-error", state === "error");
      status.classList.toggle("is-ok", state === "ok");
    }

    function host() {
      var h = window.CompXHostBridge;
      return (h && typeof h.call === "function") ? h : null;
    }

    // Render category buttons
    function renderCategories() {
      if (!catList || !data) return;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < data.categories.length; i++) {
        var cat = data.categories[i];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "expr-cat-btn";
        btn.setAttribute("data-cat", cat.id);
        btn.innerHTML = catIcon(cat.icon) + '<span>' + escHtml(cat.name) + '</span>';
        frag.appendChild(btn);
      }
      catList.innerHTML = "";
      catList.appendChild(frag);
    }

    // Render expression list for a category or search
    function renderExpressions(catId, query) {
      if (!exprList || !data) return;
      var items = [];
      var terms = query ? query.toLowerCase().split(/\s+/).filter(Boolean) : [];

      for (var c = 0; c < data.categories.length; c++) {
        var cat = data.categories[c];
        if (catId && cat.id !== catId) continue;
        for (var e = 0; e < cat.expressions.length; e++) {
          var expr = cat.expressions[e];
          if (terms.length) {
            var hay = (expr.name + " " + expr.desc + " " + (expr.tags || "")).toLowerCase();
            var match = true;
            for (var t = 0; t < terms.length; t++) {
              if (hay.indexOf(terms[t]) < 0) { match = false; break; }
            }
            if (!match) continue;
          }
          items.push({ expr: expr, catName: cat.name });
        }
      }

      var frag = document.createDocumentFragment();
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "expr-item";
        btn.setAttribute("data-expr-id", item.expr.id);
        btn.innerHTML = '<span class="expr-item-name">' + escHtml(item.expr.name) + '</span>' +
          '<span class="expr-item-cat">' + escHtml(item.catName) + '</span>';
        frag.appendChild(btn);
      }
      exprList.innerHTML = "";
      exprList.appendChild(frag);

      if (!items.length) {
        say(query ? "No expression matches “" + query + "”." : "No expressions in this category.", "error");
      } else {
        say(items.length + (items.length === 1 ? " expression" : " expressions"));
      }

      // Clear preview
      selectExpr(null);
    }

    function selectExpr(expr) {
      selectedExpr = expr;
      if (preview) preview.textContent = expr ? expr.code : "";
      if (exprTitle) exprTitle.textContent = expr ? expr.name : "";
      if (exprDesc) exprDesc.textContent = expr ? expr.desc : "Select an expression to preview its code.";
      if (applyBtn) applyBtn.disabled = !expr;
      if (copyBtn) copyBtn.disabled = !expr;

      // Highlight active item
      var items = exprList ? exprList.querySelectorAll(".expr-item") : [];
      for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("is-active", expr && items[i].getAttribute("data-expr-id") === expr.id);
      }
    }

    function findExprById(id) {
      if (!data) return null;
      for (var c = 0; c < data.categories.length; c++) {
        var cat = data.categories[c];
        for (var e = 0; e < cat.expressions.length; e++) {
          if (cat.expressions[e].id === id) return cat.expressions[e];
        }
      }
      return null;
    }

    // Apply expression to selected property
    function applyExpression() {
      if (busy || !selectedExpr) return;
      var h = host();
      if (!h) { say("After Effects is not connected yet.", "error"); return; }

      busy = true;
      card.classList.add("is-busy");
      say("Applying “" + selectedExpr.name + "”…");

      var code = selectedExpr.code;
      var payload = JSON.stringify({ code: code, name: selectedExpr.name });
      h.call("ae_applyExpression(" + h.arg(payload) + ")", function (parsed) {
        busy = false;
        card.classList.remove("is-busy");
        if (parsed && parsed.success) say("“" + selectedExpr.name + "” applied.", "ok");
        else say((parsed && (parsed.message || parsed.detail)) || "Could not apply the expression. Select a property in the timeline first.", "error");
      });
    }

    function copyCode() {
      if (!selectedExpr) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(selectedExpr.code);
        } else {
          var ta = document.createElement("textarea");
          ta.value = selectedExpr.code;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        say("Code copied to clipboard.", "ok");
      } catch (e) {
        say("Copy failed — select the code manually.", "error");
      }
    }

    // Category click
    if (catList) catList.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".expr-cat-btn");
      if (!btn) return;
      var catId = btn.getAttribute("data-cat");
      // Toggle active category
      var btns = catList.querySelectorAll(".expr-cat-btn");
      for (var i = 0; i < btns.length; i++) {
        btns[i].classList.toggle("is-active", btns[i] === btn && !btn.classList.contains("is-active"));
      }
      if (btn.classList.contains("is-active")) {
        renderExpressions(catId, "");
        if (search) search.value = "";
      } else {
        renderExpressions(null, search ? search.value.trim() : "");
      }
    });

    // Expression click
    if (exprList) exprList.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".expr-item");
      if (!btn) return;
      var id = btn.getAttribute("data-expr-id");
      var expr = findExprById(id);
      if (expr) selectExpr(expr);
    });

    if (applyBtn) applyBtn.addEventListener("click", applyExpression);
    if (copyBtn) copyBtn.addEventListener("click", copyCode);

    // Search
    if (search) search.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        var q = search.value.trim();
        // Clear category selection on search
        if (q) {
          var btns = catList ? catList.querySelectorAll(".expr-cat-btn") : [];
          for (var i = 0; i < btns.length; i++) btns[i].classList.remove("is-active");
        }
        renderExpressions(null, q);
      }, 160);
    });

    function open() {
      card.style.display = "flex";
      if (trigger) trigger.setAttribute("aria-expanded", "true");
      loadData(function (err) {
        if (err) { say("Could not load the expression library: " + loadError, "error"); return; }
        renderCategories();
        renderExpressions(null, search ? search.value.trim() : "");
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
