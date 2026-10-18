/* ============================================================
 * CompX Orbit Studio — AI voiceover
 *
 * Type a script, pick a voice, and the spoken audio lands on the timeline
 * at the playhead. The provider is whichever one has a key in the AI
 * Providers settings — the same key that does cloud transcription.
 *
 * Nothing but the script text and the voice choice leaves the panel, and it
 * only ever goes to the provider whose key is being used.
 * ============================================================ */
(function () {
  "use strict";

  var cs = null;
  try { cs = new CSInterface(); } catch (e) { return; }

  var nodeRequire = null;
  try { nodeRequire = (typeof require !== "undefined") ? require : (window.cep_node ? window.cep_node.require : null); }
  catch (e) { nodeRequire = null; }

  var MAX_SCRIPT = 8000;
  var busy = false;
  var lastFile = "";

  function keys() { return window.CompXAIKeys || null; }
  function el(id) { return document.getElementById(id); }

  function setNote(message, state) {
    var note = el("ttsNote");
    if (!note) return;
    note.textContent = message;
    note.className = "tts-note" + (state ? " is-" + state : "");
  }

  function setBusy(value) {
    busy = value;
    var button = el("btnTtsGenerate");
    if (button) {
      button.disabled = value;
      button.textContent = value ? "Speaking…" : "Generate voiceover";
    }
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

  function currentProvider() {
    var store = keys();
    if (!store) return null;
    var select = el("ttsProvider");
    var id = select && select.value ? select.value : store.active();
    var provider = store.get(id);
    return provider && provider.tts ? provider : null;
  }

  /* ---------------- the request ---------------- */
  // Audio comes back as bytes, so unlike the JSON calls elsewhere the body
  // is collected as a Buffer and never turned into a string.
  function speak(url, headers, body) {
    return new Promise(function (resolve, reject) {
      if (!nodeRequire) { reject(new Error("This build cannot reach the network.")); return; }
      var https, urlMod;
      try { https = nodeRequire("https"); urlMod = nodeRequire("url"); }
      catch (e) { reject(new Error("This build cannot reach the network.")); return; }
      var parsed = urlMod.parse(url);
      var request = https.request({
        method: "POST", hostname: parsed.hostname, path: parsed.path, headers: headers
      }, function (response) {
        var chunks = [];
        response.on("data", function (chunk) { chunks.push(chunk); });
        response.on("end", function () {
          resolve({
            status: response.statusCode,
            type: String(response.headers["content-type"] || ""),
            body: Buffer.concat(chunks)
          });
        });
      });
      request.on("error", function () { reject(new Error("Could not reach " + parsed.hostname + ".")); });
      request.setTimeout(120000, function () {
        try { request.destroy(new Error("timed out")); } catch (e) { /* already gone */ }
      });
      request.write(body);
      request.end();
    });
  }

  function speechError(response, label) {
    var detail = "";
    try {
      var parsed = JSON.parse(response.body.toString("utf8"));
      detail = (parsed && parsed.error && (parsed.error.message || parsed.error)) || parsed.message || "";
      if (typeof detail !== "string") detail = "";
    } catch (e) { detail = response.body.toString("utf8").slice(0, 200); }
    if (response.status === 401 || response.status === 403) detail = detail || "The provider rejected that key.";
    if (response.status === 429) detail = detail || "The provider is rate limiting this key.";
    return new Error(label + " failed (HTTP " + response.status + ")" + (detail ? ": " + detail : ""));
  }

  // Some providers answer with the audio itself, others wrap it in JSON with
  // the bytes base64-encoded. Accept either rather than guessing.
  function audioFrom(response, label) {
    if (response.status !== 200) throw speechError(response, label);
    if (response.type.indexOf("application/json") < 0) {
      if (!response.body.length) throw new Error(label + " returned no audio.");
      return response.body;
    }
    var parsed;
    try { parsed = JSON.parse(response.body.toString("utf8")); }
    catch (e) { throw new Error(label + " returned something that was neither audio nor JSON."); }
    var found = findBase64Audio(parsed);
    if (!found) throw speechError(response, label);
    return Buffer.from(found, "base64");
  }

  function findBase64Audio(node, depth) {
    if (!node || typeof node !== "object" || (depth || 0) > 6) return "";
    var keysOf = ["audio", "data", "audio_content", "audioContent", "content", "b64_json"];
    for (var i = 0; i < keysOf.length; i++) {
      var value = node[keysOf[i]];
      if (typeof value === "string" && value.length > 64 && /^[A-Za-z0-9+/=\s]+$/.test(value)) return value;
    }
    for (var key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      var nested = findBase64Audio(node[key], (depth || 0) + 1);
      if (nested) return nested;
    }
    return "";
  }

  function geminiSpeech(provider, apiKey, script, voice, style) {
    var content = { type: "text", text: script };
    if (style) content.annotations = [{ type: "speech_metadata", style: style }];
    var body = Buffer.from(JSON.stringify({
      model: provider.tts.model,
      input: [{ type: "user_input", content: [content] }],
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice: voice }] }
    }), "utf8");
    return speak("https://generativelanguage.googleapis.com/v1beta/interactions", {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": body.length
    }, body).then(function (response) { return audioFrom(response, "Gemini speech"); });
  }

  function openaiSpeech(provider, apiKey, script, voice, style, speed) {
    var payload = {
      model: provider.tts.model,
      input: script,
      voice: voice,
      response_format: "wav"
    };
    if (style) payload.instructions = style;
    if (speed && speed !== 1) payload.speed = speed;
    var body = Buffer.from(JSON.stringify(payload), "utf8");
    return speak("https://api.openai.com/v1/audio/speech", {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "Content-Length": body.length
    }, body).then(function (response) { return audioFrom(response, "OpenAI speech"); });
  }

  function xaiSpeech(provider, apiKey, script, voice, language, speed) {
    var payload = {
      text: script,
      language: language || "auto",
      voice_id: voice,
      output_format: { codec: "wav", sample_rate: 24000 }
    };
    if (speed && speed !== 1) payload.speed = speed;
    var body = Buffer.from(JSON.stringify(payload), "utf8");
    return speak("https://api.x.ai/v1/tts", {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "Content-Length": body.length
    }, body).then(function (response) { return audioFrom(response, "Grok speech"); });
  }

  function openrouterSpeech(provider, apiKey, script, voice, style, speed) {
    var payload = {
      model: provider.tts.model,
      input: script,
      voice: voice,
      response_format: "mp3"
    };
    if (style) payload.instructions = style;
    if (speed && speed !== 1) payload.speed = speed;
    var body = Buffer.from(JSON.stringify(payload), "utf8");
    return speak("https://openrouter.ai/api/v1/audio/speech", {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "Content-Length": body.length,
      "HTTP-Referer": "https://compxorbit.com",
      "X-Title": "CompX Orbit Studio"
    }, body).then(function (response) { return audioFrom(response, "OpenRouter speech"); });
  }

  /* ---------------- where the file goes ---------------- */
  function outputFolder() {
    var os = nodeRequire("os"), path = nodeRequire("path"), fs = nodeRequire("fs");
    var base;
    if (os.platform() === "win32") {
      base = (nodeRequire("process").env.LOCALAPPDATA) || path.join(os.homedir(), "AppData", "Local");
      base = path.join(base, "CompXOrbit", "Voiceovers");
    } else if (os.platform() === "darwin") {
      base = path.join(os.homedir(), "Library", "Application Support", "CompXOrbit", "Voiceovers");
    } else {
      base = path.join(os.homedir(), ".cache", "CompXOrbit", "Voiceovers");
    }
    fs.mkdirSync(base, { recursive: true });
    return base;
  }

  // The layer wants a name a person recognises, which is the first few words
  // of what it actually says.
  function labelFor(script) {
    var words = String(script || "").replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" ");
    var label = words.slice(0, 5).join(" ");
    if (words.length > 5) label += "…";
    return "VO · " + (label || "Voiceover");
  }

  function fileNameFor(script, extension) {
    var slug = String(script || "").replace(/\s+/g, "-").replace(/[^A-Za-z0-9\-]+/g, "")
      .replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).toLowerCase() || "voiceover";
    return slug + "-" + Date.now() + "." + extension;
  }

  function save(audio, script, extension) {
    var fs = nodeRequire("fs"), path = nodeRequire("path");
    var file = path.join(outputFolder(), fileNameFor(script, extension));
    fs.writeFileSync(file, audio);
    return file;
  }

  /* ---------------- the UI ---------------- */
  function fillProviders() {
    var store = keys();
    var select = el("ttsProvider");
    if (!store || !select) return;
    var wanted = store.speakers();
    select.innerHTML = "";
    for (var i = 0; i < wanted.length; i++) {
      var provider = store.get(wanted[i]);
      var option = document.createElement("option");
      option.value = provider.id;
      option.textContent = provider.label + (store.key(provider.id) ? "" : " — no key");
      select.appendChild(option);
    }
    var preferred = store.active();
    select.value = wanted.indexOf(preferred) >= 0 ? preferred : wanted[0];
  }

  function fillVoices() {
    var store = keys();
    var provider = currentProvider();
    var select = el("ttsVoice");
    if (!store || !provider || !select) return;
    var list = provider.tts.voices || [];
    select.innerHTML = "";
    for (var i = 0; i < list.length; i++) {
      var option = document.createElement("option");
      option.value = list[i];
      option.textContent = list[i];
      select.appendChild(option);
    }
    select.value = store.voice(provider.id);
    var style = el("ttsStyleField");
    if (style) style.hidden = !provider.tts.style;
    var speed = el("ttsSpeedField");
    if (speed) speed.hidden = !provider.tts.speed;
    var hint = el("ttsProviderNote");
    if (hint) hint.textContent = store.key(provider.id)
      ? (provider.tts.note || "")
      : "No key for " + provider.label + " yet — add one in the Tracker tab under Settings.";
  }

  function count() {
    var field = el("ttsScript");
    var label = el("ttsCount");
    if (!field || !label) return;
    var used = String(field.value || "").length;
    label.textContent = used + " / " + MAX_SCRIPT;
    label.className = "tts-count" + (used > MAX_SCRIPT ? " is-over" : "");
  }

  function generate() {
    if (busy) return;
    var store = keys();
    var provider = currentProvider();
    if (!store || !provider) { setNote("No speaking provider is available.", "error"); return; }

    var apiKey = store.key(provider.id);
    if (!apiKey) {
      setNote("No key for " + provider.label + " yet — add one in the Tracker tab under Settings.", "error");
      return;
    }

    var field = el("ttsScript");
    var script = field ? String(field.value || "").replace(/^\s+|\s+$/g, "") : "";
    if (!script) { setNote("Write the script first.", "error"); if (field) field.focus(); return; }
    if (script.length > MAX_SCRIPT) {
      setNote("That script is " + script.length + " characters; " + MAX_SCRIPT + " is the limit per take. Split it up.", "error");
      return;
    }

    var voiceSelect = el("ttsVoice");
    var voice = voiceSelect ? voiceSelect.value : "";
    if (voice) store.setVoice(provider.id, voice);
    var styleField = el("ttsStyle");
    var style = (provider.tts.style && styleField) ? String(styleField.value || "").replace(/^\s+|\s+$/g, "") : "";
    var speedField = el("ttsSpeed");
    var speed = (provider.tts.speed && speedField) ? Number(speedField.value) : 1;
    if (!isFinite(speed) || speed <= 0) speed = 1;
    var languageField = el("ttsLanguage");
    var language = languageField ? languageField.value : "auto";

    setBusy(true);
    setNote("Asking " + provider.label + " to read it…", "busy");

    var work;
    if (provider.id === "gemini") work = geminiSpeech(provider, apiKey, script, voice, style);
    else if (provider.id === "openai") work = openaiSpeech(provider, apiKey, script, voice, style, speed);
    else if (provider.id === "xai") work = xaiSpeech(provider, apiKey, script, voice, language, speed);
    else if (provider.id === "openrouter") work = openrouterSpeech(provider, apiKey, script, voice, style, speed);
    else work = Promise.reject(new Error("No voice is wired up for " + provider.label + "."));

    work.then(function (audio) {
      var file = save(audio, script, provider.tts.format || "wav");
      lastFile = file;
      var insert = el("ttsInsert");
      if (insert && !insert.checked) {
        setBusy(false);
        setNote("Saved to " + file + " — not placed in the comp.", "ok");
        return null;
      }
      setNote("Placing it on the timeline…", "busy");
      var atField = el("ttsAt");
      return hostCall("ae_insertVoiceover(" + JSON.stringify(JSON.stringify({
        path: file,
        name: labelFor(script),
        at: atField ? atField.value : "playhead"
      })) + ")").then(function (result) {
        setBusy(false);
        setNote(result.message || (result.success ? "Done." : "After Effects refused the audio."),
          result.success ? "ok" : "error");
      });
    }).catch(function (error) {
      setBusy(false);
      setNote(String((error && error.message) || error), "error");
    });
  }

  function init() {
    if (!el("studioTts")) return;
    fillProviders();
    fillVoices();
    count();

    var provider = el("ttsProvider");
    if (provider) {
      provider.addEventListener("change", function () {
        var store = keys();
        if (store && store.key(provider.value)) store.setActive(provider.value);
        fillVoices();
      });
    }
    var voice = el("ttsVoice");
    if (voice) {
      voice.addEventListener("change", function () {
        var store = keys();
        var current = currentProvider();
        if (store && current) store.setVoice(current.id, voice.value);
      });
    }
    var script = el("ttsScript");
    if (script) script.addEventListener("input", count);
    var button = el("btnTtsGenerate");
    if (button) button.addEventListener("click", generate);
    var reveal = el("btnTtsFolder");
    if (reveal) {
      reveal.addEventListener("click", function () {
        try {
          var folder = lastFile ? nodeRequire("path").dirname(lastFile) : outputFolder();
          cs.openURLInDefaultBrowser("file://" + String(folder).replace(/\\/g, "/"));
        } catch (e) { setNote("Could not open the folder.", "error"); }
      });
    }
    document.addEventListener("compx-ai-keys-changed", function () { fillProviders(); fillVoices(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
