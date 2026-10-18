/* ============================================================
   ORBIT CAROUSEL  (Carousel tab)

   Thin wiring only: read the fields, call the host, report what
   came back. Every decision about what happens to the layers lives
   in jsx/hostscript.jsx.

   Host side:
     ae_carouselBuild(style, optsJson)
     ae_carouselUpdate(optsJson)
     ae_carouselRemove()
     ae_carouselState()

   The rig is expression driven, so once a carousel exists a changed
   field is a slider write rather than a rebuild — that is why every
   field calls Update live and only Build touches the layers.

   This file loads before main.js (compx-loader injects main.js only
   after the licence check), so the host bridge is resolved lazily at
   click time rather than captured at load.
   ============================================================ */
(function () {
  "use strict";

  var STORE = "compXCarousel.";
  var STYLES = ["strip", "ring", "path", "stack", "wave", "helix", "fan", "tunnel", "cover"];

  var FIELDS = [
    { id: "carSpacing", key: "spacing", min: 1, max: 6000, def: 320 },
    { id: "carRadius", key: "radius", min: 1, max: 8000, def: 600 },
    { id: "carScale", key: "cardScale", min: 1, max: 400, def: 60 },
    { id: "carFalloff", key: "falloff", min: 0, max: 100, def: 40 },
    { id: "carTilt", key: "tilt", min: -90, max: 90, def: 0 },
    { id: "carVisible", key: "visible", min: 1, max: 120, def: 5 },
    { id: "carTiltPath", key: "tiltPath", min: 0, max: 100, def: 100 },
    { id: "carSpeed", key: "speed", min: -10, max: 10, def: 0, decimals: 2 }
  ];
  var CHECKS = ["carVertical", "carBillboard", "carCamera"];


  function read(key, fallback) {
    try {
      var v = localStorage.getItem(STORE + key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(STORE + key, String(value));
    } catch (e) {
      /* storage unavailable in some CEP sandboxes — the session still works */
    }
  }

  function init() {
    var panel = document.getElementById("panel-carousel");
    if (!panel) return;

    var status = document.getElementById("carStatus");
    var buildBtn = document.getElementById("carBuild");
    var busy = false;
    var hasRig = false;
    var updateTimer = null;

    var style = read("style", "strip");
    if (STYLES.indexOf(style) < 0) style = "strip";

    function say(message, state) {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-error", state === "error");
      status.classList.toggle("is-ok", state === "ok");
      status.title = message;
    }

    // A field that is empty, non-numeric or out of range falls back to its
    // default rather than sending NaN into a host call. The field itself is
    // only rewritten when "tidy" is set (on change/blur, or before a build):
    // doing it while the user types turned a cleared field or a lone "-"
    // back into the default under their cursor.
    function numberOf(spec, tidy) {
      var el = document.getElementById(spec.id);
      if (!el) return spec.def;
      var n = parseFloat(el.value);
      if (!isFinite(n)) n = spec.def;
      n = Math.max(spec.min, Math.min(spec.max, spec.decimals ? n : Math.round(n)));
      if (tidy) {
        var text = String(n);
        if (text !== el.value) el.value = text;
      }
      return n;
    }

    function options(tidy) {
      var o = {}, i;
      for (i = 0; i < FIELDS.length; i++) o[FIELDS[i].key] = numberOf(FIELDS[i], tidy);
      // Path uses one field for how hard a card turns to follow the curve,
      // and it lands on the same Tilt slider the other looks drive.
      if (style === "path") o.tilt = o.tiltPath;
      delete o.tiltPath;
      o.vertical = checked("carVertical");
      o.billboard = checked("carBillboard");
      o.addCamera = checked("carCamera");
      return o;
    }

    function checked(id) {
      var el = document.getElementById(id);
      return el ? !!el.checked : false;
    }

    function bridge() {
      var host = window.CompXHostBridge;
      return host && typeof host.call === "function" ? host : null;
    }

    function call(code, workingText, done) {
      if (busy) return;
      var host = bridge();
      if (!host) {
        say("After Effects is not connected yet.", "error");
        return;
      }
      busy = true;
      panel.classList.add("is-busy");
      say(workingText || "Working…");
      host.call(code, function (parsed) {
        busy = false;
        panel.classList.remove("is-busy");
        if (parsed && parsed.success) {
          say(parsed.message || "Done", "ok");
        } else {
          say((parsed && (parsed.message || parsed.detail)) || "That did not work.", "error");
        }
        if (done) done(parsed);
      });
    }

    function argOf(value) {
      var host = window.CompXHostBridge;
      if (host && typeof host.arg === "function") return host.arg(value);
      return '"' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
    }

    // Which fields a look actually uses. Showing Radius on a flat strip, or
    // Spacing on a ring, would offer a control that does nothing.
    function syncStyleUI() {
      panel.querySelectorAll("[data-car-style]").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-car-style") === style);
      });
      panel.querySelectorAll("[data-car-for]").forEach(function (row) {
        var list = " " + row.getAttribute("data-car-for") + " ";
        row.hidden = list.indexOf(" " + style + " ") < 0;
      });
      panel.dataset.carCurrent = style;
    }

    function setStyle(next, fromUser) {
      style = next;
      write("style", style);
      syncStyleUI();
      // Changing the look is a different layout, so it needs a real rebuild —
      // an Update would only move sliders the new expressions never read.
      if (fromUser && hasRig) say("Look changed — press BUILD to apply it.");
    }

    function markRig(exists) {
      hasRig = !!exists;
      panel.classList.toggle("has-rig", hasRig);
    }

    // Live: once a carousel exists, a changed number is a slider write.
    function pushUpdate() {
      if (!hasRig || busy) return;
      call("ae_carouselUpdate(" + argOf(JSON.stringify(options())) + ")", "Updating…");
    }

    function queueUpdate() {
      if (updateTimer) clearTimeout(updateTimer);
      updateTimer = setTimeout(pushUpdate, 260);
    }

    function refreshState() {
      var host = bridge();
      if (!host) return;
      host.call("ae_carouselState()", function (parsed) {
        if (!parsed || !parsed.success) return;
        markRig(parsed.exists === true);
        if (parsed.exists) {
          if (parsed.style && STYLES.indexOf(parsed.style) >= 0 && parsed.style !== style) {
            setStyle(parsed.style, false);
          }
          var i, spec, el, key;
          for (i = 0; i < FIELDS.length; i++) {
            spec = FIELDS[i];
            // One Tilt slider on the rig: on a path it is the FOLLOW field.
            key = spec.key;
            if (spec.key === "tilt" && parsed.style === "path") continue;
            if (spec.key === "tiltPath") key = parsed.style === "path" ? "tilt" : "";
            el = document.getElementById(spec.id);
            if (el && key && parsed[key] !== undefined && parsed[key] !== null) {
              el.value = String(Math.round(Number(parsed[key]) * 100) / 100);
              write(spec.id, el.value);
            }
          }
          say(parsed.cards + " cards in this comp's carousel.", "ok");
        } else if (parsed.selected >= 2) {
          say(parsed.selected + " layers selected — ready to build.");
        } else {
          say("Select 2+ layers to build from.");
        }
      });
    }

    /* ---- restore, then wire ---- */

    var i, spec, el;
    for (i = 0; i < FIELDS.length; i++) {
      spec = FIELDS[i];
      el = document.getElementById(spec.id);
      if (!el) continue;
      el.value = read(spec.id, String(spec.def));
      numberOf(spec, true);
      (function (s, input) {
        input.addEventListener("input", function () {
          write(s.id, input.value);
          queueUpdate();
        });
        input.addEventListener("change", function () {
          numberOf(s, true);
          write(s.id, input.value);
        });
      })(spec, el);
    }
    for (i = 0; i < CHECKS.length; i++) {
      el = document.getElementById(CHECKS[i]);
      if (!el) continue;
      el.checked = read(CHECKS[i], el.checked ? "1" : "") === "1";
      (function (id, input) {
        input.addEventListener("change", function () {
          write(id, input.checked ? "1" : "");
          // Vertical and Billboard are baked into the expressions, so they
          // only take effect on the next build.
          if (hasRig) say("Press BUILD to apply that.");
        });
      })(CHECKS[i], el);
    }

    panel.querySelectorAll("[data-car-style]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setStyle(btn.getAttribute("data-car-style"), true);
      });
    });

    if (buildBtn) {
      buildBtn.addEventListener("click", function () {
        call("ae_carouselBuild(" + argOf(style) + "," + argOf(JSON.stringify(options(true))) + ")",
          "Building…",
          function (parsed) { if (parsed && parsed.success) markRig(true); });
      });
    }

    var removeBtn = document.getElementById("carRemove");
    if (removeBtn) {
      removeBtn.addEventListener("click", function () {
        call("ae_carouselRemove()", "Removing…", function (parsed) {
          if (parsed && parsed.success) markRig(false);
        });
      });
    }

    var refreshBtn = document.getElementById("carRefresh");
    if (refreshBtn) refreshBtn.addEventListener("click", refreshState);

    var tabBtn = document.querySelector('[data-apptab="carousel"]');
    if (tabBtn) tabBtn.addEventListener("click", function () { setTimeout(refreshState, 40); });

    syncStyleUI();
    say("Select 2+ layers to build from.");
    setTimeout(refreshState, 900);
  }

  /* ============================================================
   * ANIMATED STYLE PREVIEWS
   *   Each .car-style-canvas tile paints a procedural mini-animation
   *   that mirrors the real AE expression layout for that style.
   *   The RAF loop runs only while the Carousel tab is visible.
   * ============================================================ */
  function startPreviews() {
    var canvases = document.querySelectorAll("#panel-carousel .car-style-canvas");
    if (!canvases.length) return;
    var contexts = [];
    for (var i = 0; i < canvases.length; i++) {
      var cv = canvases[i];
      var ctx = cv.getContext && cv.getContext("2d");
      if (!ctx) continue;
      contexts.push({ cv: cv, ctx: ctx, kind: cv.getAttribute("data-preview") || "strip" });
    }
    var start = (window.performance && performance.now) ? performance.now() : Date.now();
    var raf = 0;

    function visible() {
      var panel = document.getElementById("panel-carousel");
      return panel && panel.classList.contains("active");
    }

    function card(ctx, x, y, w, h, rot, alpha, accent) {
      if (alpha <= 0.02) return;
      ctx.save();
      ctx.translate(x, y);
      if (rot) ctx.rotate(rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      var g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      g.addColorStop(0, accent ? "#5bffa0" : "#3cff5f");
      g.addColorStop(1, accent ? "#1f6f45" : "#1b5330");
      ctx.fillStyle = g;
      ctx.strokeStyle = "rgba(190, 255, 210, 0.65)";
      ctx.lineWidth = 0.8;
      var r = Math.min(2, Math.min(w, h) / 4);
      ctx.beginPath();
      ctx.moveTo(-w / 2 + r, -h / 2);
      ctx.lineTo(w / 2 - r, -h / 2); ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
      ctx.lineTo(w / 2, h / 2 - r); ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      ctx.lineTo(-w / 2 + r, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      ctx.lineTo(-w / 2, -h / 2 + r); ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    function drawPreview(entry, t) {
      var ctx = entry.ctx, cv = entry.cv;
      var w = cv.width, h = cv.height;
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h / 2;
      var n = 7;
      var off = (t / 1800) % 1 * n;
      var i, k, a, s, alpha, items = [];

      if (entry.kind === "strip" || entry.kind === "wave") {
        var isWave = entry.kind === "wave";
        var gap = 18;
        for (i = 0; i < n; i++) {
          k = ((i - off) % n + n) % n; if (k > n / 2) k -= n;
          var d = Math.min(1, Math.abs(k) / (n / 2));
          s = 1 - 0.4 * d;
          alpha = 1 - 0.75 * Math.max(0, (Math.abs(k) - 1.4) / (n / 2 - 1.4));
          var yOff = isWave ? Math.sin((k + off) * 0.9) * 10 : 0;
          items.push({ z: -Math.abs(k), x: cx + k * gap, y: cy + yOff, w: 11 * s, h: 18 * s, rot: 0, a: alpha });
        }

      } else if (entry.kind === "ring" || entry.kind === "helix") {
        var isHelix = entry.kind === "helix";
        var r = 36, ry = 10;
        for (i = 0; i < n; i++) {
          a = ((i - off) / n) * Math.PI * 2;
          var z = -Math.cos(a);
          var persp = 1 + z * 0.35;
          var liftY = isHelix ? (((i - off) % n + n) % n - n / 2) * 2.4 : 0;
          items.push({
            z: z,
            x: cx + Math.sin(a) * r,
            y: cy + liftY + ry * Math.sin(a) * 0,
            w: 10 * persp,
            h: 16 * persp,
            rot: 0,
            a: 0.35 + 0.65 * (z + 1) / 2
          });
        }

      } else if (entry.kind === "path") {
        for (i = 0; i < n; i++) {
          var fr = (((i + 0.5 - off) / n) % 1 + 1) % 1;
          var px = fr * (w - 14) + 7;
          var py = cy + Math.sin(fr * Math.PI * 2.2) * (h * 0.28);
          var tang = Math.cos(fr * Math.PI * 2.2) * (h * 0.28) * (Math.PI * 2.2 / (w - 14));
          var edge = Math.min(fr, 1 - fr);
          alpha = Math.min(1, edge * 5);
          items.push({ z: fr, x: px, y: py, w: 10, h: 15, rot: Math.atan2(tang, 1) * 0.9, a: alpha });
        }

      } else if (entry.kind === "stack") {
        for (i = 0; i < n; i++) {
          k = ((i - off) % n + n) % n; if (k > n / 2) k -= n;
          s = Math.pow(0.86, Math.abs(k));
          var sx = cx + k * 10, sy = cy + k * 3;
          alpha = k < 0 ? 0 : Math.max(0, 1 - k / 3.2);
          items.push({ z: -k, x: sx, y: sy, w: 20 * s, h: 28 * s, rot: 0, a: alpha });
        }

      } else if (entry.kind === "tunnel") {
        // Cards coming down a corridor: Z drives both size and fade, so the
        // nearest card is the biggest and the far ones dissolve away.
        for (i = 0; i < n; i++) {
          k = ((i - off) % n + n) % n; if (k > n / 2) k -= n;
          var depth = (k + n / 2) / n;           // 0 = nearest, 1 = farthest
          var persp = 1.45 - depth * 1.15;
          alpha = k < -0.15 ? Math.max(0, 1 + k / 1.2) : Math.max(0, 1 - Math.max(0, k - 1.2) / 2);
          items.push({ z: -k, x: cx, y: cy, w: 13 * persp, h: 20 * persp, rot: 0, a: alpha });
        }

      } else if (entry.kind === "cover") {
        // Cover flow: centre card square to the viewer, the rest angled in
        // and pushed back. Faked here by squashing their width.
        var cgap = 15;
        for (i = 0; i < n; i++) {
          k = ((i - off) % n + n) % n; if (k > n / 2) k -= n;
          var turn = Math.max(-1, Math.min(1, k));
          var squash = 0.3 + 0.7 * (1 - Math.abs(turn));
          var back = Math.abs(k) * 0.08;
          s = 1 - back;
          var d3 = Math.min(1, Math.abs(k) / (n / 2));
          alpha = 1 - 0.7 * Math.max(0, (Math.abs(k) - 1.3) / (n / 2 - 1.3));
          items.push({
            z: -Math.abs(k),
            x: cx + k * cgap,
            y: cy,
            w: 14 * s * squash,
            h: 21 * s,
            rot: 0,
            a: alpha
          });
        }

      } else if (entry.kind === "fan") {
        var fr2 = cx, fy = h + 6, fR = h + 2;
        for (i = 0; i < n; i++) {
          k = ((i - off) % n + n) % n; if (k > n / 2) k -= n;
          var ang = k * 0.28;
          var fx = fr2 + Math.sin(ang) * fR;
          var fyy = fy - Math.cos(ang) * fR;
          var d2 = Math.min(1, Math.abs(k) / (n / 2));
          alpha = 1 - 0.6 * d2;
          items.push({ z: -Math.abs(k), x: fx, y: fyy, w: 10, h: 18, rot: ang, a: alpha });
        }
      }

      // Painter's algorithm — back to front
      items.sort(function (p, q) { return p.z - q.z; });
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        card(ctx, it.x, it.y, it.w, it.h, it.rot, it.a, j === items.length - 1);
      }
    }

    // 30fps is plenty for a 140x56 thumbnail, and halving the frames
    // halves the work nine tiles are doing behind the rest of the panel.
    var FRAME_MS = 33;
    var lastFrame = 0;

    function tick(now) {
      if (visible()) {
        if (now - lastFrame >= FRAME_MS) {
          lastFrame = now;
          var elapsed = now - start;
          for (var i = 0; i < contexts.length; i++) drawPreview(contexts[i], elapsed);
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      // Tab is closed: stop burning frames and wait for it to come back.
      raf = 0;
      setTimeout(function () {
        if (raf) return;
        if (visible()) { lastFrame = 0; raf = requestAnimationFrame(tick); }
        else tick(performance.now());
      }, 400);
    }

    // Paint once immediately so tiles never show blank even if the tab is not
    // active yet, then start the loop.
    for (var m = 0; m < contexts.length; m++) drawPreview(contexts[m], 0);
    raf = requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); startPreviews(); });
  } else {
    init();
    startPreviews();
  }
})();
