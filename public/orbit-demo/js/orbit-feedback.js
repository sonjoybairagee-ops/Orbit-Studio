/* ============================================================
 * CompX Orbit Studio — in-panel feedback
 *
 * A bug is only reported if reporting it is easier than shrugging. This posts
 * the message straight from the panel, with the version, host and platform
 * attached so the report arrives with the context that usually goes missing.
 *
 * If the endpoint is not reachable — offline, or not deployed yet — the note
 * is copied to the clipboard and the contact page is opened, so nothing the
 * person typed is lost.
 * ============================================================ */
(function () {
  "use strict";

  var ENDPOINT = "https://compxorbit.com/api/extension/feedback";
  var CONTACT_PAGE = "https://compxorbit.com/dashboard";
  var MAX_MESSAGE = 4000;

  var cs = null;
  try { cs = new CSInterface(); } catch (e) { return; }

  var nodeRequire = null;
  try { nodeRequire = (typeof require !== "undefined") ? require : (window.cep_node ? window.cep_node.require : null); }
  catch (e) { nodeRequire = null; }

  var hostVersion = "";

  function el(id) { return document.getElementById(id); }

  function version() {
    var badge = el("orbitVersionBadge");
    return badge ? String(badge.textContent || "").replace(/^v/, "") : "";
  }

  function context() {
    return {
      extension: "orbit-studio",
      version: version(),
      host: hostVersion || "unknown",
      platform: (window.navigator && window.navigator.platform) || "unknown",
      at: new Date().toISOString()
    };
  }

  function setNote(text, state) {
    var note = el("orbitFeedbackNote");
    if (!note) return;
    note.textContent = text;
    note.className = "orbit-feedback-note" + (state ? " is-" + state : "");
  }

  function openExternal(url) {
    try {
      if (window.cep && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
        window.cep.util.openURLInDefaultBrowser(url);
        return true;
      }
      if (cs && cs.openURLInDefaultBrowser) { cs.openURLInDefaultBrowser(url); return true; }
    } catch (e) { /* fall through to the clipboard */ }
    return false;
  }

  function copy(text) {
    try {
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch (e) { return false; }
  }

  // Through Node rather than fetch: the panel's content policy does not cover
  // this host, and Node is already how the licence talks to the server.
  function post(payload) {
    return new Promise(function (resolve, reject) {
      if (!nodeRequire) { reject(new Error("no node")); return; }
      var https, urlMod;
      try { https = nodeRequire("https"); urlMod = nodeRequire("url"); }
      catch (e) { reject(e); return; }
      var body = JSON.stringify(payload);
      var parsed = urlMod.parse(ENDPOINT);
      var request = https.request({
        host: parsed.hostname,
        path: parsed.path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body)
        }
      }, function (response) {
        var text = "";
        response.on("data", function (chunk) { text += chunk; });
        response.on("end", function () {
          if (response.statusCode >= 200 && response.statusCode < 300) resolve(text);
          else reject(new Error("HTTP " + response.statusCode));
        });
      });
      request.on("error", reject);
      request.setTimeout(15000, function () {
        try { request.destroy(new Error("timed out")); } catch (e) { /* already gone */ }
      });
      request.write(body);
      request.end();
    });
  }

  function open() {
    var modal = el("orbitFeedbackModal");
    if (!modal) return;
    modal.style.display = "flex";
    setNote("Bugs, rough edges, anything that felt slow. It all helps.", "");
    var field = el("orbitFeedbackText");
    if (field) { field.value = ""; setTimeout(function () { try { field.focus(); } catch (e) {} }, 30); }
    var meta = el("orbitFeedbackMeta");
    if (meta) meta.textContent = "Sent with: Orbit Studio " + version() + " · AE " + (hostVersion || "unknown");
  }

  function close() {
    var modal = el("orbitFeedbackModal");
    if (modal) modal.style.display = "none";
  }

  function send() {
    var field = el("orbitFeedbackText");
    var button = el("btnOrbitFeedbackSend");
    var message = field ? String(field.value || "").replace(/^\s+|\s+$/g, "") : "";
    if (!message) { setNote("Write a line or two first.", "error"); if (field) field.focus(); return; }
    if (message.length > MAX_MESSAGE) message = message.slice(0, MAX_MESSAGE);

    if (button) { button.disabled = true; button.textContent = "Sending…"; }
    setNote("Sending…", "busy");

    var payload = context();
    payload.message = message;

    post(payload).then(function () {
      if (button) { button.disabled = false; button.textContent = "Send"; }
      setNote("Thanks — that went straight to the developer.", "ok");
      if (field) field.value = "";
      setTimeout(close, 1400);
    }).catch(function () {
      if (button) { button.disabled = false; button.textContent = "Send"; }
      // Nothing typed is ever lost just because the server is unreachable.
      var block = message + "\n\n---\nOrbit Studio " + payload.version +
        "\nAfter Effects " + payload.host + "\n" + payload.platform;
      var copied = copy(block);
      openExternal(CONTACT_PAGE);
      setNote(copied
        ? "Could not reach the server, so your note is on the clipboard and the contact page is open — paste it there."
        : "Could not reach the server. Please copy your note and send it from the contact page.", "error");
    });
  }

  function init() {
    if (!el("btnOrbitFeedback")) return;
    el("btnOrbitFeedback").addEventListener("click", open);
    var closeButton = el("btnOrbitFeedbackClose");
    if (closeButton) closeButton.addEventListener("click", close);
    var sendButton = el("btnOrbitFeedbackSend");
    if (sendButton) sendButton.addEventListener("click", send);
    var modal = el("orbitFeedbackModal");
    if (modal) {
      modal.addEventListener("click", function (event) { if (event.target === modal) close(); });
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close();
    });
    try { cs.evalScript("app.version", function (value) { hostVersion = String(value || "").split(" ")[0]; }); }
    catch (e) { /* the version is a nicety, not a requirement */ }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
