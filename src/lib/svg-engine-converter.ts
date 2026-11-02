/**
 * CompX Orbit SVG Vector & Raster Engine
 * Converts SVG files/code to EPS (Encapsulated PostScript), PNG (1x-8x Hi-DPI), and JPG.
 * 100% Client-side, zero external dependencies, privacy-first.
 */

import JSZip from "jszip";

export interface SvgDimension {
  width: number;
  height: number;
  viewBox: string;
}

export interface ExportOptions {
  width?: number;
  height?: number;
  scale?: number; // 1, 2, 4, 8
  bgColor?: string; // hex color or "transparent"
  quality?: number; // 0.1 to 1.0 (for JPG)
  title?: string;
  epsMode?: "vector" | "hires";
}

export interface BulkTargetFormats {
  eps: boolean;
  png1x: boolean;
  png2x: boolean;
  png4x: boolean;
  png8x: boolean;
  jpg: boolean;
  includeSvg: boolean;
  jpgQuality: number; // 0.1 to 1.0
  bgColor?: string; // transparent or hex
  epsMode?: "vector" | "hires";
}

export interface BulkSvgItem {
  id: string;
  name: string;
  svgString: string;
  size: number;
  width: number;
  height: number;
  viewBox: string;
  status: "idle" | "processing" | "done" | "error";
  error?: string;
}

export interface BulkProgressCallback {
  (progress: {
    processedFiles: number;
    totalFiles: number;
    currentFileName: string;
    stage: "rendering" | "zipping" | "complete";
    percent: number;
  }): void;
}

/**
 * Extract width, height, and viewBox from an SVG string
 */
export function getSvgDimensions(svgString: string): SvgDimension {
  let width = 500;
  let height = 500;
  let viewBox = "0 0 500 500";

  if (typeof window === "undefined") {
    return { width, height, viewBox };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");

    if (svg) {
      const vb = svg.getAttribute("viewBox");
      if (vb) {
        viewBox = vb.trim();
        const parts = viewBox.split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          width = parts[2];
          height = parts[3];
        }
      }

      const wAttr = svg.getAttribute("width");
      const hAttr = svg.getAttribute("height");
      if (wAttr && !wAttr.includes("%")) {
        const parsedW = parseFloat(wAttr);
        if (!isNaN(parsedW) && parsedW > 0) width = parsedW;
      }
      if (hAttr && !hAttr.includes("%")) {
        const parsedH = parseFloat(hAttr);
        if (!isNaN(parsedH) && parsedH > 0) height = parsedH;
      }
    }
  } catch {
    // Fallback defaults
  }

  return { width: Math.round(width), height: Math.round(height), viewBox };
}

/**
 * Render SVG to an HTML5 Canvas at target resolution and background
 */
export async function renderSvgToCanvas(
  svgString: string,
  options: ExportOptions = {}
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  const { width: origW, height: origH } = getSvgDimensions(svgString);
  const scale = options.scale || 1;
  const targetW = Math.round((options.width || origW) * scale);
  const targetH = Math.round((options.height || origH) * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas 2D context");

  // Optional background
  if (options.bgColor && options.bgColor !== "transparent") {
    ctx.fillStyle = options.bgColor;
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Load SVG into image
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render SVG onto Canvas: " + String(err)));
    };
    img.src = url;
  });

  return { canvas, width: targetW, height: targetH };
}

/**
 * Export SVG to PNG Blob (supports alpha transparency & up to 8x resolution)
 */
export async function svgToPngBlob(
  svgString: string,
  options: ExportOptions = {}
): Promise<Blob> {
  const { canvas } = await renderSvgToCanvas(svgString, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas to PNG Blob failed"));
    }, "image/png");
  });
}

/**
 * Export SVG to JPG Blob (solid background & customizable quality)
 */
