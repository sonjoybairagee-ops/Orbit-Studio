/**
 * CompX Orbit Background Removal Engine
 * Supports both Client-Side Smart Canvas Color/Studio Removal (Ultra-Fast)
 * and in-browser AI Deep Learning subject segmentation (@imgly/background-removal).
 * Zero server upload, 100% private, instant client-side.
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
}

/**
 * Auto-detect background color by sampling the 4 corners of the image
 */
export function detectCornerBackgroundColor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { r: number; g: number; b: number; hex: string } {
  const corners = [
    ctx.getImageData(0, 0, 1, 1).data,
    ctx.getImageData(Math.max(0, width - 1), 0, 1, 1).data,
    ctx.getImageData(0, Math.max(0, height - 1), 1, 1).data,
    ctx.getImageData(Math.max(0, width - 1), Math.max(0, height - 1), 1, 1).data,
  ];

  // Average corner RGB
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  for (const c of corners) {
    sumR += c[0];
    sumG += c[1];
    sumB += c[2];
  }

  const r = Math.round(sumR / 4);
  const g = Math.round(sumG / 4);
  const b = Math.round(sumB / 4);
  const hex =
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");

  return { r, g, b, hex };
}

/**
 * Fast Client-Side Canvas Chroma / Studio Background Removal
 * Analyzes pixels, calculates Euclidean color distance with soft edge feathering.
 */
export async function removeBackgroundCanvas(
  img: HTMLImageElement,
  options: {
    targetColor?: string;
    tolerance?: number;
    autoDetectCorner?: boolean;
  } = {}
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const width = img.naturalWidth || img.width || 800;
  const height = img.naturalHeight || img.height || 800;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D canvas context");

  ctx.drawImage(img, 0, 0);

  let tr = 255;
  let tg = 255;
  let tb = 255;

  if (options.autoDetectCorner) {
    const detected = detectCornerBackgroundColor(ctx, width, height);
    tr = detected.r;
    tg = detected.g;
    tb = detected.b;
  } else if (options.targetColor) {
    const hex = options.targetColor.replace("#", "");
    tr = parseInt(hex.substring(0, 2), 16) || 255;
    tg = parseInt(hex.substring(2, 4), 16) || 255;
    tb = parseInt(hex.substring(4, 6), 16) || 255;
  }

  const tolerance = typeof options.tolerance === "number" ? options.tolerance : 35;
  const maxDist = (tolerance / 100) * 441.67; // sqrt(255^2 * 3) ~ 441.67
  const featherRange = maxDist * 0.35; // smooth feathering on edges

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

    if (dist <= maxDist) {
      if (dist > maxDist - featherRange) {
        const ratio = (dist - (maxDist - featherRange)) / featherRange;
        data[i + 3] = Math.round(data[i + 3] * ratio);
      } else {
        data[i + 3] = 0; // Transparent
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
  // Dynamically load @imgly/background-removal in browser
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
 * Process a bulk queue of images and bundle all results into a single organized ZIP
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

  for (let i = 0; i < total; i++) {
    const item = items[i];
    const baseName = item.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_") || `cutout_${i + 1}`;

    if (onProgress) {
      onProgress({
        processed: i,
        total,
        currentName: item.name,
        percent: Math.round((i / Math.max(1, total)) * 85),
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
          // Fallback to studio canvas removal
          const img = await loadHtmlImage(item.originalUrl);
          cutoutBlob = await removeBackgroundCanvas(img, {
            autoDetectCorner: true,
            tolerance: options.tolerance,
          });
        }
      } else {
        // Smart Studio Canvas Removal (Instant)
        const img = await loadHtmlImage(item.originalUrl);
        cutoutBlob = await removeBackgroundCanvas(img, {
          targetColor: options.targetColor,
          tolerance: options.tolerance,
          autoDetectCorner: options.autoDetectCorner,
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
      const ext = options.outputBg === "transparent" ? "png" : "png";
      zip.file(`${baseName}_cutout.${ext}`, finalBlob);
    } catch (err) {
      console.error(`Failed to process ${item.name}:`, err);
    }
  }

  // Compress into ZIP
  if (onProgress) {
    onProgress({
      processed: total,
      total,
      currentName: "Compressing ZIP archive...",
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
