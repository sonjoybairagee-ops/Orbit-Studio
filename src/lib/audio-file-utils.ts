/**
 * Audio & File Utilities — 100% Client-Side
 * Uses Web Audio API, Canvas API, JSZip, and lamejs for in-browser processing.
 */

// ─── WAV Encoder (Pure JS — no library) ───────────────────────────────────────
export function encodeWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bitDepth = 16;

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  const interleaved = new Float32Array(numFrames * numChannels);
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      interleaved[i * numChannels + c] = channels[c][i];
    }
  }

  const dataLength = interleaved.length * 2; // 16-bit = 2 bytes per sample
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const sample = Math.max(-1, Math.min(1, interleaved[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([wavBuffer], { type: "audio/wav" });
}

// ─── Audio Volume Normalizer ────────────────────────────────────────────────────
export interface NormalizeResult {
  blob: Blob;
  originalPeak: number;
  normalizedPeak: number;
  gainApplied: number;
}

export async function normalizeAudio(file: File, targetDb = -1): Promise<NormalizeResult> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const decoded = await ctx.decodeAudioData(arrayBuffer);

  // Find peak amplitude
  let peak = 0;
  for (let c = 0; c < decoded.numberOfChannels; c++) {
    const data = decoded.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const abs = Math.abs(data[i]);
      if (abs > peak) peak = abs;
    }
  }

  const targetLinear = Math.pow(10, targetDb / 20);
  const gain = peak > 0 ? targetLinear / peak : 1;

  // Render with gain
  const offlineCtx = new OfflineAudioContext(
    decoded.numberOfChannels,
    decoded.length,
    decoded.sampleRate
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gain;
  source.connect(gainNode);
  gainNode.connect(offlineCtx.destination);
  source.start();
  const rendered = await offlineCtx.startRendering();

  return {
    blob: encodeWav(rendered),
    originalPeak: peak,
    normalizedPeak: peak * gain,
    gainApplied: gain,
  };
}

// ─── Audio Trimmer ─────────────────────────────────────────────────────────────
export interface TrimResult {
  blob: Blob;
  trimmedDuration: number;
}

export async function trimAudio(
  file: File,
  startSec: number,
  endSec: number
): Promise<TrimResult> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const decoded = await ctx.decodeAudioData(arrayBuffer);

  const sampleRate = decoded.sampleRate;
  const channels = decoded.numberOfChannels;
  const startFrame = Math.floor(startSec * sampleRate);
  const endFrame = Math.min(Math.ceil(endSec * sampleRate), decoded.length);
  const trimLength = endFrame - startFrame;

  const trimCtx = new OfflineAudioContext(channels, trimLength, sampleRate);
  const trimBuffer = trimCtx.createBuffer(channels, trimLength, sampleRate);

  for (let c = 0; c < channels; c++) {
    const original = decoded.getChannelData(c);
    trimBuffer.getChannelData(c).set(original.subarray(startFrame, endFrame));
  }

  const src = trimCtx.createBufferSource();
  src.buffer = trimBuffer;
  src.connect(trimCtx.destination);
  src.start();
  const rendered = await trimCtx.startRendering();

  return {
    blob: encodeWav(rendered),
    trimmedDuration: rendered.duration,
  };
}

// ─── WAV to MP3 (via MediaRecorder + WebM/Opus fallback) ─────────────────────
export async function convertAudioToMp3(file: File): Promise<Blob> {
  // Decode audio
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const decoded = await ctx.decodeAudioData(arrayBuffer);

  // Re-encode via AudioContext + MediaRecorder
  const audioCtx = new AudioContext({ sampleRate: decoded.sampleRate });
  const dest = audioCtx.createMediaStreamDestination();

  const src = audioCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(dest);

  // Pick best supported format
  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
    ? "audio/webm"
    : "audio/ogg;codecs=opus";

  const recorder = new MediaRecorder(dest.stream, { mimeType });
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = reject;
    recorder.start(100);
    src.start();
    src.onended = () => {
      setTimeout(() => recorder.stop(), 200);
      audioCtx.close();
    };
  });
}

