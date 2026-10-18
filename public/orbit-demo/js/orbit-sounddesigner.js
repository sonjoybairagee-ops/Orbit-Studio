/* ============================================================
   ORBIT SOUND DESIGNER — Audio library and insertion
   Implements the Sound Designer tab functionality
   ============================================================ */
(function () {
  "use strict";

  var soundLibrary = [];
  var selectedSound = null;
  var currentCategory = "all";

  // Initialize when DOM is ready
  function init() {
    var panel = document.getElementById("panel-sounddesigner");
    if (!panel) return;

    // Tab switching
    var tabs = panel.querySelectorAll(".sound-tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var category = this.getAttribute("data-category");
        switchCategory(category);
      });
    });

    // Search
    var searchInput = document.getElementById("soundSearchInput");
    var searchBtn = document.getElementById("btnSoundSearch");
    if (searchBtn) {
      searchBtn.addEventListener("click", handleSearch);
    }
    if (searchInput) {
      searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") handleSearch();
      });
    }

    // Insert button
    var insertBtn = document.getElementById("btnSoundInsert");
    if (insertBtn) {
      insertBtn.addEventListener("click", insertSelectedSound);
    }

    // Load sample sounds (in production, this would load from API/database)
    loadSampleSounds();
  }

  function switchCategory(category) {
    currentCategory = category;
    
    // Update tab UI
    var tabs = document.querySelectorAll(".sound-tab");
    tabs.forEach(function (tab) {
      if (tab.getAttribute("data-category") === category) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Filter library
    renderLibrary();
  }

  function handleSearch() {
    var searchInput = document.getElementById("soundSearchInput");
    var query = searchInput ? searchInput.value.toLowerCase() : "";
    renderLibrary(query);
  }

  function loadSampleSounds() {
    // Sample data - in production, load from actual audio library
    soundLibrary = [
      { id: 1, name: "Whoosh Transition", category: "sfx", duration: "0:02", path: "" },
      { id: 2, name: "Click UI", category: "sfx", duration: "0:01", path: "" },
      { id: 3, name: "Impact Boom", category: "sfx", duration: "0:03", path: "" },
      { id: 4, name: "Ambient Drone", category: "ambient", duration: "0:30", path: "" },
      { id: 5, name: "Cinematic Score", category: "music", duration: "2:15", path: "" },
      { id: 6, name: "Pop Sound", category: "sfx", duration: "0:01", path: "" },
      { id: 7, name: "Wind ambience", category: "ambient", duration: "1:00", path: "" },
      { id: 8, name: "Upbeat Background", category: "music", duration: "1:45", path: "" },
    ];
    renderLibrary();
  }

  function renderLibrary(searchQuery) {
    var libraryEl = document.getElementById("soundLibrary");
    if (!libraryEl) return;

    var filtered = soundLibrary.filter(function (sound) {
      var matchesCategory = currentCategory === "all" || sound.category === currentCategory;
      var matchesSearch = !searchQuery || sound.name.toLowerCase().indexOf(searchQuery) >= 0;
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      libraryEl.innerHTML = `
        <div class="sound-empty-state">
          <div class="sound-empty-icon">♪</div>
          <div class="sound-empty-text">No sounds found</div>
          <div class="sound-empty-sub">Try a different search or category</div>
        </div>
      `;
      return;
    }

    var html = "";
    filtered.forEach(function (sound) {
      var isSelected = selectedSound && selectedSound.id === sound.id;
      html += `
        <div class="sound-row ${isSelected ? 'selected' : ''}" data-id="${sound.id}">
          <button class="sound-play-btn" title="Play preview">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <div class="sound-info">
            <div class="sound-name">${sound.name}</div>
            <div class="sound-meta">${sound.category.toUpperCase()} • ${sound.duration}</div>
          </div>
          <div class="sound-duration">${sound.duration}</div>
        </div>
      `;
    });

    libraryEl.innerHTML = html;

    // Add click handlers
    libraryEl.querySelectorAll(".sound-row").forEach(function (row) {
      row.addEventListener("click", function () {
        var id = parseInt(this.getAttribute("data-id"));
        selectSound(id);
      });
    });

    libraryEl.querySelectorAll(".sound-play-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var row = this.closest(".sound-row");
        var id = parseInt(row.getAttribute("data-id"));
        playPreview(id);
      });
    });
  }

  function selectSound(id) {
    selectedSound = soundLibrary.find(function (s) { return s.id === id; });
    renderLibrary();
  }

  function playPreview(id) {
    // In production, this would play the actual audio file
    console.log("Playing preview for sound ID:", id);
  }

  function insertSelectedSound() {
    if (!selectedSound) {
      alert("Please select a sound first");
      return;
    }

    var insertionTarget = getInsertionTarget();
    var targetAudioTrack = getTargetAudioTrack();

    var payload = {
      path: selectedSound.path,
      name: selectedSound.name,
      insertionTarget: insertionTarget,
      targetAudioTrack: targetAudioTrack
    };

    // Call host script
    if (typeof CSInterface !== "undefined") {
      var cs = new CSInterface();
      cs.evalScript("sd_insertAudioClip(" + JSON.stringify(payload) + ")", function (result) {
        try {
          var response = JSON.parse(result);
          if (response.ok) {
            alert(response.message);
          } else {
            alert("Error: " + response.message);
          }
        } catch (e) {
          alert("Error: " + result);
        }
      });
    }
  }

  function getInsertionTarget() {
    var radios = document.querySelectorAll('input[name="insertTarget"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
        return radios[i].value;
      }
    }
    return "playhead";
  }

  function getTargetAudioTrack() {
    var select = document.getElementById("soundTrackSelect");
    if (select) {
      return parseInt(select.value);
    }
    return -1;
  }

  // Wait for DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose for main.js if needed
  window.OrbitSoundDesigner = {
    insertSelectedSound: insertSelectedSound,
    selectSound: selectSound
  };

})();
