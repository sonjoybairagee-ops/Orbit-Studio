/* ============================================================
 * CompX Orbit Studio — AI provider settings
 *
 * The settings page for cloud keys. One row per provider: paste a key, save
 * it, check it against the provider, and reset it when you want it gone. The
 * row you pick is the one the caption engine uses.
 *
 * The rows are built from the provider list rather than written out in the
 * markup, so adding a provider is one entry in orbit-ai-keys.js.
 * ============================================================ */
(function () {
  "use strict";

  var cs = null;
  try { cs = new CSInterface(); } catch (e) { cs = null; }

  var nodeRequire = null;
  try { nodeRequire = (typeof require !== "undefined") ? require : (window.cep_node ? window.cep_node.require : null); }
  catch (e) { nodeRequire = null; }

  // Where a key is checked. A plain listing call is enough to know whether
  // the provider accepts it, and costs nothing.
  var PROBES = {
    gemini: { host: "generativelanguage.googleapis.com", path: "/v1beta/models", header: "x-goog-api-key", bearer: false },
    openai: { host: "api.openai.com", path: "/v1/models", header: "Authorization", bearer: true },
    xai: { host: "api.x.ai", path: "/v1/models", header: "Authorization", bearer: true },
    openrouter: { host: "openrouter.ai", path: "/api/v1/key", header: "Authorization", bearer: true }
  };

  function keys() { return window.CompXAIKeys || null; }

  function el(id) { return document.getElementById(id); }

  function openExternal(url) {
    try {
      if (window.cep && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
        window.cep.util.openURLInDefaultBrowser(url);
        return;
      }
      if (cs && cs.openURLInDefaultBrowser) cs.openURLInDefaultBrowser(url);
    } catch (e) { /* the link is a convenience, not the feature */ }
  }

  function probe(id, apiKey) {
    return new Promise(function (resolve, reject) {
      var spec = PROBES[id];
      if (!spec) { reject(new Error("There is no check for this provider.")); return; }
      if (!nodeRequire) { reject(new Error("This build cannot reach the network.")); return; }
      var https;
      try { https = nodeRequire("https"); }
      catch (e) { reject(new Error("This build cannot reach the network.")); return; }

      var headers = {};
      headers[spec.header] = spec.bearer ? "Bearer " + apiKey : apiKey;
      var request = https.request({ method: "GET", hostname: spec.host, path: spec.path, headers: headers },
        function (response) {
          var chunks = [];
          response.on("data", function (chunk) { chunks.push(chunk); });
          response.on("end", function () {
            var status = response.statusCode;
            if (status >= 200 && status < 300) { resolve(true); return; }
            var body = "";
            try { body = Buffer.concat(chunks).toString("utf8"); } catch (e) { body = ""; }
            var detail = "";
            try {
              var parsed = JSON.parse(body);
              detail = (parsed && parsed.error && (parsed.error.message || parsed.error)) || "";
              if (typeof detail !== "string") detail = "";
            } catch (e) { detail = ""; }
            if (status === 401 || status === 403) reject(new Error("That key was rejected." + (detail ? " " + detail : "")));
            else if (status === 429) reject(new Error("The provider is rate limiting this key right now."));
            else reject(new Error("The provider answered HTTP " + status + (detail ? ": " + detail : "")));
          });
        });
      request.on("error", function () { reject(new Error("Could not reach " + spec.host + ". Check the connection.")); });
      request.setTimeout(15000, function () {
        try { request.destroy(new Error("timed out")); } catch (e) { /* already gone */ }
      });
      request.end();
    });
  }

  function setRowState(id, message, state) {
    var note = el("aiKeyNote-" + id);
    if (!note) return;
    note.textContent = message;
    note.className = "ai-key-note" + (state ? " is-" + state : "");
  }

  function refreshBadges() {
    var api = keys();
    if (!api) return;
    var activeId = api.active();
    for (var i = 0; i < api.PROVIDERS.length; i++) {
      var id = api.PROVIDERS[i].id;
      var saved = !!api.key(id);
      var row = el("aiKeyRow-" + id);
      if (row) {
        row.classList.toggle("is-saved", saved);
        row.classList.toggle("is-active", saved && id === activeId);
      }
      var badge = el("aiKeyBadge-" + id);
      if (badge) {
        badge.textContent = saved ? (id === activeId ? "In use" : "Saved") : "Not set";
        badge.className = "ai-key-badge" + (saved ? (id === activeId ? " is-active" : " is-saved") : "");
      }
      var radio = el("aiKeyUse-" + id);
      if (radio) {
        radio.checked = (id === activeId);
        radio.disabled = !saved;
      }
      var reset = el("aiKeyReset-" + id);
      if (reset) reset.disabled = !saved;
    }
    var summary = el("aiKeySummary");
    if (summary) {
      var ready = api.configured();
      summary.textContent = ready.length
        ? ready.length + " of " + api.PROVIDERS.length + " set up · cloud captions use " + (api.get(activeId) || {}).label
        : "No keys yet — cloud transcription stays off until one is set up.";
    }
    // The caption cards show the same choice, so keep them in step.
    try {
      var event = document.createEvent("Event");
      event.initEvent("compx-ai-keys-changed", true, false);
      document.dispatchEvent(event);
    } catch (e) { /* the settings page still works without it */ }
  }

  function buildRow(provider) {
    var api = keys();
    var row = document.createElement("div");
    row.className = "ai-key-row";
    row.id = "aiKeyRow-" + provider.id;

    var head = document.createElement("div");
    head.className = "ai-key-head";

    var use = document.createElement("input");
    use.type = "radio";
    use.name = "compxAiActive";
    use.id = "aiKeyUse-" + provider.id;
    use.title = "Use " + provider.label + " for cloud transcription";
    head.appendChild(use);

    var name = document.createElement("label");
    name.className = "ai-key-name";
    name.setAttribute("for", "aiKeyUse-" + provider.id);
    name.textContent = provider.label;
    head.appendChild(name);

    var badge = document.createElement("span");
    badge.className = "ai-key-badge";
    badge.id = "aiKeyBadge-" + provider.id;
    head.appendChild(badge);

    var link = document.createElement("button");
    link.type = "button";
    link.className = "ai-key-link";
    link.textContent = "Get a key";
    link.title = provider.consoleUrl;
    link.addEventListener("click", function () { openExternal(provider.consoleUrl); });
    head.appendChild(link);

    row.appendChild(head);

    var field = document.createElement("input");
    field.type = "password";
    field.className = "counter-input ai-key-input";
    field.id = "aiKeyInput-" + provider.id;
    field.autocomplete = "off";
    field.spellcheck = false;
    field.placeholder = provider.hint;
    field.value = api ? api.key(provider.id) : "";
    row.appendChild(field);

    var actions = document.createElement("div");
    actions.className = "ai-key-actions";

    var save = document.createElement("button");
    save.type = "button";
    save.className = "tool-btn primary";
    save.textContent = "Save";
    save.addEventListener("click", function () {
      if (!api) return;
      var value = field.value;
      if (!String(value || "").replace(/^\s+|\s+$/g, "")) {
        setRowState(provider.id, "Paste a key first.", "error");
        return;
      }
      api.setKey(provider.id, value);
      field.value = api.key(provider.id);
      if (!api.key(api.active())) api.setActive(provider.id);
      refreshBadges();
      setRowState(provider.id, api.looksValid(provider.id, value)
        ? "Saved. It stays on this computer until you reset it."
        : "Saved, though it does not look like a " + provider.label + " key — test it to be sure.",
        api.looksValid(provider.id, value) ? "ok" : "warn");
    });
    actions.appendChild(save);

    var test = document.createElement("button");
    test.type = "button";
    test.className = "tool-btn";
    test.textContent = "Test";
    test.addEventListener("click", function () {
      if (!api) return;
      var value = String(field.value || "").replace(/^\s+|\s+$/g, "") || api.key(provider.id);
      if (!value) { setRowState(provider.id, "Paste a key first.", "error"); return; }
      test.disabled = true;
      setRowState(provider.id, "Checking with " + provider.label + "...", "busy");
      probe(provider.id, value).then(function () {
        test.disabled = false;
        setRowState(provider.id, provider.label + " accepted the key.", "ok");
      }, function (error) {
        test.disabled = false;
        setRowState(provider.id, String(error.message || error), "error");
      });
    });
    actions.appendChild(test);

    var reset = document.createElement("button");
    reset.type = "button";
    reset.className = "tool-btn danger";
    reset.id = "aiKeyReset-" + provider.id;
    reset.textContent = "Reset";
    reset.addEventListener("click", function () {
      if (!api) return;
      if (!window.confirm("Remove the saved " + provider.label + " key from this computer?")) return;
      api.clearKey(provider.id);
      field.value = "";
      refreshBadges();
      setRowState(provider.id, "Key removed.", "");
    });
    actions.appendChild(reset);

    row.appendChild(actions);

    if (provider.models && provider.models.length > 1) {
      var modelField = document.createElement("label");
      modelField.className = "ai-key-model";
      var modelLabel = document.createElement("span");
      modelLabel.textContent = "Model";
      modelField.appendChild(modelLabel);
      var select = document.createElement("select");
      select.className = "counter-select";
      select.id = "aiKeyModel-" + provider.id;
      for (var m = 0; m < provider.models.length; m++) {
        var option = document.createElement("option");
        option.value = provider.models[m];
        option.textContent = provider.models[m];
        select.appendChild(option);
      }
      select.value = api ? api.model(provider.id) : provider.defaultModel;
      select.addEventListener("change", function () {
        if (api) api.setModel(provider.id, select.value);
      });
      modelField.appendChild(select);
      row.appendChild(modelField);
    }

    var note = document.createElement("p");
    note.className = "ai-key-note";
    note.id = "aiKeyNote-" + provider.id;
    note.textContent = provider.note || "";
    row.appendChild(note);

    use.addEventListener("change", function () {
      if (!api || !use.checked) return;
      api.setActive(provider.id);
      refreshBadges();
    });

    return row;
  }

  function init() {
    var mount = el("aiKeyList");
    if (!mount) return;
    var api = keys();
    if (!api) {
      mount.textContent = "The key store did not load.";
      return;
    }
    mount.innerHTML = "";
    for (var i = 0; i < api.PROVIDERS.length; i++) mount.appendChild(buildRow(api.PROVIDERS[i]));
    refreshBadges();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