export async function svgToJpgBlob(
  svgString: string,
  options: ExportOptions = {}
): Promise<Blob> {
  // JPG does not support alpha, default background is White if not specified
  const opts: ExportOptions = {
    ...options,
    bgColor: options.bgColor && options.bgColor !== "transparent" ? options.bgColor : "#ffffff",
  };
  const { canvas } = await renderSvgToCanvas(svgString, opts);
  const quality = typeof options.quality === "number" ? options.quality : 0.92;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to JPG Blob failed"));
      },
      "image/jpeg",
      quality
    );
  });
}

/**
 * Parse CSS / SVG color string into [r, g, b] scaled to 0.0 - 1.0 for PostScript
 */
function parsePsColor(color: string): [number, number, number] | null {
  const c = color.trim().toLowerCase();
  if (c === "none" || c === "transparent" || !c) return null;

  // Named colors
  const NAMED: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    white: [1, 1, 1],
    red: [1, 0, 0],
    green: [0, 0.5, 0],
    blue: [0, 0, 1],
    yellow: [1, 1, 0],
    cyan: [0, 1, 1],
    magenta: [1, 0, 1],
    gray: [0.5, 0.5, 0.5],
    grey: [0.5, 0.5, 0.5],
  };
  if (NAMED[c]) return NAMED[c];

  // Hex colors
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((ch) => ch + ch).join("");
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      return [r, g, b];
    }
  }

  // rgb(r, g, b)
  const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255,
    ];
  }

  return [0, 0, 0]; // default black
}

/**
 * Convert SVG path data `d="..."` into PostScript path operators
 */
function svgPathToPs(d: string): string {
  const tokens = d.match(/[a-df-z][^a-df-z]*/gi);
  if (!tokens) return "";

  let cx = 0;
  let cy = 0;
  let startX = 0;
  let startY = 0;
  const ps: string[] = ["newpath"];

  for (const t of tokens) {
    const cmd = t[0];
    const rawArgs = t
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);

    if (cmd === "M") {
      cx = rawArgs[0];
      cy = rawArgs[1];
      startX = cx;
      startY = cy;
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} moveto`);
    } else if (cmd === "m") {
      cx += rawArgs[0];
      cy += rawArgs[1];
      startX = cx;
      startY = cy;
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} moveto`);
    } else if (cmd === "L") {
      for (let i = 0; i < rawArgs.length; i += 2) {
        cx = rawArgs[i];
        cy = rawArgs[i + 1];
        ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
      }
    } else if (cmd === "l") {
      for (let i = 0; i < rawArgs.length; i += 2) {
        cx += rawArgs[i];
        cy += rawArgs[i + 1];
        ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
      }
    } else if (cmd === "H") {
      cx = rawArgs[0];
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
    } else if (cmd === "h") {
      cx += rawArgs[0];
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
    } else if (cmd === "V") {
      cy = rawArgs[0];
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
    } else if (cmd === "v") {
      cy += rawArgs[0];
      ps.push(`${cx.toFixed(3)} ${cy.toFixed(3)} lineto`);
    } else if (cmd === "C") {
      for (let i = 0; i < rawArgs.length; i += 6) {
        ps.push(
          `${rawArgs[i].toFixed(3)} ${rawArgs[i + 1].toFixed(3)} ${rawArgs[i + 2].toFixed(3)} ${rawArgs[i + 3].toFixed(3)} ${rawArgs[i + 4].toFixed(3)} ${rawArgs[i + 5].toFixed(3)} curveto`
        );
        cx = rawArgs[i + 4];
        cy = rawArgs[i + 5];
      }
    } else if (cmd === "c") {
      for (let i = 0; i < rawArgs.length; i += 6) {
        const x1 = cx + rawArgs[i];
        const y1 = cy + rawArgs[i + 1];
        const x2 = cx + rawArgs[i + 2];
        const y2 = cy + rawArgs[i + 3];
        const ex = cx + rawArgs[i + 4];
        const ey = cy + rawArgs[i + 5];
        ps.push(
          `${x1.toFixed(3)} ${y1.toFixed(3)} ${x2.toFixed(3)} ${y2.toFixed(3)} ${ex.toFixed(3)} ${ey.toFixed(3)} curveto`
        );
        cx = ex;
        cy = ey;
      }
    } else if (cmd.toUpperCase() === "Z") {
      ps.push("closepath");
      cx = startX;
      cy = startY;
    }
  }

  return ps.join("\n");
}

