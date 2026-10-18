/* ============================================================
 * CompX Orbit Studio — Figma bridge
 *
 * The Figma plugin exports the current selection as SVG and sends it to a
 * loopback socket this panel opens. The SVG then goes through Orbit's own
 * parser, so what lands in After Effects is native, editable shape layers
 * with their gradients and strokes intact.
 *
 * The bridge is off until it is switched on, listens on 127.0.0.1 only, and
 * treats everything the plugin sends as untrusted: the payload must be SVG
 * text within a size limit, and the file it is written to is named here —
 * never by the sender.
 * ============================================================ */
(function () {
  "use strict";

  var cs = null;
  try { cs = new CSInterface(); } catch (e) { return; }

  var nodeRequire = null;
  try { nodeRequire = (typeof require !== "undefined") ? require : (window.cep_node ? window.cep_node.require : null); }
  catch (e) { nodeRequire = null; }

  var PORT = 7867;
  var MAX_SVG = 24 * 1024 * 1024;
  var bridge = null;
  var queue = [];
  var working = false;

  function el(id) { return document.getElementById(id); }

  function paint(state, detail) {
    var dot = el("figmaBridgeDot");
    var label = el("figmaBridgeLabel");
    var button = el("btnFigmaBridge");
    if (dot) dot.className = "figma-dot is-" + state;
    if (label) label.textContent = detail;
    if (button) button.textContent = bridge ? "Stop bridge" : "Start bridge";
  }

  function parseHostResult(raw) {
    var text = String(raw == null ? "" : raw);
    if (!text || text === "undefined" || text === "EvalScript error.") {
      return { success: false, message: "After Effects did not answer." };
    }
    try { return JSON.parse(text); }
    catch (e) { return { success: false, message: text }; }
  }

  function hostCall(expression) {
    return new Promise(function (resolve) {
      cs.evalScript(expression, function (raw) { resolve(parseHostResult(raw)); });
    });
  }

  // A name from the plugin is only ever a label, never part of a path.
  function safeLabel(value) {
    var text = String(value === undefined || value === null ? "" : value)
      .replace(/[\u0000-\u001f]/g, " ")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[\s.\-]+|[\s.\-]+$/g, "");
    return text.slice(0, 60) || "Figma";
  }

  function tempDir() {
    var os = nodeRequire("os"), path = nodeRequire("path"), fs = nodeRequire("fs");
    var dir = path.join(os.tmpdir(), "CompXOrbitFigma");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  // Each import leaves a file behind; clear anything from an earlier session
  // so a long day of iterating does not quietly fill the disk.
  function sweep() {
    try {
      var fs = nodeRequire("fs"), path = nodeRequire("path");
      var dir = tempDir();
      var names = fs.readdirSync(dir);
      var cutoff = Date.now() - 60 * 60 * 1000;
      for (var i = 0; i < names.length; i++) {
        if (!/^compx-figma-.*\.svg$/.test(names[i])) continue;
        var file = path.join(dir, names[i]);
        try { if (fs.statSync(file).mtimeMs < cutoff) fs.unlinkSync(file); }
        catch (e) { /* a file in use is not worth reporting */ }
      }
    } catch (e) { /* housekeeping only */ }
  }

  function writeSvg(label, svg) {
    var fs = nodeRequire("fs"), path = nodeRequire("path");
    var stamp = Date.now() + "-" + Math.floor(Math.random() * 1e6);
    var file = path.join(tempDir(), "compx-figma-" + stamp + ".svg");
    fs.writeFileSync(file, svg, "utf8");
    return file;
  }

  function reply(payload) {
    if (bridge) bridge.send(JSON.stringify(payload));
  }

  function pump() {
    if (working || !queue.length) return;
    working = true;
    var job = queue.shift();
    paint("busy", "Building " + job.label + "...");
    var options = {
      files: [job.file],
      name: job.label,
      centre: true,
      scale: 1,
      separate: !!(el("figmaSeparate") && el("figmaSeparate").checked)
    };
    hostCall("ae_importSvgAsShapes(" + JSON.stringify(JSON.stringify(options)) + ")").then(function (result) {
      working = false;
      paint(result.success ? "on" : "error", result.message || (result.success ? "Done" : "Import failed"));
      reply({ type: "result", ok: !!result.success, message: String(result.message || "") });
      pump();
    });
  }

  function handle(text) {
    var message;
    try { message = JSON.parse(text); }
    catch (e) { reply({ type: "result", ok: false, message: "That was not valid JSON." }); return; }
    if (!message || message.type !== "svg") return;

    var svg = typeof message.svg === "string" ? message.svg : "";
    if (!svg || svg.length > MAX_SVG) {
      reply({ type: "result", ok: false, message: "The SVG was empty or too large." });
      paint("error", "Rejected an oversized payload");
      return;
    }
    if (svg.indexOf("<svg") < 0) {
      reply({ type: "result", ok: false, message: "That did not look like SVG." });
      return;
    }
    var label = safeLabel(message.name);
    var file;
    try { file = writeSvg(label, svg); }
    catch (e) {
      reply({ type: "result", ok: false, message: "Could not write the SVG to disk." });
      paint("error", "Could not write to the temp folder");
      return;
    }
    queue.push({ file: file, label: label });
    pump();
  }

  function status(state) {
    if (/^error:/.test(state)) { paint("error", state.slice(6)); return; }
    if (state === "connected") { paint("on", "Figma connected"); return; }
    if (state === "waiting") { paint("wait", "Listening on 127.0.0.1:" + PORT); return; }
    if (state === "stopped") { paint("off", "Bridge stopped"); return; }
    paint("wait", state);
  }

  function start() {
    if (bridge) return;
    if (!nodeRequire || !window.CompXWS) { paint("error", "Node is not available in this build"); return; }
    sweep();
    try {
      bridge = window.CompXWS.createServer({ port: PORT, onMessage: handle, onStatus: status });
      paint("wait", "Listening on 127.0.0.1:" + PORT);
    } catch (e) {
      bridge = null;
      paint("error", String(e.message || e));
    }
  }

  function stop() {
    if (!bridge) return;
    try { bridge.close(); } catch (e) { /* already gone */ }
    bridge = null;
    queue = [];
    working = false;
    paint("off", "Bridge stopped");
  }

  function init() {
    if (!el("btnFigmaBridge")) return;
    el("btnFigmaBridge").addEventListener("click", function () {
      if (bridge) stop(); else start();
    });
    var reveal = el("btnFigmaPluginFolder");
    if (reveal) {
      reveal.addEventListener("click", function () {
        try {
          var path = nodeRequire("path");
          var folder = path.join(cs.getSystemPath(SystemPath.EXTENSION), "figma-plugin");
          cs.openURLInDefaultBrowser("file://" + folder.replace(/\\/g, "/"));
        } catch (e) { paint("error", "Could not open the plugin folder"); }
      });
    }
    paint("off", "Bridge off");
    // Leaving a listening socket behind would block the port next launch.
    window.addEventListener("beforeunload", stop);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
