/* ============================================================
 * CompX Orbit Studio — AI depth map and parallax
 *
 * Depth Anything v2 Small (Apache-2.0) runs locally through the ONNX runtime
 * the background remover already ships, so a still photograph can be given
 * real depth: near things travel further than far ones, and the background
 * can fall out of focus.
 *
 * Nothing leaves the machine. The model is fetched once, over HTTPS, only
 * after the person agrees, and is checked against a known SHA-256 before it
 * is ever loaded.
 * ============================================================ */
(function () {
  "use strict";

  var cs = null;
  try { cs = new CSInterface(); } catch (e) { return; }

  var nodeRequire = null;
  try { nodeRequire = (typeof require !== "undefined") ? require : (window.cep_node ? window.cep_node.require : null); }
  catch (e) { nodeRequire = null; }
  if (!nodeRequire) return;

  var fs = nodeRequire("fs");
  var os = nodeRequire("os");
  var path = nodeRequire("path");
  var https = nodeRequire("https");
  var crypto = nodeRequire("crypto");
  var urlMod = nodeRequire("url");
  var nodeProcess = nodeRequire("process");
  var BufferCtor = (typeof Buffer !== "undefined") ? Buffer : nodeRequire("buffer").Buffer;

  var session = null;
  var sessionModelId = "";
  var pendingSelection = null;
  var busy = false;

  function audit(code, error) {
    if (window.CompXDiagnostics && window.CompXDiagnostics.fallback) window.CompXDiagnostics.fallback(code, error);
  }

  function el(id) { return document.getElementById(id); }

  function setStatus(message, state) {
    var node = el("aiDepthStatus");
    if (!node) return;
    node.textContent = message;
    node.className = "hint cx-ai-bg-status" + (state ? " is-" + state : "");
  }

  function setBusy(value) {
    busy = value;
    var button = el("btnAiDepthBuild");
    var mapOnly = el("btnAiDepthMapOnly");
    var reveal = el("btnAiDepthReveal");
    if (button) button.disabled = value;
    if (mapOnly) mapOnly.disabled = value;
    if (reveal) reveal.disabled = value;
  }

  function progress(label, percent) {
    setStatus(label + (percent ? " " + Math.round(percent) + "%" : ""), "busy");
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

  function hostArg(value) {
    return JSON.stringify(value == null ? "" : String(value));
  }

  function extensionRoot() {
    if (window.CompXLocalAI && window.CompXLocalAI.extensionRoot) return window.CompXLocalAI.extensionRoot();
    return cs.getSystemPath(SystemPath.EXTENSION);
  }

  function loadSpec() {
    var spec = JSON.parse(fs.readFileSync(path.join(extensionRoot(), "scripts", "depth-runtime.json"), "utf8"));
    if (!spec || spec.schema !== 1 || !spec.models || !spec.models.length) throw new Error("The depth manifest is invalid.");
    for (var i = 0; i < spec.models.length; i++) {
      if (!/^[a-f0-9]{64}$/.test(spec.models[i].sha256 || "")) throw new Error("The depth manifest is missing a checksum.");
    }
    return spec;
  }

  function chosenModel(spec) {
    var select = el("aiDepthQuality");
    var wanted = select ? select.value : spec.models[0].id;
    for (var i = 0; i < spec.models.length; i++) if (spec.models[i].id === wanted) return spec.models[i];
    return spec.models[0];
  }

  // Beside the other CompX runtimes, so a person can reclaim the space by
  // deleting one folder.
  function runtimeRoot() {
    if (os.platform() === "win32") {
      var local = (nodeProcess.env && nodeProcess.env.LOCALAPPDATA) || path.join(os.homedir(), "AppData", "Local");
      return path.join(local, "CompXOrbit", "Depth");
    }
    if (os.platform() === "darwin") return path.join(os.homedir(), "Library", "Application Support", "CompXOrbit", "Depth");
    return path.join(os.homedir(), ".cache", "CompXOrbit", "Depth");
  }

  function modelPath(model) { return path.join(runtimeRoot(), "models", model.file); }

  function installed(model) {
    try {
      var stat = fs.statSync(modelPath(model));
      return stat.isFile() && stat.size === model.bytes;
    } catch (e) { return false; }
  }

  function download(model) {
    return new Promise(function (resolve, reject) {
      var destination = modelPath(model);
      var partial = destination + ".part";
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      try { if (fs.existsSync(partial)) fs.unlinkSync(partial); }
      catch (e) { audit("DEPTH_PARTIAL_CLEANUP_001", e); }

      function request(currentUrl, redirects) {
        var req = https.get(currentUrl, function (response) {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            response.resume();
            if (redirects >= 8) { reject(new Error("Too many download redirects.")); return; }
            request(urlMod.resolve(currentUrl, response.headers.location), redirects + 1);
            return;
          }
          if (response.statusCode !== 200) {
            response.resume();
            reject(new Error("The model download returned HTTP " + response.statusCode + "."));
            return;
          }
          var total = Number(response.headers["content-length"]) || Number(model.bytes) || 0;
          var received = 0;
          var hash = crypto.createHash("sha256");
          var output = fs.createWriteStream(partial);
          var settled = false;

          function fail(error) {
            if (settled) return;
            settled = true;
            try { output.destroy(); } catch (e) { audit("DEPTH_STREAM_001", e); }
            try { if (fs.existsSync(partial)) fs.unlinkSync(partial); } catch (e2) { audit("DEPTH_PARTIAL_CLEANUP_002", e2); }
            reject(error);
          }

          response.on("data", function (chunk) {
            received += chunk.length;
            hash.update(chunk);
            progress("Downloading the depth model...", total ? received * 100 / total : 0);
          });
          response.on("error", fail);
          output.on("error", fail);
          output.on("finish", function () {
            output.close(function () {
              if (settled) return;
              // A model is code as far as the runtime is concerned, so it is
              // never kept unless it is byte for byte what was expected.
              if (hash.digest("hex") !== model.sha256 || received !== model.bytes) {
                fail(new Error("The downloaded model failed its security check and was discarded."));
                return;
              }
              try {
                if (fs.existsSync(destination)) fs.unlinkSync(destination);
                fs.renameSync(partial, destination);
                settled = true;
                resolve(destination);
              } catch (renameError) { fail(renameError); }
            });
          });
          response.pipe(output);
        });
        req.setTimeout(30000, function () { req.destroy(new Error("The model download timed out.")); });
        req.on("error", function (error) {
          try { if (fs.existsSync(partial)) fs.unlinkSync(partial); } catch (e) { audit("DEPTH_PARTIAL_CLEANUP_003", e); }
          reject(error);
        });
      }
      request(model.url, 0);
    });
  }

  function ensureModel(spec) {
    var model = chosenModel(spec);
    if (installed(model)) return Promise.resolve(model);
    var consent = window.confirm(
      "Download the depth model?\n\n" +
      model.name + " · " + model.sizeMB + " MB · " + spec.license + "\n" +
      "From " + spec.source + "\n\n" +
      "It is downloaded once and then runs entirely on this computer. No image ever leaves the machine."
    );
    if (!consent) return Promise.reject(new Error("Download cancelled."));
    return download(model).then(function () { return model; });
  }

  function ensureSession(spec) {
    var model = chosenModel(spec);
    if (session && sessionModelId === model.id) return Promise.resolve(session);
    var loader = window.CompXLocalAI && window.CompXLocalAI.loadOrtRuntime;
    if (!loader) return Promise.reject(new Error("The local AI runtime is not available in this build."));
    setStatus("Loading the depth model...", "busy");
    return loader().then(function (ortApi) {
      var bytes = new Uint8Array(fs.readFileSync(modelPath(model)));
      return ortApi.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
    }).then(function (created) {
      session = created;
      sessionModelId = model.id;
      return session;
    });
  }

  function loadImage(sourcePath) {
    return new Promise(function (resolve, reject) {
      var extension = path.extname(sourcePath).toLowerCase();
      var mime = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg";
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("That image could not be decoded.")); };
      image.src = "data:" + mime + ";base64," + fs.readFileSync(sourcePath).toString("base64");
    });
  }

  function inputTensor(image, spec, ortApi) {
    var size = Number(spec.input.size) || 518;
    var canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    var context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, size, size);
    var pixels = context.getImageData(0, 0, size, size).data;
    var plane = size * size;
    var data = new Float32Array(plane * 3);
    var mean = spec.input.mean, std = spec.input.std;
    for (var i = 0; i < plane; i++) {
      var p = i * 4;
      data[i] = (pixels[p] / 255 - mean[0]) / std[0];
      data[plane + i] = (pixels[p + 1] / 255 - mean[1]) / std[1];
      data[plane * 2 + i] = (pixels[p + 2] / 255 - mean[2]) / std[2];
    }
    return new ortApi.Tensor("float32", data, [1, 3, size, size]);
  }

  // The network returns relative depth with no fixed range, so it is
  // normalised to the full 0-255 the displacement map expects. White is near.
  function depthCanvas(output, width, height) {
    var values = output.data;
    var dims = output.dims || [];
    var side = Number(dims[dims.length - 1]) || Math.round(Math.sqrt(values.length));
    var rows = Number(dims[dims.length - 2]) || side;
    var count = side * rows;
    var minimum = Infinity, maximum = -Infinity;
    for (var i = 0; i < count; i++) {
      if (values[i] < minimum) minimum = values[i];
      if (values[i] > maximum) maximum = values[i];
    }
    var range = maximum - minimum || 1;

    var small = document.createElement("canvas");
    small.width = side; small.height = rows;
    var smallContext = small.getContext("2d", { willReadFrequently: true });
    var imageData = smallContext.createImageData(side, rows);
    for (var m = 0; m < count; m++) {
      var level = Math.round(Math.max(0, Math.min(1, (values[m] - minimum) / range)) * 255);
      var offset = m * 4;
      imageData.data[offset] = level;
      imageData.data[offset + 1] = level;
      imageData.data[offset + 2] = level;
      imageData.data[offset + 3] = 255;
    }
    smallContext.putImageData(imageData, 0, 0);

    var full = document.createElement("canvas");
    full.width = width; full.height = height;
    var fullContext = full.getContext("2d");
    fullContext.imageSmoothingEnabled = true;
    fullContext.imageSmoothingQuality = "high";
    fullContext.drawImage(small, 0, 0, width, height);
    return full;
  }

  function saveCanvas(canvas, sourcePath) {
    var root = path.join(runtimeRoot(), "outputs");
    fs.mkdirSync(root, { recursive: true });
    var base = path.basename(sourcePath, path.extname(sourcePath))
      .replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
    var destination = path.join(root, base + "_depth_" + Date.now() + ".png");
    var dataUrl = canvas.toDataURL("image/png");
    fs.writeFileSync(destination, BufferCtor.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"));
    return { path: destination, dataUrl: dataUrl };
  }

  function showPreview(dataUrl) {
    var preview = el("aiDepthPreview");
    var image = el("aiDepthPreviewImage");
    if (!preview || !image) return;
    var empty = preview.querySelector(".cx-ai-bg-preview-empty");
    if (empty) empty.hidden = true;
    image.src = dataUrl;
    image.hidden = false;
  }

  function refreshContext() {
    var label = el("aiDepthSelection");
    return hostCall("ae_bgRemoveSelectionInfo()").then(function (selection) {
      if (!selection.success) {
        pendingSelection = null;
        if (label) label.textContent = String(selection.message || "SELECT ONE IMAGE LAYER").toUpperCase();
        return null;
      }
      pendingSelection = selection;
      if (label) label.textContent = String(selection.name || "image").toUpperCase();
      return selection;
    });
  }

  // "rig" parallaxes the photo, "reveal" wipes it in through its own depth,
  // "map" just imports the map. All three share one depth pass.
  function numberFrom(id, fallback, low, high) {
    var node = el(id);
    var value = node ? parseFloat(node.value) : NaN;
    if (!isFinite(value)) value = fallback;
    return Math.max(low, Math.min(high, value));
  }

  function run(mode) {
    if (busy) return;
    setBusy(true);
    var spec;
    try { spec = loadSpec(); }
    catch (error) { setStatus(String(error.message || error), "error"); setBusy(false); return; }

    var selection = null;
    refreshContext().then(function (found) {
      if (!found) throw new Error("Select one still-image layer in the comp first.");
      selection = found;
      return ensureModel(spec);
    }).then(function () {
      return ensureSession(spec);
    }).then(function (active) {
      setStatus("Reading the image...", "busy");
      return loadImage(selection.path).then(function (image) {
        setStatus("Working out the depth...", "busy");
        var loader = window.CompXLocalAI.loadOrtRuntime;
        return loader().then(function (ortApi) {
          var feeds = {};
          feeds[spec.input.name] = inputTensor(image, spec, ortApi);
          return active.run(feeds).then(function (results) {
            var output = results[spec.output] || results[Object.keys(results)[0]];
            if (!output) throw new Error("The model returned nothing to read.");
            var canvas = depthCanvas(output, image.naturalWidth, image.naturalHeight);
            return saveCanvas(canvas, selection.path);
          });
        });
      });
    }).then(function (saved) {
      showPreview(saved.dataUrl);
      if (mode === "reveal") {
        setStatus("Building the reveal...", "busy");
        var reveal = {
          depthPath: saved.path,
          compId: selection.compId,
          layerId: selection.layerId,
          frames: Math.round(numberFrom("aiDepthRevealFrames", 30, 1, 600)),
          softness: numberFrom("aiDepthRevealSoft", 40, 0, 100),
          order: (el("aiDepthRevealOrder") || {}).value || "near",
          direction: (el("aiDepthRevealDirection") || {}).value || "reveal"
        };
        return hostCall("ae_depthReveal(" + hostArg(JSON.stringify(reveal)) + ")");
      }
      setStatus(mode === "rig" ? "Building the rig..." : "Importing the map...", "busy");
      var options = {
        depthPath: saved.path,
        compId: selection.compId,
        layerId: selection.layerId,
        amount: numberFrom("aiDepthAmount", 28, 0, 400),
        blur: numberFrom("aiDepthBlur", 0, 0, 80),
        preset: (el("aiDepthPreset") || {}).value || "push",
        rig: mode === "rig"
      };
      return hostCall("ae_depthBuildRig(" + hostArg(JSON.stringify(options)) + ")");
    }).then(function (result) {
      setStatus(result.message || (result.success ? "Done." : "After Effects refused that."), result.success ? "ok" : "error");
      setBusy(false);
    }).catch(function (error) {
      setStatus(String((error && error.message) || error), "error");
      setBusy(false);
    });
  }

  function init() {
    if (!el("studioAiDepth")) return;
    var build = el("btnAiDepthBuild");
    if (build) build.addEventListener("click", function () { run("rig"); });
    var mapOnly = el("btnAiDepthMapOnly");
    if (mapOnly) mapOnly.addEventListener("click", function () { run("map"); });
    var reveal = el("btnAiDepthReveal");
    if (reveal) reveal.addEventListener("click", function () { run("reveal"); });
    var refresh = el("btnAiDepthRefresh");
    if (refresh) refresh.addEventListener("click", function () { refreshContext(); });
    refreshContext();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