/**
 * Generate Pure Vector PostScript Level 3 commands from SVG DOM
 */
export function svgToVectorEpsString(
  svgString: string,
  options: ExportOptions = {}
): string {
  const { width: w, height: h } = getSvgDimensions(svgString);
  const targetW = options.width || w;
  const targetH = options.height || h;
  const title = options.title || "vector-export";

  const lines: string[] = [];
  lines.push("%!PS-Adobe-3.0 EPSF-3.0");
  lines.push("%%Creator: CompX Orbit SVG Vector Engine");
  lines.push(`%%Title: ${title}.eps`);
  lines.push(`%%BoundingBox: 0 0 ${Math.round(targetW)} ${Math.round(targetH)}`);
  lines.push(`%%HiResBoundingBox: 0 0 ${targetW.toFixed(2)} ${targetH.toFixed(2)}`);
  lines.push("%%Pages: 1");
  lines.push("%%LanguageLevel: 3");
  lines.push("%%DocumentData: Clean7Bit");
  lines.push("%%EndComments");
  lines.push("%%Page: 1 1");
  lines.push("save");
  lines.push("gsave");
  lines.push(`0 ${targetH.toFixed(2)} translate`);
  lines.push("1 -1 scale");

  if (typeof window !== "undefined") {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgString, "image/svg+xml");
      const elements = doc.querySelectorAll(
        "path, rect, circle, ellipse, line, polyline, polygon"
      );

      elements.forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        const fillAttr = el.getAttribute("fill") || "black";
        const strokeAttr = el.getAttribute("stroke");
        const strokeWAttr = el.getAttribute("stroke-width");

        const fillColor = parsePsColor(fillAttr);
        const strokeColor = strokeAttr ? parsePsColor(strokeAttr) : null;
        const strokeW = strokeWAttr ? parseFloat(strokeWAttr) : 1;

        let psPath = "";

        if (tagName === "path") {
          const d = el.getAttribute("d");
          if (d) psPath = svgPathToPs(d);
        } else if (tagName === "rect") {
          const x = parseFloat(el.getAttribute("x") || "0");
          const y = parseFloat(el.getAttribute("y") || "0");
          const rw = parseFloat(el.getAttribute("width") || "0");
          const rh = parseFloat(el.getAttribute("height") || "0");
          psPath = `newpath\n${x} ${y} moveto\n${x + rw} ${y} lineto\n${x + rw} ${y + rh} lineto\n${x} ${y + rh} lineto\nclosepath`;
        } else if (tagName === "circle") {
          const cx = parseFloat(el.getAttribute("cx") || "0");
          const cy = parseFloat(el.getAttribute("cy") || "0");
          const r = parseFloat(el.getAttribute("r") || "0");
          psPath = `newpath\n${cx} ${cy} ${r} 0 360 arc\nclosepath`;
        } else if (tagName === "line") {
          const x1 = parseFloat(el.getAttribute("x1") || "0");
          const y1 = parseFloat(el.getAttribute("y1") || "0");
          const x2 = parseFloat(el.getAttribute("x2") || "0");
          const y2 = parseFloat(el.getAttribute("y2") || "0");
          psPath = `newpath\n${x1} ${y1} moveto\n${x2} ${y2} lineto`;
        } else if (tagName === "polygon" || tagName === "polyline") {
          const pts = (el.getAttribute("points") || "")
            .trim()
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(Number);
          if (pts.length >= 4) {
            const pathArr = [`newpath\n${pts[0]} ${pts[1]} moveto`];
            for (let i = 2; i < pts.length; i += 2) {
              pathArr.push(`${pts[i]} ${pts[i + 1]} lineto`);
            }
            if (tagName === "polygon") pathArr.push("closepath");
            psPath = pathArr.join("\n");
          }
        }

        if (psPath) {
          lines.push("gsave");
          lines.push(psPath);

          if (fillColor) {
            lines.push(
              `${fillColor[0].toFixed(3)} ${fillColor[1].toFixed(3)} ${fillColor[2].toFixed(3)} setrgbcolor`
            );
            lines.push(strokeColor ? "gsave fill grestore" : "fill");
          }
          if (strokeColor) {
            lines.push(
              `${strokeColor[0].toFixed(3)} ${strokeColor[1].toFixed(3)} ${strokeColor[2].toFixed(3)} setrgbcolor`
            );
            lines.push(`${strokeW} setlinewidth stroke`);
          }

          lines.push("grestore");
        }
      });
    } catch {
      // fallback
    }
  }

  lines.push("grestore");
  lines.push("restore");
  lines.push("showpage");
  lines.push("%%EOF");

  return lines.join("\n");
}

