/* ============================================================
   ORBIT CURVE LAB — cubic-bezier easing on After Effects keys
   Flow-style graph + library; Orbit host bridge for apply/read
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "orbitCurveLabLibraries";
  var DEFAULT_LIB_ID = "default";
  var USER_LIB_ID = "mine";

  var DEFAULT_CURVES = [
    { name: "Linear", x1: 0, y1: 0, x2: 1, y2: 1 },
    { name: "Ease", x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
    { name: "Ease In", x1: 0.42, y1: 0, x2: 1, y2: 1 },
    { name: "Ease Out", x1: 0, y1: 0, x2: 0.58, y2: 1 },
    { name: "Ease In Out", x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    { name: "Sine In", x1: 0.47, y1: 0, x2: 0.745, y2: 0.715 },
    { name: "Sine Out", x1: 0.39, y1: 0.575, x2: 0.565, y2: 1 },
    { name: "Sine In Out", x1: 0.445, y1: 0.05, x2: 0.55, y2: 0.95 },
    { name: "Quad In", x1: 0.55, y1: 0.085, x2: 0.68, y2: 0.53 },
    { name: "Quad Out", x1: 0.25, y1: 0.46, x2: 0.45, y2: 0.94 },
    { name: "Quad In Out", x1: 0.455, y1: 0.03, x2: 0.515, y2: 0.955 },
    { name: "Cubic In", x1: 0.55, y1: 0.055, x2: 0.675, y2: 0.19 },
    { name: "Cubic Out", x1: 0.215, y1: 0.61, x2: 0.355, y2: 1 },
    { name: "Cubic In Out", x1: 0.645, y1: 0.045, x2: 0.355, y2: 0.355 },
    { name: "Quart In", x1: 0.895, y1: 0.03, x2: 0.685, y2: 0.22 },
    { name: "Quart Out", x1: 0.165, y1: 0.84, x2: 0.44, y2: 1 },
    { name: "Quart In Out", x1: 0.77, y1: 0, x2: 0.175, y2: 1 },
    { name: "Quint In", x1: 0.755, y1: 0.05, x2: 0.855, y2: 0.06 },
    { name: "Quint Out", x1: 0.23, y1: 1, x2: 0.32, y2: 1 },
    { name: "Expo In", x1: 0.95, y1: 0.05, x2: 0.795, y2: 0.035 },
    { name: "Expo Out", x1: 0.19, y1: 1, x2: 0.22, y2: 1 },
    { name: "Circ In", x1: 0.6, y1: 0.04, x2: 0.98, y2: 0.335 },
    { name: "Circ Out", x1: 0.075, y1: 0.82, x2: 0.165, y2: 1 },
    { name: "Back In", x1: 0.6, y1: -0.28, x2: 0.735, y2: 0.045 },
    { name: "Back Out", x1: 0.175, y1: 0.885, x2: 0.32, y2: 1.275 },
    { name: "Back In Out", x1: 0.68, y1: -0.55, x2: 0.265, y2: 1.55 },
    { name: "Fast Out Slow In", x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
    { name: "Sharp Out", x1: 0.4, y1: 0, x2: 0.6, y2: 1 }
  ];

  /* Cubic In Out y2 was typed wrong - CSS ease-in-out-cubic is 0.645,0.045,0.355,1 */
  DEFAULT_CURVES[13] = { name: "Cubic In Out", x1: 0.645, y1: 0.045, x2: 0.355, y2: 1 };

  var canvas = null;
  var canvasLast = null;
  var ctx = null;
  var ctxLast = null;
  var wrap = null;
  var cp1 = { x: 0.25, y: 0.1 };
  var cp2 = { x: 0.25, y: 1 };
  var lastCurve = null;
  var isDragging = null;
  var viewY0 = -0.25;
  var viewY1 = 1.25;
  var pad = 18;
  var libraries = [];
  var activeLibId = DEFAULT_LIB_ID;
  var previewRaf = 0;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function fmt(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function hostCall(fnName, payload, callback) {
    var script = fnName + "(" + JSON.stringify(JSON.stringify(payload || {})) + ")";
    var bridge = window.CompXHostBridge;
    if (bridge && typeof bridge.call === "function") {
      bridge.call(script, function (parsed) {
        callback(parsed || { success: false, ok: false, message: "No host response" });
      });
      return;
    }
    if (typeof CSInterface !== "undefined") {
      var cs = new CSInterface();
      cs.evalScript(script, function (raw) {
        try {
          callback(JSON.parse(String(raw || "{}")));
        } catch (err) {
          callback({ success: false, ok: false, message: String(raw || err) });
        }
      });
      return;
    }
    callback({ success: false, ok: false, message: "After Effects host is not connected." });
  }

  function init() {
    canvas = document.getElementById("flowCurveCanvas");
    canvasLast = document.getElementById("flowCurveCanvasLast");
    wrap = document.getElementById("curveCanvasWrap") || (canvas && canvas.parentElement);
    if (!canvas || !wrap) return;
    ctx = canvas.getContext("2d");
    if (canvasLast) ctxLast = canvasLast.getContext("2d");
    loadLibraries();
    resizeCanvas();
    window.addEventListener("resize", function () { if (resizeRaf) return; resizeRaf = requestAnimationFrame(function () { resizeRaf = 0; resizeCanvas(); }); });
    setupDragHandlers();
    setupInputHandlers();
    setupButtonHandlers();
    renderLibrarySelect();
    renderPresetGrid();
    drawAll();
    updateControlPointPositions();
  }

  // Canvas size in CSS pixels. The backing store is this times the device
  // pixel ratio, so every draw call can keep working in CSS units.
  var cssW = 0, cssH = 0;

  function sizeOne(cv, c, w, h, dpr) {
    if (!cv) return null;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    if (c) c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return c;
  }

  function resizeCanvas() {
    if (!canvas || !wrap) return;
    // CEP panels run at a scaled device pixel ratio; drawing at 1:1 is what
    // made the whole graph look blurry, so match the real pixel grid.
    var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    cssW = Math.max(120, wrap.clientWidth);
    cssH = Math.max(120, wrap.clientHeight);
    sizeOne(canvas, ctx, cssW, cssH, dpr);
    sizeOne(canvasLast, ctxLast, cssW, cssH, dpr);
    drawAll();
    updateControlPointPositions();
  }

  function graphBounds() {
    var lo = Math.min(0, cp1.y, cp2.y);
    var hi = Math.max(1, cp1.y, cp2.y);
    if (lastCurve) {
      lo = Math.min(lo, lastCurve.y1, lastCurve.y2);
      hi = Math.max(hi, lastCurve.y1, lastCurve.y2);
    }
    var extra = Math.max(0.2, (hi - lo) * 0.12);
    viewY0 = lo - extra;
    viewY1 = hi + extra;
  }

  function toPx(x, y, w, h) {
    return {
      x: pad + x * (w - pad * 2),
      y: pad + (1 - (y - viewY0) / (viewY1 - viewY0)) * (h - pad * 2)
    };
  }

  function fromPx(px, py, w, h) {
    return {
      x: (px - pad) / (w - pad * 2),
      y: viewY0 + (1 - (py - pad) / (h - pad * 2)) * (viewY1 - viewY0)
    };
  }

  /* ============================================================
   * Curve canvas — Orbit's own look.
   *
   * Three layers of information, drawn back to front:
   *   1. the field  — dotted grid + the 0 / 1 rails the ease lives between
   *   2. the curve  — glowing stroke over a gradient that fades to the floor
   *   3. the ruler  — evenly-timed markers laid out at their eased positions,
   *                   so the bunching tells you where the motion slows down
   *                   at a glance. That lane is the part no other bezier
   *                   editor shows, and it is what makes an ease readable
   *                   without scrubbing anything.
   * ============================================================ */

  var resizeRaf = 0;

  var LANE_H = 16;          // height of the motion-ruler lane at the bottom
  var LANE_GAP = 6;         // breathing room between the graph floor and lane

  // Graph area stops short of the lane so the two never overlap.
  function graphH(h) { return h - LANE_H - LANE_GAP; }

  function drawGrid(c, w, h) {
    var i, j, p0, p1, gh = graphH(h);

    // -- dotted field: lighter than ruled lines, keeps the curve dominant.
    //    Square dots in one fill path instead of 99 arcs: same look at this
    //    size, a fraction of the work on every drag frame.
    c.fillStyle = "rgba(180, 255, 205, 0.11)";
    for (i = 0; i <= 10; i++) {
      for (j = 0; j <= 8; j++) {
        var gy = viewY0 + (viewY1 - viewY0) * (j / 8);
        p0 = toPx(i / 10, gy, w, gh);
        c.fillRect(Math.round(p0.x) - 0.5, Math.round(p0.y) - 0.5, 1.6, 1.6);
      }
    }

    // -- the two rails the ease travels between --
    var rails = [
      { v: 0, label: "0" },
      { v: 1, label: "1" }
    ];
    for (i = 0; i < rails.length; i++) {
      p0 = toPx(0, rails[i].v, w, gh);
      p1 = toPx(1, rails[i].v, w, gh);
      var grad = c.createLinearGradient(p0.x, 0, p1.x, 0);
      grad.addColorStop(0, "rgba(60,255,95,0.05)");
      grad.addColorStop(0.5, "rgba(60,255,95,0.26)");
      grad.addColorStop(1, "rgba(60,255,95,0.05)");
      c.strokeStyle = grad;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(p0.x, p0.y);
      c.lineTo(p1.x, p1.y);
      c.stroke();

      c.fillStyle = "rgba(150, 215, 175, 0.5)";
      c.font = "7px 'Segoe UI', sans-serif";
      c.textAlign = "left";
      c.fillText(rails[i].label, 3, p0.y - 2);
    }

    // -- linear reference: how far this ease departs from no easing at all --
    p0 = toPx(0, 0, w, gh);
    p1 = toPx(1, 1, w, gh);
    c.strokeStyle = "rgba(255,255,255,0.10)";
    c.lineWidth = 1;
    c.setLineDash([3, 4]);
    c.beginPath();
    c.moveTo(p0.x, p0.y);
    c.lineTo(p1.x, p1.y);
    c.stroke();
    c.setLineDash([]);
  }

  // The motion ruler. Markers are spaced evenly in TIME; their x positions
  // come from the ease, so a cluster means "slow here" and a gap means "fast".
  function drawMotionRuler(c, w, h) {
    var n = 26;
    var x0 = pad, x1 = w - pad;
    var laneY = h - LANE_H;
    var laneW = x1 - x0;
    var i, t, v, x, isEdge;

    // lane bed
    var bed = c.createLinearGradient(x0, 0, x1, 0);
    bed.addColorStop(0, "rgba(60,255,95,0.04)");
    bed.addColorStop(0.5, "rgba(60,255,95,0.10)");
    bed.addColorStop(1, "rgba(60,255,95,0.04)");
    c.fillStyle = bed;
    c.beginPath();
    var r = 3, by = laneY + 3, bh = LANE_H - 6;
    c.moveTo(x0 + r, by);
    c.lineTo(x1 - r, by); c.quadraticCurveTo(x1, by, x1, by + r);
    c.lineTo(x1, by + bh - r); c.quadraticCurveTo(x1, by + bh, x1 - r, by + bh);
    c.lineTo(x0 + r, by + bh); c.quadraticCurveTo(x0, by + bh, x0, by + bh - r);
    c.lineTo(x0, by + r); c.quadraticCurveTo(x0, by, x0 + r, by);
    c.closePath();
    c.fill();

    for (i = 0; i < n; i++) {
      t = i / (n - 1);
      v = cubicY(t);
      if (v < 0) v = 0; if (v > 1) v = 1;
      x = x0 + v * laneW;
      isEdge = (i === 0 || i === n - 1);
      c.fillStyle = isEdge ? "rgba(60,255,95,0.95)" : "rgba(60,255,95," + (0.28 + 0.45 * t).toFixed(3) + ")";
      c.fillRect(x - 0.6, laneY + 5, isEdge ? 1.8 : 1.2, LANE_H - 10);
    }
  }

  function strokeBezier(c, curve, color, width, w, h) {
    var gh = graphH(h);
    var a = toPx(0, 0, w, gh);
    var b = toPx(curve.x1, curve.y1, w, gh);
    var d = toPx(curve.x2, curve.y2, w, gh);
    var e = toPx(1, 1, w, gh);
    c.strokeStyle = color;
    c.lineWidth = width;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.bezierCurveTo(b.x, b.y, d.x, d.y, e.x, e.y);
    c.stroke();
  }

  // Shaded body under the curve, fading out as it falls to the 0 rail.
  function fillUnderCurve(c, w, h) {
    var gh = graphH(h);
    var a = toPx(0, 0, w, gh);
    var b = toPx(cp1.x, cp1.y, w, gh);
    var d = toPx(cp2.x, cp2.y, w, gh);
    var e = toPx(1, 1, w, gh);
    var floor = toPx(0, 0, w, gh).y;

    var g = c.createLinearGradient(0, e.y, 0, floor);
    g.addColorStop(0, "rgba(60,255,95,0.20)");
    g.addColorStop(0.55, "rgba(60,255,95,0.07)");
    g.addColorStop(1, "rgba(60,255,95,0.00)");

    c.fillStyle = g;
    c.beginPath();
    c.moveTo(a.x, floor);
    c.lineTo(a.x, a.y);
    c.bezierCurveTo(b.x, b.y, d.x, d.y, e.x, e.y);
    c.lineTo(e.x, floor);
    c.closePath();
    c.fill();
  }

  // Handle arms + their grips, and the two fixed anchors they pull against.
  function drawHandles(c, w, h) {
    var gh = graphH(h);
    var a = toPx(0, 0, w, gh);
    var b = toPx(cp1.x, cp1.y, w, gh);
    var d = toPx(cp2.x, cp2.y, w, gh);
    var e = toPx(1, 1, w, gh);

    // arms
    c.lineWidth = 1.1;
    c.strokeStyle = "rgba(120,255,170,0.42)";
    c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
    c.beginPath(); c.moveTo(e.x, e.y); c.lineTo(d.x, d.y); c.stroke();

    // grips — hollow rings so the arm stays visible through them
    var grips = [b, d];
    for (var i = 0; i < grips.length; i++) {
      c.beginPath();
      c.arc(grips[i].x, grips[i].y, 3.4, 0, Math.PI * 2);
      c.fillStyle = "rgba(8,18,12,0.92)";
      c.fill();
      c.lineWidth = 1.4;
      c.strokeStyle = "#5bffa0";
      c.stroke();
    }

    // anchors — solid, they never move
    var anchors = [a, e];
    for (i = 0; i < anchors.length; i++) {
      c.beginPath();
      c.arc(anchors[i].x, anchors[i].y, 2.6, 0, Math.PI * 2);
      c.fillStyle = "rgba(150,255,190,0.85)";
      c.fill();
    }
  }

  function drawAll() {
    if (!ctx || !canvas) return;
    graphBounds();
    var w = cssW || wrap.clientWidth;
    var h = cssH || wrap.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Ghost of the last applied curve, on its own layer behind everything.
    if (ctxLast && canvasLast) {
      ctxLast.clearRect(0, 0, w, h);
      if (lastCurve) strokeBezier(ctxLast, lastCurve, "rgba(255,255,255,0.18)", 1.4, w, h);
    }

    drawGrid(ctx, w, h);
    fillUnderCurve(ctx, w, h);
    drawHandles(ctx, w, h);

    // One narrow bloom pass for depth, then the real line on top. The old
    // 9px blur at 0.55 alpha was what turned the whole graph into a haze.
    var curve = { x1: cp1.x, y1: cp1.y, x2: cp2.x, y2: cp2.y };
    ctx.save();
    ctx.shadowColor = "rgba(60,255,95,0.32)";
    ctx.shadowBlur = 4;
    strokeBezier(ctx, curve, "rgba(60,255,95,0.55)", 2.2, w, h);
    ctx.restore();
    strokeBezier(ctx, curve, "#9dffc4", 1.5, w, h);

    drawMotionRuler(ctx, w, h);
  }

  // Dragging fires far faster than the panel can paint, so coalesce
  // redraws onto one frame instead of repainting per mousemove.
  var redrawRaf = 0;
  function scheduleDraw() {
    if (redrawRaf) return;
    redrawRaf = requestAnimationFrame(function () {
      redrawRaf = 0;
      drawAll();
      updateControlPointPositions();
    });
  }

  function updateControlPointPositions() {
    if (!canvas || !wrap) return;
    graphBounds();
    var w = wrap.clientWidth;
    // The grips are painted on the canvas now; these elements are the
    // invisible drag targets that sit exactly on top of them, so they
    // must use the same graph height the canvas does.
    var h = graphH(wrap.clientHeight);
    var p1 = toPx(cp1.x, cp1.y, w, h);
    var p2 = toPx(cp2.x, cp2.y, w, h);
    var el1 = document.getElementById("cp1");
    var el2 = document.getElementById("cp2");
    if (el1) {
      el1.style.left = (p1.x - 11) + "px";
      el1.style.top = (p1.y - 11) + "px";
    }
    if (el2) {
      el2.style.left = (p2.x - 11) + "px";
      el2.style.top = (p2.y - 11) + "px";
    }
  }

  function setupDragHandlers() {
    var el1 = document.getElementById("cp1");
    var el2 = document.getElementById("cp2");
    if (!el1 || !el2) return;

    function startDrag(e, point) {
      isDragging = point;
      if (wrap) wrap.classList.add("is-dragging");
      var el = document.getElementById(point);
      if (el) el.classList.add("is-dragging");
      e.preventDefault();
      e.stopPropagation();
    }

    // Which grip, if either, is under this point — in wrapper pixels.
    // A 22px target is small on a HiDPI panel, so grabbing anywhere
    // within this radius of a grip picks it up.
    var GRAB_RADIUS = 18;
    function gripAt(px, py) {
      if (!wrap) return null;
      graphBounds();
      var w = wrap.clientWidth, h = graphH(wrap.clientHeight);
      var a = toPx(cp1.x, cp1.y, w, h);
      var b = toPx(cp2.x, cp2.y, w, h);
      var da = Math.sqrt((px - a.x) * (px - a.x) + (py - a.y) * (py - a.y));
      var db = Math.sqrt((px - b.x) * (px - b.x) + (py - b.y) * (py - b.y));
      if (da > GRAB_RADIUS && db > GRAB_RADIUS) return null;
      return da <= db ? "cp1" : "cp2";
    }

    function pointer(e) {
      if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return { x: e.clientX, y: e.clientY };
    }

    function drag(e) {
      if (!isDragging || !wrap) return;
      if (e.cancelable) e.preventDefault();
      var rect = wrap.getBoundingClientRect();
      var pt = pointer(e);
      graphBounds();
      var uv = fromPx(pt.x - rect.left, pt.y - rect.top, wrap.clientWidth, graphH(wrap.clientHeight));
      uv.x = clamp(uv.x, 0, 1);
      uv.y = clamp(uv.y, -2, 2);
      if (isDragging === "cp1") {
        cp1.x = uv.x;
        cp1.y = uv.y;
      } else {
        cp2.x = uv.x;
        cp2.y = uv.y;
      }
      updateInputs();
      scheduleDraw();
    }

    function endDrag() {
      if (!isDragging) return;
      var el = document.getElementById(isDragging);
      if (el) el.classList.remove("is-dragging");
      if (wrap) wrap.classList.remove("is-dragging");
      isDragging = null;
    }

    el1.addEventListener("mousedown", function (e) { startDrag(e, "cp1"); });
    el2.addEventListener("mousedown", function (e) { startDrag(e, "cp2"); });
    el1.addEventListener("touchstart", function (e) { startDrag(e, "cp1"); }, { passive: false });
    el2.addEventListener("touchstart", function (e) { startDrag(e, "cp2"); }, { passive: false });

    // Pressing near a grip anywhere on the canvas grabs it too, so the
    // handles are not a pixel hunt.
    wrap.addEventListener("mousedown", function (e) {
      if (isDragging) return;
      var rect = wrap.getBoundingClientRect();
      var hit = gripAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) startDrag(e, hit);
    });
    wrap.addEventListener("touchstart", function (e) {
      if (isDragging || !e.touches || !e.touches[0]) return;
      var rect = wrap.getBoundingClientRect();
      var hit = gripAt(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
      if (hit) startDrag(e, hit);
    }, { passive: false });

    // Cursor feedback while just hovering the canvas.
    wrap.addEventListener("mousemove", function (e) {
      if (isDragging) return;
      var rect = wrap.getBoundingClientRect();
      wrap.classList.toggle("is-over-grip", !!gripAt(e.clientX - rect.left, e.clientY - rect.top));
    });
    wrap.addEventListener("mouseleave", function () { wrap.classList.remove("is-over-grip"); });

    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);
    document.addEventListener("touchcancel", endDrag);
    // A drag that ends outside the panel (or while the window loses focus)
    // would otherwise leave the handle stuck to the pointer.
    window.addEventListener("blur", endDrag);
  }

  function setupInputHandlers() {
    ["curveX1", "curveY1", "curveX2", "curveY2"].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener("change", syncFromInputs);
      input.addEventListener("input", syncFromInputs);
    });
  }

  function syncFromInputs() {
    var x1 = document.getElementById("curveX1");
    var y1 = document.getElementById("curveY1");
    var x2 = document.getElementById("curveX2");
    var y2 = document.getElementById("curveY2");
    if (!x1 || !y1 || !x2 || !y2) return;
    cp1.x = clamp(parseFloat(x1.value) || 0, 0, 1);
    cp1.y = clamp(parseFloat(y1.value) || 0, -2, 2);
    cp2.x = clamp(parseFloat(x2.value) || 0, 0, 1);
    cp2.y = clamp(parseFloat(y2.value) || 0, -2, 2);
    updateBezierChip();
    drawAll();
    updateControlPointPositions();
  }

  function updateInputs() {
    var x1 = document.getElementById("curveX1");
    var y1 = document.getElementById("curveY1");
    var x2 = document.getElementById("curveX2");
    var y2 = document.getElementById("curveY2");
    if (x1) x1.value = fmt(cp1.x);
    if (y1) y1.value = fmt(cp1.y);
    if (x2) x2.value = fmt(cp2.x);
    if (y2) y2.value = fmt(cp2.y);
    updateBezierChip();
  }

  function updateBezierChip() {
    var chip = document.getElementById("btnBezierValues");
    if (chip) chip.textContent = fmt(cp1.x) + ", " + fmt(cp1.y) + ", " + fmt(cp2.x) + ", " + fmt(cp2.y);
  }

  function setupButtonHandlers() {
    var readBtn = document.getElementById("btnReadCurve");
    var saveBtn = document.getElementById("btnSaveCurve");
    var applyBtn = document.getElementById("btnApplyCurve");
    var chip = document.getElementById("btnBezierValues");
    var libSel = document.getElementById("curveLibrarySelect");
    var newLib = document.getElementById("btnNewCurveLibrary");
    var delLib = document.getElementById("btnDeleteCurveLibrary");
    var impLib = document.getElementById("btnImportCurveLibrary");
    var expLib = document.getElementById("btnExportCurveLibrary");
    if (readBtn) readBtn.addEventListener("click", readFromKeyframe);
    if (saveBtn) saveBtn.addEventListener("click", savePreset);
    if (applyBtn) applyBtn.addEventListener("click", applyCurve);
    if (chip) chip.addEventListener("click", editBezierValues);
    if (libSel) {
      libSel.addEventListener("change", function () {
        activeLibId = libSel.value;
        persistLibraries();
        renderPresetGrid();
      });
    }
    if (newLib) newLib.addEventListener("click", createLibrary);
    if (delLib) delLib.addEventListener("click", deleteLibrary);
    if (impLib) impLib.addEventListener("click", importLibrary);
    if (expLib) expLib.addEventListener("click", exportLibrary);
  }

  /* ---- Library Import / Export (Flow v1.5.2 parity) ---- */
  function cepFs() {
    return (typeof window !== "undefined" && window.cep && window.cep.fs) ? window.cep.fs : null;
  }

  function sanitizeImportedCurves(arr) {
    if (!arr || !arr.length) return [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      if (!c) continue;
      var x1 = Number(c.x1), y1 = Number(c.y1), x2 = Number(c.x2), y2 = Number(c.y2);
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) continue;
      out.push({
        name: String(c.name || ("Curve " + (i + 1))),
        x1: clamp(x1, 0, 1), y1: clamp(y1, -2, 2),
        x2: clamp(x2, 0, 1), y2: clamp(y2, -2, 2)
      });
    }
    return out;
  }

  function importLibrary() {
    var fs = cepFs();
    if (!fs) { setStatus("Import needs CEP file access.", true); return; }
    try {
      var r = fs.showOpenDialogEx
        ? fs.showOpenDialogEx(false, false, "Import curve library", "", ["json"], null, false)
        : fs.showOpenDialog(false, false, "Import curve library", "", ["json"]);
      if (!r || r.err !== 0 || !r.data || !r.data.length) return;
      var filePath = r.data[0];
      var fc = fs.readFile(filePath, "utf-8");
      if (fc.err !== 0) { setStatus("Could not read file.", true); return; }
      var parsed;
      try { parsed = JSON.parse(fc.data); } catch (pe) { setStatus("Invalid JSON.", true); return; }
      // Accept either a single library { name, curves:[] } or { libraries:[ {name,curves}, ... ] } or raw array
      var libs = [];
      if (parsed && parsed.libraries && parsed.libraries.length) {
        for (var i = 0; i < parsed.libraries.length; i++) {
          libs.push({
            name: String(parsed.libraries[i].name || "Imported"),
            curves: sanitizeImportedCurves(parsed.libraries[i].curves)
          });
        }
      } else if (parsed && parsed.curves) {
        libs.push({ name: String(parsed.name || "Imported"), curves: sanitizeImportedCurves(parsed.curves) });
      } else if (parsed && parsed.length) {
        libs.push({ name: "Imported", curves: sanitizeImportedCurves(parsed) });
      }
      if (!libs.length) { setStatus("No curves found in file.", true); return; }
      var added = 0;
      for (var j = 0; j < libs.length; j++) {
        if (!libs[j].curves.length) continue;
        var id = "lib-" + Date.now() + "-" + j;
        libraries.push({ id: id, name: libs[j].name, locked: false, curves: libs[j].curves });
        activeLibId = id;
        added++;
      }
      if (!added) { setStatus("No valid curves in that file.", true); return; }
      persistLibraries();
      renderLibrarySelect();
      renderPresetGrid();
      setStatus("Imported " + added + " librar" + (added === 1 ? "y" : "ies") + ".", false, true);
    } catch (e) {
      setStatus("Import failed: " + e, true);
    }
  }

  function exportLibrary() {
    var fs = cepFs();
    if (!fs) { setStatus("Export needs CEP file access.", true); return; }
    var lib = activeLibrary();
    if (!lib || !lib.curves || !lib.curves.length) {
      setStatus("Current library is empty — nothing to export.", true);
      return;
    }
    try {
      var defaultName = (lib.name || "library").replace(/[^A-Za-z0-9_\- ]+/g, "_") + ".json";
      var r = fs.showSaveDialogEx
        ? fs.showSaveDialogEx("Export curve library", "", ["json"], defaultName, null, false)
        : fs.showSaveDialog("Export curve library", "", ["json"], defaultName);
      if (!r || r.err !== 0 || !r.data) return;
      var destPath = r.data;
      if (destPath.toLowerCase().indexOf(".json") < 0) destPath += ".json";
      var payload = {
        format: "orbit-curve-library",
        version: 1,
        name: lib.name,
        exportedAt: new Date().toISOString(),
        curves: lib.curves
      };
      var w = fs.writeFile(destPath, JSON.stringify(payload, null, 2));
      if (w.err !== 0) { setStatus("Could not write file.", true); return; }
      setStatus("Exported “" + lib.name + "” (" + lib.curves.length + " curves).", false, true);
    } catch (e) {
      setStatus("Export failed: " + e, true);
    }
  }

  function editBezierValues() {
    var current = fmt(cp1.x) + ", " + fmt(cp1.y) + ", " + fmt(cp2.x) + ", " + fmt(cp2.y);
    var next = window.prompt("cubic-bezier(x1, y1, x2, y2)", current);
    if (!next) return;
    var parts = next.split(/[,\s]+/).map(parseFloat).filter(function (n) { return !isNaN(n); });
    if (parts.length < 4) {
      setStatus("Need four numbers: x1, y1, x2, y2", true);
      return;
    }
    setCurve(parts[0], parts[1], parts[2], parts[3]);
  }

  function setCurve(x1, y1, x2, y2) {
    cp1.x = clamp(x1, 0, 1);
    cp1.y = clamp(y1, -2, 2);
    cp2.x = clamp(x2, 0, 1);
    cp2.y = clamp(y2, -2, 2);
    updateInputs();
    drawAll();
    updateControlPointPositions();
    renderPresetGrid();
  }

  function directionValue() {
    var el = document.querySelector('input[name="easeDirection"]:checked');
    return el ? String(el.value) : "0";
  }

  function applyCurve() {
    var payload = {
      x1: cp1.x,
      y1: cp1.y,
      x2: cp2.x,
      y2: cp2.y,
      direction: directionValue()
    };
    setStatus("Applying curve to selected keys…");
    hostCall("ae_applyBezierCurve", payload, function (res) {
      var ok = !!(res && (res.ok || res.success));
      if (ok) {
        lastCurve = { x1: cp1.x, y1: cp1.y, x2: cp2.x, y2: cp2.y };
        drawAll();
        playPreview();
        setStatus(res.message || "Curve applied.", false, true);
      } else {
        setStatus((res && res.message) || "Could not apply curve.", true);
      }
    });
  }

  function readFromKeyframe() {
    setStatus("Reading easing from selected keys…");
    hostCall("ae_readBezierCurve", {}, function (res) {
      var ok = !!(res && (res.ok || res.success));
      if (!ok) {
        setStatus((res && res.message) || "Could not read selected keys.", true);
        return;
      }
      setCurve(Number(res.x1), Number(res.y1), Number(res.x2), Number(res.y2));
      setStatus(res.message || "Curve loaded from selected keys.", false, true);
    });
  }

  function activeLibrary() {
    var i;
    for (i = 0; i < libraries.length; i++) {
      if (libraries[i].id === activeLibId) return libraries[i];
    }
    return libraries[0];
  }

  function loadLibraries() {
    libraries = [
      { id: DEFAULT_LIB_ID, name: "Default", locked: true, curves: DEFAULT_CURVES.slice() },
      { id: USER_LIB_ID, name: "Mine", locked: false, curves: [] }
    ];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && saved.activeId) activeLibId = saved.activeId;
      if (saved && saved.libraries && saved.libraries.length) {
        saved.libraries.forEach(function (lib) {
          if (!lib || lib.id === DEFAULT_LIB_ID) return;
          if (lib.id === USER_LIB_ID) {
            libraries[1].curves = lib.curves || [];
            return;
          }
          libraries.push({
            id: lib.id,
            name: lib.name || "Library",
            locked: false,
            curves: lib.curves || []
          });
        });
      }
    } catch (err) { /* sandboxed storage */ }
  }

  function persistLibraries() {
    try {
      var extra = libraries.filter(function (lib) { return lib.id !== DEFAULT_LIB_ID; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeId: activeLibId, libraries: extra }));
    } catch (err) { /* sandboxed storage */ }
  }

  function renderLibrarySelect() {
    var sel = document.getElementById("curveLibrarySelect");
    if (!sel) return;
    sel.innerHTML = libraries.map(function (lib) {
      return '<option value="' + lib.id + '"' + (lib.id === activeLibId ? " selected" : "") + ">" + lib.name + "</option>";
    }).join("");
  }

  function createLibrary() {
    var name = (window.prompt && window.prompt("Library name", "Library " + libraries.length)) || "";
    name = name.trim();
    if (!name) return;
    var id = "lib-" + Date.now();
    libraries.push({ id: id, name: name, locked: false, curves: [] });
    activeLibId = id;
    persistLibraries();
    renderLibrarySelect();
    renderPresetGrid();
    setStatus("Created library “" + name + "”.", false, true);
  }

  function deleteLibrary() {
    var lib = activeLibrary();
    if (!lib || lib.locked || lib.id === USER_LIB_ID) {
      setStatus("The Default and Mine libraries cannot be deleted.", true);
      return;
    }
    libraries = libraries.filter(function (item) { return item.id !== lib.id; });
    activeLibId = USER_LIB_ID;
    persistLibraries();
    renderLibrarySelect();
    renderPresetGrid();
    setStatus("Library deleted.");
  }

  function savePreset() {
    var lib = activeLibrary();
    if (!lib || lib.locked) {
      activeLibId = USER_LIB_ID;
      lib = activeLibrary();
      renderLibrarySelect();
    }
    var name = (window.prompt && window.prompt("Preset name", "Curve " + ((lib.curves.length || 0) + 1))) || "";
    name = name.trim();
    if (!name) return;
    lib.curves.push({ name: name, x1: cp1.x, y1: cp1.y, x2: cp2.x, y2: cp2.y });
    persistLibraries();
    renderPresetGrid();
    setStatus("Saved “" + name + "” to " + lib.name + ".", false, true);
  }

  function miniPath(curve) {
    var i, d = "", x, y, t, mt, bx, by;
    for (i = 0; i <= 16; i++) {
      t = i / 16;
      mt = 1 - t;
      bx = 3 * mt * mt * t * curve.x1 + 3 * mt * t * t * curve.x2 + t * t * t;
      by = 3 * mt * mt * t * curve.y1 + 3 * mt * t * t * curve.y2 + t * t * t;
      x = 3 + bx * 34;
      y = 21 - clamp(by, -0.25, 1.25) / 1.5 * 18;
      d += (i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1);
    }
    return d;
  }

  function renderPresetGrid() {
    var grid = document.getElementById("curvePresetGrid");
    if (!grid) return;
    var lib = activeLibrary();
    var curves = (lib && lib.curves) || [];
    if (!curves.length) {
      grid.innerHTML = '<div class="curve-lib-empty">Save a curve to this library.</div>';
      return;
    }
    grid.innerHTML = curves.map(function (curve, idx) {
      var selected = Math.abs(curve.x1 - cp1.x) < 0.001 && Math.abs(curve.y1 - cp1.y) < 0.001 &&
        Math.abs(curve.x2 - cp2.x) < 0.001 && Math.abs(curve.y2 - cp2.y) < 0.001;
      var del = lib.locked ? "" : '<button type="button" class="curve-preset-del" data-del="' + idx + '" title="Delete">×</button>';
      return '<div class="curve-preset-item' + (selected ? " active" : "") + '" data-idx="' + idx + '">' +
        '<svg viewBox="0 0 40 24" class="curve-preset-mini"><path d="' + miniPath(curve) + '"/></svg>' +
        '<span>' + curve.name + "</span>" + del +
        "</div>";
    }).join("");
    grid.querySelectorAll(".curve-preset-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute("data-del") != null) return;
        var curve = curves[parseInt(item.getAttribute("data-idx"), 10)];
        if (curve) setCurve(curve.x1, curve.y1, curve.x2, curve.y2);
      });
      item.addEventListener("dblclick", function () {
        var curve = curves[parseInt(item.getAttribute("data-idx"), 10)];
        if (!curve) return;
        setCurve(curve.x1, curve.y1, curve.x2, curve.y2);
        applyCurve();
      });
    });
    grid.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(btn.getAttribute("data-del"), 10);
        lib.curves.splice(idx, 1);
        persistLibraries();
        renderPresetGrid();
      });
    });
  }

  function cubicY(t) {
    var mt = 1 - t;
    return 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t;
  }

  function playPreview() {
    var dot = document.getElementById("curvePreviewDot");
    if (!dot || !wrap) return;
    if (previewRaf) cancelAnimationFrame(previewRaf);
    dot.hidden = false;
    var start = (window.performance && performance.now) ? performance.now() : Date.now();
    function frame(now) {
      var t = ((now - start) % 1400) / 1400;
      var uv = toPx(t, cubicY(t), cssW || wrap.clientWidth, graphH(cssH || wrap.clientHeight));
      dot.style.left = (uv.x - 4) + "px";
      dot.style.top = (uv.y - 4) + "px";
      if (now - start < 1400) previewRaf = requestAnimationFrame(frame);
      else {
        previewRaf = 0;
        dot.hidden = true;
      }
    }
    previewRaf = requestAnimationFrame(frame);
  }

  function setStatus(message, isError, isSuccess) {
    var status = document.getElementById("curveStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (isError) status.classList.add("is-error");
    if (isSuccess) status.classList.add("is-success");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.OrbitCurveLab = {
    applyCurve: applyCurve,
    readFromKeyframe: readFromKeyframe,
    setCurve: setCurve
  };
})();
