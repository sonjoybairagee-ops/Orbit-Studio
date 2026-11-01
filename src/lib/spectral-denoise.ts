/**
 * Studio-Grade Multi-Stage Noise Reduction & Voice Enhancement DSP Engine
 * 100% Client-Side Pure TypeScript/JavaScript
 *
 * Architecture:
 * 1. Dual-stage Butterworth Highpass filter (eliminates sub-bass desk rumble & HVAC vibrations)
 * 2. Harmonic Notch Filters (eradicates 50Hz, 60Hz, 100Hz, 120Hz, 180Hz power-line hum & fan whine)
 * 3. Per-Bin Minimum-Statistics Noise Profiling (robust even with continuous speech)
 *    + Over-subtracted Wiener Spectral Gating
 * 4. Adaptive Speech VAD Downward Expander (wipes out residual hiss/hum during speech pauses)
 *    - Threshold derived from the RESIDUAL (post-denoise) noise floor so it never eats speech
 * 5. Studio Vocal Enhancer (Adobe Podcast Style):
 *    - Warm Chest Resonance / Proximity Boost (180 Hz - 230 Hz)
 *    - Boxy Room Resonance Notch (450 Hz - 550 Hz)
 *    - Speech Articulation & Consonant Presence (2.8 kHz - 4.5 kHz)
 *    - Silky High-End Condenser Air (10 kHz - 14 kHz)
 * 6. Dynamic Broadcast Vocal Leveler (true upward compression + makeup gain)
 *    & Transparent Soft-Clip Limiter
 *
 * A single shared AudioContext singleton is used for buffer allocation to avoid
 * hitting the browser's AudioContext instantiation limit.
 */

export interface DenoiseOptions {
  noiseReductionStrength: number; // 0 to 100 (percentage)
  vocalClarityBoost: number; // 0 to 100 (percentage)
  highPassRumbleCutHz: number; // e.g. 85 Hz
  warmthBoost?: number; // 0 to 100 (adds rich chest resonance / proximity)
  roomDeMuffle?: number; // 0 to 100 (cuts boxy room resonance)
  broadcastLeveling?: boolean; // auto-levels speech volume to studio broadcast standard
}

// ─── Shared AudioContext Singleton (avoids browser context instantiation limit) ──
let sharedAudioCtx: AudioContext | null = null;

export function getSharedAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("Web Audio API requires a browser environment");
  }
  const win = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = win.AudioContext || win.webkitAudioContext;
  if (!Ctor) {
    throw new Error("Web Audio API not supported in current environment");
  }
  if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
    sharedAudioCtx = new Ctor();
  }
  return sharedAudioCtx;
}

// ─── Fast In-Place Cooley-Tukey Radix-2 FFT ──────────────────────────────────
class FastFFT {
  private size: number;
  private cosTable: Float32Array;
  private sinTable: Float32Array;
  private bitReverse: Uint32Array;

  constructor(size: number) {
    this.size = size;
    this.cosTable = new Float32Array(size / 2);
    this.sinTable = new Float32Array(size / 2);
    for (let i = 0; i < size / 2; i++) {
      this.cosTable[i] = Math.cos((-2 * Math.PI * i) / size);
      this.sinTable[i] = Math.sin((-2 * Math.PI * i) / size);
    }

    this.bitReverse = new Uint32Array(size);
    const bits = Math.round(Math.log2(size));
    for (let i = 0; i < size; i++) {
      let rev = 0;
      let val = i;
      for (let j = 0; j < bits; j++) {
        rev = (rev << 1) | (val & 1);
        val >>= 1;
      }
      this.bitReverse[i] = rev;
    }
  }

  public transform(real: Float32Array, imag: Float32Array, inverse = false) {
    const n = this.size;

    // Bit-reversal permutation
    for (let i = 0; i < n; i++) {
      const j = this.bitReverse[i];
      if (j > i) {
        const tr = real[i];
        real[i] = real[j];
        real[j] = tr;

        const ti = imag[i];
        imag[i] = imag[j];
        imag[j] = ti;
      }
    }

    // Cooley-Tukey decimation-in-time
    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const step = n / len;

      for (let i = 0; i < n; i += len) {
        for (let j = 0; j < halfLen; j++) {
          const tableIdx = j * step;
          const cos = this.cosTable[tableIdx];
          const sin = inverse ? -this.sinTable[tableIdx] : this.sinTable[tableIdx];

          const uR = real[i + j];
          const uI = imag[i + j];

          const vR = real[i + j + halfLen] * cos - imag[i + j + halfLen] * sin;
          const vI = real[i + j + halfLen] * sin + imag[i + j + halfLen] * cos;

          real[i + j] = uR + vR;
          imag[i + j] = uI + vI;

          real[i + j + halfLen] = uR - vR;
          imag[i + j + halfLen] = uI - vI;
        }
      }
    }

