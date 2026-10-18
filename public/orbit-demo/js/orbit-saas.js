/* ============================================================
   ORBIT SaaS TAB — modal wiring

   The four SaaS tools (UI Kit, UI Stagger, Wipe Reveal, Figma
   Bridge) each had a trigger button and a fully built modal, but
   nothing in the codebase ever connected the two: no file
   referenced uiKitModal, uiStaggerModal, wipeRevealModal or
   figmaBridgeModal. Clicking any of those buttons did nothing at
   all. The controls *inside* the modals were wired — Wipe Reveal's
   build button, the proximity hover fields, the stagger rig, the
   Figma receive button all call the host correctly — they were
   simply unreachable.

   This module supplies the missing half, following the same shape
   the Number Counter modal uses in main.js: open on the trigger,
   close on the × / backdrop / Escape, keep focus inside while open
   and hand it back to the trigger on close.

   It also wires the tab's own three tools:

     ae_saasGlass(payload)        frosted panel rig
     ae_saasGradientBg(payload)   recolourable comp background
     ae_saasAttachLayer(kind)     null / solid / adjustment, sized
                                  to the selection and parented to it
     ae_saasTyping(payload)       typewriter / coloured / random letters
     ae_saasTextReveal(payload)   per-character or per-word reveal
     ae_saasReveal(payload)       blur in / clip up / mask wipe
   ============================================================ */
