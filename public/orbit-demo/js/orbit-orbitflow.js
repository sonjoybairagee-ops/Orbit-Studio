/* ============================================================
   ORBITFLOW — HTML video drop + AE build
   ============================================================ */
(function () {
  "use strict";

  var fs = null;
  var pathMod = null;
  var conversionHistory = [];
  var currentFile = null;
  var buildTarget = "new";
  var dragDepth = 0;

  function nodeFs() {
    try {
      if (typeof require !== "undefined") {
        fs = require("fs");
        pathMod = require("path");
      } else if (typeof window.require !== "undefined") {
        fs = window.require("fs");
        pathMod = window.require("path");
      }
    } catch (e) {}
  }

  function $(id) {
    return document.getElementById(id);
  }

  function init() {
    nodeFs();
    var dropZone = $("flowDropZone");
    if (!dropZone) return;

    setupDragDrop(dropZone);
    dropZone.addEventListener("click", function (e) {
      if (e.target && e.target.id === "btnFlowOpen") return;
      pickFile();
    });
    dropZone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pickFile();
      }
    });

    $("btnFlowOpen").addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      pickFile();
    });

    var fileInput = $("flowFileInput");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        fileInput.value = "";
        if (file) loadFromBrowserFile(file);
      });
    }

    $("flowTargetNew").addEventListener("click", function () { setBuildTarget("new"); });
    $("flowTargetActive").addEventListener("click", function () { setBuildTarget("active"); });
    $("btnFlowConvert").addEventListener("click", convertToAE);
    $("btnFlowClear").addEventListener("click", clearFile);
    $("flowFileWhere").addEventListener("click", revealLoadedFile);
    $("btnFlowOpenBrowser").addEventListener("click", openBrowser);
    var captureBtn = $("btnFlowCapture");
    if (captureBtn) {
      captureBtn.disabled = true;
      captureBtn.title = "Live frame capture is not available in this build. Drop the HTML file and use Build in After Effects instead.";
      captureBtn.addEventListener("click", startCapture);
    }
    if ($("flowProgressText")) {
      $("flowProgressText").textContent = "Live capture unavailable — use Build in After Effects";
    }

    setStatus("Drop an HTML file to convert it to After Effects");
  }

  function setBuildTarget(value) {
    buildTarget = value === "active" ? "active" : "new";
    $("flowTargetNew").classList.toggle("sel", buildTarget === "new");
    $("flowTargetActive").classList.toggle("sel", buildTarget === "active");
    $("flowTargetHint").textContent = buildTarget === "new"
      ? "Creates its own comps in the project. Your other comps are left alone."
      : "Builds layers into the composition that is open now.";
  }

  function dropContainsFiles(dataTransfer) {
    if (!dataTransfer) return false;
    try {
      var types = Array.from(dataTransfer.types || []);
      if (types.indexOf("Files") >= 0 || types.indexOf("application/x-moz-file") >= 0) return true;
      return !!(dataTransfer.files && dataTransfer.files.length);
    } catch (e) {
      return false;
    }
  }

  function setupDragDrop(dropZone) {
    function clearHot() {
      dragDepth = 0;
      dropZone.classList.remove("hot");
    }

    dropZone.addEventListener("dragenter", function (e) {
      if (!dropContainsFiles(e.dataTransfer)) return;
      e.preventDefault();
      e.stopPropagation();
      dragDepth++;
      dropZone.classList.add("hot");
    });

    dropZone.addEventListener("dragover", function (e) {
      if (!dropContainsFiles(e.dataTransfer)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      dropZone.classList.add("hot");
    });

    dropZone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      e.stopPropagation();
      dragDepth = Math.max(0, dragDepth - 1);
      if (!dragDepth) dropZone.classList.remove("hot");
    });

    dropZone.addEventListener("drop", function (e) {
      if (!dropContainsFiles(e.dataTransfer)) return;
      e.preventDefault();
      e.stopPropagation();
      clearHot();
      var files = e.dataTransfer.files;
      if (!files || !files.length) {
        setStatus("Could not read the dropped item.", true);
        return;
      }
      loadFromBrowserFile(files[0]);
    });
  }

  function pickFile() {
    var fsApi = window.cep && window.cep.fs ? window.cep.fs : null;
    var calls = ["showOpenDialogEx", "showOpenDialog"];
    var exts = ["html", "htm", "css", "json", "codeflow"];
    var c, res;
    for (c = 0; c < calls.length; c++) {
      if (!fsApi || typeof fsApi[calls[c]] !== "function") continue;
      try {
        res = fsApi[calls[c]](false, false, "Open HTML video or OrbitFlow file", "", exts);
        if (res && res.data && res.data.length) {
          loadFromPath(String(res.data[0]));
          return;
        }
        if (res && res.err === 0) return;
      } catch (e) {}
    }
    if ($("flowFileInput")) $("flowFileInput").click();
  }

  function extOf(filePath) {
    var name = String(filePath || "").split(/[\\/]/).pop() || "";
    var dot = name.lastIndexOf(".");
    return dot >= 0 ? name.slice(dot).toLowerCase() : "";
  }

  function baseName(filePath) {
    return String(filePath || "").split(/[\\/]/).pop() || "untitled";
  }

  function dirName(filePath) {
    var s = String(filePath || "").replace(/[\\/]+$/, "");
    var i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
    return i >= 0 ? s.slice(0, i) : "";
  }

  function isSupportedName(name) {
    return /\.(html?|css|json|codeflow)$/i.test(name || "");
  }

  function loadFromBrowserFile(file) {
    var filePath = file && file.path ? String(file.path) : "";
    if (filePath && fs) {
      loadFromPath(filePath);
      return;
    }
    if (!file) {
      setStatus("Could not read the dropped file path. Drop from File Explorer.", true);
      return;
    }
    if (!isSupportedName(file.name)) {
      setStatus("Drop an HTML, CSS, JSON, or .codeflow file.", true);
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      ingestContent(file.name, "", String(e.target.result || ""), file.name);
    };
    reader.onerror = function () {
      setStatus("Could not read that file.", true);
    };
    reader.readAsText(file);
  }

  function loadFromPath(filePath) {
    if (!filePath) {
      setStatus("No file path.", true);
      return;
    }
    if (!fs) {
      setStatus("CEP local runtime is unavailable.", true);
      return;
    }
    try {
      var stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        var found = findHtmlInFolder(filePath);
        if (!found) {
          setStatus("No HTML or .codeflow file in that folder.", true);
          return;
        }
        filePath = found;
      }
    } catch (e) {
      setStatus("Could not open that path.", true);
      return;
    }

    if (!isSupportedName(filePath)) {
      setStatus("Drop an HTML, CSS, JSON, or .codeflow file.", true);
      return;
    }

    var content = "";
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch (e2) {
      setStatus("Could not read " + baseName(filePath), true);
      return;
    }
    ingestContent(baseName(filePath), filePath, content, filePath);
  }

  function findHtmlInFolder(folder) {
    var names;
    try {
      names = fs.readdirSync(folder);
    } catch (e) {
      return "";
    }
    var preferred = ["scene.json", "orbit.scene.json", "index.html", "index.htm", "video.html", "main.html"];
    var i, n, lower, full;
    for (i = 0; i < preferred.length; i++) {
      for (n = 0; n < names.length; n++) {
        if (String(names[n]).toLowerCase() === preferred[i]) {
          return pathMod ? pathMod.join(folder, names[n]) : folder + "/" + names[n];
        }
      }
    }
    for (n = 0; n < names.length; n++) {
      lower = String(names[n]).toLowerCase();
      if (/\.(html?|codeflow|json)$/.test(lower)) {
        full = pathMod ? pathMod.join(folder, names[n]) : folder + "/" + names[n];
        return full;
      }
    }
    return "";
  }

  function ingestContent(name, filePath, raw, sourceLabel) {
    var parsed = parseDroppedPayload(name, raw);
    if (!parsed.html && !parsed.css && !parsed.scene) {
      setStatus("That file did not contain HTML, CSS, or an Orbit Scene.", true);
      return;
    }

    var elements = parseHTML(parsed.html);
    var animations = parsed.css ? parseCSSAnimations(parsed.css) : [];
    var fonts = collectFonts(parsed.html, parsed.css);
    var duration = parsed.duration || readDurationInput();
    var size = parsed.size || { width: 1920, height: 1080 };

    currentFile = {
      name: name,
      path: filePath,
      html: parsed.html,
      css: parsed.css,
      elements: elements,
      animations: animations,
      fonts: fonts,
      duration: duration,
      width: size.width,
      height: size.height,
      // Scene JSON carriers — present only when a scene file was dropped
      scene: parsed.scene || null,
      sceneJson: parsed.sceneJson || "",
      isScene: !!parsed.scene
    };

    $("flowFileName").textContent = name;
    $("flowFileDir").textContent = filePath ? dirName(filePath) : "Loaded in panel";
    // Scene JSON reports its own layer count; HTML drops still use the
    // parsed-element count as before.
    var layerStat = parsed.scene ? (parsed.layerCount || 0) : elements.length;
    $("flowStatComps").textContent = String(Math.max(1, countCompHints(elements)));
    $("flowStatLayers").textContent = String(layerStat);
    $("flowStatDur").textContent = formatDuration(duration);

    var fontsRow = $("flowFontsRow");
    if (fonts.length) {
      fontsRow.classList.remove("hidden");
      fontsRow.innerHTML = '<span class="ic">Aa</span><span>Fonts: <b>' + escapeHtml(fonts.join(", ")) + "</b></span>";
    } else {
      fontsRow.classList.add("hidden");
      fontsRow.innerHTML = "";
    }

    $("flowEmpty").classList.add("hidden");
    $("flowLoaded").classList.remove("hidden");
    $("flowTargetBox").classList.remove("hidden");
    $("flowBuildBox").classList.remove("hidden");
    $("flowResult").classList.add("hidden");
    $("flowDuration").value = String(duration);

    setStatus("Loaded " + sourceLabel, false, true);
  }

  function parseDroppedPayload(name, raw) {
    var text = String(raw || "").replace(/^\uFEFF/, "");
    var ext = extOf(name);
    var html = "";
    var css = "";

    if (ext === ".css") {
      return { html: "", css: text, duration: 0, size: null };
    }

    if (ext === ".json" || ext === ".codeflow") {
      try {
        var obj = JSON.parse(text);
        // --- Scene JSON (Approach D) — the primary, lossless path ---
        // When a JSON file announces itself as an Orbit Scene, treat it as
        // a precompiled scene blueprint rather than trying to pull HTML/CSS
        // out of it. The actual build is delegated to ae_orbitFlowImport.
        if (obj && (obj.format === "orbit-scene" || obj.format === "orbitflow-scene")) {
          var cmp = obj.comp || {};
          return {
            html: "", css: "",
            scene: obj,
            sceneJson: text,
            duration: Number(cmp.duration || obj.duration || 0) || 5,
            size: { width: parseInt(cmp.width || 1920, 10), height: parseInt(cmp.height || 1080, 10) },
            layerCount: (obj.layers || []).length,
            compName: String(cmp.name || obj.name || "")
          };
        }
        html = obj.html || obj.markup || obj.source || "";
        css = obj.css || obj.styles || "";
        if (!html && typeof obj.content === "string") html = obj.content;
        if (!html && typeof obj === "string") html = obj;
        return {
          html: html,
          css: css,
          duration: Number(obj.duration || obj.DURATION || 0) || extractDuration(html + "\n" + css),
          size: extractSize(html, obj)
        };
      } catch (e) {
        html = text;
      }
    } else {
      html = text;
    }

    var extracted = extractCssFromHtml(html);
    return {
      html: extracted.html || html,
      css: extracted.css,
      duration: extractDuration(html),
      size: extractSize(html, null)
    };
  }

  function extractCssFromHtml(html) {
    var cssParts = [];
    var cleaned = String(html || "").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, function (_, block) {
      cssParts.push(block);
      return "";
    });
    return { html: cleaned, css: cssParts.join("\n") };
  }

  function extractDuration(text) {
    var src = String(text || "");
    var match = src.match(/\b(?:DURATION|TOTAL|LENGTH)\s*(?:=|:)\s*([0-9]*\.?[0-9]+)/i);
    if (match) return parseFloat(match[1]);
    match = src.match(/\b(?:TOTAL_MS|DURATION_MS)\s*(?:=|:)\s*([0-9]*\.?[0-9]+)/i);
    if (match) return parseFloat(match[1]) / 1000;
    return 0;
  }

  function extractSize(html, obj) {
    if (obj && (obj.width || obj.w) && (obj.height || obj.h)) {
      return { width: parseInt(obj.width || obj.w, 10) || 1920, height: parseInt(obj.height || obj.h, 10) || 1080 };
    }
    var src = String(html || "");
    var vw = src.match(/width\s*=\s*["']?(\d{3,5})/i);
    var vh = src.match(/height\s*=\s*["']?(\d{3,5})/i);
    if (vw && vh) return { width: parseInt(vw[1], 10), height: parseInt(vh[1], 10) };
    return { width: 1920, height: 1080 };
  }

  function collectFonts(html, css) {
    var blob = String(html || "") + "\n" + String(css || "");
    var fonts = [];
    var seen = {};
    var re = /font-family\s*:\s*([^;}{]+)/gi;
    var m, name;
    while ((m = re.exec(blob))) {
      name = m[1].replace(/["']/g, "").split(",")[0].trim();
      if (name && !seen[name.toLowerCase()]) {
        seen[name.toLowerCase()] = true;
        fonts.push(name);
      }
    }
    return fonts.slice(0, 6);
  }

  function countCompHints(elements) {
    var n = 1;
    elements.forEach(function (el) {
      if (el.tag === "section" || el.tag === "article" || (el.classes && el.classes.indexOf("comp") >= 0)) n++;
    });
    return n;
  }

  function formatDuration(sec) {
    var n = Number(sec) || 0;
    if (!n) return "—";
    if (n < 10) return (Math.round(n * 10) / 10) + "s";
    return Math.round(n) + "s";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function readDurationInput() {
    return parseFloat($("flowDuration").value) || 5;
  }

  function clearFile() {
    currentFile = null;
    $("flowEmpty").classList.remove("hidden");
    $("flowLoaded").classList.add("hidden");
    $("flowTargetBox").classList.add("hidden");
    $("flowBuildBox").classList.add("hidden");
    $("flowResult").classList.add("hidden");
    $("flowLog").textContent = "";
    setStatus("Drop an HTML file to convert it to After Effects");
  }

  function revealLoadedFile() {
    if (!currentFile || !currentFile.path) return;
    try {
      var cp = (typeof require !== "undefined" ? require : window.require)("child_process");
      var p = currentFile.path;
      if (process.platform === "win32") cp.exec('explorer /select,"' + p.replace(/\//g, "\\") + '"');
      else if (process.platform === "darwin") cp.exec('open -R "' + p + '"');
      else cp.exec('xdg-open "' + dirName(p) + '"');
    } catch (e) {
      setStatus("Could not open that folder.", true);
    }
  }

  function appendLog(line, cls) {
    var log = $("flowLog");
    var result = $("flowResult");
    result.classList.remove("hidden");
    var span = document.createElement("div");
    if (cls) span.className = cls;
    span.textContent = line;
    log.appendChild(span);
    log.scrollTop = log.scrollHeight;
  }

  function convertToAE() {
    if (!currentFile || (!currentFile.html && !currentFile.css && !currentFile.isScene)) {
      setStatus("Drop or open an HTML / Scene JSON file first.", true);
      return;
    }

    $("flowLog").innerHTML = "";
    appendLog("Building " + currentFile.name + "…");
    setStatus("Building in After Effects…");

    /* ===== Scene JSON route (Approach D — lossless, schema-based) =====
     * The scene JSON is sent to the host as-is. The host rebuilds the comp
     * from exact spec values. Zero conversion, zero fitting — every bezier
     * handle and value lands on the AE keyframe untouched. */
    if (currentFile.isScene && currentFile.sceneJson) {
      var sceneOpts = {
        targetLayer: buildTarget === "new" ? "new" : "active",
        sceneDir: currentFile.path ? dirName(currentFile.path) : ""
      };
      var sceneHistoryTag = {
        kind: "scene",
        compName: (currentFile.scene && currentFile.scene.comp && currentFile.scene.comp.name) || currentFile.name,
        layers: currentFile.scene && currentFile.scene.layers ? currentFile.scene.layers.length : 0
      };
      if (typeof CSInterface !== "undefined") {
        var csScene = new CSInterface();
        var argA = JSON.stringify(currentFile.sceneJson);
        var argB = JSON.stringify(JSON.stringify(sceneOpts));
        // Ask the host whether the importer is actually present before
        // calling it. It ships separately from this panel, so a build
        // without it should say so plainly instead of throwing
        // "ae_orbitFlowImport is not defined" at the user.
        csScene.evalScript('typeof ae_orbitFlowImport', function (probe) {
          if (String(probe || "").indexOf("function") < 0) {
            var msg = "This build has no Scene JSON importer yet — drop the HTML file instead, or rebuild the extension with it included.";
            setStatus(msg, true);
            appendLog(msg, "bad");
            return;
          }
          csScene.evalScript("ae_orbitFlowImport(" + argA + "," + argB + ")", function (response) {
            handleBuildResponse(response, sceneHistoryTag);
          });
        });
      } else {
        setStatus("Preview: " + sceneHistoryTag.layers + " scene layers (CEP host unavailable).", false, true);
        appendLog("Preview mode — CEP host is not available.", "warn");
        addToHistory(sceneHistoryTag, currentFile.name);
      }
      return;
    }

    /* ===== HTML/CSS legacy route — the old approximate importer ===== */
    var scale = parseInt($("flowScale").value, 10) || 100;
    var convertAnimations = $("flowConvertAnimations").checked;
    var preserveFonts = $("flowPreserveFonts").checked;
    var duration = currentFile.duration || readDurationInput();
    var fps = parseInt($("flowFps").value, 10) || 30;

    var result = {
      elements: currentFile.elements,
      animations: convertAnimations ? currentFile.animations : [],
      options: {
        targetLayer: buildTarget === "new" ? "new" : "selected",
        scale: scale,
        convertAnimations: convertAnimations,
        preserveFonts: preserveFonts,
        duration: duration,
        fps: fps,
        width: currentFile.width || 1920,
        height: currentFile.height || 1080,
        name: currentFile.name.replace(/\.[^.]+$/, "")
      }
    };

    if (typeof CSInterface !== "undefined") {
      var cs = new CSInterface();
      cs.evalScript("ae_convertHtmlToAe(" + JSON.stringify(result) + ")", function (response) {
        handleBuildResponse(response, result);
      });
    } else {
      setStatus("Preview: " + currentFile.elements.length + " layers, " + currentFile.animations.length + " animations", false, true);
      appendLog("Preview mode — CEP host is not available.", "warn");
      addToHistory(result, currentFile.name);
    }
  }

  function handleBuildResponse(response, historyTag) {
    try {
      var parsed = JSON.parse(response);
      if (parsed.ok || parsed.success) {
        setStatus(parsed.message || "Built.", false, true);
        appendLog(parsed.message || "Built.", "ok");
        addToHistory(historyTag, currentFile.name);
      } else {
        setStatus("Error: " + (parsed.message || "Build failed"), true);
        appendLog(parsed.message || "Build failed", "bad");
      }
    } catch (e) {
      setStatus("Build finished. Refresh the composition if layers are not visible.", false, true);
      appendLog("Build completed.", "ok");
      addToHistory(historyTag, currentFile.name);
    }
  }

  function openBrowser() {
    var html = currentFile ? currentFile.html : "";
    var css = currentFile ? currentFile.css : "";
    if (!html) {
      setStatus("Load an HTML file first.", true);
      return;
    }

    try {
      var htmlContent = html;
      if (css) {
        if (/<\/head>/i.test(htmlContent)) htmlContent = htmlContent.replace(/<\/head>/i, "<style>" + css + "</style></head>");
        else htmlContent = "<style>" + css + "</style>" + htmlContent;
      }
      if (htmlContent.indexOf("DURATION") === -1) {
        htmlContent = htmlContent.replace("<script>", "<script>const DURATION = " + readDurationInput() + ";");
      }

      if (typeof CSInterface !== "undefined") {
        var cs = new CSInterface();
        var tempPath = cs.getSystemPath(SystemPath.USER_DOCUMENTS) + "/OrbitFlow_Temp.html";
        cs.evalScript("ae_writeTempFile(" + JSON.stringify({ path: tempPath, content: htmlContent }) + ")", function (result) {
          try {
            var parsed = JSON.parse(result);
            if (parsed.ok) {
              cs.evalScript("ae_openBrowser(" + JSON.stringify({ url: "file:///" + parsed.path }) + ")", function (res) {
                var ok = res === "success" || (res && res.indexOf('"ok":true') >= 0);
                if (ok) {
                  $("flowBrowserStatus").textContent = "Browser open";
                  $("flowBrowserStatus").classList.add("active");
                  setStatus("Browser opened successfully", false, true);
                } else {
                  setStatus("Failed to open browser", true);
                }
              });
            }
          } catch (e) {
            setStatus("Error preparing HTML file", true);
          }
        });
      } else {
        setStatus("Browser requires CEP environment", true);
      }
    } catch (e) {
      setStatus("Error: " + e.message, true);
    }
  }

  function startCapture() {
    var message = "Live frame capture is not available in this build. Drop the HTML file and use Build in After Effects instead.";
    updateProgress(0, "Live capture unavailable");
    setStatus(message, true);

    if (typeof CSInterface === "undefined") return;
    try {
      var cs = new CSInterface();
      var duration = parseFloat($("flowDuration").value) || 5;
      var fps = parseInt($("flowFps").value, 10) || 30;
      cs.evalScript("ae_startFrameCapture(" + JSON.stringify({
        duration: duration,
        fps: fps,
        totalFrames: Math.floor(duration * fps)
      }) + ")", function (result) {
        try {
          var parsed = JSON.parse(result);
          setStatus(parsed.message || message, !parsed.ok, !!parsed.ok);
        } catch (e) {
          setStatus(message, true);
        }
      });
    } catch (e2) {
      setStatus(message, true);
    }
  }

  function updateProgress(percent, text) {
    $("flowProgressFill").style.width = percent + "%";
    $("flowProgressText").textContent = text;
  }

  function parseHTML(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html || "", "text/html");
    var elements = [];

    function traverse(node, parent) {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      var el = {
        tag: node.tagName.toLowerCase(),
        id: node.id || null,
        classes: Array.from(node.classList || []),
        styles: parseInlineStyles(node),
        text: (node.textContent || "").trim() || null,
        children: [],
        attributes: parseAttributes(node)
      };

      if (el.tag === "svg") {
        el.isSvg = true;
        el.width = node.getAttribute("width");
        el.height = node.getAttribute("height");
        el.viewBox = node.getAttribute("viewBox");
      }
      if (el.tag === "path") {
        el.isSvgPath = true;
        el.d = node.getAttribute("d");
      }
      if (el.tag === "circle") {
        el.isSvgCircle = true;
        el.cx = node.getAttribute("cx");
        el.cy = node.getAttribute("cy");
        el.r = node.getAttribute("r");
      }
      if (el.tag === "rect") {
        el.isSvgRect = true;
        el.x = node.getAttribute("x");
        el.y = node.getAttribute("y");
        el.width = node.getAttribute("width");
        el.height = node.getAttribute("height");
      }
      if (el.tag === "ellipse") {
        el.isSvgEllipse = true;
        el.cx = node.getAttribute("cx");
        el.cy = node.getAttribute("cy");
        el.rx = node.getAttribute("rx");
        el.ry = node.getAttribute("ry");
      }
      if (el.tag === "line") {
        el.isSvgLine = true;
        el.x1 = node.getAttribute("x1");
        el.y1 = node.getAttribute("y1");
        el.x2 = node.getAttribute("x2");
        el.y2 = node.getAttribute("y2");
      }
      if (el.tag === "text") {
        el.isSvgText = true;
        el.svgText = node.textContent;
      }

      elements.push(el);
      Array.from(node.childNodes).forEach(function (child) {
        traverse(child, el);
      });
      if (parent) parent.children.push(el);
    }

    traverse(doc.body, null);
    return elements;
  }

  function parseAttributes(node) {
    var attrs = {};
    var i, attr;
    for (i = 0; i < node.attributes.length; i++) {
      attr = node.attributes[i];
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }

  function parseInlineStyles(node) {
    var styles = {};
    var inline = node.getAttribute("style");
    if (inline) {
      inline.split(";").forEach(function (rule) {
        var parts = rule.split(":");
        if (parts.length >= 2) {
          styles[parts[0].trim()] = parts.slice(1).join(":").trim();
        }
      });
    }
    return styles;
  }

  function parseCSSAnimations(css) {
    var animations = [];
    var animationRegex = /@keyframes\s+([^{]+)\s*{([^}]+)}/g;
    var match;
    while ((match = animationRegex.exec(css)) !== null) {
      animations.push({
        name: match[1].trim(),
        keyframes: parseKeyframes(match[2].trim())
      });
    }
    return animations;
  }

  function parseKeyframes(content) {
    var keyframes = [];
    var keyframeRegex = /(\d+%|from|to)\s*{([^}]+)}/g;
    var match;
    while ((match = keyframeRegex.exec(content)) !== null) {
      keyframes.push({
        time: match[1].trim(),
        properties: parseKeyframeProperties(match[2].trim())
      });
    }
    return keyframes;
  }

  function parseKeyframeProperties(props) {
    var properties = {};
    props.split(";").forEach(function (prop) {
      var parts = prop.split(":");
      if (parts.length >= 2) {
        properties[parts[0].trim()] = parts.slice(1).join(":").trim();
      }
    });
    return properties;
  }

  function addToHistory(result, label) {
    conversionHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      label: label || "HTML",
      result: result
    });
    if (conversionHistory.length > 10) conversionHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    var list = $("flowHistoryList");
    if (!list) return;
    if (!conversionHistory.length) {
      list.innerHTML = '<div class="flow-history-empty">No conversions yet</div>';
      return;
    }
    list.innerHTML = conversionHistory.map(function (item) {
      return '<div class="flow-history-item">' +
        '<div class="flow-history-name">' + escapeHtml(item.label) + " · " + item.result.elements.length + " layers</div>" +
        '<div class="flow-history-time">' + escapeHtml(item.timestamp) + "</div>" +
        "</div>";
    }).join("");
  }

  function setStatus(message, isError, isSuccess) {
    var status = $("flowStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("is-error", "is-success");
    if (isError) status.classList.add("is-error");
    if (isSuccess) status.classList.add("is-success");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.OrbitFlow = {
    convertToAE: convertToAE,
    parseHTML: parseHTML,
    parseCSSAnimations: parseCSSAnimations
  };
})();