    if (inverse) {
      for (let i = 0; i < n; i++) {
        real[i] /= n;
        imag[i] /= n;
      }
    }
  }
}

// ─── Biquad IIR Filter (HighPass, Notch, Peaking, HighShelf) ─────────────────
class BiquadFilter {
  private x1 = 0;
  private x2 = 0;
  private y1 = 0;
  private y2 = 0;
  private b0 = 1;
  private b1 = 0;
  private b2 = 0;
  private a1 = 0;
  private a2 = 0;

  public setHighPass(freq: number, sampleRate: number, q = 0.707) {
    const safeFreq = Math.max(20, Math.min(sampleRate * 0.45, freq));
    const w0 = (2 * Math.PI * safeFreq) / sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    const cosw0 = Math.cos(w0);
    const a0 = 1 + alpha;

    this.b0 = (1 + cosw0) / 2 / a0;
    this.b1 = -(1 + cosw0) / a0;
    this.b2 = (1 + cosw0) / 2 / a0;
    this.a1 = (-2 * cosw0) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  public setNotch(freq: number, sampleRate: number, q = 6.0) {
    if (freq >= sampleRate * 0.45) return;
    const w0 = (2 * Math.PI * freq) / sampleRate;
    const alpha = Math.sin(w0) / (2 * q);
    const cosw0 = Math.cos(w0);
    const a0 = 1 + alpha;

    this.b0 = 1 / a0;
    this.b1 = (-2 * cosw0) / a0;
    this.b2 = 1 / a0;
    this.a1 = (-2 * cosw0) / a0;
    this.a2 = (1 - alpha) / a0;
  }

  public setPeaking(freq: number, gainDb: number, q = 1.0, sampleRate = 44100) {
    if (freq >= sampleRate * 0.45 || Math.abs(gainDb) < 0.05) {
      this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0;
      return;
    }
    const w0 = (2 * Math.PI * freq) / sampleRate;
    const A = Math.pow(10, gainDb / 40);
    const alpha = Math.sin(w0) / (2 * q);
    const cosw0 = Math.cos(w0);
    const a0 = 1 + alpha / A;

    this.b0 = (1 + alpha * A) / a0;
    this.b1 = (-2 * cosw0) / a0;
    this.b2 = (1 - alpha * A) / a0;
    this.a1 = (-2 * cosw0) / a0;
    this.a2 = (1 - alpha / A) / a0;
  }

  public setHighShelf(freq: number, gainDb: number, sampleRate = 44100) {
    if (freq >= sampleRate * 0.45 || Math.abs(gainDb) < 0.05) {
      this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0;
      return;
    }
    const w0 = (2 * Math.PI * freq) / sampleRate;
    const A = Math.pow(10, gainDb / 40);
    const cosw0 = Math.cos(w0);
    const sinw0 = Math.sin(w0);
    const alpha = (sinw0 / 2) * Math.SQRT2;
    const twoSqrtAAlpha = 2 * Math.sqrt(A) * alpha;

    const a0 = (A + 1) - (A - 1) * cosw0 + twoSqrtAAlpha;
    this.b0 = (A * ((A + 1) + (A - 1) * cosw0 + twoSqrtAAlpha)) / a0;
    this.b1 = (-2 * A * ((A - 1) + (A + 1) * cosw0)) / a0;
    this.b2 = (A * ((A + 1) + (A - 1) * cosw0 - twoSqrtAAlpha)) / a0;
    this.a1 = (2 * ((A - 1) - (A + 1) * cosw0)) / a0;
    this.a2 = ((A + 1) - (A - 1) * cosw0 - twoSqrtAAlpha) / a0;
  }

  public process(x: number): number {
    const y =
      this.b0 * x +
      this.b1 * this.x1 +
      this.b2 * this.x2 -
      this.a1 * this.y1 -
      this.a2 * this.y2;
    this.x2 = this.x1;
    this.x1 = x;
    this.y2 = this.y1;
    this.y1 = y;
    return y;
  }
}

// ─── Main Spectral Denoising & Studio Voice Enhancement Function ─────────────
export function spectralDenoiseAudio(
  buffer: AudioBuffer,
  options: DenoiseOptions
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;

  // Shared context — never create a fresh AudioContext per call (browser limit!)
  const ctx = getSharedAudioContext();
  const outBuffer = ctx.createBuffer(numChannels, length, sampleRate);

  const FFT_SIZE = 1024;
  const HOP_SIZE = 256; // 75% overlap for artifact-free overlap-add
  const fft = new FastFFT(FFT_SIZE);

  // Periodic Hann Window
  const windowTable = new Float32Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) {
    windowTable[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / FFT_SIZE));
  }

  // Window Sum for overlap-add normalization
  const windowSum = new Float32Array(length + FFT_SIZE);
  for (let start = 0; start < length; start += HOP_SIZE) {
    for (let i = 0; i < FFT_SIZE; i++) {
      windowSum[start + i] += windowTable[i] * windowTable[i];
    }
  }

  // Normalized parameters
  const strengthNorm = Math.max(0.1, Math.min(1.0, options.noiseReductionStrength / 100));
  // Oversubtraction factor: scales up for heavy fan & AC noise (bounded so it
  // never devours voice energy when speech and noise share frequency bins)
  const oversubtraction = 1.45 + strengthNorm * 2.3;
  // Floor gain: lower floor down to 0.001 for a clean black background
  const gainFloor = Math.max(0.001, 0.03 * Math.pow(1.0 - strengthNorm, 2));

  // Enhancement parameters
  const clarityNorm = Math.max(0, Math.min(1.0, options.vocalClarityBoost / 100));
  const warmthNorm = Math.max(0, Math.min(1.0, (options.warmthBoost ?? 65) / 100));
  const deMuffleNorm = Math.max(0, Math.min(1.0, (options.roomDeMuffle ?? 60) / 100));
  const enableBroadcastLeveling = options.broadcastLeveling !== false;

  // Per-channel residual (post-denoise) noise RMS, used by the gate + leveler
  const residualNoiseRmsArr = new Float32Array(numChannels);

  for (let ch = 0; ch < numChannels; ch++) {
    const inData = buffer.getChannelData(ch);
    const outData = outBuffer.getChannelData(ch);

    if (length < FFT_SIZE * 2) {
      outData.set(inData);
      // Rough passthrough level estimate for the leveler stage
      let e = 0;
      for (let i = 0; i < length; i++) e += inData[i] * inData[i];
      residualNoiseRmsArr[ch] = Math.sqrt(e / Math.max(1, length)) * gainFloor;
      continue;
    }

    const realBuffer = new Float32Array(FFT_SIZE);
    const imagBuffer = new Float32Array(FFT_SIZE);

    // ── STAGE 1 & 2: Pre-filtering (High-pass rumble cut + Hum notches) ──
    const preFiltered = new Float32Array(length);
    const hp1 = new BiquadFilter();
    hp1.setHighPass(options.highPassRumbleCutHz || 85, sampleRate);
    const hp2 = new BiquadFilter();
    hp2.setHighPass(options.highPassRumbleCutHz || 85, sampleRate);

    // Eradicate electrical hum & motor fan harmonics
    const notch50 = new BiquadFilter();
    notch50.setNotch(50, sampleRate, 6);
    const notch60 = new BiquadFilter();
    notch60.setNotch(60, sampleRate, 6);
    const notch100 = new BiquadFilter();
    notch100.setNotch(100, sampleRate, 6);
    const notch120 = new BiquadFilter();
    notch120.setNotch(120, sampleRate, 6);
    const notch180 = new BiquadFilter();
    notch180.setNotch(180, sampleRate, 6);

    for (let i = 0; i < length; i++) {
      let s = inData[i];
      s = hp1.process(s);
      s = hp2.process(s);
      s = notch50.process(s);
      s = notch60.process(s);
      s = notch100.process(s);
      s = notch120.process(s);
      s = notch180.process(s);
      preFiltered[i] = s;
    }

    // ── STAGE 3: Per-Bin Minimum-Statistics Noise Profile Estimation ──
    // Classic percentile frame selection is kept to find candidate noise-only
    // frames, BUT the profile is built from the per-bin MINIMUM magnitude
    // across those frames instead of the average. Speech remnants pulse and
    // fluctuate, so the minimum rejects them; stationary noise keeps its level.
    // This is what makes the profile usable even with continuous speech.
    const numFrames = Math.max(1, Math.floor((length - FFT_SIZE) / HOP_SIZE) + 1);
    const frameEnergies = new Float32Array(numFrames);

    for (let f = 0; f < numFrames; f++) {
      const offset = f * HOP_SIZE;
      let energy = 0;
      for (let i = 0; i < FFT_SIZE; i++) {
        const val = preFiltered[offset + i] * windowTable[i];
        energy += val * val;
      }
      frameEnergies[f] = energy;
    }

    // Sort to isolate the true quietest frames (12th percentile)
    const sortedEnergies = frameEnergies.slice().sort();
    const noiseThreshold = sortedEnergies[Math.floor(numFrames * 0.12)] || sortedEnergies[0];

    const noiseFrameMask = new Uint8Array(numFrames);
    let noiseFrameCount = 0;
    for (let f = 0; f < numFrames; f++) {
      if (frameEnergies[f] <= noiseThreshold * 1.35) {
        noiseFrameMask[f] = 1;
        noiseFrameCount++;
      }
    }

    const binCount = FFT_SIZE / 2 + 1;
    const minMagProfile = new Float32Array(binCount).fill(Infinity);
    const avgAccum = new Float32Array(binCount);
    const perBinMags =
      noiseFrameCount >= 16
        ? new Float32Array(binCount * noiseFrameCount)
        : null;
    let noiseEnergySum = 0;
    let noiseOrdinal = 0;

    for (let f = 0; f < numFrames; f++) {
      if (!noiseFrameMask[f]) continue;
      const offset = f * HOP_SIZE;
      noiseEnergySum += frameEnergies[f];
      for (let i = 0; i < FFT_SIZE; i++) {
        realBuffer[i] = preFiltered[offset + i] * windowTable[i];
        imagBuffer[i] = 0;
      }
      fft.transform(realBuffer, imagBuffer, false);

      if (perBinMags) {
        for (let k = 0; k < binCount; k++) {
          const mag = Math.sqrt(
            realBuffer[k] * realBuffer[k] + imagBuffer[k] * imagBuffer[k]
          );
          if (mag < minMagProfile[k]) minMagProfile[k] = mag;
          avgAccum[k] += mag;
          perBinMags[k * noiseFrameCount + noiseOrdinal] = mag;
        }
        noiseOrdinal++;
        continue;
      }

      for (let k = 0; k < binCount; k++) {
        const mag = Math.sqrt(
          realBuffer[k] * realBuffer[k] + imagBuffer[k] * imagBuffer[k]
        );
        if (mag < minMagProfile[k]) minMagProfile[k] = mag;
        avgAccum[k] += mag;
      }
    }

    const noiseProfile = new Float32Array(binCount);
    const baselineNoiseRms =
      noiseFrameCount > 0
        ? Math.sqrt(noiseEnergySum / (noiseFrameCount * FFT_SIZE))
        : 0.015;

    for (let k = 0; k < binCount; k++) {
      if (perBinMags) {
        // 25th percentile of magnitudes across noise-only frames, with a bias
        // correction, gives the true stationary noise level. Speech remnants
        // pulse above it (rejected), noise itself sits right around it.
        const col = perBinMags.subarray(k * noiseFrameCount, (k + 1) * noiseFrameCount);
        col.sort();
        let est = col[Math.floor(noiseFrameCount * 0.25)] * 1.7;
        noiseProfile[k] = Math.max(0.0005, est);
      } else if (noiseFrameCount > 0) {
        noiseProfile[k] = Math.max(0.0005, avgAccum[k] / noiseFrameCount);
      } else {
        noiseProfile[k] = 0.008;
      }
    }

    // Smooth the profile across neighbouring frequency bins to avoid musical noise
    for (let k = 1; k < binCount - 1; k++) {
      noiseProfile[k] = (noiseProfile[k - 1] + noiseProfile[k] + noiseProfile[k + 1]) / 3;
    }

    // ── STAGE 4: Spectral Wiener Gating with Temporal Smoothing ──
    const prevGains = new Float32Array(binCount);
    prevGains.fill(gainFloor);

    const outAccumulator = new Float32Array(length + FFT_SIZE);

    for (let f = 0; f < numFrames; f++) {
      const offset = f * HOP_SIZE;
      for (let i = 0; i < FFT_SIZE; i++) {
        realBuffer[i] = preFiltered[offset + i] * windowTable[i];
        imagBuffer[i] = 0;
      }

      fft.transform(realBuffer, imagBuffer, false);

      for (let k = 0; k < binCount; k++) {
        const real = realBuffer[k];
        const imag = imagBuffer[k];
        const mag = Math.sqrt(real * real + imag * imag);

        const noiseMag = noiseProfile[k] * oversubtraction;
        let instantGain = gainFloor;

        if (mag > 1e-6) {
          const snrRatio = (mag - noiseMag) / mag;
          if (snrRatio > 0) {
            // Exponent keeps the transition soft but preserves voice harmonics
            instantGain = Math.max(gainFloor, Math.pow(snrRatio, 1.2));
          }
        }

        // Temporal Smoothing (fast attack, slower release)
        const smoothedGain =
          instantGain > prevGains[k]
            ? 0.50 * instantGain + 0.50 * prevGains[k]
            : 0.12 * instantGain + 0.88 * prevGains[k];

        prevGains[k] = smoothedGain;

        realBuffer[k] *= smoothedGain;
        imagBuffer[k] *= smoothedGain;

        if (k > 0 && k < FFT_SIZE / 2) {
          realBuffer[FFT_SIZE - k] = realBuffer[k];
          imagBuffer[FFT_SIZE - k] = -imagBuffer[k];
        }
      }

      fft.transform(realBuffer, imagBuffer, true);

      for (let i = 0; i < FFT_SIZE; i++) {
        outAccumulator[offset + i] += realBuffer[i] * windowTable[i];
      }
    }

    const spectralOutput = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const norm = windowSum[i] > 1e-5 ? windowSum[i] : 1.0;
      spectralOutput[i] = outAccumulator[i] / norm;
    }

    // ── Measure the RESIDUAL noise floor of the denoised signal ──
    // The gate must be thresholded against the level of the noise that is
    // actually left AFTER spectral gating — not the raw input noise level —
    // otherwise quiet speech gets chopped off.
    let resSum = 0;
    let resCount = 0;
    for (let f = 0; f < numFrames; f++) {
      if (!noiseFrameMask[f]) continue;
      const offset = f * HOP_SIZE;
      for (let i = 0; i < FFT_SIZE; i++) {
        const idx = offset + i;
        if (idx >= length) break;
        resSum += spectralOutput[idx] * spectralOutput[idx];
        resCount++;
      }
    }
    residualNoiseRmsArr[ch] =
      resCount > 0
        ? Math.sqrt(resSum / resCount)
        : baselineNoiseRms * gainFloor;

    // ── STAGE 5: Adaptive Downward Speech Gate (Total Pause Silence) ──
    const gateThresh = Math.max(0.003, residualNoiseRmsArr[ch] * 1.8);
    const attackCoeff = Math.exp(-1 / (sampleRate * 0.008)); // 8ms attack (preserves consonants)
    const releaseCoeff = Math.exp(-1 / (sampleRate * 0.300)); // 300ms release (natural decay)

    const gatedOutput = new Float32Array(length);
    let envelope = 0;
    for (let i = 0; i < length; i++) {
      const absVal = Math.abs(spectralOutput[i]);
      if (absVal > envelope) {
        envelope = attackCoeff * envelope + (1 - attackCoeff) * absVal;
      } else {
        envelope = releaseCoeff * envelope + (1 - releaseCoeff) * absVal;
      }

      let gateGain = 1.0;
      if (envelope < gateThresh) {
        const ratio = envelope / gateThresh;
        // Deep sigmoid expansion down to zero
        gateGain = Math.max(0.0003, Math.pow(ratio, 2.2));
      }

      gatedOutput[i] = spectralOutput[i] * gateGain;
    }

    // ── STAGE 6: Studio Vocal Enhancement Filters (The "Adobe Podcast" Sound) ──
    // 1. Warm Chest Resonance (190 Hz) — Gives body & authority like a Shure SM7B
    const chestWarmthFilter = new BiquadFilter();
    const warmthGainDb = warmthNorm * 4.8; // up to +4.8 dB
    chestWarmthFilter.setPeaking(190, warmthGainDb, 1.1, sampleRate);

    // 2. Anti-Boxy Room Notch (500 Hz) — Removes cardboard bedroom boxiness
    const roomDeMuffleFilter = new BiquadFilter();
    const deMuffleGainDb = -(deMuffleNorm * 3.5); // down to -3.5 dB
    roomDeMuffleFilter.setPeaking(500, deMuffleGainDb, 1.2, sampleRate);

    // 3. Speech Presence & Consonant Clarity (3.4 kHz) — Crystal-clear dialogue
    const clarityFilter = new BiquadFilter();
    const clarityGainDb = clarityNorm * 5.2; // up to +5.2 dB
    clarityFilter.setPeaking(3400, clarityGainDb, 1.0, sampleRate);

    // 4. Silky Condenser Air (11 kHz) — Modern studio high-end shimmer
    const airFilter = new BiquadFilter();
    const airGainDb = clarityNorm * 2.8; // up to +2.8 dB
    airFilter.setHighShelf(11000, airGainDb, sampleRate);

    for (let i = 0; i < length; i++) {
      let s = gatedOutput[i];
      s = chestWarmthFilter.process(s);
      s = roomDeMuffleFilter.process(s);
      s = clarityFilter.process(s);
      s = airFilter.process(s);
      outData[i] = s;
    }
  }

  // ── STAGE 7: Dynamic Broadcast Vocal Leveler (True Upward Compression) ──
  // Brings quiet speech up to broadcast loudness block-by-block, while never
  // boosting the (already-near-silent) pauses. Static makeup gain targets the
  // median active-speech RMS; a smooth per-block compressor evens out words.
  if (enableBroadcastLeveling) {
    let avgResidual = 0;
    for (let ch = 0; ch < numChannels; ch++) avgResidual += residualNoiseRmsArr[ch];
    avgResidual /= numChannels;

    const speechTh = Math.max(0.012, avgResidual * 3.0);
    const blockSize = 1024; // ~21 ms blocks
    const numBlocks = Math.floor(length / blockSize);

    if (numBlocks > 2) {
      const detectData = outBuffer.getChannelData(0);
      const blockRms = new Float64Array(numBlocks);
      for (let b = 0; b < numBlocks; b++) {
        let s = 0;
        const start = b * blockSize;
        for (let i = 0; i < blockSize; i++) {
          const v = detectData[start + i];
          s += v * v;
        }
        blockRms[b] = Math.sqrt(s / blockSize);
      }

      // Median RMS across speech-active blocks → makeup gain target
      const speechBlocks: number[] = [];
      for (let b = 0; b < numBlocks; b++) {
        if (blockRms[b] > speechTh) speechBlocks.push(blockRms[b]);
      }

      const targetRms = 0.16; // broadcast speech RMS target
      let staticGain = 1.0;
      if (speechBlocks.length > 0) {
        speechBlocks.sort((a, b) => a - b);
        const median =
          speechBlocks.length % 2 === 0
            ? speechBlocks[speechBlocks.length / 2 - 1]
            : speechBlocks[Math.floor(speechBlocks.length / 2)];
        if (median > 1e-5) {
          staticGain = Math.min(4.0, Math.max(1.0, targetRms / median));
        }
      }

      // Smooth per-block compressor gains: fast-follow speech, never boost pauses
      const blockGains = new Float64Array(numBlocks);
      let prev = 1.0;
      for (let b = 0; b < numBlocks; b++) {
        const r = blockRms[b];
        let target = 1.0;
        if (r > speechTh) {
          const g = targetRms / r;
          target = Math.min(staticGain, Math.max(1.0, g));
        }
        // Fast attack on speech bursts, smoother release on decay
        const speed = target < prev ? 0.35 : 0.08;
        const cur = prev + (target - prev) * speed;
        blockGains[b] = cur;
        prev = cur;
      }

      // Apply gains to every channel with linear interpolation between blocks
      for (let ch = 0; ch < numChannels; ch++) {
        const data = outBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          const pos = i / blockSize;
          const b = Math.floor(pos);
          if (b >= numBlocks) break;
          const frac = pos - b;
          const next = b + 1 < numBlocks ? blockGains[b + 1] : blockGains[b];
          data[i] *= blockGains[b] + (next - blockGains[b]) * frac;
        }
      }
    }
  }

  // Final peak management + Transparent Soft Limiter (tanh saturation)
  for (let ch = 0; ch < numChannels; ch++) {
    const data = outBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const val = data[i];
      if (Math.abs(val) > 0.85) {
        data[i] = 0.85 * Math.tanh(val / 0.85);
      }
    }
  }

  return outBuffer;
}