(function () {
  "use strict";

  var MODALS = [
    { modal: "uiKitModal", trigger: "btnUiKitOpen", close: "btnUiKitClose", focus: "hovRadius" },
    { modal: "uiStaggerModal", trigger: "btnUiStaggerOpen", close: "btnUiStaggerClose", focus: null },
    { modal: "wipeRevealModal", trigger: "btnWipeRevealOpen", close: "btnWipeRevealClose", focus: "wipeStyle" },
    { modal: "figmaBridgeModal", trigger: "btnFigmaBridgeOpen", close: "btnFigmaBridgeClose", focus: null }
  ];

  function byId(id) { return id ? document.getElementById(id) : null; }

  function focusables(root) {
    var all = root.querySelectorAll("button, input, select, textarea, [tabindex]");
    var out = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.disabled) continue;
      if (el.tabIndex < 0) continue;
      if (!el.getClientRects().length) continue;
      out.push(el);
    }
    return out;
  }

  function wire(spec) {
    var modal = byId(spec.modal);
    var trigger = byId(spec.trigger);
    var close = byId(spec.close);
    if (!modal || !trigger) return false;
    if (modal.getAttribute("data-saas-wired") === "1") return true;
    modal.setAttribute("data-saas-wired", "1");

    function hide() {
      modal.style.display = "none";
      trigger.setAttribute("aria-expanded", "false");
      try { trigger.focus(); } catch (e) { /* trigger may have been re-rendered */ }
    }

    function show() {
      modal.style.display = "flex";
      trigger.setAttribute("aria-expanded", "true");
      var first = byId(spec.focus) || focusables(modal)[0];
      if (first) { try { first.focus(); } catch (e) { /* not focusable yet */ } }
    }

    trigger.addEventListener("click", show);
    if (close) close.addEventListener("click", hide);

    // Clicking the dimmed area outside the box closes it.
    modal.addEventListener("click", function (ev) {
      if (ev.target === modal) hide();
    });

    // Escape closes; Tab is trapped so focus cannot wander behind the modal.
    modal.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") {
        ev.preventDefault();
        ev.stopPropagation();
        hide();
        return;
      }
      if (ev.key !== "Tab") return;
      var list = focusables(modal);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault();
        first.focus();
      }
    });

    return true;
  }

  /* ---------------- the tab's own tools ---------------- */

  function bridge() {
    var host = window.CompXHostBridge;
    return host && typeof host.call === "function" ? host : null;
  }

  function argOf(value) {
    var host = window.CompXHostBridge;
    if (host && typeof host.arg === "function") return host.arg(value);
    return '"' + String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }

  // "#1c42f5" -> [0.109, 0.258, 0.960] for an AE colour property.
  function hexToUnit(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    if (h.length !== 6) return [1, 1, 1];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [1, 1, 1];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function numOf(id, fallback) {
    var el = byId(id);
    var v = el ? Number(el.value) : NaN;
    return isFinite(v) ? v : fallback;
  }

  function hexOf(id, fallback) {
    var el = byId(id);
    return (el && el.value) ? el.value : fallback;
  }

  var busy = false;

  function say(msg, kind) {
    var el = byId("saasStatus");
    if (!el) return;
    el.textContent = msg;
    el.className = "saas-status" + (kind ? " is-" + kind : "");
  }

  function run(code, working) {
    if (busy) return;
    var host = bridge();
    if (!host) { say("After Effects is not connected yet.", "error"); return; }
    busy = true;
    say(working);
    host.call(code, function (parsed) {
      busy = false;
      if (parsed && parsed.success) say(parsed.message || "Done", "ok");
      else say((parsed && (parsed.message || parsed.detail)) || "That did not work.", "error");
    });
  }

  function wireTools() {
    var panel = byId("panel-saas");
    if (!panel || panel.getAttribute("data-saas-tools") === "1") return;
    panel.setAttribute("data-saas-tools", "1");

    var glass = byId("btnSaasGlass");
    if (glass) {
      glass.addEventListener("click", function () {
        run("ae_saasGlass(" + argOf(JSON.stringify({
          blur: numOf("glassBlur", 26),
          tint: numOf("glassTint", 14),
          border: numOf("glassBorder", 45),
          shadow: numOf("glassShadow", 42)
        })) + ")", "Building glass…");
      });
    }

    // One delegated listener per group rather than one per button, so a
    // re-rendered panel cannot end up with handlers bound twice.
    panel.addEventListener("click", function (ev) {
      var btn = ev.target;
      var ATTRS = ["data-saas-bg", "data-saas-attach", "data-saas-type",
                   "data-saas-reveal-text", "data-saas-reveal"];
      function tagged(node) {
        if (!node || !node.getAttribute) return false;
        for (var a = 0; a < ATTRS.length; a++) {
          if (node.getAttribute(ATTRS[a])) return true;
        }
        return false;
      }
      while (btn && btn !== panel && !tagged(btn)) btn = btn.parentNode;
      if (!btn || btn === panel) return;

      var bg = btn.getAttribute("data-saas-bg");
      if (bg) {
        run("ae_saasGradientBg(" + argOf(JSON.stringify({
          style: bg,
          colorA: hexToUnit(hexOf("bgColorA", "#1c42f5")),
          colorB: hexToUnit(hexOf("bgColorB", "#a62eeb")),
          colorC: hexToUnit(hexOf("bgColorC", "#0d101f")),
          angle: numOf("bgAngle", 90)
        })) + ")", "Adding background…");
        return;
      }

      var attach = btn.getAttribute("data-saas-attach");
      if (attach) { run("ae_saasAttachLayer(" + argOf(attach) + ")", "Attaching…"); return; }

      var typing = btn.getAttribute("data-saas-type");
      if (typing) {
        run("ae_saasTyping(" + argOf(JSON.stringify({
          kind: typing,
          speed: numOf("typeSpeed", 18),
          scramble: numOf("typeScramble", 4),
          colorA: hexToUnit(hexOf("typeColour", "#22ff6f"))
        })) + ")", "Rigging typing…");
        return;
      }

      var trUnit = btn.getAttribute("data-saas-reveal-text");
      if (trUnit) {
        run("ae_saasTextReveal(" + argOf(JSON.stringify({
          unit: trUnit,
          rise: numOf("trRise", 90),
          scale: numOf("trScale", 70),
          blur: numOf("trBlur", 9),
          stagger: numOf("trStagger", 3) / 100,
          time: 1
        })) + ")", "Building reveal…");
        return;
      }

      var rev = btn.getAttribute("data-saas-reveal");
      if (rev) {
        run("ae_saasReveal(" + argOf(JSON.stringify({
          kind: rev,
          frames: numOf("revFrames", 20)
        })) + ")", "Building reveal…");
      }
    });
  }

  function init() {
    var pending = 0;
    for (var i = 0; i < MODALS.length; i++) {
      if (!wire(MODALS[i])) pending++;
    }
    wireTools();
    return pending === 0;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // main.js builds the rest of the panel after the licence gate, so retry
  // until every trigger exists rather than binding once and hoping.
  setTimeout(init, 1200);
  setTimeout(init, 4000);
})();
