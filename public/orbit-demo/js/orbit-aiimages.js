/* ============================================================
   AI IMAGES — prompt stills via Pollinations, then import into AE
   ============================================================ */
(function () {
  "use strict";

  var MAX_BYTES = 12 * 1024 * 1024;
  var MAX_COUNT = 4;
  var generatedImages = [];
  var currentSource = "pollinations";
  var busy = false;
  var nodeRequire = null;
  var cs = null;

  try { cs = new CSInterface(); } catch (e) { cs = null; }
  try {
    nodeRequire = (typeof require !== "undefined") ? require
      : (window.cep_node ? window.cep_node.require : null);
  } catch (e2) { nodeRequire = null; }

  function el(id) { return document.getElementById(id); }

  function setStatus(message, isError, isSuccess) {
    var status = el("aiStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (isError) status.classList.add("is-error");
    if (isSuccess) status.classList.add("is-success");
  }

  function setBusy(value) {
    busy = value;
    var button = el("btnAiGenerate");
    if (button) {
      button.disabled = value;
      button.textContent = value ? "Generating…" : "Generate";
    }
    var insert = el("btnAiInsertSelected");
    if (insert) insert.disabled = value;
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

  function hostCall(expression) {
    return new Promise(function (resolve) {
      if (!cs) {
        resolve({ success: false, message: "After Effects host is not available." });
        return;
      }
      cs.evalScript(expression, function (raw) { resolve(parseHostResult(raw)); });
    });
  }

  function outputFolder() {
    var os = nodeRequire("os");
    var path = nodeRequire("path");
    var fs = nodeRequire("fs");
    var base;
    if (os.platform() === "win32") {
      base = (nodeRequire("process").env.LOCALAPPDATA) || path.join(os.homedir(), "AppData", "Local");
      base = path.join(base, "CompXOrbit", "AIImages");
    } else if (os.platform() === "darwin") {
      base = path.join(os.homedir(), "Library", "Application Support", "CompXOrbit", "AIImages");
    } else {
      base = path.join(os.homedir(), ".cache", "CompXOrbit", "AIImages");
    }
    fs.mkdirSync(base, { recursive: true });
    return base;
  }

  function slug(text) {
    return String(text || "").replace(/\s+/g, "-").replace(/[^A-Za-z0-9\-]+/g, "")
      .replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).toLowerCase() || "image";
  }

  function trustedImageUrl(url) {
    try {
      var parsed = nodeRequire("url").parse(url);
      var host = String(parsed.hostname || "").toLowerCase();
      return parsed.protocol === "https:" && (
        host === "image.pollinations.ai" ||
        host.slice(-16) === ".pollinations.ai"
      );
    } catch (e) { return false; }
  }

  function downloadImage(url) {
    return new Promise(function (resolve, reject) {
      if (!nodeRequire) {
        reject(new Error("This build cannot download images."));
        return;
      }
      var https = nodeRequire("https");
      var fs = nodeRequire("fs");
      var path = nodeRequire("path");
      var finished = false;
      function end(err, val) {
        if (finished) return;
        finished = true;
        if (err) reject(err instanceof Error ? err : new Error(String(err)));
        else resolve(val);
      }
      (function hop(u, left) {
        if (!trustedImageUrl(u)) { end("Image host is not allowed."); return; }
        var req = https.get(u, { headers: { "User-Agent": "CompX-Orbit-Studio" } }, function (res) {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            res.resume();
            if (left <= 0) { end("Too many redirects."); return; }
            var next = String(res.headers.location);
            if (next.indexOf("http") !== 0) next = "https://image.pollinations.ai" + next;
            hop(next, left - 1);
            return;
          }
          if (res.statusCode !== 200) { res.resume(); end("Image server answered " + res.statusCode + "."); return; }
          var chunks = [];
          var total = 0;
          res.on("data", function (d) {
            total += d.length;
            if (total > MAX_BYTES) { req.abort(); end("That image is too large."); return; }
            chunks.push(d);
          });
          res.on("end", function () {
            try {
              var buf = Buffer.concat(chunks);
              var file = path.join(outputFolder(), slug(el("aiPromptInput").value) + "-" + Date.now() + ".png");
              fs.writeFileSync(file, buf);
              var blob = new Blob([buf], { type: "image/png" });
              end(null, { path: file, preview: URL.createObjectURL(blob) });
            } catch (writeErr) {
              end(writeErr);
            }
          });
        });
        req.on("error", function () { end("Could not reach the image server."); });
        req.setTimeout(45000, function () { req.abort(); end("The image download timed out."); });
      })(url, 4);
    });
  }

  function pollinationsUrl(prompt, style, size, seed) {
    var parts = size.split("x");
    var width = parseInt(parts[0], 10) || 1024;
    var height = parseInt(parts[1], 10) || 1024;
    var extra = "";
    if (currentSource === "stock") extra = ", documentary photograph, natural lighting, stock photo";
    else if (style) extra = ", " + style + " style";
    var full = prompt + extra;
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(full) +
      "?width=" + width + "&height=" + height + "&seed=" + seed + "&nologo=true";
  }

  function renderGallery() {
    var galleryGrid = el("aiGalleryGrid");
    if (!galleryGrid) return;
    if (!generatedImages.length) {
      galleryGrid.innerHTML = '<div class="ai-gallery-empty">No images generated yet</div>';
      return;
    }
    var html = "";
    var i;
    for (i = 0; i < generatedImages.length; i++) {
      var img = generatedImages[i];
      html += '<div class="ai-gallery-item' + (img.selected ? " selected" : "") + '" data-index="' + i + '">';
      html += '<img src="' + img.preview + '" alt="" />';
      html += '<div class="ai-gallery-checkbox' + (img.selected ? " checked" : "") + '">';
      if (img.selected) html += '<svg viewBox="0 0 20 20"><path d="M4 10l6 6 8-10" fill="none" stroke="#fff" stroke-width="2"/></svg>';
      html += "</div></div>";
    }
    galleryGrid.innerHTML = html;
    var items = galleryGrid.querySelectorAll(".ai-gallery-item");
    for (i = 0; i < items.length; i++) {
      items[i].addEventListener("click", function () {
        var index = parseInt(this.getAttribute("data-index"), 10);
        generatedImages[index].selected = !generatedImages[index].selected;
        renderGallery();
      });
    }
  }

  function generateImages() {
    if (busy) return;
    var promptInput = el("aiPromptInput");
    var prompt = promptInput ? String(promptInput.value || "").replace(/^\s+|\s+$/g, "") : "";
    if (!prompt) {
      setStatus("Please enter a prompt", true);
      if (promptInput) promptInput.focus();
      return;
    }
    var style = el("aiStyleSelect") ? el("aiStyleSelect").value : "";
    var size = el("aiSizeSelect") ? el("aiSizeSelect").value : "1024x1024";
    var quantity = parseInt(el("aiQuantitySelect") && el("aiQuantitySelect").value, 10) || 1;
    if (quantity < 1) quantity = 1;
    if (quantity > MAX_COUNT) quantity = MAX_COUNT;

    setBusy(true);
    setStatus("Generating " + quantity + " image" + (quantity > 1 ? "s" : "") + "…");

    var jobs = [];
    var i;
    for (i = 0; i < quantity; i++) {
      jobs.push(downloadImage(pollinationsUrl(prompt, style, size, Date.now() + i * 17)));
    }

    Promise.all(jobs).then(function (files) {
      for (i = 0; i < files.length; i++) {
        generatedImages.push({
          path: files[i].path,
          preview: files[i].preview,
          prompt: prompt,
          source: currentSource,
          size: size,
          selected: true
        });
      }
      renderGallery();
      setBusy(false);
      setStatus("Generated " + files.length + " image" + (files.length > 1 ? "s" : "") + ". Select and insert.", false, true);
    }).catch(function (error) {
      setBusy(false);
      setStatus(String((error && error.message) || error), true);
    });
  }

  function clearGallery() {
    var i;
    for (i = 0; i < generatedImages.length; i++) {
      if (generatedImages[i].preview && generatedImages[i].preview.indexOf("blob:") === 0) {
        try { URL.revokeObjectURL(generatedImages[i].preview); } catch (e) {}
      }
    }
    generatedImages = [];
    renderGallery();
    setStatus("Gallery cleared");
  }

  function insertSelected() {
    if (busy) return;
    var selected = [];
    var i;
    for (i = 0; i < generatedImages.length; i++) {
      if (generatedImages[i].selected) selected.push(generatedImages[i].path.replace(/\\/g, "/"));
    }
    if (!selected.length) {
      setStatus("Please select at least one image", true);
      return;
    }
    var duration = parseFloat(el("aiInsertDuration") && el("aiInsertDuration").value) || 2;
    setBusy(true);
    setStatus("Inserting " + selected.length + " image" + (selected.length > 1 ? "s" : "") + "…");
    hostCall("ae_insertImagesToTimeline(" + JSON.stringify(JSON.stringify({
      paths: selected,
      duration: duration
    })) + ")").then(function (result) {
      setBusy(false);
      setStatus(result.message || (result.success ? "Inserted." : "Insert failed."), !result.success, !!result.success);
    });
  }

  function openFromStockButton() {
    var stock = el("btnStockOpen");
    if (!stock) return;
    stock.addEventListener("click", function () {
      var radio = document.querySelector('input[name="aiSource"][value="stock"]');
      if (radio) {
        radio.checked = true;
        currentSource = "stock";
      }
      var tab = document.querySelector('#appTabsRow [data-apptab="aiimages"]');
      if (tab) tab.click();
      setStatus("Photo look — describe the still you want");
      var prompt = el("aiPromptInput");
      if (prompt) prompt.focus();
    });
  }

  function init() {
    if (!el("aiPromptInput") || !el("aiGalleryGrid")) return;

    var radios = document.querySelectorAll('input[name="aiSource"]');
    var i;
    for (i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", function () {
        currentSource = this.value;
        setStatus(currentSource === "stock" ? "Photo look — photographic stills from your prompt" : "Generate — illustrated or cinematic stills");
      });
    }
    el("btnAiGenerate").addEventListener("click", generateImages);
    el("btnAiClear").addEventListener("click", clearGallery);
    el("btnAiInsertSelected").addEventListener("click", insertSelected);
    openFromStockButton();
    setStatus("Ready to generate images");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