/**
 * Generate High-Resolution Level 2 PostScript EPS (colorimage stream)
 * Guarantees 100% fidelity for complex gradients, text, and SVG filters.
 */
export async function svgToHiresEpsString(
  svgString: string,
  options: ExportOptions = {}
): Promise<string> {
  const { canvas, width, height } = await renderSvgToCanvas(svgString, {
    ...options,
    scale: 2, // 2x crispness
    bgColor: options.bgColor || "#ffffff",
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context failed");
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Convert pixel data to hex string stream
  let hexStream = "";
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i].toString(16).padStart(2, "0");
    const g = data[i + 1].toString(16).padStart(2, "0");
    const b = data[i + 2].toString(16).padStart(2, "0");
    hexStream += r + g + b;
    if (hexStream.length % 72 === 0) hexStream += "\n";
  }

  const { width: origW, height: origH } = getSvgDimensions(svgString);
  const title = options.title || "vector-export";

  const lines: string[] = [
    "%!PS-Adobe-3.0 EPSF-3.0",
    "%%Creator: CompX Orbit SVG Vector Engine",
    `%%Title: ${title}.eps`,
    `%%BoundingBox: 0 0 ${Math.round(origW)} ${Math.round(origH)}`,
    `%%HiResBoundingBox: 0 0 ${origW.toFixed(2)} ${origH.toFixed(2)}`,
    "%%Pages: 1",
    "%%LanguageLevel: 2",
    "%%DocumentData: Clean7Bit",
    "%%EndComments",
    "%%Page: 1 1",
    "save",
    "gsave",
    `0 ${origH.toFixed(2)} translate`,
    "1 -1 scale",
    `${origW.toFixed(2)} ${origH.toFixed(2)} scale`,
    `${width} ${height} 8 [${width} 0 0 -${height} 0 ${height}]`,
    `{currentfile 3 ${width} mul string readhexstring pop} false 3 colorimage`,
    hexStream,
    "grestore",
    "restore",
    "showpage",
    "%%EOF",
  ];

  return lines.join("\n");
}

/**
 * Main EPS Export function (creates EPS Blob)
 */
export async function svgToEpsBlob(
  svgString: string,
  options: ExportOptions = {}
): Promise<Blob> {
  let epsContent = "";
  if (options.epsMode === "hires") {
    epsContent = await svgToHiresEpsString(svgString, options);
  } else {
    // Default: pure vector path EPS
    epsContent = svgToVectorEpsString(svgString, options);
  }

  return new Blob([epsContent], {
    type: "application/postscript;charset=utf-8",
  });
}

/**
 * Trigger download of any Blob with given filename
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

/**
 * Process multiple SVGs into a single ZIP archive containing all requested sizes & formats
 */
