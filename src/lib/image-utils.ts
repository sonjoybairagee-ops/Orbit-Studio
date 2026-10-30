/**
 * Browser Canvas-based Image Utilities for client-side processing
 * 100% Client-side: Privacy focused, fast, and no server upload needed.
 */

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number; img: HTMLImageElement; objectUrl: string }> {
  const objectUrl = URL.createObjectURL(file);
  const img = await loadImage(objectUrl);
  return {
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    img,
    objectUrl,
  };
}

export interface CompressResult {
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  savedPercentage: number;
}

export async function compressImage(
  file: File,
  qualityPercentage: number = 80,
  targetFormat?: string
): Promise<CompressResult> {
  const { img, width, height, objectUrl } = await getImageDimensions(file);
  URL.revokeObjectURL(objectUrl);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const outputMime = targetFormat || (file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg");

  // If converting to JPEG, paint white background for transparency
  if (outputMime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const quality = Math.max(0.05, Math.min(1, qualityPercentage / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Compression failed"));
          return;
        }
        const url = URL.createObjectURL(blob);
        const originalSize = file.size;
        const compressedSize = blob.size;
        const savedPercentage = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

        resolve({
          blob,
          url,
          originalSize,
          compressedSize,
          width,
          height,
          savedPercentage,
        });
      },
      outputMime,
      quality
    );
  });
}

export interface ConvertResult {
  blob: Blob;
  url: string;
  size: number;
  width: number;
  height: number;
  filename: string;
}

export async function convertImage(
  file: File,
  targetFormat: "image/webp" | "image/jpeg" | "image/png",
  qualityPercentage: number = 90,
  bgColor: string = "#ffffff"
): Promise<ConvertResult> {
  const { img, width, height, objectUrl } = await getImageDimensions(file);
  URL.revokeObjectURL(objectUrl);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  const quality = Math.max(0.1, Math.min(1, qualityPercentage / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Conversion failed"));
        const url = URL.createObjectURL(blob);
        const ext = targetFormat === "image/webp" ? ".webp" : targetFormat === "image/jpeg" ? ".jpg" : ".png";
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        resolve({
          blob,
          url,
          size: blob.size,
          width,
          height,
          filename: `${baseName}${ext}`,
        });
      },
      targetFormat,
      quality
    );
  });
}

export async function resizeImage(
  file: File,
  newWidth: number,
  newHeight: number,
  qualityPercentage: number = 90,
  format?: string
): Promise<ConvertResult> {
  const { img, objectUrl } = await getImageDimensions(file);
  URL.revokeObjectURL(objectUrl);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(newWidth);
  canvas.height = Math.round(newHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  // High quality resizing smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const outputFormat = format || file.type || "image/jpeg";
  if (outputFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const quality = Math.max(0.1, Math.min(1, qualityPercentage / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Resizing failed"));
        const url = URL.createObjectURL(blob);
        const ext = outputFormat === "image/webp" ? ".webp" : outputFormat === "image/png" ? ".png" : ".jpg";
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        resolve({
          blob,
          url,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          filename: `${baseName}-${canvas.width}x${canvas.height}${ext}`,
        });
      },
      outputFormat,
      quality
    );
  });
}

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropImage(
  file: File,
  coords: CropCoordinates,
  qualityPercentage: number = 92,
  format?: string
): Promise<ConvertResult> {
  const { img, objectUrl } = await getImageDimensions(file);
  URL.revokeObjectURL(objectUrl);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(coords.width));
  canvas.height = Math.max(1, Math.round(coords.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const outputFormat = format || file.type || "image/jpeg";
  if (outputFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw crop region from natural image
  ctx.drawImage(
    img,
    coords.x,
    coords.y,
    coords.width,
    coords.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const quality = Math.max(0.1, Math.min(1, qualityPercentage / 100));

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Crop failed"));
        const url = URL.createObjectURL(blob);
        const ext = outputFormat === "image/webp" ? ".webp" : outputFormat === "image/png" ? ".png" : ".jpg";
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        resolve({
          blob,
          url,
          size: blob.size,
          width: canvas.width,
          height: canvas.height,
          filename: `${baseName}-cropped${ext}`,
        });
      },
      outputFormat,
      quality
    );
  });
}
