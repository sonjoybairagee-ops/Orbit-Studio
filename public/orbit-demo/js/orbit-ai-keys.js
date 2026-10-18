/* ============================================================
 * CompX Orbit Studio — AI provider keys
 *
 * One place that remembers which cloud services the panel may use and the
 * keys for them. Keys are written once and kept until the person resets
 * them; nothing expires them, and nothing but this file writes them.
 *
 * The keys live in this panel's own localStorage, which belongs to this
 * extension on this computer. They are only ever sent to the provider the
 * key belongs to, over HTTPS, and never to compxorbit.com or anywhere else.
 * ============================================================ */
(function (global) {
  "use strict";

  var KEY_PREFIX = "compxAiKey_";
  var MODEL_PREFIX = "compxAiModel_";
  var VOICE_PREFIX = "compxAiVoice_";
  var ACTIVE_KEY = "compxAiProvider";
  var LEGACY_GEMINI = "compxGeminiKey";

  // Every provider here can return word-level timings, which is what the
  // caption engine needs; a transcript without them cannot drive a karaoke
  // highlight. Endpoints and models are from each provider's own docs.
  var PROVIDERS = [
    {
      id: "gemini",
      label: "Google Gemini",
      hint: "AI Studio key, starts with AIza",
      pattern: /^AIza[0-9A-Za-z\-_]{10,}$/,
      consoleUrl: "https://aistudio.google.com/apikey",
      defaultModel: "gemini-3.5-transcribe",
      models: ["gemini-3.5-transcribe"],
      note: "Generous free tier.",
      tts: {
        model: "gemini-3.8-flash-tts",
        format: "wav",
        style: true,
        voices: ["Kore", "Puck", "Zephyr", "Charon", "Fenrir", "Leda", "Orus", "Aoede",
          "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba", "Despina",
          "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar",
          "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia",
          "Sadaltager", "Sulafat"],
        note: "130+ languages including Bangla."
      }
    },
    {
      id: "openai",
      label: "OpenAI",
      hint: "Secret key, starts with sk-",
      pattern: /^sk-[0-9A-Za-z\-_]{16,}$/,
      consoleUrl: "https://platform.openai.com/api-keys",
      defaultModel: "whisper-1",
      models: ["whisper-1"],
      note: "Whisper, billed per minute. 25 MB per file.",
      tts: {
        model: "gpt-4o-mini-tts",
        format: "wav",
        style: true,
        speed: true,
        voices: ["alloy", "ash", "ballad", "coral", "echo", "fable", "onyx", "nova",
          "sage", "shimmer", "verse", "marin", "cedar"],
        note: "Delivery can be described in words."
      }
    },
    {
      id: "xai",
      label: "xAI Grok",
      hint: "Key from the xAI console",
      pattern: /^[0-9A-Za-z\-_]{20,}$/,
      consoleUrl: "https://console.x.ai",
      defaultModel: "grok-voice-transcribe-2.0",
      models: ["grok-voice-transcribe-2.0"],
      note: "Handles long files and can tell speakers apart.",
      tts: {
        format: "wav",
        speed: true,
        voices: ["eve", "carina", "zagan", "helix", "orion", "luna", "iris", "altair",
          "zenith", "perseus", "helios", "lux", "kepler", "rigel", "cosmo", "celeste",
          "ursa", "sirius", "lumen", "castor", "naksh", "atlas", "aurora", "liora",
          "ara", "leo", "rex", "sal"],
        note: "28 voices, up to 60,000 characters at a time."
      }
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      hint: "Key, starts with sk-or-",
      pattern: /^sk-or-[0-9A-Za-z\-_]{16,}$/,
      consoleUrl: "https://openrouter.ai/keys",
      defaultModel: "openai/whisper-1",
      models: ["openai/whisper-1", "openai/whisper-large-v3"],
      note: "One key, many models behind it.",
      tts: {
        model: "openai/gpt-4o-mini-tts",
        format: "mp3",
        style: true,
        speed: true,
        voices: ["alloy", "nova", "echo", "shimmer", "onyx", "fable"],
        note: "Fronts several vendors' voices behind one key."
      }
    }
  ];

  var byId = {};
  for (var i = 0; i < PROVIDERS.length; i++) byId[PROVIDERS[i].id] = PROVIDERS[i];

  function store() {
    try { return global.localStorage || null; }
    catch (e) { return null; }
  }

  function readRaw(name) {
    var s = store();
    if (!s) return "";
    try { return String(s.getItem(name) || ""); }
    catch (e) { return ""; }
  }

  function writeRaw(name, value) {
    var s = store();
    if (!s) return false;
    try {
      if (value === null) s.removeItem(name);
      else s.setItem(name, String(value));
      return true;
    } catch (e) { return false; }
  }

  function known(id) { return Object.prototype.hasOwnProperty.call(byId, String(id)); }

  // A key the panel had before this settings page existed still belongs to
  // the person, so it is carried over rather than quietly dropped.
  function migrate() {
    var legacy = readRaw(LEGACY_GEMINI).replace(/^\s+|\s+$/g, "");
    if (legacy && !readRaw(KEY_PREFIX + "gemini")) writeRaw(KEY_PREFIX + "gemini", legacy);
  }

  function key(id) {
    if (!known(id)) return "";
    return readRaw(KEY_PREFIX + id).replace(/^\s+|\s+$/g, "");
  }

  function setKey(id, value) {
    if (!known(id)) return false;
    var trimmed = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "");
    if (!trimmed) return clearKey(id);
    var ok = writeRaw(KEY_PREFIX + id, trimmed);
    // The old single-key storage is kept in step so an older build of the
    // caption code keeps working after a downgrade.
    if (id === "gemini") writeRaw(LEGACY_GEMINI, trimmed);
    return ok;
  }

  function clearKey(id) {
    if (!known(id)) return false;
    writeRaw(KEY_PREFIX + id, null);
    if (id === "gemini") writeRaw(LEGACY_GEMINI, null);
    return true;
  }

  function model(id) {
    if (!known(id)) return "";
    var stored = readRaw(MODEL_PREFIX + id).replace(/^\s+|\s+$/g, "");
    return stored || byId[id].defaultModel;
  }

  function setModel(id, value) {
    if (!known(id)) return false;
    var trimmed = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "");
    if (!trimmed || trimmed === byId[id].defaultModel) return writeRaw(MODEL_PREFIX + id, null);
    return writeRaw(MODEL_PREFIX + id, trimmed);
  }

  function voice(id) {
    if (!known(id) || !byId[id].tts) return "";
    var stored = readRaw(VOICE_PREFIX + id).replace(/^\s+|\s+$/g, "");
    var list = byId[id].tts.voices || [];
    if (stored && list.indexOf(stored) >= 0) return stored;
    return list.length ? list[0] : "";
  }

  function setVoice(id, value) {
    if (!known(id) || !byId[id].tts) return false;
    var trimmed = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "");
    if (!trimmed) return writeRaw(VOICE_PREFIX + id, null);
    return writeRaw(VOICE_PREFIX + id, trimmed);
  }

  // Which providers can speak, as opposed to listen.
  function speakers() {
    var out = [];
    for (var i = 0; i < PROVIDERS.length; i++) if (PROVIDERS[i].tts) out.push(PROVIDERS[i].id);
    return out;
  }

  function configured() {
    var out = [];
    for (var i = 0; i < PROVIDERS.length; i++) if (key(PROVIDERS[i].id)) out.push(PROVIDERS[i].id);
    return out;
  }

  // The active provider is only meaningful if it still has a key; otherwise
  // fall through to whichever one does, so a reset never leaves the caption
  // engine pointing at nothing.
  function active() {
    var stored = readRaw(ACTIVE_KEY).replace(/^\s+|\s+$/g, "");
    if (known(stored) && key(stored)) return stored;
    var ready = configured();
    if (ready.length) return ready[0];
    return known(stored) ? stored : PROVIDERS[0].id;
  }

  function setActive(id) {
    if (!known(id)) return false;
    return writeRaw(ACTIVE_KEY, id);
  }

  // A shape check only: whether the provider accepts it is the provider's
  // business, and a wrong-looking key is still worth letting someone try.
  function looksValid(id, value) {
    if (!known(id)) return false;
    var trimmed = String(value || "").replace(/^\s+|\s+$/g, "");
    if (!trimmed) return false;
    var rule = byId[id].pattern;
    return rule ? rule.test(trimmed) : trimmed.length >= 12;
  }

  // Never print a key in full — a screenshot of the settings page should not
  // be enough to use someone's account.
  function mask(value) {
    var text = String(value || "").replace(/^\s+|\s+$/g, "");
    if (!text) return "";
    if (text.length <= 10) return text.charAt(0) + "••••";
    return text.slice(0, 6) + "••••••" + text.slice(-4);
  }

  migrate();

  global.CompXAIKeys = {
    PROVIDERS: PROVIDERS,
    get: function (id) { return byId[id] || null; },
    key: key,
    setKey: setKey,
    clearKey: clearKey,
    model: model,
    setModel: setModel,
    voice: voice,
    setVoice: setVoice,
    speakers: speakers,
    active: active,
    setActive: setActive,
    configured: configured,
    looksValid: looksValid,
    mask: mask
  };
})(typeof window !== "undefined" ? window : this);
