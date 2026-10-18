/* ============================================================
   AUDIO VISUALIZER — AE Audio Spectrum / Waveform on a solid
   ============================================================ */
(function () {
  "use strict";

  var vizType = "waveform";
  var busy = false;
  var cs = null;
  try { cs = new CSInterface(); } catch (e) { cs = null; }

  function el(id) { return document.getElementById(id); }

  function setStatus(message, isError, isSuccess) {
    var status = el("vizStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (isError) status.classList.add("is-error");
    if (isSuccess) status.classList.add("is-success");
  }

  function parseHostResult(raw) {
    var text = String(raw == null ? "" : raw);
    if (!text || text === "undefined" || text === "EvalScript error.") {
      return { success: false, message: "After Effects did not answer." };
    }
    try {
      var parsed = JSON.parse(text);
      if (typeof parsed.success !== "boolean" && typeof parsed.ok === "boolean") {
        parsed.success = parsed.ok;
      }
      return parsed;
    } catch (e) {
      return { success: false, message: text };
    }
  }

  function hexToRgb(hex) {
    hex = String(hex || "#a855f7").replace("#", "");
    if (hex.length === 3) hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
    var n = parseInt(hex, 16);
    if (!isFinite(n)) n = 0xa855f7;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function drawPreview() {
    var canvas = el("vizPreviewDraw");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var bars = parseInt(el("vizBarsCount") && el("vizBarsCount").value, 10) || 32;
    var gap = parseInt(el("vizGap") && el("vizGap").value, 10) || 4;
    var mirror = !!(el("vizMirror") && el("vizMirror").checked);
    var rgb = hexToRgb(el("vizColor") && el("vizColor").value);
    var useGradient = !!(el("vizGradient") && el("vizGradient").checked);
    ctx.fillStyle = "#0e1014";
    ctx.fillRect(0, 0, w, h);
    var usable = w - 16;
    var barW = Math.max(1, (usable - gap * (bars - 1)) / bars);
    var i;
    var mid = mirror ? h / 2 : h - 12;
    for (i = 0; i < bars; i++) {
      var amp = 0.25 + 0.7 * Math.abs(Math.sin(i * 0.45 + 0.8));
      if (vizType === "waveform") amp = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(i * 0.35));
      var bh = Math.max(4, (mirror ? h * 0.38 : h * 0.7) * amp);
      var x = 8 + i * (barW + gap);
      var y = mid - bh;
      if (useGradient) {
        var g = ctx.createLinearGradient(0, y, 0, y + (mirror ? bh * 2 : bh));
        g.addColorStop(0, "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")");
        g.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0.25)");
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
      }
      ctx.fillRect(x, y, barW, bh);
      if (mirror) ctx.fillRect(x, mid, barW, bh);
    }
  }

  function generateVisualizer() {
    if (busy) return;
    var barsCount = parseInt(el("vizBarsCount").value, 10) || 32;
    var maxHeight = parseInt(el("vizMaxHeight").value, 10) || 200;
    var barWidth = parseInt(el("vizBarWidth").value, 10) || 8;
    var gap = parseInt(el("vizGap").value, 10) || 4;
    var color = el("vizColor").value || "#a855f7";
    var useGradient = !!(el("vizGradient") && el("vizGradient").checked);
    var mirror = !!(el("vizMirror") && el("vizMirror").checked);

    drawPreview();
    if (!cs) {
      setStatus("Preview only — open this panel in After Effects to build the effect.", true);
      return;
    }

    busy = true;
    var button = el("btnVizGenerate");
    if (button) { button.disabled = true; button.textContent = "Building…"; }
    setStatus("Building visualizer…");

    cs.evalScript("ae_generateAudioVisualizer(" + JSON.stringify(JSON.stringify({
      type: vizType,
      barsCount: barsCount,
      maxHeight: maxHeight,
      barWidth: barWidth,
      gap: gap,
      color: color,
      useGradient: useGradient,
      mirror: mirror
    })) + ")", function (raw) {
      busy = false;
      if (button) { button.disabled = false; button.textContent = "Build visualizer"; }
      var result = parseHostResult(raw);
      setStatus(result.message || (result.success ? "Visualizer built." : "Build failed."), !result.success, !!result.success);
    });
  }

  function init() {
    if (!el("vizBarsCount")) return;
    var radios = document.querySelectorAll('input[name="vizType"]');
    var i;
    for (i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", function () {
        vizType = this.value;
        drawPreview();
        setStatus("Switched to " + vizType + " — select an audio layer, then build.");
      });
    }
    var live = ["vizBarsCount", "vizMaxHeight", "vizBarWidth", "vizGap", "vizColor", "vizGradient", "vizMirror"];
    for (i = 0; i < live.length; i++) {
      var node = el(live[i]);
      if (!node) continue;
      node.addEventListener("input", drawPreview);
      node.addEventListener("change", drawPreview);
    }
    el("btnVizGenerate").addEventListener("click", generateVisualizer);
    drawPreview();
    setStatus("Select an audio layer first");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
