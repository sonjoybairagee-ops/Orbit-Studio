/* ============================================================
   ORBIT ANIMATION TEMPLATES  (Animation tab → TEXT TEMPLATE / MOTION TEMPLATE)

   A browser for saved .aep templates. It reads exactly the bundle
   the Composition Library writes:

     <Name>.aep            the project holding the comp
     <Name>.png            poster thumbnail
     <Name>_frames/        frame_00.png … frame_11.png scrub frames

   Both libraries ship inside the extension, so there is no folder
   to choose: one instance is built per sub-tab, each reading its
   own bundled folder. TEXT TEMPLATE and MOTION TEMPLATE are
   therefore independent browsers with nothing to set up.
   The PREMIUM STYLES tab is left exactly as it was.

   Host side (jsx/hostscript.jsx):
     compx_useAnimationTemplate({path, text, mode})
     compx_rebuildCompositionPreview(path, outFolder)

   Cards animate on hover by cycling the frame PNGs. A bundle whose
   frames rendered empty is flagged rather than silently blank, with
   a Rebuild action that re-renders them from the .aep itself.
   ============================================================ */
(function () {
  "use strict";

  var STORE = "compXAnimTpl.";
  var FRAMES = 12;
  var BLANK_BYTES = 1100;   // a fully transparent 1920×1080 PNG lands under this

  // One browser per sub-tab. `dir` is the folder that ships inside the
  // extension; the user can point an instance somewhere else with BROWSE.
  var LIBRARIES = [
    {
      id: "text",
      panel: "texttpl",
      title: "TEXT ANIMATION TEMPLATES",
      sub: "Ready-made .aep text animations — hover a card to see it move, click to drop it on the timeline",
      dir: "assets/anim-templates",
      empty: "The built-in text template library is empty."
    },
    {
      id: "motion",
      panel: "motiontpl",
      title: "MOTION TEMPLATES",
      sub: "Icon and UI motion graphics — hover a card to see it move, click to drop it on the timeline",
      dir: "assets/motion-templates",
      empty: "The built-in motion template library is empty."
    }
  ];

  var nodeRequire = typeof require === "function"
    ? require
    : (typeof window.require === "function" ? window.require : null);
  var fs = nodeRequire ? nodeRequire("fs") : null;
  var pathUtil = nodeRequire ? nodeRequire("path") : null;

  function read(key, fallback) {
    try {
      var v = localStorage.getItem(STORE + key);
      return v === null ? fallback : v;
    } catch (e) { return fallback; }
  }

  function write(key, value) {
    try { localStorage.setItem(STORE + key, String(value)); } catch (e) { /* sandboxed */ }
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // The CEP folder picker hands back a file:// URL on some builds and a
  // plain path on others; Node hands back backslashes. Normalise once.
  function normalizePath(value) {
    var out = String(value || "");
    if (/^file:\/\//i.test(out)) {
      out = out.replace(/^file:\/\//i, "");
      if (/^localhost\//i.test(out)) out = out.replace(/^localhost/i, "");
      else if (out.charAt(0) !== "/") out = "//" + out;
      try { out = decodeURIComponent(out); } catch (de) { /* leave it visible */ }
      if (/^\/[A-Za-z]:\//.test(out)) out = out.slice(1);
    }
    return out.replace(/\\/g, "/").replace(/\/+$/, "");
  }

  function fileUrl(p) {
    var s = normalizePath(p);
    if (!s) return "";
    if (s.charAt(0) !== "/") s = "/" + s;
    return "file://" + s.split("/").map(encodeURIComponent).join("/").replace(/%3A/gi, ":");
  }

  function join(a, b) {
    if (pathUtil) return pathUtil.join(a, b);
    return normalizePath(a) + "/" + b;
  }

  function sizeOf(p) {
    if (!fs) return -1;
    try { return fs.statSync(p).size; } catch (e) { return -1; }
  }

  function extensionRoot() {
    try {
      var cs = new CSInterface();
      return normalizePath(cs.getSystemPath(SystemPath.EXTENSION));
    } catch (e) { return ""; }
  }

  function bundledFolder(lib) {
    if (!fs) return "";
    var root = extensionRoot();
    if (!root) return "";
    var dir = root + "/" + lib.dir;
    try { return fs.existsSync(dir) ? dir : ""; } catch (e) { return ""; }
  }

  // A ZXP installs under Program Files (or /Library), which a standard
  // user cannot write to — so rebuilt previews cannot land next to the
  // .aep on a customer's machine. They go to this cache instead, and the
  // scanner reads frames from here whenever the bundled ones are blank.
  function cacheFolder(lib) {
    var req = nodeRequire;
    if (!req || !pathUtil) return "";
    try {
      var os = req("os");
      var dir = pathUtil.join(os.homedir(), "Documents", "CompX", "PreviewCache", lib.id);
      fs.mkdirSync(dir, { recursive: true });
      return normalizePath(dir);
    } catch (e) { return ""; }
  }

  // Whether rebuilt previews can be written beside the templates. True on
  // a dev checkout, false on an installed ZXP — which is exactly what
  // decides where the rebuild writes.
  function isWritable(dir) {
    if (!fs || !dir) return false;
    var probe = dir + "/.compx-write-test";
    try {
      fs.writeFileSync(probe, "x");
      fs.unlinkSync(probe);
      return true;
    } catch (e) { return false; }
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

  // ------------------------------------------------------------------
  // One browser instance, bound to one sub-tab panel and one library.
  // ------------------------------------------------------------------
  function build(mount, lib) {
    var state = { folder: "", query: "", items: [] };
    var busy = false;

    state.folder = bundledFolder(lib);
    // Where a rebuild may write: beside the templates on a dev checkout,
    // otherwise the per-user cache, because an installed ZXP is read-only.
    var writeDir = isWritable(state.folder) ? state.folder : cacheFolder(lib);
    var bakedIn = writeDir === state.folder;
    var fillText = read(lib.id + ".text", "");
    var mode = read(lib.id + ".mode", "layer");

    var card = document.createElement("div");
    card.className = "tool-section oat-shell";
    card.setAttribute("data-oat-lib", lib.id);
    card.innerHTML =
      '<div class="tool-section-head">' +
        '<div>' +
          '<div class="tool-section-title">' + esc(lib.title) + '</div>' +
          '<div class="oat-sub">' + esc(lib.sub) + '</div>' +
        '</div>' +
        '<span class="tool-help" title="Each template is an .aep plus a poster PNG and a 12-frame preview folder. Clicking a card imports the composition into your open project and adds it to the current timeline; type something in the text box first and CompX retypes the template\'s text layers for you.">?</span>' +
      '</div>' +
      '<div class="oat-bar">' +
        '<input class="counter-input oat-search" placeholder="Search templates…" type="text" data-oat="search"/>' +
        '<span class="oat-count" data-oat="count">0</span>' +
        '<button class="oat-mini oat-rebuild-all" data-oat="rebuildall" title="Re-render the preview frames of every template whose thumbnails came out blank" type="button">REBUILD PREVIEWS</button>' +
      '</div>' +
      '<div class="oat-bar oat-bar-2">' +
        '<input class="counter-input oat-text" maxlength="60" placeholder="Replace template text with… (optional)" type="text" data-oat="text"/>' +
        '<div class="oat-modes" data-oat="modes" role="group" aria-label="How to place the template">' +
          '<button class="is-on" data-oat-mode="layer" type="button" title="Add the template as a layer on the comp that is open">AS LAYER</button>' +
          '<button data-oat-mode="open" type="button" title="Just import it and open the template comp">OPEN COMP</button>' +
        '</div>' +
      '</div>' +
      '<div class="oat-grid" data-oat="grid"></div>' +
      '<div class="oat-status" data-oat="status">Loading templates…</div>';
    mount.appendChild(card);

    function q(name) { return card.querySelector('[data-oat="' + name + '"]'); }

    var elSearch = q("search");
    var elCount = q("count");
    var elText = q("text");
    var elModes = q("modes");
    var grid = q("grid");
    var status = q("status");

    elText.value = fillText;

    function paintModes() {
      var btns = elModes.querySelectorAll("[data-oat-mode]");
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i].getAttribute("data-oat-mode") === mode;
        btns[i].classList.toggle("is-on", on);
        btns[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
    }
    paintModes();

    function say(msg, kind) {
      status.textContent = msg;
      status.className = "oat-status" + (kind ? " is-" + kind : "");
    }

    function run(code, working, done) {
      if (busy) return;
      var host = bridge();
      if (!host) { say("After Effects is not connected yet.", "error"); return; }
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

    // ---- reading the folder -------------------------------------------
    function scan() {
      state.items = [];
      if (!fs || !pathUtil) {
        say("This build cannot read the template library from disk.", "error");
        render();
        return;
      }
      if (!state.folder) { render(); return; }
      var names;
      try { names = fs.readdirSync(state.folder); } catch (e) {
        say("Could not read the built-in template library.", "error");
        render();
        return;
      }
      // Previews are looked for next to the template first (that is where
      // the baked-in ones live) and in the per-user cache second, so a
      // rebuild on a read-only install still shows up.
      function previewsFrom(dir, base) {
        var out = { frames: [], live: 0, poster: "" };
        if (!dir) return out;
        for (var f = 0; f < FRAMES; f++) {
          var fp = join(dir, base + "_frames/frame_" + (f < 10 ? "0" : "") + f + ".png");
          var sz = sizeOf(fp);
          if (sz <= 0) continue;
          out.frames.push(fileUrl(fp));
          // A frame at or under the blank threshold is a transparent render,
          // so counting them separately tells us the preview is unusable.
          if (sz > BLANK_BYTES) out.live++;
        }
        var posterPath = join(dir, base + ".png");
        if (sizeOf(posterPath) > BLANK_BYTES) out.poster = fileUrl(posterPath);
        return out;
      }

      for (var i = 0; i < names.length; i++) {
        var n = names[i];
        if (!/\.aep$/i.test(n)) continue;
        var base = n.replace(/\.aep$/i, "");

        var baked = previewsFrom(state.folder, base);
        var shot = baked;
        if (baked.live < 2 && !bakedIn) {
          var cached = previewsFrom(writeDir, base);
          if (cached.live >= 2) shot = cached;
          else if (!baked.poster && cached.poster) shot.poster = cached.poster;
        }

        state.items.push({
          name: base,
          aep: join(state.folder, n),
          poster: shot.poster,
          frames: shot.frames,
          live: shot.live
        });
      }
      state.items.sort(function (a, b) {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
      });
      render();
    }

    function filtered() {
      var s = state.query.toLowerCase();
      if (!s) return state.items;
      var out = [];
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].name.toLowerCase().indexOf(s) >= 0) out.push(state.items[i]);
      }
      return out;
    }

    // ---- rendering ----------------------------------------------------
    function render() {
      var items = filtered();
      elCount.textContent = String(state.items.length);
      grid.innerHTML = "";

      if (!state.folder) {
        grid.innerHTML = '<div class="oat-empty">The built-in template library is missing from this install. Reinstall the extension to restore it.</div>';
        say("Built-in library not found.", "error");
        return;
      }
      if (!items.length) {
        grid.innerHTML = '<div class="oat-empty">' +
          esc(state.items.length ? "Nothing matched that search." : lib.empty) + '</div>';
        return;
      }

      var blanks = 0;
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.live < 2) blanks++;
        var tile = document.createElement("article");
        tile.className = "oat-card" + (it.live < 2 ? " is-blank" : "");
        tile.setAttribute("data-oat-name", it.name);
        tile.innerHTML =
          '<div class="oat-thumb">' +
            (it.poster ? '<img alt="" src="' + esc(it.poster) + '"/>' : '<span class="oat-nothumb">NO PREVIEW</span>') +
            (it.live >= 2 ? '<span class="oat-badge">' + it.live + 'f</span>' : '') +
          '</div>' +
          '<div class="oat-name" title="' + esc(it.name) + '">' + esc(it.name) + '</div>' +
          '<div class="oat-row">' +
            '<button class="oat-use" data-oat-act="use" type="button">USE</button>' +
            '<button class="oat-rebuild" data-oat-act="rebuild" type="button" title="Re-render this template\'s preview frames from the .aep">&#8635;</button>' +
          '</div>';
        grid.appendChild(tile);
        bindHover(tile, it);
      }

      if (blanks) {
        say(blanks + " of " + items.length + " templates have blank preview frames — hit REBUILD PREVIEWS to render them all.", "warn");
      } else {
        say(items.length + " templates ready. Hover to preview, USE to place.", "ok");
      }
    }

    // Cycling the frame PNGs is the whole preview: no video, no GIF, just
    // the frames Comp Saver already wrote beside the project.
    function bindHover(tile, item) {
      if (item.live < 2) return;
      var img = tile.querySelector("img");
      if (!img) return;
      var poster = img.getAttribute("src");
      var timer = null;
      var at = 0;

      tile.addEventListener("mouseenter", function () {
        if (timer) return;
        at = 0;
        timer = setInterval(function () {
          if (!tile.parentNode) { clearInterval(timer); timer = null; return; }
          img.src = item.frames[at % item.frames.length];
          at++;
        }, 95);
      });
      tile.addEventListener("mouseleave", function () {
        if (timer) { clearInterval(timer); timer = null; }
        if (poster) img.src = poster;
      });
    }

    // ---- actions ------------------------------------------------------
    grid.addEventListener("click", function (ev) {
      var btn = ev.target;
      while (btn && btn !== grid && !btn.getAttribute("data-oat-act")) btn = btn.parentNode;
      if (!btn || btn === grid) return;
      var tile = btn;
      while (tile && tile !== grid && !tile.getAttribute("data-oat-name")) tile = tile.parentNode;
      if (!tile || tile === grid) return;

      var name = tile.getAttribute("data-oat-name");
      var item = null;
      for (var i = 0; i < state.items.length; i++) if (state.items[i].name === name) item = state.items[i];
      if (!item) return;

      if (btn.getAttribute("data-oat-act") === "rebuild") {
        run("compx_rebuildCompositionPreview(" + argOf(normalizePath(item.aep)) + "," + argOf(writeDir) + ")",
          "Re-rendering " + name + "…",
          function (parsed) { if (parsed && parsed.success) scan(); });
        return;
      }

      var all = grid.querySelectorAll(".oat-card");
      for (var j = 0; j < all.length; j++) all[j].classList.remove("is-active");
      tile.classList.add("is-active");

      var payload = {
        path: normalizePath(item.aep),
        text: elText.value || "",
        mode: mode
      };
      run("compx_useAnimationTemplate(" + argOf(JSON.stringify(payload)) + ")", "Placing " + name + "…");
    });

    elModes.addEventListener("click", function (ev) {
      var b = ev.target;
      while (b && b !== elModes && !b.getAttribute("data-oat-mode")) b = b.parentNode;
      if (!b || b === elModes) return;
      mode = b.getAttribute("data-oat-mode");
      write(lib.id + ".mode", mode);
      paintModes();
    });

    elSearch.addEventListener("input", function () {
      state.query = elSearch.value;
      render();
    });

    elText.addEventListener("input", function () { write(lib.id + ".text", elText.value); });

    // Rebuilding one at a time across dozens of templates is not a workflow,
    // so this walks every blank one in sequence and reports once at the end.
    q("rebuildall").addEventListener("click", function () {
      var queue = [];
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].live < 2) queue.push(state.items[i]);
      }
      if (!queue.length) { say("Every template already has preview frames.", "ok"); return; }
      if (!writeDir) {
        say("Previews cannot be rebuilt here — no writable folder is available.", "error");
        return;
      }
      var host = bridge();
      if (!host) { say("After Effects is not connected yet.", "error"); return; }

      var done = 0, failed = 0, at = 0;
      busy = true;
      card.classList.add("is-busy");

      function step() {
        if (at >= queue.length) {
          busy = false;
          card.classList.remove("is-busy");
          scan();
          var msg = "Rebuilt " + done + " of " + queue.length + " previews" +
            (failed ? " · " + failed + " could not render" : "") + ".";
          // On an installed ZXP these land in the per-user cache, so say
          // where they went rather than letting them look baked in.
          if (!bakedIn) msg += " Saved to Documents\\CompX\\PreviewCache (this computer only).";
          say(msg, failed ? "warn" : "ok");
          return;
        }
        var item = queue[at++];
        status.textContent = "Rebuilding " + at + "/" + queue.length + " — " + item.name + "…";
        status.className = "oat-status";
        host.call("compx_rebuildCompositionPreview(" + argOf(normalizePath(item.aep)) + "," + argOf(writeDir) + ")", function (parsed) {
          if (parsed && parsed.success) done++; else failed++;
          step();
        });
      }
      step();
    });

    scan();
  }

  function init() {
    for (var i = 0; i < LIBRARIES.length; i++) {
      var lib = LIBRARIES[i];
      var mount = document.querySelector('[data-text-library-panel="' + lib.panel + '"]');
      if (!mount || mount.querySelector('.oat-shell[data-oat-lib="' + lib.id + '"]')) continue;
      build(mount, lib);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // The Animation tab's sub-panels are built by main.js after the licence
  // gate, so retry once the rest of the panel has settled.
  setTimeout(init, 1300);
  setTimeout(init, 4200);
})();
