/**
 * CompX Orbit High-Definition Background Removal Engine
 * Supports:
 * - Studio-Grade Border-Connected Flood-Fill (Protects internal whites/highlights)
 * - Anti-Halo Edge Despill & Color Decontamination
 * - Sub-pixel Alpha Edge Feathering & Smoothing
 * - Robust Perimeter Multi-Sample Background Detection
 * - AI Deep Learning Subject Segmentation (@imgly/background-removal)
 * - Parallel Batch Processing for Bulk Queues
 * Zero server upload, 100% private, client-side, lossless 32-bit PNG.
 */

import JSZip from "jszip";

export interface BulkImageItem {
  id: string;
  file: File;
  name: string;
  originalUrl: string;
  processedUrl: string | null;
  processedBlob: Blob | null;
  size: number;
  width: number;
  height: number;
  status: "idle" | "processing" | "done" | "error";
  progress: number;
  error?: string;
}

export type RemovalEngine = "smart-studio" | "ai-deep";
export type BgOption = "transparent" | "white" | "black" | "custom";

export interface BulkRemovalOptions {
  engine: RemovalEngine;
  tolerance: number; // 5 to 85 (for smart-studio)
  targetColor?: string; // e.g. "#ffffff" or auto-detect
  autoDetectCorner: boolean;
  outputBg: BgOption;
  customBgColor: string;
  // High-Quality Studio Enhancements
  contiguousMode?: boolean; // Protect internal subject whites via border-connected fill
  decontaminateFringe?: boolean; // Remove edge color halo/bleed
  featherRadius?: number; // Smooth edge feathering
}

export interface CanvasRemovalOptions {
  targetColor?: string;
  tolerance?: number;
  autoDetectCorner?: boolean;
  contiguousMode?: boolean;
  decontaminateFringe?: boolean;
  featherRadius?: number;
}

/**
 * Robust background color detector sampling 100+ points along all 4 outer borders.
 * Uses median averaging to eliminate outliers (e.g. if subject touches an edge).
 */
export function detectStudioBackgroundColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { r: number; g: number; b: number; hex: string } {
  const samplesR: number[] = [];
  const samplesG: number[] = [];
  const samplesB: number[] = [];

  const stepX = Math.max(1, Math.floor(width / 30));
  const stepY = Math.max(1, Math.floor(height / 30));

  // Top & Bottom perimeter lines
  for (let x = 0; x < width; x += stepX) {
    const topPixel = ctx.getImageData(x, 0, 1, 1).data;
    samplesR.push(topPixel[0]);
    samplesG.push(topPixel[1]);
    samplesB.push(topPixel[2]);

    const bottomPixel = ctx.getImageData(x, Math.max(0, height - 1), 1, 1).data;
    samplesR.push(bottomPixel[0]);
    samplesG.push(bottomPixel[1]);
    samplesB.push(bottomPixel[2]);
  }

  // Left & Right perimeter lines
  for (let y = 0; y < height; y += stepY) {
    const leftPixel = ctx.getImageData(0, y, 1, 1).data;
    samplesR.push(leftPixel[0]);
    samplesG.push(leftPixel[1]);
    samplesB.push(leftPixel[2]);

    const rightPixel = ctx.getImageData(Math.max(0, width - 1), y, 1, 1).data;
    samplesR.push(rightPixel[0]);
    samplesG.push(rightPixel[1]);
    samplesB.push(rightPixel[2]);
  }

  // Median values
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  };

  const r = samplesR.length ? median(samplesR) : 255;
  const g = samplesG.length ? median(samplesG) : 255;
  const b = samplesB.length ? median(samplesB) : 255;

  const hex =
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");

  return { r, g, b, hex };
}

/**
 * Backward compatibility corner sample
 */
export function detectCornerBackgroundColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { r: number; g: number; b: number; hex: string } {
  return detectStudioBackgroundColor(ctx, width, height);
}

