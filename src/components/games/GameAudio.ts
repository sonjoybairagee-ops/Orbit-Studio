/**
 * CompX Orbit Game Audio & Visual FX Engine
 * Zero-dependency Web Audio API synthesizer for instant, lag-free retro & studio game SFX.
 * Includes pure HTML5 Canvas particle confetti system.
 */

let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Initialize or return shared audio context
function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export const GameSound = {
  getMuted: (): boolean => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("compx_games_muted");
      if (saved !== null) isMuted = saved === "true";
    }
    return isMuted;
  },

  setMuted: (muted: boolean) => {
    isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("compx_games_muted", String(muted));
    }
  },

  toggleMute: (): boolean => {
    GameSound.setMuted(!isMuted);
    return isMuted;
  },

  // Dice roll rattling sound
  playDiceRoll: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const count = 5;
    for (let i = 0; i < count; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = i * 0.045;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(140 + Math.random() * 220, ctx.currentTime + delay);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + delay + 0.05);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.06);
    }
  },

  // Token hopping step sound
  playTokenStep: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  },

  // Token capture / Knockout sound
  playCapture: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Pitch drop + noise thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(550, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.23);
  },

  // Carrom wooden striker impact snap
  playCarromStrike: (powerRatio: number = 0.7) => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(280 + powerRatio * 180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(Math.min(0.4, 0.15 + powerRatio * 0.25), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  },

  // Carrom pocket drop bell
  playPocketChime: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = ctx.currentTime + idx * 0.05;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.36);
    });
  },

  // Monopoly Cash Register Cha-Ching!
  playCashRegister: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Bell 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime); // E6
    gain1.gain.setValueAtTime(0.22, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.46);

    // Bell 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1975.53, ctx.currentTime + 0.08); // B6
    gain2.gain.setValueAtTime(0.26, ctx.currentTime + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.56);
  },

  // UNO / Card swoosh
  playCardSwoosh: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.09);
  },

  // Tic-Tac-Toe neon mark tone
  playNeonMark: (isPlayer: boolean = true) => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isPlayer ? "triangle" : "sine";
    osc.frequency.setValueAtTime(isPlayer ? 523.25 : 392.0, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.13);
  },

  // Victory fanfare chord
  playVictory: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const delay = i * 0.09;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.24, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.56);
    });
  },

  // UNO! declaration shout fanfare
  playUnoShout: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Rapid ascending brass fanfare C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = ctx.currentTime + idx * 0.07;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.26, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.36);
    });
  },

  // UNO! Catch Penalty buzzer/alarm
  playUnoCatch: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    // Double alarm drop
    [0, 0.12].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = ctx.currentTime + delay;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(700, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.1);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.12);
    });
  },

  // Turn timer countdown tick
  playTimerTick: () => {
    if (GameSound.getMuted()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1050, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },
};

/**
 * Pure Canvas Confetti Explosion
 * Works with zero external packages, lightweight & mobile responsive.
 */
export function fireVictoryConfetti() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const colors = [
    "#3cff5f",
    "#38bdf8",
    "#facc15",
    "#ef4444",
    "#ec4899",
    "#a855f7",
    "#ffffff",
  ];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    tilt: number;
    tiltSpeed: number;
    alpha: number;
  }

  const particles: Particle[] = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w / 2,
      y: h / 2,
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() - 0.7) * 20 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      tilt: Math.random() * 10 - 5,
      tiltSpeed: (Math.random() - 0.5) * 0.2,
      alpha: 1,
    });
  }

  let animationFrame: number;
  const startTime = Date.now();

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    const elapsed = Date.now() - startTime;
    let anyAlive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
      p.vx *= 0.985;
      p.tilt += p.tiltSpeed;
      if (elapsed > 1200) {
        p.alpha -= 0.02;
      }

      if (p.alpha > 0 && p.y < h + 50) {
        anyAlive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (anyAlive && elapsed < 3500) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animate();
}

