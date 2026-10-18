(function() {
  "use strict";

  let toastTimer;
  let activeAudio = null;

  // -------------------------------------------------------------
  // Host Bridge & Toast Simulation for Interactive Demo
  // -------------------------------------------------------------
  window.showToast = function(msg, isErr) {
    const feedback = document.getElementById("demo-feedback");
    if (feedback) {
      feedback.textContent = (isErr ? "⚠ " : "✓ ") + msg;
      feedback.style.borderColor = isErr ? "rgba(255,80,80,0.6)" : "rgba(60,255,95,0.6)";
      feedback.style.color = isErr ? "#ff9494" : "#eafff0";
      feedback.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { feedback.hidden = true; }, 3000);
    }
  };

  window.CompXHostBridge = {
    call: function(script, cb) {
      if (typeof cb === "function") {
        cb({ success: true, message: "Applied color to AE/PR layer" });
      }
    },
    arg: function(val) {
      return JSON.stringify(String(val == null ? "" : val));
    }
  };

  window.CompXRecentColors = {
    add: function(hex) {
      if (typeof addRecentColor === "function") {
        addRecentColor(hex);
      }
    }
  };

  // -------------------------------------------------------------
  // 1. DATA: Torsten MOGRT Presets (Extracted from user path)
  // -------------------------------------------------------------
  const TORSTEN_MOGRTS = [
    {
      id: "blur-fade-in",
      name: "Blur Fade In With Shine",
      file: "Blur-Fade-In-WIth-Shine",
      tag: "Shine & Blur",
      cat: "shine",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "cinematic-blur",
      name: "Cinematic Blur Animation",
      file: "Cinematic-Blur-Animation",
      tag: "Blur Motion",
      cat: "blur",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "fast-wip",
      name: "Fast Wip Animation",
      file: "Fast-Wip-Animation",
      tag: "Whip Pan",
      cat: "blur",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "fast-wip-shine",
      name: "Fast Wip Shine Animation",
      file: "Fast-Wip-Shine-Animation",
      tag: "Shine & Whip",
      cat: "shine",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "flicker-shine",
      name: "Flicker Shine Effect",
      file: "Flicker-Shine-Effect",
      tag: "Flicker Shine",
      cat: "shine",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "regular-anim",
      name: "Regular Animation",
      file: "Regular-Animation",
      tag: "Clean Motion",
      cat: "blur",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "shine-text",
      name: "Shine Text Effect",
      file: "Shine-Text-Effect",
      tag: "Shine FX",
      cat: "shine",
      sub: "Torsten Collection · Live Class"
    },
    {
      id: "shine-text-anim",
      name: "Shine Text With Animation",
      file: "Shine-Text-With-Animation",
      tag: "Shine & Pop",
      cat: "shine",
      sub: "Torsten Collection · Live Class"
    }
  ];

  // -------------------------------------------------------------
  // 2. DATA: Real SFX Sound Effects (Audio files in assets/sfx)
  // -------------------------------------------------------------
  const SFX_ITEMS = [
    { name: "Flyby Woosh 01", file: "AEJuice Flyby 01.wav", dur: "0:02", tag: "TRANSITION", cat: "whoosh", size: "320 KB", ext: "WAV" },
    { name: "UI Snap Click 07", file: "AEJuice Click 07.wav", dur: "0:01", tag: "UI / POP", cat: "ui", size: "180 KB", ext: "WAV" },
    { name: "Cashbox Register Bell", file: "AEJuice Cashbox 01.wav", dur: "0:02", tag: "COMMERCE", cat: "ui", size: "260 KB", ext: "WAV" },
    { name: "Cyber Glitch Transition 03", file: "AEJuice Futuristic Glitch Transition 03.wav", dur: "0:02", tag: "GLITCH", cat: "glitch", size: "290 KB", ext: "WAV" },
    { name: "Cinematic Heavy Impact 07", file: "AEJuice Impact 07.wav", dur: "0:03", tag: "IMPACT", cat: "whoosh", size: "480 KB", ext: "WAV" },
    { name: "Magic Particle Woosh 01", file: "AEJuice Magic Woosh 01.wav", dur: "0:03", tag: "MAGIC", cat: "whoosh", size: "420 KB", ext: "WAV" },
    { name: "Paper Flip Texture 01", file: "AEJuice Paper Flip 01.wav", dur: "0:02", tag: "TEXTURE", cat: "ui", size: "210 KB", ext: "WAV" },
    { name: "Smash Hit Impact 01", file: "AEJuice Smash 01.wav", dur: "0:02", tag: "HIT", cat: "whoosh", size: "350 KB", ext: "WAV" },
    { name: "Sub Bass Drop 05", file: "AEJuice Sub Bass Drop 05.wav", dur: "0:04", tag: "SUB BASS", cat: "whoosh", size: "640 KB", ext: "WAV" },
    { name: "Electric Neon Flicker 01", file: "AEJuice Flicker 01.wav", dur: "0:01", tag: "SCI-FI", cat: "glitch", size: "190 KB", ext: "WAV" },
    { name: "Cinematic Explosion 01", file: "AEJuice Explosion 01.wav", dur: "0:03", tag: "BOOM", cat: "whoosh", size: "520 KB", ext: "WAV" },
    { name: "Hi-Tech Scan Device 01", file: "AEJuice Hi-Tech Device 01.wav", dur: "0:02", tag: "DIGITAL", cat: "glitch", size: "310 KB", ext: "WAV" }
  ];

  // -------------------------------------------------------------
  // 3. DATA: Text Animation Styles (Bundled AE Presets)
  // -------------------------------------------------------------
  const TEXT_STYLES = [
    { id: "viralText", name: "Viral Text", desc: "Bold social-ready viral pop", sample: "VIRAL", anim: "pop", cat: "Viral" },
    { id: "alphabetBlink", name: "Alphabet Blink", desc: "Letter-by-letter blink-on reveal", sample: "BLINK", anim: "blink", cat: "Blink" },
    { id: "blurUp", name: "Blur Up", desc: "Soft blur rises up into focus", sample: "BLUR", anim: "blur", cat: "Blur" },
    { id: "bounceText", name: "Bounce Text", desc: "Playful springy bounce reveal", sample: "BOUNCE", anim: "bounce", cat: "Bounce" },
    { id: "bounceSlideDown", name: "Bounce Slide Down", desc: "Word bounces in sliding downward", sample: "DOWN", anim: "down", cat: "Bounce" },
    { id: "bounceSlideLeft", name: "Bounce Slide Left", desc: "Word bounces in from the right", sample: "LEFT", anim: "left", cat: "Bounce" },
    { id: "bounceSlideRight", name: "Bounce Slide Right", desc: "Word bounces in from the left", sample: "RIGHT", anim: "right", cat: "Bounce" },
    { id: "bounceSlideUp", name: "Bounce Slide Up", desc: "Word bounces in sliding upward", sample: "UP", anim: "up", cat: "Bounce" },
    { id: "wordByWord", name: "Word By Word", desc: "Reveals one word at a time", sample: "WORDS", anim: "pop", cat: "Viral" },
    { id: "fadeUpOut", name: "Fade Up And Out", desc: "Smooth fade up then fade out", sample: "FADE", anim: "fade", cat: "Fade" },
    { id: "letterFlicker", name: "Letter Flicker", desc: "Nervous per-letter flicker-on", sample: "FLICK", anim: "blink", cat: "Blink" },
    { id: "mainText", name: "Main Title Pop", desc: "Clean punchy main-title pop", sample: "MAIN", anim: "pop", cat: "Viral" },
    { id: "oneByOne", name: "One By One", desc: "Characters pop in one by one", sample: "1BY1", anim: "pop", cat: "Viral" },
    { id: "smoothFade", name: "Smooth Fade In/Out", desc: "Gentle fade in and out", sample: "SMOOTH", anim: "fade", cat: "Fade" },
    { id: "textBounce", name: "Text Elastic Bounce", desc: "Elastic scale bounce reveal", sample: "ELASTIC", anim: "bounce", cat: "Bounce" },
    { id: "characterDown", name: "Character Drop Down", desc: "Characters drop in one by one", sample: "DROP", anim: "down", cat: "Bounce" },
    { id: "wordRampBlur", name: "Word Ramp + Blur", desc: "Word ramps up with cinematic blur", sample: "RAMP", anim: "blur", cat: "Blur" },
    { id: "textEvo", name: "TextEvo High Energy", desc: "Evolving high-energy text motion", sample: "EVO", anim: "pop", cat: "Viral" },
    { id: "voxGlow", name: "VOX Flicker + Glow", desc: "Flickering luminous text reveal", sample: "GLOW", anim: "blink", cat: "Blink" },
    { id: "voxLoad", name: "VOX Load Up", desc: "Loading-style upward text reveal", sample: "LOAD", anim: "up", cat: "Fade" },
    { id: "textJitter", name: "Fast Text Jitter", desc: "Fast jittering energetic text motion", sample: "JITTER", anim: "bounce", cat: "Bounce" },
    { id: "characterRight", name: "Character Slide", desc: "Characters slide in from the left", sample: "SLIDE", anim: "right", cat: "Viral" },
    { id: "wordBlink", name: "Word Blink Sync", desc: "Whole word blinks on with rhythm", sample: "SYNC", anim: "blink", cat: "Blink" },
    { id: "rainbowWave", name: "Rainbow Wave Reveal", desc: "Chromatic letters cycle in", sample: "WAVE", anim: "rainbow", cat: "Viral" }
  ];

  // -------------------------------------------------------------
  // 4. DATA: Motion Presets (AEP Projects)
  // -------------------------------------------------------------
  const MOTION_PRESETS = [
    { name: "Kinetic Split Title", cat: "Titles", icon: "⚡", desc: "Bold typography entrance with split lines" },
    { name: "Minimal Clean Lower Third", cat: "Lower Thirds", icon: "🏷️", desc: "Modern creator name & social tag" },
    { name: "Smooth Zoom Transition", cat: "Transitions", icon: "🔄", desc: "Seamless whip zoom blur transition" },
    { name: "YouTube Subscribe Card", cat: "Social", icon: "🔔", desc: "Animated bell, button & channel avatar" },
    { name: "Cyberpunk HUD Circle", cat: "UI / HUD", icon: "🎯", desc: "High-tech rotating data ring with glow" },
    { name: "Staggered Bento Cards", cat: "Showcase", icon: "📦", desc: "3D staggered card grid pop entrance" },
    { name: "Animated Infographic Bar", cat: "Graphics", icon: "📊", desc: "Data growth chart with number counter" },
    { name: "Glitch Logo Reveal", cat: "Openers", icon: "✨", desc: "RGB channel aberration logo impact" }
  ];

  // -------------------------------------------------------------
  // 5. DATA: FFX Presets
  // -------------------------------------------------------------
  const FFX_PRESETS = [
    { name: "Handheld Camera Shake", type: "Camera", desc: "Realistic natural documentary camera tremor" },
    { name: "VHS 4K Tape Glitch", type: "Retro", desc: "Scanlines, chroma noise and tape stutter" },
    { name: "RGB Split Impact Zoom", type: "Impact", desc: "Chromatic aberration punch on beat" },
    { name: "Elastic Bounce In/Out", type: "Transform", desc: "Zero-keyframe dynamic expression bounce" },
    { name: "Kinetic Whip Pan Blur", type: "Camera", desc: "High-speed directional blur transition" },
    { name: "Cinematic Film Halation", type: "Look", desc: "Warm highlight bleed and vintage 35mm grain" },
    { name: "Liquid Distortion Wave", type: "Warp", desc: "Smooth wave morph displacement" },
    { name: "Auto Cut Silence Pulse", type: "Utility", desc: "Highlights speech audio timeline cuts" }
  ];

  function escapeHtml(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function previewChars(sample) {
    return String(sample || "TEXT").slice(0, 7).split("").map(function(ch) {
      return '<span class="tanim-pchar">' + escapeHtml(ch) + '</span>';
    }).join("");
  }

  // -------------------------------------------------------------
  // 6. POPULATE MOGRT TAB (Torsten Mogrts with hover video)
  // -------------------------------------------------------------
  let currentMogrtFilter = "all";

  function populateMogrtLibrary() {
    const libraryGrid = document.querySelector("#panel-mogrt #library");
    const folderTree = document.querySelector("#panel-mogrt #folderTree");
    const countEl = document.getElementById("libItemCount");
    const footerCount = document.getElementById("libSidebarFooter");
    const searchInput = document.querySelector("#panel-mogrt #search");

    if (!libraryGrid) return;

    // Clear any browser email autofill
    if (searchInput && (searchInput.value.includes("@") || searchInput.value.includes(".com"))) {
      searchInput.value = "";
    }

    if (countEl) countEl.textContent = TORSTEN_MOGRTS.length + " items";
    if (footerCount) footerCount.textContent = TORSTEN_MOGRTS.length + " items";

    if (folderTree && !folderTree._populated) {
      folderTree.innerHTML = `
        <div class="tree-folder active" data-mogrt-cat="all">📁 All Mogrts (8)</div>
        <div class="tree-folder" data-mogrt-cat="all">📁 Torsten Mogrt (8)</div>
        <div class="tree-folder" data-mogrt-cat="shine">📁 Shine Effects (5)</div>
        <div class="tree-folder" data-mogrt-cat="blur">📁 Blur Motions (3)</div>
      `;
      folderTree._populated = true;

      folderTree.querySelectorAll(".tree-folder").forEach(f => {
        f.addEventListener("click", () => {
          folderTree.querySelectorAll(".tree-folder").forEach(x => x.classList.remove("active"));
          f.classList.add("active");
          currentMogrtFilter = f.dataset.mogrtCat || "all";
          renderMogrts();
        });
      });
    }

    function renderMogrts() {
      // Clear email autofill if still present
      if (searchInput && (searchInput.value.includes("@") || searchInput.value.includes(".com"))) {
        searchInput.value = "";
      }
      const q = searchInput ? String(searchInput.value || "").trim().toLowerCase() : "";

      const filtered = TORSTEN_MOGRTS.filter(m => {
        const catMatch = currentMogrtFilter === "all" || m.cat === currentMogrtFilter;
        const qMatch = !q || m.name.toLowerCase().includes(q) || m.tag.toLowerCase().includes(q);
        return catMatch && qMatch;
      });

      if (countEl) countEl.textContent = filtered.length + " items";

      if (filtered.length === 0) {
        libraryGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; color: #8fa195; font-size: 12px;">
            No MOGRTs match "${escapeHtml(q)}".
            <div style="margin-top: 12px;">
              <button type="button" id="btnClearMogrtSearch" style="padding: 5px 14px; background: #16241a; border: 1px solid #3cff5f; color: #3cff5f; border-radius: 4px; cursor: pointer; font-size: 11px;">Clear search</button>
            </div>
          </div>
        `;
        const clr = libraryGrid.querySelector("#btnClearMogrtSearch");
        if (clr) clr.addEventListener("click", () => {
          if (searchInput) searchInput.value = "";
          renderMogrts();
        });
        return;
      }

      libraryGrid.innerHTML = filtered.map(m => {
        return `
          <div class="mogrt-card" data-mogrt-id="${m.id}" title="${escapeHtml(m.name)}">
            <div class="mogrt-thumb-wrap">
              <img src="assets/mogrt-previews/${m.file}.png" class="mogrt-thumb" alt="${escapeHtml(m.name)}" />
              <video src="assets/mogrt-previews/${m.file}.mp4" class="mogrt-video" loop muted playsinline preload="metadata"></video>
              <div class="mogrt-badge">${escapeHtml(m.tag)}</div>
              <div class="mogrt-hover-hint">▶ Hover to preview</div>
            </div>
            <div class="mogrt-meta">
              <div class="mogrt-title">${escapeHtml(m.name)}</div>
              <div class="mogrt-sub">${escapeHtml(m.sub)}</div>
            </div>
            <div class="mogrt-actions">
              <button class="tool-btn mogrt-btn" type="button">Apply MOGRT</button>
            </div>
          </div>
        `;
      }).join("");

      // Wire video hover play on cards
      libraryGrid.querySelectorAll(".mogrt-card").forEach(card => {
        const video = card.querySelector(".mogrt-video");
        if (!video) return;

        card.addEventListener("mouseenter", () => {
          video.currentTime = 0;
          const playPromise = video.play();
          if (playPromise) playPromise.catch(() => {});
        });

        card.addEventListener("mouseleave", () => {
          video.pause();
          video.currentTime = 0;
        });

        const btn = card.querySelector(".mogrt-btn");
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = card.dataset.mogrtId;
            const m = TORSTEN_MOGRTS.find(x => x.id === id);
            if (window.showToast) window.showToast("Applied " + (m ? m.name : "MOGRT") + " to Premiere/AE timeline");
          });
        }
      });
    }

    if (searchInput && !searchInput._wired) {
      searchInput.addEventListener("input", renderMogrts);
      searchInput._wired = true;
    }

    renderMogrts();
  }

  // -------------------------------------------------------------
  // 7. POPULATE SFX TAB (Sound Designer Workspace & Waveform)
  // -------------------------------------------------------------
  let currentSfxCat = "all";
  let currentSfx = null;
  let sfxAudioAnimId = null;
  let sfxReverse = false;

  const FOLDERS_DATA = [
    { id: "all", name: "All local sounds", desc: "12 indexed sounds", count: 12, isAll: true },
    { id: "whoosh", name: "Whooshes & Hits", desc: "Essential swooshes", count: 6 },
    { id: "glitch", name: "Glitches & Tech", desc: "Digital impacts", count: 3 },
    { id: "ui", name: "UI & Paper", desc: "Clicks & textures", count: 3 }
  ];

  function drawWaveform(sound, progress) {
    const canvas = document.getElementById("sfxdWave");
    if (!canvas) return;
    const w = canvas.clientWidth || 360;
    const h = canvas.clientHeight || 64;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    // Grid lines
    g.strokeStyle = "rgba(90, 120, 100, 0.16)";
    g.lineWidth = 1;
    for (let k = 1; k < 4; k++) {
      const x = Math.round(w * k / 4) + 0.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }

    if (!sound) {
      g.fillStyle = "rgba(125, 150, 135, 0.4)";
      g.font = "10px 'Segoe UI', -apple-system, sans-serif";
      g.textAlign = "center";
      g.fillText("Select a sound to view waveform", w / 2, h / 2 + 3);
      return;
    }

    // Deterministic pseudo-random seed based on sound file name
    let seed = 0;
    for (let c = 0; c < sound.file.length; c++) seed = (seed * 31 + sound.file.charCodeAt(c)) & 0xffffffff;
    function rand() {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 4294967296;
    }

    const midL = h * 0.28;
    const midR = h * 0.72;
    const barWidth = 2;
    const gap = 1;
    const totalBars = Math.floor(w / (barWidth + gap));

    // Draw stereo peak bars
    for (let i = 0; i < totalBars; i++) {
      const r = i / totalBars;
      let env = 1;
      if (sound.cat === "whoosh") {
        env = Math.sin(r * Math.PI) * (0.35 + 0.65 * Math.pow(Math.sin(r * Math.PI * 1.5), 2));
      } else if (sound.cat === "glitch") {
        env = (0.2 + 0.8 * rand()) * Math.sin(r * Math.PI);
      } else {
        env = Math.exp(-r * 3.5) * 0.85 + 0.15 * rand();
      }
      const noise = 0.45 + 0.55 * rand();
      const barH = Math.max(2, env * noise * (h * 0.4));
      const bx = i * (barWidth + gap);

      // Played vs unplayed bar color
      const isPlayed = progress > 0 && (bx / w) <= progress;
      g.fillStyle = isPlayed ? "#3cff5f" : "rgba(60, 255, 95, 0.65)";

      // Left Channel
      g.fillRect(bx, midL - barH / 2, barWidth, barH);

      // Right Channel (slight stereo variance)
      const barHR = Math.max(2, barH * (0.85 + 0.3 * rand()));
      g.fillRect(bx, midR - barHR / 2, barWidth, barHR);
    }

    // Center baselines
    g.strokeStyle = "rgba(60, 255, 95, 0.22)";
    g.beginPath();
    g.moveTo(0, midL + 0.5); g.lineTo(w, midL + 0.5);
    g.moveTo(0, midR + 0.5); g.lineTo(w, midR + 0.5);
    g.stroke();

    // Dim progress overlay
    if (progress > 0) {
      g.fillStyle = "rgba(60, 255, 95, 0.1)";
      g.fillRect(0, 0, Math.min(w, w * progress), h);
    }
  }

  function drawMiniWave(canvas, sound) {
    if (!canvas) return;
    const w = canvas.clientWidth || 100;
    const h = canvas.clientHeight || 12;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    const g = canvas.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    const mid = h / 2;
    g.strokeStyle = "rgba(125, 150, 135, 0.25)";
    g.beginPath(); g.moveTo(0, mid + 0.5); g.lineTo(w, mid + 0.5); g.stroke();

    let seed = 0;
    for (let c = 0; c < sound.file.length; c++) seed = (seed * 31 + sound.file.charCodeAt(c)) & 0xffffffff;
    function rand() {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      return (seed >>> 0) / 4294967296;
    }

    const bars = Math.floor(w / 3);
    g.fillStyle = "rgba(60, 255, 95, 0.55)";
    for (let i = 0; i < bars; i++) {
      const r = i / bars;
      const env = Math.sin(r * Math.PI) * (0.3 + 0.7 * rand());
      const bh = Math.max(1, env * (h - 2));
      g.fillRect(i * 3, mid - bh / 2, 1.5, bh);
    }
  }

  function selectSound(sound, autoPlay = true) {
    currentSfx = sound;

    // Update row highlights
    const resultsContainer = document.getElementById("sfxdResults");
    if (resultsContainer) {
      resultsContainer.querySelectorAll(".sfxd-row").forEach(r => {
        r.classList.toggle("is-on", r.dataset.sfxFile === sound.file);
      });
    }

    // Populate Spectrum Preview header & metadata
    const pvName = document.getElementById("sfxdPvName");
    const fmt = document.getElementById("sfxdFormat");
    const sz = document.getElementById("sfxdSize");
    const len = document.getElementById("sfxdLength");
    const src = document.getElementById("sfxdSource");
    const nowName = document.getElementById("sfxdNowName");
    const t0 = document.getElementById("sfxdT0");
    const t1 = document.getElementById("sfxdT1");
    const tM = document.getElementById("sfxdTM");

    if (pvName) pvName.textContent = sound.name;
    if (fmt) fmt.textContent = (sound.ext || "WAV") + " · 24-bit · 48 kHz";
    if (sz) sz.textContent = sound.size || "320 KB";
    if (len) len.textContent = sound.dur;
    if (src) src.textContent = "Essential SFX / " + sound.cat;
    if (nowName) nowName.textContent = sound.name;
    if (t0) t0.textContent = "0:00";
    if (t1) t1.textContent = sound.dur;
    if (tM) tM.textContent = "0:01";

    drawWaveform(sound, 0);

    const playhead = document.getElementById("sfxdPlayhead");
    const timeEl = document.getElementById("sfxdTime");
    const playBtn = document.getElementById("sfxdPlay");

    if (playhead) playhead.style.left = "0%";
    if (timeEl) timeEl.textContent = "0:0.00";

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
    if (sfxAudioAnimId) {
      cancelAnimationFrame(sfxAudioAnimId);
      sfxAudioAnimId = null;
    }

    if (autoPlay) {
      playSound(sound);
    } else {
      if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z"/></svg>';
    }
  }

  function playSound(sound) {
    if (!sound) return;
    const playhead = document.getElementById("sfxdPlayhead");
    const timeEl = document.getElementById("sfxdTime");
    const playBtn = document.getElementById("sfxdPlay");
    const resultsContainer = document.getElementById("sfxdResults");

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    if (sfxAudioAnimId) cancelAnimationFrame(sfxAudioAnimId);

    activeAudio = new Audio("assets/sfx/" + encodeURIComponent(sound.file));
    activeAudio.volume = 0.85;

    if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';

    if (resultsContainer) {
      resultsContainer.querySelectorAll(".sfxd-row").forEach(r => {
        r.classList.toggle("is-playing", r.dataset.sfxFile === sound.file);
      });
    }

    const p = activeAudio.play();
    if (p) p.catch(() => {});

    function sync() {
      if (!activeAudio || activeAudio.paused) return;
      const cur = activeAudio.currentTime;
      const dur = activeAudio.duration || 2.0;
      const progress = Math.min(1, cur / dur);
      if (playhead) playhead.style.left = (progress * 100) + "%";
      if (timeEl) timeEl.textContent = "0:0" + cur.toFixed(2);
      drawWaveform(sound, progress);
      sfxAudioAnimId = requestAnimationFrame(sync);
    }
    sync();

    activeAudio.onended = () => {
      if (playhead) playhead.style.left = "0%";
      if (timeEl) timeEl.textContent = "0:0.00";
      if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z"/></svg>';
      drawWaveform(sound, 0);
      if (resultsContainer) {
        resultsContainer.querySelectorAll(".sfxd-row.is-playing").forEach(r => r.classList.remove("is-playing"));
      }
      activeAudio = null;
    };
  }

  function renderFolders() {
    const foldersContainer = document.getElementById("sfxdFolders");
    const filterInput = document.getElementById("sfxdFolderFilter");
    const q = filterInput ? filterInput.value.trim().toLowerCase() : "";

    if (!foldersContainer) return;
    foldersContainer.innerHTML = FOLDERS_DATA
      .filter(f => !q || f.name.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q))
      .map(f => {
        const on = f.id === currentSfxCat;
        return `
          <button type="button" class="sfxd-folder ${on ? 'is-on' : ''}" data-sfx-cat="${f.id}" role="option" aria-selected="${on}">
            ${f.isAll ? `
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M8 9v6M12 7.5v9M16 10v3.5"/></svg>
            ` : `
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h6l1.6 2.2h9.4v9.8H3.5Z"/></svg>
            `}
            <span class="sfxd-fname"><b>${escapeHtml(f.name)}</b><small>${escapeHtml(f.desc)}</small></span>
            <span class="sfxd-fcount">${f.count}</span>
          </button>
        `;
      }).join("");

    foldersContainer.querySelectorAll(".sfxd-folder").forEach(btn => {
      btn.addEventListener("click", () => {
        currentSfxCat = btn.dataset.sfxCat || "all";
        renderFolders();
        renderSfx();
      });
    });
  }

  function renderSfx() {
    const resultsContainer = document.getElementById("sfxdResults");
    const searchInput = document.getElementById("sfxdSearch");
    const countEl = document.getElementById("sfxdCount");
    if (!resultsContainer) return;

    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const filtered = SFX_ITEMS.filter(s => {
      const catMatch = currentSfxCat === "all" || s.cat === currentSfxCat;
      const qMatch = !q || s.name.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
      return catMatch && qMatch;
    });

    if (countEl) countEl.textContent = filtered.length + " sound" + (filtered.length === 1 ? "" : "s");

    resultsContainer.innerHTML = filtered.map((s, idx) => {
      const isSelected = currentSfx && currentSfx.file === s.file;
      return `
        <div class="sfxd-row ${isSelected ? 'is-on' : ''}" data-sfx-file="${s.file}" data-sfx-idx="${idx}" role="option" tabindex="0">
          <button type="button" class="sfxd-rowplay" title="Play sound" tabindex="-1">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z"/></svg>
          </button>
          <span class="sfxd-rowmid">
            <span class="sfxd-rowname">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M8 10v4M12 8.5v7M16 10.5v3"/></svg>
              <b>${escapeHtml(s.name)}</b>
              <span class="sfxd-sound-badge">${s.tag}</span>
            </span>
            <canvas class="sfxd-rowwave" data-row-idx="${idx}"></canvas>
          </span>
          <span class="sfxd-rowinfo">
            <span class="sfxd-rowdur">${s.dur}</span>
            <span class="sfxd-rowmeta">${s.ext || 'WAV'} · ${s.size || '320 KB'}</span>
          </span>
          <span class="sfxd-rowend">
            <button type="button" class="sfxd-fav" title="Add to favorites" tabindex="-1">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.5s-7-4.3-7-9A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.5c0 4.7-7 9-7 9Z"/></svg>
            </button>
            <button type="button" class="sfxd-insert-btn" title="Insert to active sequence" tabindex="-1">Insert</button>
          </span>
        </div>
      `;
    }).join("");

    // Draw mini waves on rows
    resultsContainer.querySelectorAll("canvas.sfxd-rowwave").forEach(c => {
      const idx = Number(c.dataset.rowIdx);
      if (filtered[idx]) drawMiniWave(c, filtered[idx]);
    });

    // Wire click & hover on rows
    resultsContainer.querySelectorAll(".sfxd-row").forEach(row => {
      const file = row.dataset.sfxFile;
      const sound = SFX_ITEMS.find(s => s.file === file);
      if (!sound) return;

      row.addEventListener("click", (e) => {
        if (e.target.closest(".sfxd-fav")) {
          e.stopPropagation();
          const btn = e.target.closest(".sfxd-fav");
          btn.classList.toggle("is-on");
          return;
        }
        if (e.target.closest(".sfxd-insert-btn")) {
          e.stopPropagation();
          if (window.showToast) window.showToast("Inserted " + sound.name + " to After Effects comp timeline");
          return;
        }
        selectSound(sound, true);
      });

      row.addEventListener("mouseenter", () => {
        if (!activeAudio || activeAudio.paused) {
          selectSound(sound, false);
        }
      });
    });

    // If nothing selected, select the first sound by default without autoPlay
    if (!currentSfx && filtered.length > 0) {
      selectSound(filtered[0], false);
    }
  }

  function populateSoundDesigner() {
    const sourceCount = document.getElementById("sfxdSourceCount");
    const libFoot = document.getElementById("sfxdLibFoot");

    if (sourceCount) sourceCount.textContent = SFX_ITEMS.length + " sounds ready";
    if (libFoot) libFoot.textContent = SFX_ITEMS.length + " indexed sounds";

    renderFolders();
    renderSfx();

    // Wire transport buttons once
    if (!populateSoundDesigner._wired) {
      populateSoundDesigner._wired = true;

      const playBtn = document.getElementById("sfxdPlay");
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          if (!currentSfx && SFX_ITEMS.length) currentSfx = SFX_ITEMS[0];
          if (activeAudio && !activeAudio.paused) {
            activeAudio.pause();
            playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z"/></svg>';
            const resultsContainer = document.getElementById("sfxdResults");
            if (resultsContainer) resultsContainer.querySelectorAll(".sfxd-row.is-playing").forEach(r => r.classList.remove("is-playing"));
          } else if (currentSfx) {
            playSound(currentSfx);
          }
        });
      }

      const stopBtn = document.getElementById("sfxdStop");
      if (stopBtn) {
        stopBtn.addEventListener("click", () => {
          if (activeAudio) {
            activeAudio.pause();
            activeAudio.currentTime = 0;
            activeAudio = null;
          }
          if (sfxAudioAnimId) cancelAnimationFrame(sfxAudioAnimId);
          const playhead = document.getElementById("sfxdPlayhead");
          const timeEl = document.getElementById("sfxdTime");
          if (playhead) playhead.style.left = "0%";
          if (timeEl) timeEl.textContent = "0:0.00";
          if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5Z"/></svg>';
          const resultsContainer = document.getElementById("sfxdResults");
          if (resultsContainer) resultsContainer.querySelectorAll(".sfxd-row.is-playing").forEach(r => r.classList.remove("is-playing"));
          if (currentSfx) drawWaveform(currentSfx, 0);
        });
      }

      const prevBtn = document.getElementById("sfxdPrev");
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (!SFX_ITEMS.length) return;
          const curIdx = currentSfx ? SFX_ITEMS.findIndex(s => s.file === currentSfx.file) : 0;
          const nextIdx = (curIdx - 1 + SFX_ITEMS.length) % SFX_ITEMS.length;
          selectSound(SFX_ITEMS[nextIdx], true);
        });
      }

      const nextBtn = document.getElementById("sfxdNext");
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (!SFX_ITEMS.length) return;
          const curIdx = currentSfx ? SFX_ITEMS.findIndex(s => s.file === currentSfx.file) : 0;
          const nextIdx = (curIdx + 1) % SFX_ITEMS.length;
          selectSound(SFX_ITEMS[nextIdx], true);
        });
      }

      const revBtn = document.getElementById("sfxdReverse");
      if (revBtn) {
        revBtn.addEventListener("click", () => {
          sfxReverse = !sfxReverse;
          revBtn.classList.toggle("is-on", sfxReverse);
          revBtn.setAttribute("aria-pressed", sfxReverse ? "true" : "false");
          if (window.showToast) window.showToast(sfxReverse ? "Reverse playback enabled" : "Normal playback");
        });
      }

      const insertBtn = document.getElementById("sfxdInsert");
      if (insertBtn) {
        insertBtn.addEventListener("click", () => {
          const name = currentSfx ? currentSfx.name : "Sound";
          if (window.showToast) window.showToast("Inserted " + name + " to active After Effects composition");
        });
      }

      const searchInput = document.getElementById("sfxdSearch");
      if (searchInput) {
        searchInput.addEventListener("input", () => renderSfx());
      }

      const folderFilter = document.getElementById("sfxdFolderFilter");
      if (folderFilter) {
        folderFilter.addEventListener("input", () => renderFolders());
      }
    }
  }

  // -------------------------------------------------------------
  // 8. POPULATE ANIMATION TAB & PRESETS
  // -------------------------------------------------------------
  function populateTextAnimStyles() {
    const listEl = document.getElementById("tanimList");
    const categoryEl = document.getElementById("tanimCategory");
    const countEl = document.getElementById("tanimResultCount");
    const searchEl = document.getElementById("tanimSearch");
    if (!listEl) return;

    if (categoryEl && categoryEl.options.length <= 1) {
      const cats = {};
      TEXT_STYLES.forEach(s => cats[s.cat] = true);
      Object.keys(cats).sort().forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        categoryEl.appendChild(opt);
      });
    }

    function render() {
      const q = searchEl ? String(searchEl.value || "").trim().toLowerCase() : "";
      const selectedCat = categoryEl ? categoryEl.value : "all";

      const filtered = TEXT_STYLES.filter(t => {
        const catMatch = selectedCat === "all" || t.cat === selectedCat;
        const qMatch = !q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
        return catMatch && qMatch;
      });

      if (countEl) countEl.textContent = filtered.length + " of " + TEXT_STYLES.length + " After Effects text presets";

      listEl.innerHTML = filtered.map(t => {
        return `
          <div class="tanim-card" data-tanim="${t.id}" title="${escapeHtml(t.name)}">
            <div class="tanim-card-preview tanim-fx-${t.anim || 'pop'}">
              <div class="tanim-card-badge">${escapeHtml(t.cat)}</div>
              <div class="tanim-card-stage">
                <div class="tanim-card-word">${previewChars(t.sample)}</div>
                <div class="tanim-card-glow"></div>
              </div>
            </div>
            <div class="tanim-card-meta">
              <div class="tanim-card-title">${escapeHtml(t.name)}</div>
              <div class="tanim-card-sub">${escapeHtml(t.desc)}</div>
            </div>
            <div class="tanim-card-actions">
              <button class="tanim-card-btn" type="button" data-action="apply">Apply</button>
            </div>
          </div>
        `;
      }).join("");
    }

    if (searchEl && !searchEl._wired) {
      searchEl.addEventListener("input", render);
      searchEl._wired = true;
    }
    if (categoryEl && !categoryEl._wired) {
      categoryEl.addEventListener("change", render);
      categoryEl._wired = true;
    }

    render();
  }

  function populateMotions() {
    const grid = document.getElementById("motionGrid");
    const count = document.getElementById("motionCount");
    if (!grid) return;
    if (count) count.textContent = MOTION_PRESETS.length + " ready-to-insert AEP motion comps";

    grid.innerHTML = MOTION_PRESETS.map(m => {
      return `
        <div class="tanim-card motion-card" style="min-height:120px; padding:10px; background:#0f1412; border:1px solid #22322a; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:18px;">${m.icon}</span>
            <span style="font-size:9px; font-weight:bold; color:#3cff5f; background:rgba(60,255,95,0.1); border:1px solid rgba(60,255,95,0.25); padding:2px 6px; border-radius:4px; text-transform:uppercase;">${m.cat}</span>
          </div>
          <div>
            <div style="font-size:12px; font-weight:bold; color:#eafff0; margin-bottom:3px;">${escapeHtml(m.name)}</div>
            <div style="font-size:10px; color:#84968a;">${escapeHtml(m.desc)}</div>
          </div>
          <div style="margin-top:8px;">
            <button class="tool-btn" style="width:100%; min-height:26px; font-size:10px; background:rgba(60,255,95,0.1); border:1px solid #3cff5f; color:#3cff5f;" type="button">Insert Comp</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function populateFfx() {
    const list = document.getElementById("ffxList");
    if (!list) return;

    list.innerHTML = FFX_PRESETS.map(f => {
      return `
        <div class="ffx-item" style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; margin-bottom:6px; background:#0f1412; border:1px solid #22322a; border-radius:6px;">
          <div>
            <div style="font-size:12px; font-weight:bold; color:#eafff0;">${escapeHtml(f.name)}</div>
            <div style="font-size:10px; color:#84968a;">${escapeHtml(f.desc)}</div>
          </div>
          <span style="font-size:9px; color:#35c8ff; background:rgba(53,200,255,0.1); border:1px solid rgba(53,200,255,0.25); padding:2px 6px; border-radius:4px;">${f.type}</span>
        </div>
      `;
    }).join("");
  }

  // -------------------------------------------------------------
  // COLOR STUDIO DATA & UTILITIES
  // -------------------------------------------------------------
  const CompXColorUtils = {
    hexToRgb: function(hex) {
      hex = String(hex || "").replace(/^#/, "");
      if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
      const num = parseInt(hex, 16);
      if (isNaN(num)) return { r: 255, g: 102, b: 0 };
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    },
    rgbToHex: function(r, g, b) {
      return "#" + [r, g, b].map(x => {
        const h = Math.max(0, Math.min(255, Math.round(Number(x) || 0))).toString(16);
        return h.length === 1 ? "0" + h : h;
      }).join("").toLowerCase();
    },
    rgbToHsl: function(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    },
    hslToRgb: function(h, s, l) {
      h = (((Number(h) || 0) % 360) + 360) % 360 / 360;
      s = Math.max(0, Math.min(100, Number(s) || 0)) / 100;
      l = Math.max(0, Math.min(100, Number(l) || 0)) / 100;
      if (s === 0) {
        const val = Math.round(l * 255);
        return { r: val, g: val, b: val };
      }
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      return {
        r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
        g: Math.round(hue2rgb(p, q, h) * 255),
        b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
      };
    }
  };

  const DEFAULT_SWATCHES = [
    "#22ff6f", "#00d8ff", "#ff0055", "#ffb703",
    "#7c3aed", "#f07167", "#38bdf8", "#10b981",
    "#facc15", "#f43f5e", "#6ee7b7", "#a855f7",
    "#ffffff", "#1e293b", "#fb8500", "#d500f9"
  ];

  const DEFAULT_RECENT = [
    "#22ff6f", "#00d8ff", "#ff0055", "#ffb703",
    "#7c3aed", "#38bdf8", "#ffffff", "#111827"
  ];

  const DEFAULT_PALETTES = [
    {
      name: "Orbit Signature",
      colors: ["#22ff6f", "#0a192f", "#00d8ff", "#ffffff"]
    },
    {
      name: "Cyberpunk Pulse",
      colors: ["#ff0055", "#d500f9", "#651fff", "#00ffff"]
    },
    {
      name: "Warm Editorial",
      colors: ["#e8e2d9", "#c84b31", "#a67c52", "#2c3e50"]
    },
    {
      name: "Sunset Horizon",
      colors: ["#023047", "#219ebc", "#ffb703", "#fb8500"]
    }
  ];

  const DEFAULT_GRADIENTS = [
    { mode: 2, colors: ["#EA2A2A", "#D1511A"], type: 1, angle: 0 },
    { mode: 2, colors: ["#00F5A0", "#00D9F5"], type: 1, angle: 45 },
    { mode: 2, colors: ["#FF512F", "#DD2476"], type: 1, angle: 90 },
    { mode: 2, colors: ["#7F00FF", "#E100FF"], type: 1, angle: 135 },
    { mode: 4, colors: ["#050816", "#3858FF", "#00E5C3", "#C8FF67"], type: 4, angle: 0 },
    { mode: 4, colors: ["#391306", "#FF512F", "#F09819", "#FFE259"], type: 4, angle: 0 },
    { mode: 4, colors: ["#090014", "#7F00FF", "#E100FF", "#00F5D4"], type: 4, angle: 0 },
    { mode: 4, colors: ["#001219", "#005F73", "#0A9396", "#94D2BD"], type: 4, angle: 0 }
  ];

  function getStorage(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    try { localStorage.setItem(key, JSON.stringify(fallback)); } catch (e) {}
    return fallback;
  }

  function setStorage(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }

  function addRecentColor(hex) {
    const norm = String(hex || "").trim().toLowerCase();
    if (!norm) return;
    let list = getStorage("compXRecentColors", DEFAULT_RECENT);
    list = list.filter(c => String(c).toLowerCase() !== norm);
    list.unshift(norm);
    if (list.length > 16) list = list.slice(0, 16);
    setStorage("compXRecentColors", list);
    renderSwatches("recentColorGrid", "compXRecentColors", "No recent colors.", DEFAULT_RECENT);
  }

  function renderSwatches(containerId, storageKey, emptyMsg, fallback) {
    const grid = document.getElementById(containerId);
    if (!grid) return;
    const colors = getStorage(storageKey, fallback);
    if (!colors || colors.length === 0) {
      grid.innerHTML = `<div class="studio-empty" style="font-size:10px;">${emptyMsg}</div>`;
      return;
    }
    grid.innerHTML = colors.map((hex, idx) => {
      const safe = escapeHtml(hex);
      return `
        <div class="swatch-chip" style="background:${safe};" data-hex="${safe}" data-idx="${idx}" title="${safe}">
          <span class="swatch-remove" data-action="remove-swatch" data-storage="${storageKey}" data-container="${containerId}" data-idx="${idx}" title="Remove swatch">×</span>
          <span class="swatch-hex-tip">${safe}</span>
        </div>
      `;
    }).join("");
  }

  function renderUserPalettes() {
    const list = document.getElementById("paletteList");
    if (!list) return;
    const palettes = getStorage("compXUserPalettes", DEFAULT_PALETTES);
    if (!palettes || palettes.length === 0) {
      list.innerHTML = '<div class="studio-empty" style="font-size:10px;">No custom palettes yet.</div>';
      return;
    }
    list.innerHTML = palettes.map((pal, idx) => {
      const swatchesHtml = (pal.colors || []).map((c, cIdx) => {
        const safeHex = escapeHtml(c);
        return `
          <div class="swatch-chip" style="background:${safeHex};" data-hex="${safeHex}" data-pal-idx="${idx}" data-c-idx="${cIdx}" title="${safeHex}">
            <span class="swatch-remove" data-action="remove-pal-color" data-pal-idx="${idx}" data-c-idx="${cIdx}">×</span>
            <span class="swatch-hex-tip">${safeHex}</span>
          </div>
        `;
      }).join("");

      return `
        <div class="cx-palette-row">
          <div class="cx-palette-row-head">
            <strong>${escapeHtml(pal.name || "My Palette")}</strong>
            <div style="display:flex; gap:4px;">
              <button class="cx-btn cx-btn-mini" data-action="add-pal-color" data-pal-idx="${idx}" type="button" title="Add current color to this palette">+ Color</button>
              <button class="cx-btn cx-btn-mini" data-action="delete-pal" data-pal-idx="${idx}" type="button" title="Delete palette">×</button>
            </div>
          </div>
          <div class="swatch-grid">${swatchesHtml}</div>
        </div>
      `;
    }).join("");
  }

  function updateColorPickerFields(hex) {
    hex = String(hex || "").trim();
    if (!hex.startsWith("#")) hex = "#" + hex;
    const norm = hex.toLowerCase();

    const picker = document.getElementById("colorPickerMain");
    const hexInput = document.getElementById("colorHexInput");
    if (picker) picker.value = norm;
    if (hexInput) hexInput.value = norm;

    const rgb = CompXColorUtils.hexToRgb(norm);
    const rInp = document.getElementById("colorRInput");
    const gInp = document.getElementById("colorGInput");
    const bInp = document.getElementById("colorBInput");
    if (rInp) rInp.value = rgb.r;
    if (gInp) gInp.value = rgb.g;
    if (bInp) bInp.value = rgb.b;

    const hsl = CompXColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hInp = document.getElementById("colorHInput");
    const sInp = document.getElementById("colorSInput");
    const lInp = document.getElementById("colorLInput");
    if (hInp) hInp.value = hsl.h;
    if (sInp) sInp.value = hsl.s;
    if (lInp) lInp.value = hsl.l;
  }

  function getSelectedGradient() {
    const gradMode = document.getElementById("gradStopMode");
    const gradType = document.getElementById("gradType");
    const gradAngle = document.getElementById("gradAngle");
    const mode = gradMode && gradMode.value === "4" ? 4 : 2;
    const colors = [1, 2, 3, 4].map(n => {
      const el = document.getElementById("gradColor" + n);
      return el ? el.value : "#000000";
    });
    return {
      mode: mode,
      colors: colors.slice(0, mode),
      type: mode === 4 ? 4 : (gradType ? Number(gradType.value) || 1 : 1),
      angle: gradAngle ? Math.max(-360, Math.min(360, Number(gradAngle.value) || 0)) : 0
    };
  }

  function updateGradientPreview() {
    const gradient = getSelectedGradient();
    const gradType = document.getElementById("gradType");
    const gradAngle = document.getElementById("gradAngle");
    const gradPreview = document.getElementById("customGradientPreview");
    const gradLabel = document.getElementById("customGradientLabel");

    document.querySelectorAll("#panel-colors .grad-extra-stop").forEach(el => {
      el.style.display = gradient.mode === 4 ? "flex" : "none";
    });

    if (gradType) gradType.disabled = gradient.mode === 4;
    if (gradAngle) gradAngle.disabled = gradient.mode === 4;

    if (gradPreview) {
      if (gradient.mode === 4) {
        gradPreview.style.background = `radial-gradient(circle at 18% 20%, ${gradient.colors[0]} 0, transparent 55%), radial-gradient(circle at 82% 18%, ${gradient.colors[1]} 0, transparent 55%), radial-gradient(circle at 18% 82%, ${gradient.colors[2]} 0, transparent 55%), ${gradient.colors[3]}`;
      } else if (gradient.type === 2) {
        gradPreview.style.background = `radial-gradient(circle, ${gradient.colors.join(", ")})`;
      } else {
        gradPreview.style.background = `linear-gradient(${gradient.angle + 90}deg, ${gradient.colors.join(", ")})`;
      }
    }

    if (gradLabel) {
      gradLabel.textContent = gradient.mode === 4 ? "4-point AE gradient" : `${gradient.mode} stops · ${gradient.type === 2 ? "radial" : gradient.angle + "°"}`;
    }
  }

  function renderSavedGradients() {
    const grid = document.getElementById("savedGradientGrid");
    if (!grid) return;
    const items = getStorage("compXSavedGradients", DEFAULT_GRADIENTS);
    if (!items || items.length === 0) {
      grid.innerHTML = '<div class="studio-empty" style="font-size:10px;">No saved gradients yet.</div>';
      return;
    }
    grid.innerHTML = items.map((g, idx) => {
      const colors = (g.colors || []).map(c => String(c).toUpperCase());
      const bg = g.mode === 4
        ? `linear-gradient(135deg, ${colors.join(",")})`
        : (g.type === 2 ? `radial-gradient(circle, ${colors.join(",")})` : `linear-gradient(${(Number(g.angle) || 0) + 90}deg, ${colors.join(",")})`);
      return `
        <button class="cx-saved-gradient" data-gradient-idx="${idx}" type="button" title="Click to load · Double-click to apply" style="background:${bg};">
          <span>${g.mode} stops</span>
          <i data-action="remove-saved-gradient" data-idx="${idx}" title="Delete">×</i>
        </button>
      `;
    }).join("");
  }

  function loadGradientIntoBuilder(gradient) {
    if (!gradient || !gradient.colors) return;
    const gradMode = document.getElementById("gradStopMode");
    const gradType = document.getElementById("gradType");
    const gradAngle = document.getElementById("gradAngle");

    if (gradMode) gradMode.value = String(gradient.mode === 4 ? 4 : 2);
    if (gradType && gradient.mode !== 4) gradType.value = String(gradient.type || 1);
    if (gradAngle) gradAngle.value = String(Number(gradient.angle) || 0);

    gradient.colors.forEach((c, idx) => {
      const inp = document.getElementById("gradColor" + (idx + 1));
      if (inp) inp.value = c;
    });

    updateGradientPreview();
    if (typeof window.showToast === "function") window.showToast(`Loaded ${gradient.mode}-stop gradient`);
  }

  function refreshColorStudio() {
    renderSwatches("swatchGrid", "compXSwatches", "No swatches saved yet. Pick a color and click 'Save Swatch'.", DEFAULT_SWATCHES);
    renderSwatches("recentColorGrid", "compXRecentColors", "No recent colors.", DEFAULT_RECENT);
    renderUserPalettes();
    renderSavedGradients();
    updateGradientPreview();
  }

  function initColorStudio() {
    updateColorPickerFields("#ff6600");
    refreshColorStudio();

    // Listeners for Color Picker
    const picker = document.getElementById("colorPickerMain");
    const hexInput = document.getElementById("colorHexInput");
    if (picker) {
      picker.addEventListener("input", () => {
        updateColorPickerFields(picker.value);
      });
    }
    if (hexInput) {
      hexInput.addEventListener("input", () => {
        let val = hexInput.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
          updateColorPickerFields(val);
        }
      });
    }

    // RGB Inputs
    const rInp = document.getElementById("colorRInput");
    const gInp = document.getElementById("colorGInput");
    const bInp = document.getElementById("colorBInput");
    const onRgbChange = () => {
      const r = Number(rInp ? rInp.value : 0);
      const g = Number(gInp ? gInp.value : 0);
      const b = Number(bInp ? bInp.value : 0);
      const hex = CompXColorUtils.rgbToHex(r, g, b);
      if (picker) picker.value = hex;
      if (hexInput) hexInput.value = hex;
      const hsl = CompXColorUtils.rgbToHsl(r, g, b);
      const hInp = document.getElementById("colorHInput");
      const sInp = document.getElementById("colorSInput");
      const lInp = document.getElementById("colorLInput");
      if (hInp) hInp.value = hsl.h;
      if (sInp) sInp.value = hsl.s;
      if (lInp) lInp.value = hsl.l;
    };
    [rInp, gInp, bInp].forEach(el => el && el.addEventListener("input", onRgbChange));

    // HSL Inputs
    const hInp = document.getElementById("colorHInput");
    const sInp = document.getElementById("colorSInput");
    const lInp = document.getElementById("colorLInput");
    const onHslChange = () => {
      const h = Number(hInp ? hInp.value : 0);
      const s = Number(sInp ? sInp.value : 0);
      const l = Number(lInp ? lInp.value : 0);
      const rgb = CompXColorUtils.hslToRgb(h, s, l);
      if (rInp) rInp.value = rgb.r;
      if (gInp) gInp.value = rgb.g;
      if (bInp) bInp.value = rgb.b;
      const hex = CompXColorUtils.rgbToHex(rgb.r, rgb.g, rgb.b);
      if (picker) picker.value = hex;
      if (hexInput) hexInput.value = hex;
    };
    [hInp, sInp, lInp].forEach(el => el && el.addEventListener("input", onHslChange));

    // Gradient Builder inputs
    [1, 2, 3, 4].forEach(n => {
      const el = document.getElementById("gradColor" + n);
      if (el) el.addEventListener("input", updateGradientPreview);
    });
    const gradMode = document.getElementById("gradStopMode");
    const gradType = document.getElementById("gradType");
    const gradAngle = document.getElementById("gradAngle");
    [gradMode, gradType, gradAngle].forEach(el => el && el.addEventListener("change", updateGradientPreview));
    if (gradAngle) gradAngle.addEventListener("input", updateGradientPreview);

    // Stop Eyedroppers
    document.querySelectorAll(".cx-stop-eyedropper").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-eyedrop-target");
        const targetInput = document.getElementById(targetId);
        if (targetInput) {
          const sampleColors = ["#3cff5f", "#00d8ff", "#ff0055", "#ffb703", "#7c3aed", "#ff5500", "#e02aea"];
          const next = sampleColors[Math.floor(Math.random() * sampleColors.length)];
          targetInput.value = next;
          updateGradientPreview();
          if (typeof window.showToast === "function") window.showToast(`Sampled ${next.toUpperCase()} into Stop`);
        }
      });
    });

    // ⇄ Swap
    const btnSwap = document.getElementById("btnGradientSwap");
    if (btnSwap) {
      btnSwap.addEventListener("click", () => {
        const c1 = document.getElementById("gradColor1");
        const c2 = document.getElementById("gradColor2");
        const c3 = document.getElementById("gradColor3");
        const c4 = document.getElementById("gradColor4");
        const is4 = gradMode && gradMode.value === "4";
        if (is4 && c1 && c2 && c3 && c4) {
          const vals = [c1.value, c2.value, c3.value, c4.value].reverse();
          c1.value = vals[0]; c2.value = vals[1]; c3.value = vals[2]; c4.value = vals[3];
        } else if (c1 && c2) {
          const tmp = c1.value; c1.value = c2.value; c2.value = tmp;
        }
        updateGradientPreview();
        if (typeof window.showToast === "function") window.showToast("Gradient colors swapped");
      });
    }

    // ✦ Harmony
    const btnHarmony = document.getElementById("btnGradientHarmony");
    if (btnHarmony) {
      btnHarmony.addEventListener("click", () => {
        const c1 = document.getElementById("gradColor1");
        const baseHex = (c1 && c1.value) || "#ea2a2a";
        const rgb = CompXColorUtils.hexToRgb(baseHex);
        const hsl = CompXColorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const is4 = gradMode && gradMode.value === "4";
        const offsets = is4 ? [0, 45, 180, 225] : [0, 180];
        offsets.forEach((off, idx) => {
          const target = document.getElementById("gradColor" + (idx + 1));
          if (target) {
            const h = (hsl.h + off) % 360;
            const newRgb = CompXColorUtils.hslToRgb(h, Math.max(50, hsl.s), Math.max(40, hsl.l));
            target.value = CompXColorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
          }
        });
        updateGradientPreview();
        if (typeof window.showToast === "function") window.showToast("Harmonious color balance generated");
      });
    }

    // ＋ Save Gradient
    const btnSaveGrad = document.getElementById("btnSaveGradient");
    if (btnSaveGrad) {
      btnSaveGrad.addEventListener("click", () => {
        const grad = getSelectedGradient();
        const list = getStorage("compXSavedGradients", DEFAULT_GRADIENTS);
        list.unshift(grad);
        setStorage("compXSavedGradients", list);
        renderSavedGradients();
        if (typeof window.showToast === "function") window.showToast("Gradient variant saved");
      });
    }

    // Apply Custom Gradient
    const btnApplyGrad = document.getElementById("btnApplyCustomGrad");
    if (btnApplyGrad) {
      btnApplyGrad.addEventListener("click", () => {
        const grad = getSelectedGradient();
        grad.colors.forEach(addRecentColor);
        if (typeof window.showToast === "function") window.showToast(`Applied ${grad.mode}-stop gradient to comp`);
      });
    }

    // Scan Duplicates
    const btnScan = document.getElementById("btnScanColorDuplicates");
    if (btnScan) {
      btnScan.addEventListener("click", () => {
        const auditStatus = document.getElementById("colorDuplicateStatus");
        if (auditStatus) {
          auditStatus.textContent = "Duplicate scan complete. Built-in library & saved variants verified.";
        }
        if (typeof window.showToast === "function") window.showToast("All colors and gradients scanned");
      });
    }

    // Save Swatch Button
    const btnSaveSwatch = document.getElementById("btnColorSaveSwatch");
    if (btnSaveSwatch) {
      btnSaveSwatch.addEventListener("click", () => {
        const picker = document.getElementById("colorPickerMain");
        const hex = (picker && picker.value) || "#ff6600";
        let list = getStorage("compXSwatches", DEFAULT_SWATCHES);
        if (!list.includes(hex.toLowerCase())) {
          list.unshift(hex.toLowerCase());
          setStorage("compXSwatches", list);
          renderSwatches("swatchGrid", "compXSwatches", "No swatches saved yet.", DEFAULT_SWATCHES);
        }
        addRecentColor(hex);
        if (typeof window.showToast === "function") window.showToast(`Saved swatch ${hex.toUpperCase()}`);
      });
    }

    // Clear Swatches
    const btnClearSwatches = document.getElementById("btnClearSwatches");
    if (btnClearSwatches) {
      btnClearSwatches.addEventListener("click", () => {
        setStorage("compXSwatches", []);
        renderSwatches("swatchGrid", "compXSwatches", "No swatches saved yet. Pick a color and click 'Save Swatch'.", []);
        if (typeof window.showToast === "function") window.showToast("Swatches cleared");
      });
    }

    // Clear Recent
    const btnClearRecent = document.getElementById("btnClearRecent");
    if (btnClearRecent) {
      btnClearRecent.addEventListener("click", () => {
        setStorage("compXRecentColors", []);
        renderSwatches("recentColorGrid", "compXRecentColors", "No recent colors.", []);
        if (typeof window.showToast === "function") window.showToast("Recent colors cleared");
      });
    }

    // + New Palette
    const btnNewPal = document.getElementById("btnNewPalette");
    if (btnNewPal) {
      btnNewPal.addEventListener("click", () => {
        const name = prompt("Enter Palette Name:", "My Neon Palette");
        if (name && name.trim()) {
          const picker = document.getElementById("colorPickerMain");
          const hex = (picker && picker.value) || "#22ff6f";
          const list = getStorage("compXUserPalettes", DEFAULT_PALETTES);
          list.unshift({
            name: name.trim(),
            colors: [hex, "#00d8ff", "#ff0055", "#ffffff"]
          });
          setStorage("compXUserPalettes", list);
          renderUserPalettes();
          if (typeof window.showToast === "function") window.showToast(`Created palette '${name.trim()}'`);
        }
      });
    }

    // Eyedropper & Pick buttons
    const btnEye = document.getElementById("btnScreenEyedropper");
    if (btnEye) {
      btnEye.addEventListener("click", () => {
        const sampleColors = ["#3cff5f", "#00d8ff", "#ff0055", "#ffb703", "#7c3aed", "#ff5500", "#10b981", "#e02aea"];
        const next = sampleColors[Math.floor(Math.random() * sampleColors.length)];
        updateColorPickerFields(next);
        addRecentColor(next);
        if (typeof window.showToast === "function") window.showToast(`Screen Eyedropper picked ${next.toUpperCase()}`);
      });
    }

    const btnPickLayer = document.getElementById("btnColorPickFromLayer");
    if (btnPickLayer) {
      btnPickLayer.addEventListener("click", () => {
        const sampleColors = ["#00d8ff", "#3cff5f", "#ffd400", "#ff0055"];
        const next = sampleColors[Math.floor(Math.random() * sampleColors.length)];
        updateColorPickerFields(next);
        addRecentColor(next);
        if (typeof window.showToast === "function") window.showToast(`Layer fill sampled: ${next.toUpperCase()}`);
      });
    }

    const btnApplyFill = document.getElementById("btnColorApplyFill");
    if (btnApplyFill) {
      btnApplyFill.addEventListener("click", () => {
        const picker = document.getElementById("colorPickerMain");
        const hex = (picker && picker.value) || "#ff6600";
        addRecentColor(hex);
        if (typeof window.showToast === "function") window.showToast(`Applied Fill: ${hex.toUpperCase()} to layer`);
      });
    }

    const btnApplySolid = document.getElementById("btnColorApplySolid");
    if (btnApplySolid) {
      btnApplySolid.addEventListener("click", () => {
        const picker = document.getElementById("colorPickerMain");
        const hex = (picker && picker.value) || "#ff6600";
        addRecentColor(hex);
        if (typeof window.showToast === "function") window.showToast(`Applied Solid: ${hex.toUpperCase()} in AE/PR`);
      });
    }
  }

  // -------------------------------------------------------------
  // 9. Main Click & Interaction Handler
  // -------------------------------------------------------------
  document.addEventListener("click", function(event) {
    // A) Left Rail Tabs (tools, studio, sfx, colors, morph, pro, arrow, mogrt, sfxdesign, etc.)
    const tab = event.target.closest("[data-apptab]");
    if (tab) {
      document.querySelectorAll("[data-apptab]").forEach(t => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-pressed", String(on));
      });

      const tabId = tab.dataset.apptab;
      const targetPanelId = "panel-" + tabId;

      window.scrollTo(0, 0);

      document.querySelectorAll(".app-panel").forEach(p => {
        const on = p.id === targetPanelId;
        p.classList.toggle("active", on);
      });

      // Special setup per tab
      if (tabId === "mogrt") {
        populateMogrtLibrary();
      } else if (tabId === "sfxdesign") {
        populateSoundDesigner();
        window.setTimeout(() => {
          if (currentSfx) drawWaveform(currentSfx, 0);
        }, 30);
      } else if (tabId === "colors") {
        refreshColorStudio();
      } else if (tabId === "sfx") {
        const tanimView = document.getElementById("textAnimView");
        if (tanimView) tanimView.style.display = "flex";
        populateTextAnimStyles();
        populateMotions();
        populateFfx();
      } else if (tabId === "pro") {
        window.setTimeout(() => window.dispatchEvent(new Event("resize")), 40);
      } else if (tabId === "arrow") {
        window.setTimeout(() => window.dispatchEvent(new Event("resize")), 40);
      }

      // Rail auto-scroll
      const railNav = document.getElementById("railNav");
      if (railNav) {
        const top = tab.offsetTop - railNav.offsetTop;
        const bottom = top + tab.offsetHeight;
        if (top < railNav.scrollTop) railNav.scrollTop = Math.max(0, top - 6);
        else if (bottom > railNav.scrollTop + railNav.clientHeight - 14) {
          railNav.scrollTop = bottom - railNav.clientHeight + 20;
        }
      }
      return;
    }

    // B) Animation Shelves (TEXT | MOTIONS | FFX)
    const shelfBtn = event.target.closest("#assetTypeRow .shelf");
    if (shelfBtn) {
      document.querySelectorAll("#assetTypeRow .shelf").forEach(b => b.classList.toggle("active", b === shelfBtn));
      const type = shelfBtn.dataset.type;

      const tanimView = document.getElementById("textAnimView");
      const motionView = document.getElementById("motionPresetView");
      const ffxView = document.getElementById("ffxPresetView");

      if (tanimView) tanimView.style.display = type === "textanim" ? "flex" : "none";
      if (motionView) motionView.style.display = type === "motions" ? "flex" : "none";
      if (ffxView) ffxView.style.display = type === "ffx" ? "flex" : "none";

      if (type === "textanim") populateTextAnimStyles();
      if (type === "motions") populateMotions();
      if (type === "ffx") populateFfx();
      return;
    }

    // C) Text Library Sub-Tabs (PREMIUM STYLES | TEXT FX | COLOR FX | TEXT TPL | MOTION TPL)
    const textSubTab = event.target.closest("#textLibraryTabs [data-text-library-tab]");
    if (textSubTab) {
      const mode = textSubTab.getAttribute("data-text-library-tab");
      document.querySelectorAll("#textLibraryTabs [data-text-library-tab]").forEach(b => b.classList.toggle("active", b === textSubTab));
      document.querySelectorAll("[data-text-library-panel]").forEach(p => {
        p.hidden = p.getAttribute("data-text-library-panel") !== mode;
      });

      if (mode === "styles") populateTextAnimStyles();
      return;
    }

    // D) Swatch chips (in swatches, recent, or palettes)
    const chip = event.target.closest(".swatch-chip");
    if (chip) {
      const removeBtn = event.target.closest(".swatch-remove");
      if (removeBtn) {
        const action = removeBtn.getAttribute("data-action");
        if (action === "remove-swatch") {
          const storageKey = removeBtn.getAttribute("data-storage");
          const idx = Number(removeBtn.getAttribute("data-idx"));
          let list = getStorage(storageKey, []);
          list.splice(idx, 1);
          setStorage(storageKey, list);
          renderSwatches(removeBtn.getAttribute("data-container"), storageKey, "No swatches saved yet.", []);
        } else if (action === "remove-pal-color") {
          const palIdx = Number(removeBtn.getAttribute("data-pal-idx"));
          const cIdx = Number(removeBtn.getAttribute("data-c-idx"));
          let list = getStorage("compXUserPalettes", DEFAULT_PALETTES);
          if (list[palIdx] && list[palIdx].colors) {
            list[palIdx].colors.splice(cIdx, 1);
            setStorage("compXUserPalettes", list);
            renderUserPalettes();
          }
        }
        return;
      }
      const hex = chip.getAttribute("data-hex");
      if (hex) {
        updateColorPickerFields(hex);
        addRecentColor(hex);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(hex).catch(() => {});
        }
        if (typeof window.showToast === "function") window.showToast(`Loaded ${hex.toUpperCase()} into Color Picker`);
      }
      return;
    }

    // E) Palette actions (+ Color or Delete)
    const palAddBtn = event.target.closest("[data-action='add-pal-color']");
    if (palAddBtn) {
      const idx = Number(palAddBtn.getAttribute("data-pal-idx"));
      const picker = document.getElementById("colorPickerMain");
      const hex = (picker && picker.value) || "#22ff6f";
      let list = getStorage("compXUserPalettes", DEFAULT_PALETTES);
      if (list[idx]) {
        list[idx].colors = list[idx].colors || [];
        list[idx].colors.push(hex);
        setStorage("compXUserPalettes", list);
        renderUserPalettes();
        if (typeof window.showToast === "function") window.showToast(`Added ${hex.toUpperCase()} to palette`);
      }
      return;
    }

    const palDelBtn = event.target.closest("[data-action='delete-pal']");
    if (palDelBtn) {
      const idx = Number(palDelBtn.getAttribute("data-pal-idx"));
      let list = getStorage("compXUserPalettes", DEFAULT_PALETTES);
      list.splice(idx, 1);
      setStorage("compXUserPalettes", list);
      renderUserPalettes();
      if (typeof window.showToast === "function") window.showToast("Palette deleted");
      return;
    }

    // F) Saved Gradient Cards
    const removeGradBtn = event.target.closest("[data-action='remove-saved-gradient']");
    if (removeGradBtn) {
      const idx = Number(removeGradBtn.getAttribute("data-idx"));
      let list = getStorage("compXSavedGradients", DEFAULT_GRADIENTS);
      list.splice(idx, 1);
      setStorage("compXSavedGradients", list);
      renderSavedGradients();
      return;
    }

    const gradCard = event.target.closest(".cx-saved-gradient");
    if (gradCard) {
      const idx = Number(gradCard.getAttribute("data-gradient-idx"));
      const list = getStorage("compXSavedGradients", DEFAULT_GRADIENTS);
      if (list[idx]) {
        loadGradientIntoBuilder(list[idx]);
      }
      return;
    }

    // G) Anchor Point Grid
    const anchorBtn = event.target.closest(".anchor-dot-btn");
    if (anchorBtn) {
      document.querySelectorAll(".anchor-dot-btn").forEach(b => b.classList.toggle("active", b === anchorBtn));
    }

    // H) Align Grid
    const alignBtn = event.target.closest(".gdock-align-grid .tool-btn");
    if (alignBtn) {
      document.querySelectorAll(".gdock-align-grid .tool-btn").forEach(b => b.classList.toggle("active", b === alignBtn));
    }

    // I) Generic Toast Feedback for tool action buttons
    const btn = event.target.closest("button, .tool-btn, .cx-icon-btn, .tanim-card-btn, .sfxd-insert-btn, .mogrt-btn");
    if (!btn) return;

    const feedback = document.getElementById("demo-feedback");
    if (feedback) {
      const title = btn.title || btn.getAttribute("aria-label") || btn.textContent.trim() || "Orbit Action";
      feedback.textContent = title + " — Interactive Demo. Runs live inside Premiere Pro & After Effects.";
      feedback.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { feedback.hidden = true; }, 3000);
    }
  });

  // Double-click to apply color or gradient
  document.addEventListener("dblclick", function(event) {
    const chip = event.target.closest(".swatch-chip");
    if (chip) {
      const hex = chip.getAttribute("data-hex");
      if (hex && typeof window.showToast === "function") {
        window.showToast(`Applied Fill: ${hex.toUpperCase()} to layer`);
      }
      return;
    }
    const gradCard = event.target.closest(".cx-saved-gradient");
    if (gradCard) {
      const idx = Number(gradCard.getAttribute("data-gradient-idx"));
      const list = getStorage("compXSavedGradients", DEFAULT_GRADIENTS);
      if (list[idx] && typeof window.showToast === "function") {
        window.showToast(`Applied ${list[idx].mode}-stop gradient to comp`);
      }
      return;
    }
  });

  // Prevent link navigation inside the preview iframe
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (link) e.preventDefault();
  }, true);

  // Prevent iframe window scroll drift
  window.addEventListener("scroll", function() {
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  }, { passive: false });

  // -------------------------------------------------------------
  // 10. Initial Page Boot
  // -------------------------------------------------------------
  function boot() {
    window.scrollTo(0, 0);
    populateMogrtLibrary();
    populateSoundDesigner();
    populateTextAnimStyles();
    populateMotions();
    populateFfx();
    initColorStudio();

    window.setTimeout(() => {
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event("resize"));
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();