/**
 * Ultra-Clean Studio Canvas Background Removal Engine
 * Features:
 * 1. Border-Connected Flood-Fill (Protects internal subject whites/highlights)
 * 2. Color Decontamination / Anti-Halo Despill
 * 3. Sub-pixel Edge Feathering & Anti-Aliasing
 * 4. 100% Native Resolution Preservation
 */
export async function removeBackgroundCanvas(
  img: HTMLImageElement,
  options: CanvasRemovalOptions = {}
): Promise<Blob> {
  const width = img.naturalWidth || img.width || 800;
  const height = img.naturalHeight || img.height || 800;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  let tr = 255;
  let tg = 255;
  let tb = 255;

  if (options.autoDetectCorner !== false) {
    const detected = detectStudioBackgroundColor(ctx, width, height);
    tr = detected.r;
    tg = detected.g;
    tb = detected.b;
  } else if (options.targetColor) {
    const hex = options.targetColor.replace("#", "");
    tr = parseInt(hex.substring(0, 2), 16) || 255;
    tg = parseInt(hex.substring(2, 4), 16) || 255;
    tb = parseInt(hex.substring(4, 6), 16) || 255;
  }

  const tolerance = typeof options.tolerance === "number" ? options.tolerance : 38;
  const maxDist = (tolerance / 100) * 441.67; // sqrt(255^2 * 3) ~ 441.67
  const featherRange = Math.max(2, maxDist * 0.28);
  const contiguousMode = options.contiguousMode !== false;
  const decontaminate = options.decontaminateFringe !== false;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  if (contiguousMode) {
    // =========================================================================
    // HIGH QUALITY: BORDER-CONNECTED FLOOD FILL
    // Only erases background that connects to the image borders.
    // Whites / reflections INSIDE the subject are never touched!
    // =========================================================================
    const isBg = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    const checkBorderPixel = (x: number, y: number) => {
      const idx = y * width + x;
      if (isBg[idx]) return;
      const pIdx = idx * 4;
      const r = data[pIdx];
      const g = data[pIdx + 1];
      const b = data[pIdx + 2];
      const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
      if (dist <= maxDist) {
        isBg[idx] = 1;
        queue[tail++] = idx;
      }
    };

    // Seed outer borders
    for (let x = 0; x < width; x++) {
      checkBorderPixel(x, 0);
      checkBorderPixel(x, height - 1);
    }
    for (let y = 1; y < height - 1; y++) {
      checkBorderPixel(0, y);
      checkBorderPixel(width - 1, y);
    }

    // BFS Queue Traversal
    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);

      // Neighbor left
      if (cx > 0) {
        const n = curr - 1;
        if (!isBg[n]) {
          const p = n * 4;
          const dist = Math.sqrt((data[p] - tr) ** 2 + (data[p + 1] - tg) ** 2 + (data[p + 2] - tb) ** 2);
          if (dist <= maxDist) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
      }

      // Neighbor right
      if (cx < width - 1) {
        const n = curr + 1;
        if (!isBg[n]) {
          const p = n * 4;
          const dist = Math.sqrt((data[p] - tr) ** 2 + (data[p + 1] - tg) ** 2 + (data[p + 2] - tb) ** 2);
          if (dist <= maxDist) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
      }

      // Neighbor top
      if (cy > 0) {
        const n = curr - width;
        if (!isBg[n]) {
          const p = n * 4;
          const dist = Math.sqrt((data[p] - tr) ** 2 + (data[p + 1] - tg) ** 2 + (data[p + 2] - tb) ** 2);
          if (dist <= maxDist) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
      }

      // Neighbor bottom
      if (cy < height - 1) {
        const n = curr + width;
        if (!isBg[n]) {
          const p = n * 4;
          const dist = Math.sqrt((data[p] - tr) ** 2 + (data[p + 1] - tg) ** 2 + (data[p + 2] - tb) ** 2);
          if (dist <= maxDist) {
            isBg[n] = 1;
            queue[tail++] = n;
          }
        }
      }
    }

    // Apply alpha with edge feathering and despill
    for (let i = 0; i < totalPixels; i++) {
      const pIdx = i * 4;
      if (isBg[i]) {
        const r = data[pIdx];
        const g = data[pIdx + 1];
        const b = data[pIdx + 2];
        const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

        if (dist > maxDist - featherRange) {
          // Boundary sub-pixel feather
          const ratio = (dist - (maxDist - featherRange)) / featherRange;
          const newAlpha = Math.round(data[pIdx + 3] * ratio);
          data[pIdx + 3] = newAlpha;

          // Color decontamination for boundary pixels to remove edge halo fringe
          if (decontaminate && newAlpha > 15 && newAlpha < 240) {
            const a = newAlpha / 255;
            data[pIdx] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * tr) / a)));
            data[pIdx + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * tg) / a)));
            data[pIdx + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * tb) / a)));
          }
        } else {
          data[pIdx + 3] = 0; // Pure transparent
        }
      }
    }
  } else {
    // =========================================================================
    // GLOBAL CHROMA COLOR REMOVAL (for green screen or multi-hole cutouts)
    // =========================================================================
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

      if (dist <= maxDist) {
        if (dist > maxDist - featherRange) {
          const ratio = (dist - (maxDist - featherRange)) / featherRange;
          const newAlpha = Math.round(data[i + 3] * ratio);
          data[i + 3] = newAlpha;

          if (decontaminate && newAlpha > 15 && newAlpha < 240) {
            const a = newAlpha / 255;
            data[i] = Math.max(0, Math.min(255, Math.round((r - (1 - a) * tr) / a)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round((g - (1 - a) * tg) / a)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round((b - (1 - a) * tb) / a)));
          }
        } else {
          data[i + 3] = 0;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/png");
  });
}