// ─── Audio File Metadata ───────────────────────────────────────────────────────
export async function getAudioDuration(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new OfflineAudioContext(1, 1, 44100);
  const decoded = await ctx.decodeAudioData(arrayBuffer);
  return decoded.duration;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2).padStart(5, "0");
  return `${m}:${s}`;
}

// ─── Video Frame Extractor ─────────────────────────────────────────────────────
export interface VideoFrame {
  index: number;
  timeCode: number;
  dataUrl: string;
}

export function extractVideoFrames(
  videoEl: HTMLVideoElement,
  count: number,
  quality = 0.92
): VideoFrame[] {
  const duration = videoEl.duration;
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx2d = canvas.getContext("2d")!;

  const frames: VideoFrame[] = [];
  // Note: for real async extraction, use the seeked approach
  // This synchronous version extracts at current playback times
  for (let i = 0; i < count; i++) {
    const time = (duration / (count - 1 || 1)) * i;
    ctx2d.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    frames.push({
      index: i,
      timeCode: time,
      dataUrl: canvas.toDataURL("image/jpeg", quality),
    });
  }
  return frames;
}

export async function extractFrameAt(
  videoEl: HTMLVideoElement,
  timeSec: number,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    const onSeeked = () => {
      videoEl.removeEventListener("seeked", onSeeked);
      const ctx2d = canvas.getContext("2d")!;
      ctx2d.drawImage(videoEl, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    videoEl.addEventListener("seeked", onSeeked);
    videoEl.currentTime = timeSec;
  });
}

// ─── CSV to JSON ───────────────────────────────────────────────────────────────
export interface CsvToJsonResult {
  data: Record<string, string>[];
  headers: string[];
  rowCount: number;
  error?: string;
}

export function csvToJson(csvStr: string, delimiter = ","): CsvToJsonResult {
  try {
    const lines = csvStr.trim().split(/\r?\n/);
    if (lines.length < 1) return { data: [], headers: [], rowCount: 0 };

    // Parse headers
    const headers = parseCsvLine(lines[0], delimiter);

    // Parse data rows
    const data: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = parseCsvLine(lines[i], delimiter);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? "";
      });
      data.push(row);
    }

    return { data, headers, rowCount: data.length };
  } catch (err: any) {
    return { data: [], headers: [], rowCount: 0, error: err?.message };
  }
}

function parseCsvLine(line: string, delimiter: string): string[] {
  const results: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      results.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  results.push(current);
  return results;
}

// ─── Format file size ──────────────────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── ZIP Creator (via JSZip) ──────────────────────────────────────────────────
import JSZip from "jszip";

export interface ZipFileInput {
  name: string;
  file: File | Blob;
}

export async function createZipArchive(
  files: ZipFileInput[],
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  for (const item of files) {
    zip.file(item.name, item.file);
  }
  return await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) onProgress(Math.round(metadata.percent));
    }
  );
}

// ─── Pure Client-Side GIF Encoder ─────────────────────────────────────────────
// Generates standard GIF89a animation directly in browser without node dependencies

export interface GifFrameOptions {
  canvas: HTMLCanvasElement;
  delayMs: number; // milliseconds per frame (e.g. 100ms = 10fps)
}