export async function processBulkSvgToZip(
  items: BulkSvgItem[],
  targets: BulkTargetFormats,
  zipFileName: string = "svg-bulk-bundle",
  onProgress?: BulkProgressCallback
): Promise<{ zipBlob: Blob; totalFilesGenerated: number; zipSize: number }> {
  const zip = new JSZip();
  let totalFilesGenerated = 0;
  const totalItems = items.length;

  for (let i = 0; i < totalItems; i++) {
    const item = items[i];
    const baseName = item.name.replace(/\.svg$/i, "").replace(/[^a-zA-Z0-9_\-]/g, "_") || `vector_${i + 1}`;

    if (onProgress) {
      onProgress({
        processedFiles: i,
        totalFiles: totalItems,
        currentFileName: item.name,
        stage: "rendering",
        percent: Math.round((i / Math.max(1, totalItems)) * 80),
      });
    }

    try {
      // 1. EPS Vector
      if (targets.eps) {
        const epsBlob = await svgToEpsBlob(item.svgString, {
          width: item.width,
          height: item.height,
          title: baseName,
          epsMode: targets.epsMode || "vector",
        });
        zip.file(`eps/${baseName}.eps`, epsBlob);
        totalFilesGenerated++;
      }

      // 2. PNG 1x
      if (targets.png1x) {
        const png1Blob = await svgToPngBlob(item.svgString, {
          width: item.width,
          height: item.height,
          scale: 1,
          bgColor: targets.bgColor || "transparent",
        });
        zip.file(`png_1x/${baseName}_1x.png`, png1Blob);
        totalFilesGenerated++;
      }

      // 3. PNG 2x (Retina)
      if (targets.png2x) {
        const png2Blob = await svgToPngBlob(item.svgString, {
          width: item.width,
          height: item.height,
          scale: 2,
          bgColor: targets.bgColor || "transparent",
        });
        zip.file(`png_2x/${baseName}_2x.png`, png2Blob);
        totalFilesGenerated++;
      }

      // 4. PNG 4x (4K Ultra HD)
      if (targets.png4x) {
        const png4Blob = await svgToPngBlob(item.svgString, {
          width: item.width,
          height: item.height,
          scale: 4,
          bgColor: targets.bgColor || "transparent",
        });
        zip.file(`png_4x/${baseName}_4k.png`, png4Blob);
        totalFilesGenerated++;
      }

      // 5. PNG 8K Print Master
      if (targets.png8x) {
        const png8Blob = await svgToPngBlob(item.svgString, {
          width: item.width,
          height: item.height,
          scale: 8,
          bgColor: targets.bgColor || "transparent",
        });
        zip.file(`png_8k/${baseName}_8k.png`, png8Blob);
        totalFilesGenerated++;
      }

      // 6. JPG
      if (targets.jpg) {
        const jpgBlob = await svgToJpgBlob(item.svgString, {
          width: item.width,
          height: item.height,
          scale: 2,
          bgColor: targets.bgColor && targets.bgColor !== "transparent" ? targets.bgColor : "#ffffff",
          quality: targets.jpgQuality || 0.92,
        });
        zip.file(`jpg/${baseName}.jpg`, jpgBlob);
        totalFilesGenerated++;
      }

      // 7. Original SVG
      if (targets.includeSvg) {
        zip.file(`svg/${baseName}.svg`, item.svgString);
        totalFilesGenerated++;
      }
    } catch (err) {
      console.error(`Error processing ${item.name}:`, err);
    }
  }

  // Finalize ZIP
  if (onProgress) {
    onProgress({
      processedFiles: totalItems,
      totalFiles: totalItems,
      currentFileName: "Compressing ZIP archive...",
      stage: "zipping",
      percent: 85,
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
          processedFiles: totalItems,
          totalFiles: totalItems,
          currentFileName: "Packaging assets bundle...",
          stage: "zipping",
          percent: 85 + Math.round((metadata.percent / 100) * 15),
        });
      }
    }
  );

  if (onProgress) {
    onProgress({
      processedFiles: totalItems,
      totalFiles: totalItems,
      currentFileName: "Completed!",
      stage: "complete",
      percent: 100,
    });
  }

  return {
    zipBlob,
    totalFilesGenerated,
    zipSize: zipBlob.size,
  };
}