/**
 * AI-powered Subject Cutout via in-browser WebAssembly (@imgly/background-removal)
 */
export async function removeBackgroundAi(
  fileOrBlob: File | Blob,
  onProgress?: (msg: string, percent: number) => void
): Promise<Blob> {
  const dynamicImport = new Function("url", "return import(url)");
  const imglyModule: any = await dynamicImport(
    "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm"
  );

  const removeBackgroundFn =
    imglyModule.removeBackground ||
    imglyModule.default?.removeBackground ||
    imglyModule.default;

  if (!removeBackgroundFn) {
    throw new Error("Could not load AI background removal engine");
  }

  const resultBlob = await removeBackgroundFn(fileOrBlob, {
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        const p = Math.round((current / total) * 100);
        if (key.includes("fetch")) {
          onProgress(`Loading AI model (${p}%)...`, Math.round(p * 0.3));
        } else if (key.includes("compute")) {
          onProgress(`Segmenting subject (${p}%)...`, 30 + Math.round(p * 0.7));
        }
      }
    },
  });

  return resultBlob;
}

/**
 * Composite a transparent cutout onto a custom solid background (White, Black, Custom)
 */
export async function compositeCutoutBackground(
  cutoutBlob: Blob,
  outputBg: BgOption,
  customColor: string = "#ffffff"
): Promise<Blob> {
  if (outputBg === "transparent") {
    return cutoutBlob;
  }

  const url = URL.createObjectURL(cutoutBlob);
  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load cutout image"));
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    return cutoutBlob;
  }

  // Draw solid background
  if (outputBg === "white") {
    ctx.fillStyle = "#ffffff";
  } else if (outputBg === "black") {
    ctx.fillStyle = "#000000";
  } else {
    ctx.fillStyle = customColor || "#ffffff";
  }

  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || cutoutBlob);
    }, "image/png");
  });
}

/**
 * Process a bulk queue of images with parallel concurrency, bundling all results into a single organized ZIP
 */