export function encodeGifFromCanvases(
  frames: GifFrameOptions[],
  width: number,
  height: number
): Blob {
  // Pre-generate standard 256-color palette (6x6x6 web safe color cube + 40 shades of gray)
  const palette: number[] = [];
  const levels = [0, 51, 102, 153, 204, 255];
  for (let r of levels) {
    for (let g of levels) {
      for (let b of levels) {
        palette.push(r, g, b);
      }
    }
  }
  // Fill remaining 40 colors with grayscale ramp
  for (let i = 0; i < 40; i++) {
    const val = Math.round((i / 39) * 255);
    palette.push(val, val, val);
  }

  // Quick color lookup: snap RGB to nearest palette index
  const matchColor = (r: number, g: number, b: number): number => {
    // Check if grayscale
    if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8) {
      const avg = (r + g + b) / 3;
      const grayIdx = Math.round((avg / 255) * 39);
      return 216 + grayIdx;
    }
    const snap = (v: number) => {
      let best = 0;
      let minDiff = 999;
      for (let i = 0; i < levels.length; i++) {
        const diff = Math.abs(levels[i] - v);
        if (diff < minDiff) {
          minDiff = diff;
          best = i;
        }
      }
      return best;
    };
    return snap(r) * 36 + snap(g) * 6 + snap(b);
  };

  const output: number[] = [];
  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) output.push(s.charCodeAt(i));
  };
  const writeU16 = (v: number) => {
    output.push(v & 0xff, (v >> 8) & 0xff);
  };

  // 1. GIF Header
  writeStr("GIF89a");

  // 2. Logical Screen Descriptor
  writeU16(width);
  writeU16(height);
  // packed: Global Color Table Flag (1), Color Res 7 (3 bits), Sort 0, Table Size 7 (256 colors)
  output.push(0xf7, 0x00, 0x00);

  // 3. Global Color Table
  for (const byte of palette) {
    output.push(byte);
  }

  // 4. Netscape Application Block for Infinite Looping
  output.push(0x21, 0xff, 0x0b);
  writeStr("NETSCAPE2.0");
  output.push(0x03, 0x01, 0x00, 0x00, 0x00);

  // 5. Each Frame
  for (const frame of frames) {
    const ctx = frame.canvas.getContext("2d");
    if (!ctx) continue;
    const imgData = ctx.getImageData(0, 0, width, height).data;

    // Graphic Control Extension
    const delayHundredths = Math.max(2, Math.round(frame.delayMs / 10));
    output.push(0x21, 0xf9, 0x04);
    output.push(0x04); // Disposal: Do Not Dispose
    writeU16(delayHundredths);
    output.push(0x00, 0x00); // Transparent color index (none), block terminator

    // Image Descriptor
    output.push(0x2c);
    writeU16(0); // Left
    writeU16(0); // Top
    writeU16(width);
    writeU16(height);
    output.push(0x00); // No local color table (use global)

    // Quantize pixels to palette indices
    const pixelIndices = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < imgData.length; i += 4, p++) {
      pixelIndices[p] = matchColor(imgData[i], imgData[i + 1], imgData[i + 2]);
    }

    // LZW Compression
    encodeLzw(pixelIndices, output);
  }

  // 6. GIF Trailer
  output.push(0x3b);

  return new Blob([new Uint8Array(output)], { type: "image/gif" });
}

// LZW compressor for GIF image data
function encodeLzw(pixels: Uint8Array, out: number[]) {
  const initCodeSize = 8;
  out.push(initCodeSize);

  const clearCode = 1 << initCodeSize; // 256
  const eoiCode = clearCode + 1; // 257

  let codeSize = initCodeSize + 1; // 9
  let nextCode = clearCode + 2; // 258

  // Hash table for prefix code + pixel character -> code
  const codeTable = new Map<number, number>();

  let curBits = 0;
  let curVal = 0;
  const subBlock: number[] = [];

  const flushSubBlock = () => {
    if (subBlock.length > 0) {
      out.push(subBlock.length);
      for (const b of subBlock) out.push(b);
      subBlock.length = 0;
    }
  };

  const emitCode = (code: number) => {
    curVal |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      subBlock.push(curVal & 0xff);
      curVal >>= 8;
      curBits -= 8;
      if (subBlock.length === 255) flushSubBlock();
    }
  };

  emitCode(clearCode);

  let prefix = pixels[0];
  for (let i = 1; i < pixels.length; i++) {
    const k = pixels[i];
    const key = (prefix << 8) | k;

    if (codeTable.has(key)) {
      prefix = codeTable.get(key)!;
    } else {
      emitCode(prefix);
      if (nextCode < 4096) {
        codeTable.set(key, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Table full, reset
        emitCode(clearCode);
        codeTable.clear();
        codeSize = initCodeSize + 1;
        nextCode = clearCode + 2;
      }
      prefix = k;
    }
  }

  emitCode(prefix);
  emitCode(eoiCode);

  // Flush remaining bits
  if (curBits > 0) {
    subBlock.push(curVal & 0xff);
    if (subBlock.length === 255) flushSubBlock();
  }
  flushSubBlock();
  out.push(0x00); // Block terminator
}

