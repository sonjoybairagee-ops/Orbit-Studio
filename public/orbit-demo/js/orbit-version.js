/* ============================================================
   ORBIT VERSION — single source of truth

   The version used to be hardcoded in four places (the manifest,
   the badge in index.html, main.js's backup header and the update
   checker's CONFIG) and they drifted apart: the panel showed one
   number while the installed bundle was another. This reads
   CSXS/manifest.xml at startup and publishes that one value, so
   the manifest is the only place a release number is ever typed.

   Exposes:
     window.CompXVersion         "3.0.0"  (bare, no "v")
     window.CompXVersionReady    a Promise-free callback list

   Loads before main.js and the update checker, both of which fall
   back to their own constant when this cannot read the manifest
   (a CEP build without Node file access, for example).
   ============================================================ */
(function (window) {
  "use strict";

  var FALLBACK = "3.0.0";

  function nodeRequire() {
    if (typeof require === "function") return require;
    if (typeof window.require === "function") return window.require;
    return null;
  }

  function extensionRoot() {
    try {
      var cs = new CSInterface();
      return String(cs.getSystemPath(SystemPath.EXTENSION) || "").replace(/\\/g, "/").replace(/\/+$/, "");
    } catch (e) { return ""; }
  }

  function readManifestVersion() {
    var req = nodeRequire();
    if (!req) return "";
    var root = extensionRoot();
    if (!root) return "";
    try {
      var fs = req("fs");
      var xml = fs.readFileSync(root + "/CSXS/manifest.xml", "utf8");
      var m = /ExtensionBundleVersion\s*=\s*"([^"]+)"/.exec(xml);
      return m ? m[1] : "";
    } catch (e) { return ""; }
  }

  var version = readManifestVersion() || FALLBACK;
  window.CompXVersion = version;

  function paintBadge() {
    var badge = document.getElementById("orbitVersionBadge");
    if (badge) badge.textContent = "v" + version;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", paintBadge);
  } else {
    paintBadge();
  }
  // The header is rebuilt by main.js after the licence gate, so repaint
  // once the rest of the panel has settled.
  setTimeout(paintBadge, 1200);
  setTimeout(paintBadge, 4000);
})(window);