export async function processBulkImagesToZip(
  items: BulkImageItem[],
  options: BulkRemovalOptions,
  zipFileName: string = "compx-cutouts-bundle",
  onProgress?: (info: {
    processed: number;
    total: number;
    currentName: string;
    percent: number;
    stage: "processing" | "zipping" | "done";
  }) => void
): Promise<{
  zipBlob: Blob;
  totalProcessed: number;
  zipSize: number;
  processedItems: { id: string; blob: Blob; url: string }[];
}> {
  const zip = new JSZip();
  const total = items.length;
  const processedResults: { id: string; blob: Blob; url: string }[] = [];

  // Concurrency: for AI we do 1 at a time (memory intense), for canvas we run 3 in parallel
  const concurrency = options.engine === "ai-deep" ? 1 : 3;
  let currentIndex = 0;
  let finishedCount = 0;

  async function worker() {
    while (currentIndex < total) {
      const idx = currentIndex++;
      const item = items[idx];
      const baseName =
        item.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_") || `cutout_${idx + 1}`;

      if (onProgress) {
        onProgress({
          processed: finishedCount,
          total,
          currentName: item.name,
          percent: Math.round((finishedCount / Math.max(1, total)) * 85),
          stage: "processing",
        });
      }

      try {
        let cutoutBlob: Blob;

        if (options.engine === "ai-deep") {
          try {
            cutoutBlob = await removeBackgroundAi(item.file);
          } catch (aiErr) {
            console.warn(`AI model fallback for ${item.name}:`, aiErr);
            const img = await loadHtmlImage(item.originalUrl);
            cutoutBlob = await removeBackgroundCanvas(img, {
              autoDetectCorner: true,
              tolerance: options.tolerance,
              contiguousMode: options.contiguousMode,
              decontaminateFringe: options.decontaminateFringe,
            });
          }
        } else {
          // Smart Studio High-Definition Canvas Removal
          const img = await loadHtmlImage(item.originalUrl);
          cutoutBlob = await removeBackgroundCanvas(img, {
            targetColor: options.targetColor,
            tolerance: options.tolerance,
            autoDetectCorner: options.autoDetectCorner,
            contiguousMode: options.contiguousMode,
            decontaminateFringe: options.decontaminateFringe,
          });
        }

        // Composite backdrop if requested
        const finalBlob = await compositeCutoutBackground(
          cutoutBlob,
          options.outputBg,
          options.customBgColor
        );

        const url = URL.createObjectURL(finalBlob);
        processedResults.push({ id: item.id, blob: finalBlob, url });

        // Add to ZIP
        zip.file(`${baseName}_cutout.png`, finalBlob);
      } catch (err) {
        console.error(`Failed to process ${item.name}:`, err);
      } finally {
        finishedCount++;
        if (onProgress) {
          onProgress({
            processed: finishedCount,
            total,
            currentName: item.name,
            percent: Math.round((finishedCount / Math.max(1, total)) * 85),
            stage: "processing",
          });
        }
      }
    }
  }

  // Launch workers
  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);

  // Compress into ZIP
  if (onProgress) {
    onProgress({
      processed: total,
      total,
      currentName: "Packaging ZIP archive...",
      percent: 90,
      stage: "zipping",
    });
  }

  const zipBlob = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress({
          processed: total,
          total,
          currentName: "Packaging ZIP archive...",
          percent: 90 + Math.round((metadata.percent / 100) * 10),
          stage: "zipping",
        });
      }
    }
  );

  if (onProgress) {
    onProgress({
      processed: total,
      total,
      currentName: "Done!",
      percent: 100,
      stage: "done",
    });
  }

  return {
    zipBlob,
    totalProcessed: processedResults.length,
    zipSize: zipBlob.size,
    processedItems: processedResults,
  };
}

/**
 * Helper to load HTMLImageElement from URL
 */
function loadHtmlImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error("Image failed to load: " + String(e)));
    img.src = url;
  });
}

/**
 * Trigger immediate browser download of any Blob
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
