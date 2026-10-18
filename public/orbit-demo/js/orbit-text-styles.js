/* ============================================================
   ORBIT TEXT STYLE PRESETS  (Animation tab → TEXT STYLE sub-tab)

   One-click "looks" for text layers: sticker outline, hard 3D
   extrude, gradient fill, gloss, duo tone, neon, grunge print,
   long shadow, letterpress, chrome, soft shadow.

   These are static treatments, not motion. They sit next to the
   existing TEXT ANIMATION STYLES card so a user can pick a look
   here and a motion there, and stack both on the same layer.

   Host side (jsx/hostscript.jsx):
     ae_applyTextStyle(payloadJson)   payload = {id, colorA, colorB, replace, demoText}
     ae_clearTextStyle()

   Each card's thumbnail is rendered with real CSS using the two
   chosen colours, so the preview changes the moment the user picks
   a colour — what they see is what the Layer Styles will produce.

   This file loads before main.js, so the host bridge is resolved
   lazily at click time rather than captured at load.
   ============================================================ */
(function () {
  "use strict";

  var STORE = "compXTextStyle.";
  var DEF_A = "#ffc720";
  var DEF_B = "#12131a";
  var DEF_TEXT = "ORBIT";

  // id must match the branches in compxTsBuild() on the host side.
  var STYLES = [
    { id: "sticker", name: "Sticker", hint: "Thick white outline plus a hard offset shadow — the classic cut-out sticker look." },
    { id: "pop3d", name: "3D Pop", hint: "Dark keyline and a solid extrude in your second colour, no blur." },
    { id: "gradient", name: "Gradient Fill", hint: "Vertical gradient between both colours, held inside the glyphs." },
    { id: "gloss", name: "Gradient Gloss", hint: "Gradient fill with an inner bevel highlight across the top." },
    { id: "duotone", name: "Duo Tone", hint: "White inner outline with a tight second-colour ring around it." },
    { id: "outline", name: "Outline Only", hint: "Fill dropped to zero, centred stroke left behind." },
    { id: "double", name: "Double Outline", hint: "Dark keyline, then a wider coloured ring, then a soft shadow." },
    { id: "neon", name: "Neon Glow", hint: "Bright core with an outer bloom and an inner rim light." },
    { id: "grunge", name: "Grunge Print", hint: "Noisy offset shadow and an inverted satin pass for print texture." },
    { id: "longshadow", name: "Long Shadow", hint: "One very long hard shadow at 45°, flat-design style." },
    { id: "letterpress", name: "Letterpress", hint: "Pressed-in inner shadow with a light lip underneath." },
    { id: "chrome", name: "Chrome", hint: "Silver gradient, hard chisel bevel and a satin sweep." },
    { id: "softcard", name: "Soft Shadow", hint: "Wide, low-opacity shadow — readable text over busy footage." }
  ];

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(STORE + key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(STORE + key, String(value)); } catch (e) { /* sandboxed storage */ }
  }

  // "#ffc720" -> [1, 0.78, 0.125] for setValue on an AE colour property.
  function hexToUnit(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (h.length !== 6) return [1, 1, 1];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [1, 1, 1];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function mixHex(hex, towards, t) {
    var a = hexToUnit(hex), b = hexToUnit(towards);
    var out = "#";
    for (var i = 0; i < 3; i++) {
      var v = Math.round((a[i] + (b[i] - a[i]) * t) * 255);
      if (v < 0) v = 0; if (v > 255) v = 255;
      out += (v < 16 ? "0" : "") + v.toString(16);
    }
    return out;
  }

  function lum(hex) {
    var c = hexToUnit(hex);
    return c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
  }

  // Long hard shadow built as a chain of 1px steps.
  function shadowRamp(color, steps) {
    var parts = [];
    for (var i = 1; i <= steps; i++) parts.push(i + "px " + i + "px 0 " + color);
    return parts.join(", ");
  }

  // The CSS that stands in for each set of Layer Styles. Kept in one
  // place so the thumbnail and the tooltip never drift apart.
  function previewCss(id, a, b) {
    var ink = lum(a) < 0.45 ? "#ffffff" : "#0f1014";
    var css = { color: a, background: "none", webkitTextFillColor: "" };

    if (id === "sticker") {
      css.webkitTextStroke = "7px #ffffff";
      css.paintOrder = "stroke fill";
      css.textShadow = "6px 6px 0 #0a0b10";
    } else if (id === "pop3d") {
      css.webkitTextStroke = "3px " + ink;
      css.paintOrder = "stroke fill";
      css.textShadow = shadowRamp(b, 9);
    } else if (id === "gradient") {
      css.background = "linear-gradient(180deg, " + a + ", " + b + ")";
      css.webkitTextFillColor = "transparent";
      css.textShadow = "none";
      css.filter = "drop-shadow(3px 4px 3px rgba(0,0,0,.5))";
    } else if (id === "gloss") {
      css.background = "linear-gradient(180deg, " + mixHex(a, "#ffffff", 0.55) + " 0%, " + a + " 48%, " + mixHex(a, "#000000", 0.35) + " 100%)";
      css.webkitTextFillColor = "transparent";
      css.filter = "drop-shadow(0 2px 0 rgba(255,255,255,.55))";
    } else if (id === "duotone") {
      css.webkitTextStroke = "3px #ffffff";
      css.paintOrder = "stroke fill";
      css.textShadow = "0 0 0 " + b + ", 0 0 7px " + b + ", 0 0 7px " + b;
    } else if (id === "outline") {
      css.webkitTextStroke = "2.5px " + a;
      css.webkitTextFillColor = "transparent";
    } else if (id === "double") {
      css.webkitTextStroke = "3px " + ink;
      css.paintOrder = "stroke fill";
      css.textShadow = "0 0 8px " + b + ", 0 0 8px " + b + ", 4px 5px 4px rgba(0,0,0,.45)";
    } else if (id === "neon") {
      css.color = mixHex(a, "#ffffff", 0.6);
      css.textShadow = "0 0 4px #fff, 0 0 12px " + a + ", 0 0 26px " + a + ", 0 0 44px " + a;
    } else if (id === "grunge") {
      css.textShadow = "3px 3px 2px " + b + ", -1px 1px 0 rgba(0,0,0,.35)";
      css.filter = "contrast(1.25) saturate(1.1)";
    } else if (id === "longshadow") {
      css.textShadow = shadowRamp(b, 26);
    } else if (id === "letterpress") {
      css.textShadow = "0 -1px 1px rgba(0,0,0,.75), 0 2px 1px rgba(255,255,255,.5)";
    } else if (id === "chrome") {
      css.background = "linear-gradient(180deg,#ffffff 0%,#c9d2de 38%,#6f7d90 52%,#e8eef6 66%,#8e9aab 100%)";
      css.webkitTextFillColor = "transparent";
      css.filter = "drop-shadow(0 2px 1px rgba(0,0,0,.6))";
    } else if (id === "softcard") {
      css.textShadow = "0 6px 18px " + b + ", 0 2px 4px rgba(0,0,0,.4)";
    }
    return css;
  }

  function paintSample(el, id, a, b) {
    var css = previewCss(id, a, b);
    el.style.cssText = "";
    el.style.color = css.color || a;
    el.style.textShadow = css.textShadow || "none";
    el.style.filter = css.filter || "none";
    el.style.webkitTextStroke = css.webkitTextStroke || "0";
    el.style.paintOrder = css.paintOrder || "normal";
    if (css.background && css.background !== "none") {
      el.style.backgroundImage = css.background;
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
    } else {
      el.style.backgroundImage = "none";
      el.style.webkitBackgroundClip = "border-box";
      el.style.backgroundClip = "border-box";
    }
    el.style.webkitTextFillColor = css.webkitTextFillColor || "currentColor";
  }

  function bridge() {
    var host = window.CompXHostBridge;
    return host && typeof host.call === "function" ? host : null;
  }

  function argOf(value) {
    var host = window.CompXHostBridge;
    if (host && typeof host.arg === "function") return host.arg(value);
    return '"' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  function init() {
    // The Animation tab's "styles" sub-panel; the motion card already lives there.
    // Its own sub-tab: PREMIUM STYLES stays exactly as it was.
    var mount = document.querySelector('[data-text-library-panel="textstyle"]');
    if (!mount || mount.querySelector(".ots-shell")) return;

    var colorA = read("colorA", DEF_A);
    var colorB = read("colorB", DEF_B);
    var sampleText = read("sample", DEF_TEXT);
    var replace = read("replace", "1") === "1";
    var busy = false;

    var card = document.createElement("div");
    card.className = "tool-section ots-shell";
    card.innerHTML =
      '<div class="tool-section-head">' +
        '<div>' +
          '<div class="tool-section-title">TEXT STYLE PRESETS</div>' +
          '<div class="ots-sub">Static looks built from After Effects Layer Styles — stack them under any animation</div>' +
        '</div>' +
        '<span class="tool-help" title="Pick two colours, then click a look. It is applied to every selected text layer using real Layer Styles and a Fill effect, so you can keep editing it by hand in the Timeline afterwards. With nothing selected, a demo text layer is created.">?</span>' +
      '</div>' +
      '<div class="ots-bar">' +
        '<label class="ots-swatch"><span>MAIN</span><input id="otsColorA" type="color"/></label>' +
        '<label class="ots-swatch"><span>ACCENT</span><input id="otsColorB" type="color"/></label>' +
        '<button class="ots-mini" id="otsSwap" type="button" title="Swap the two colours">&#8646;</button>' +
        '<input class="counter-input ots-text" id="otsSample" maxlength="18" placeholder="Preview text" type="text"/>' +
      '</div>' +
      '<div class="ots-bar ots-bar-2">' +
        '<label class="ots-check"><input id="otsReplace" type="checkbox"/><span>Replace existing styles</span></label>' +
        '<button class="ots-mini ots-clear" id="otsClear" type="button">CLEAR STYLES</button>' +
      '</div>' +
      '<div class="ots-grid" id="otsGrid"></div>' +
      '<div class="ots-status" id="otsStatus">Select a text layer, then click a look.</div>';
    mount.appendChild(card);

    var inA = card.querySelector("#otsColorA");
    var inB = card.querySelector("#otsColorB");
    var inSample = card.querySelector("#otsSample");
    var inReplace = card.querySelector("#otsReplace");
    var grid = card.querySelector("#otsGrid");
    var status = card.querySelector("#otsStatus");

    inA.value = colorA;
    inB.value = colorB;
    inSample.value = sampleText;
    inReplace.checked = replace;

    function say(msg, kind) {
      status.textContent = msg;
      status.className = "ots-status" + (kind ? " is-" + kind : "");
    }

    var samples = [];
    for (var i = 0; i < STYLES.length; i++) {
      var s = STYLES[i];
      var item = document.createElement("button");
      item.type = "button";
      item.className = "ots-item";
      item.setAttribute("data-ots-style", s.id);
      item.title = s.hint;
      var sample = document.createElement("span");
      sample.className = "ots-sample";
      sample.textContent = sampleText || DEF_TEXT;
      var label = document.createElement("span");
      label.className = "ots-label";
      label.textContent = s.name;
      item.appendChild(sample);
      item.appendChild(label);
      grid.appendChild(item);
      samples.push({ el: sample, id: s.id });
    }

    function repaint() {
      var a = inA.value || DEF_A;
      var b = inB.value || DEF_B;
      var txt = inSample.value || DEF_TEXT;
      for (var i = 0; i < samples.length; i++) {
        samples[i].el.textContent = txt;
        paintSample(samples[i].el, samples[i].id, a, b);
      }
    }

    function onColour() {
      write("colorA", inA.value);
      write("colorB", inB.value);
      repaint();
    }

    inA.addEventListener("input", onColour);
    inB.addEventListener("input", onColour);
    inSample.addEventListener("input", function () {
      write("sample", inSample.value);
      repaint();
    });
    inReplace.addEventListener("change", function () {
      write("replace", inReplace.checked ? "1" : "0");
    });
    card.querySelector("#otsSwap").addEventListener("click", function () {
      var t = inA.value;
      inA.value = inB.value;
      inB.value = t;
      onColour();
    });

    function run(code, working, done) {
      if (busy) return;
      var host = bridge();
      if (!host) {
        say("After Effects is not connected yet.", "error");
        return;
      }
      busy = true;
      card.classList.add("is-busy");
      say(working);
      host.call(code, function (parsed) {
        busy = false;
        card.classList.remove("is-busy");
        if (parsed && parsed.success) say(parsed.message || "Done", "ok");
        else say((parsed && (parsed.message || parsed.detail)) || "That did not work.", "error");
        if (done) done(parsed);
      });
    }

    grid.addEventListener("click", function (ev) {
      var btn = ev.target;
      while (btn && btn !== grid && !btn.getAttribute("data-ots-style")) btn = btn.parentNode;
      if (!btn || btn === grid) return;
      var id = btn.getAttribute("data-ots-style");
      var name = "";
      for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === id) name = STYLES[i].name;

      var all = grid.querySelectorAll(".ots-item");
      for (var j = 0; j < all.length; j++) all[j].classList.remove("is-active");
      btn.classList.add("is-active");

      var payload = {
        id: id,
        colorA: hexToUnit(inA.value || DEF_A),
        colorB: hexToUnit(inB.value || DEF_B),
        replace: !!inReplace.checked,
        demoText: inSample.value || DEF_TEXT
      };
      run("ae_applyTextStyle(" + argOf(JSON.stringify(payload)) + ")", "Applying " + name + "…");
    });

    card.querySelector("#otsClear").addEventListener("click", function () {
      var all = grid.querySelectorAll(".ots-item");
      for (var j = 0; j < all.length; j++) all[j].classList.remove("is-active");
      run("ae_clearTextStyle()", "Clearing…");
    });

    repaint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // The Animation tab's sub-panels are built by main.js after the licence
  // gate, so retry once the rest of the panel has settled.
  setTimeout(init, 1200);
  setTimeout(init, 4000);
})();
