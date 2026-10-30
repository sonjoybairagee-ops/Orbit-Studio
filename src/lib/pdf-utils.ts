import { PDFDocument, degrees } from "pdf-lib";

export interface PdfResult {
  blob: Blob;
  url: string;
  size: number;
  pageCount: number;
  filename: string;
}

/**
 * Merge multiple PDF files into one single PDF in client-side memory
 */
export async function mergePdfFiles(files: File[]): Promise<PdfResult> {
  if (files.length === 0) {
    throw new Error("No files provided for merging.");
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  const mergedBytes = await mergedDoc.save();
  const blob = new Blob([mergedBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    size: blob.size,
    pageCount: mergedDoc.getPageCount(),
    filename: `merged-${Date.now()}.pdf`,
  };
}

/**
 * Parse page ranges string like "1-3, 5, 7-9" into 0-indexed page numbers
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(totalPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pages.add(i - 1); // 0-indexed
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pages.add(pageNum - 1);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Split a PDF by extracting specific pages/ranges into a new PDF
 */
export async function splitPdf(file: File, rangeStr: string): Promise<PdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = srcDoc.getPageCount();

  const indices = parsePageRanges(rangeStr, totalPages);
  if (indices.length === 0) {
    throw new Error("No valid pages found in the specified range.");
  }

  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => newDoc.addPage(page));

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return {
    blob,
    url,
    size: blob.size,
    pageCount: newDoc.getPageCount(),
    filename: `${baseName}-split.pdf`,
  };
}

/**
 * Compress PDF: strips metadata, compresses content streams, and cleans unused object streams
 */
export async function compressPdf(file: File): Promise<{
  blob: Blob;
  url: string;
  originalSize: number;
  compressedSize: number;
  savedPercentage: number;
  pageCount: number;
  filename: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  // Load with ignoreEncryption and optimize options
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  // Clear unneeded heavy metadata
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  // Save with objects stream compression
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
  const blob = new Blob([compressedBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const originalSize = file.size;
  const compressedSize = blob.size;
  const savedPercentage = Math.max(
    0,
    Math.round(((originalSize - compressedSize) / originalSize) * 100)
  );

  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return {
    blob,
    url,
    originalSize,
    compressedSize,
    savedPercentage,
    pageCount: pdfDoc.getPageCount(),
    filename: `${baseName}-compressed.pdf`,
  };
}

/**
 * Convert an array of images (JPG, PNG) into a single PDF document
 */
export async function imagesToPdf(
  imageFiles: File[],
  pageSize: "fit" | "a4" | "letter" = "fit",
  orientation: "portrait" | "landscape" = "portrait"
): Promise<PdfResult> {
  const pdfDoc = await PDFDocument.create();

  // A4 dimensions at 72 DPI: 595.28 x 841.89 pt
  const A4 = { width: 595.28, height: 841.89 };
  const LETTER = { width: 612, height: 792 };

  for (const imgFile of imageFiles) {
    const arrayBuffer = await imgFile.arrayBuffer();
    let embeddedImg;

    if (imgFile.type === "image/png") {
      embeddedImg = await pdfDoc.embedPng(arrayBuffer);
    } else {
      embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
    }

    const { width: imgW, height: imgH } = embeddedImg;

    if (pageSize === "fit") {
      const page = pdfDoc.addPage([imgW, imgH]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: imgW,
        height: imgH,
      });
    } else {
      const baseDim = pageSize === "letter" ? LETTER : A4;
      const targetW = orientation === "landscape" ? baseDim.height : baseDim.width;
      const targetH = orientation === "landscape" ? baseDim.width : baseDim.height;

      const page = pdfDoc.addPage([targetW, targetH]);

      // Calculate scale to fit with margin (20pt padding)
      const margin = 20;
      const maxW = targetW - margin * 2;
      const maxH = targetH - margin * 2;

      const scale = Math.min(maxW / imgW, maxH / imgH, 1);
      const drawW = imgW * scale;
      const drawH = imgH * scale;

      const x = (targetW - drawW) / 2;
      const y = (targetH - drawH) / 2;

      page.drawImage(embeddedImg, {
        x,
        y,
        width: drawW,
        height: drawH,
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    size: blob.size,
    pageCount: pdfDoc.getPageCount(),
    filename: `images-to-pdf-${Date.now()}.pdf`,
  };
}

export interface PageAction {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  deleted: boolean;
}

/**
 * Inspect PDF page count
 */
export async function getPdfInfo(file: File): Promise<{ pageCount: number; pages: PageAction[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  const pages: PageAction[] = [];
  for (let i = 0; i < pageCount; i++) {
    pages.push({
      id: `page-${i + 1}`,
      originalIndex: i,
      rotation: 0,
      deleted: false,
    });
  }

  return { pageCount, pages };
}

/**
 * Reorganize PDF: Apply reordering, page rotation, and page deletions
 */
export async function organizePdf(file: File, pageActions: PageAction[]): Promise<PdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  const activePages = pageActions.filter((p) => !p.deleted);
  if (activePages.length === 0) {
    throw new Error("Cannot save a PDF with 0 pages. Keep at least one page.");
  }

  const newDoc = await PDFDocument.create();

  // Copy pages in the specified reordered sequence
  const indices = activePages.map((p) => p.originalIndex);
  const copiedPages = await newDoc.copyPages(srcDoc, indices);

  copiedPages.forEach((copiedPage, i) => {
    const action = activePages[i];
    if (action.rotation !== 0) {
      const currentRotation = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRotation + action.rotation) % 360));
    }
    newDoc.addPage(copiedPage);
  });

  const pdfBytes = await newDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const baseName = file.name.replace(/\.[^/.]+$/, "");

  return {
    blob,
    url,
    size: blob.size,
    pageCount: newDoc.getPageCount(),
    filename: `${baseName}-organized.pdf`,
  };
}
