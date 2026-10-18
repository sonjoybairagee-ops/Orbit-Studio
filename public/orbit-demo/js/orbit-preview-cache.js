/* ============================================================
 * CompX preview cache
 *
 * The Text FX and Motion libraries ship 845 animated GIF previews — about
 * 170 MB, roughly three quarters of the whole package. Keeping them in the
 * ZXP made every update a 195 MB download, so they now live beside the other
 * big assets on https://assets.compxorbit.com and are fetched the first time
 * a thumbnail scrolls into view.
 *
 * What is NOT remote: the .ffx and .aep presets themselves. Those stay in the
 * package, so applying a preset works offline exactly as before — only the
 * little animated picture needs the network, and only once.
 *
 * Order of preference for any preview:
 *   1. the file inside the extension   (older installs, and the dev tree)
 *   2. the local cache folder          (downloaded earlier — works offline)
 *   3. the CDN                         (downloaded now, then cached)
 * ============================================================ */
(function (global) {
  "use strict";

  var REMOTE_BASE = "https://assets.compxorbit.com/previews/";
  var MAX_PARALLEL = 4;          // enough to keep scrolling smooth, not a flood
  var REQUEST_TIMEOUT_MS = 15000;
  var MAX_BYTES = 12 * 1024 * 1024;   // a preview GIF is ~200 KB; this is a sanity cap

  var fs = null, path = null, os = null, https = null, urlMod = null, nodeProcess = null, cs = null;
  try {
    var req = typeof require !== "undefined" ? require : (typeof global.require !== "undefined" ? global.require : null);
    if (req) {
      fs = req("fs"); path = req("path"); os = req("os");
      https = req("https"); urlMod = req("url"); nodeProcess = req("process");
    }
  } catch (nodeError) { void nodeError; }
  try { cs = new CSInterface(); } catch (csError) { void csError; }

  var nodeReady = !!(fs && path && os && https && urlMod);
  var queue = [], active = 0;
  var pending = {};   // key -> Promise, so two cards never fetch the same file
  var failed = {};    // key -> true, so an offline panel stops retrying all 750

  function extensionRoot() {
    try { return cs ? cs.getSystemPath(SystemPath.EXTENSION) : ""; }
    catch (error) { return ""; }
  }

  // Beside the AutoCaptions runtime, so everything CompX keeps on disk for a
  // user sits under one folder they can delete if they ever want the space back.
  function cacheRoot() {
    if (!nodeReady) return "";
    try {
      var base;
      if (os.platform() === "win32") {
        base = (nodeProcess && nodeProcess.env && nodeProcess.env.LOCALAPPDATA) ||
          path.join(os.homedir(), "AppData", "Local");
      } else if (os.platform() === "darwin") {
        base = path.join(os.homedir(), "Library", "Application Support");
      } else {
        base = path.join(os.homedir(), ".cache");
      }
      return path.join(base, "CompXOrbit", "PreviewCache");
    } catch (error) { return ""; }
  }

  function fileUrl(filePath) {
    var normalized = String(filePath || "").replace(/\\/g, "/");
    if (/^[A-Za-z]:\//.test(normalized)) normalized = "/" + normalized;
    return "file://" + encodeURI(normalized).replace(/#/g, "%23");
  }

  function remoteUrl(key) {
    return REMOTE_BASE + String(key || "").split("/").map(encodeURIComponent).join("/");
  }

  function localPath(root, key) {
    if (!root || !nodeReady) return "";
    var parts = String(key || "").split("/").filter(Boolean);
    if (!parts.length) return "";
    // Nothing from a key may climb out of its own folder.
    for (var i = 0; i < parts.length; i++) if (parts[i] === "." || parts[i] === "..") return "";
    return path.join.apply(path, [root].concat(parts));
  }

  function hasFile(filePath) {
    try { return !!(filePath && fs.existsSync(filePath) && fs.statSync(filePath).size > 0); }
    catch (error) { return false; }
  }

  // The copy that shipped with the extension, when there is one.
  function packagedPath(key) {
    var root = extensionRoot();
    if (!root || !nodeReady) return "";
    return localPath(path.join(root, "presets"), key);
  }

  function pump() {
    while (active < MAX_PARALLEL && queue.length) {
      var job = queue.shift();
      active++;
      job();
    }
  }

  function download(key, destination) {
    return new Promise(function (resolve, reject) {
      var done = false;
      function finish(error) {
        if (done) return;
        done = true;
        active--;
        pump();
        if (error) reject(error); else resolve();
      }

      queue.push(function () {
        var temporary = destination + ".part";
        try { fs.mkdirSync(path.dirname(destination), { recursive: true }); }
        catch (dirError) { finish(dirError); return; }

        function get(url, redirects) {
          var request;
          try { request = https.get(url, { timeout: REQUEST_TIMEOUT_MS }, onResponse); }
          catch (requestError) { finish(requestError); return; }
          request.on("timeout", function () { request.destroy(); finish(new Error("timeout")); });
          request.on("error", finish);

          function onResponse(response) {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
              response.resume();
              if (redirects >= 5) { finish(new Error("too many redirects")); return; }
              get(urlMod.resolve(url, response.headers.location), redirects + 1);
              return;
            }
            if (response.statusCode !== 200) {
              response.resume();
              finish(new Error("HTTP " + response.statusCode));
              return;
            }
            var received = 0;
            var out = fs.createWriteStream(temporary);
            response.on("data", function (chunk) {
              received += chunk.length;
              if (received > MAX_BYTES) { response.destroy(); out.destroy(); finish(new Error("too large")); }
            });
            response.on("error", finish);
            out.on("error", finish);
            out.on("close", function () {
              if (done) { try { fs.unlinkSync(temporary); } catch (e) {} return; }
              try {
                if (!received) throw new Error("empty");
                // Rename last, so a half-written file is never served as a cache hit.
                fs.renameSync(temporary, destination);
              } catch (renameError) {
                try { fs.unlinkSync(temporary); } catch (e) {}
                finish(renameError);
                return;
              }
              finish(null);
            });
            response.pipe(out);
          }
        }

        get(remoteUrl(key), 0);
      });
      pump();
    });
  }

  var CompXPreviewCache = {
    // True when this build can cache previews on disk. Without Node the panel
    // still shows them, straight from the CDN.
    ready: nodeReady,

    remoteUrl: remoteUrl,

    // A URL to use right now without waiting: the packaged or cached file when
    // one exists, otherwise "" (ask ensure() for the rest).
    immediate: function (key) {
      if (!key) return "";
      if (!nodeReady) return "";
      var packaged = packagedPath(key);
      if (hasFile(packaged)) return fileUrl(packaged);
      var cached = localPath(cacheRoot(), key);
      if (hasFile(cached)) return fileUrl(cached);
      return "";
    },

    // Resolves with a URL the <img> can use, or "" when the preview cannot be
    // had at all (offline, first run). Callers show their placeholder then.
    ensure: function (key) {
      if (!key) return Promise.resolve("");
      if (!nodeReady) return Promise.resolve(remoteUrl(key));

      var immediate = this.immediate(key);
      if (immediate) return Promise.resolve(immediate);
      if (failed[key]) return Promise.resolve("");
      if (pending[key]) return pending[key];

      var cached = localPath(cacheRoot(), key);
      if (!cached) return Promise.resolve("");

      pending[key] = download(key, cached).then(function () {
        delete pending[key];
        return fileUrl(cached);
      }).catch(function (error) {
        delete pending[key];
        failed[key] = true;
        void error;
        return "";
      });
      return pending[key];
    },

    // Called when the network comes back: give every preview another chance.
    retryFailed: function () { failed = {}; }
  };

  global.CompXPreviewCache = CompXPreviewCache;

  try {
    global.addEventListener("online", function () { CompXPreviewCache.retryFailed(); });
  } catch (listenerError) { void listenerError; }
})(window);
