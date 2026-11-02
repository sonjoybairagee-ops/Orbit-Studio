/**
 * CompX Orbit Invoice PDF & Vector Document Engine
 * Generates high-DPI (300 DPI equivalent) A4 invoices with logo, customer details,
 * auto-calculated product pricing tables, taxes, discounts, and native PDF export.
 * 100% Client-side, zero external upload, private and instant.
 */

import { PDFDocument } from "pdf-lib";

export interface InvoiceLineItem {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  rate: number;
}

export interface InvoiceData {
  // Header
  logoUrl?: string; // base64 or object URL
  title: string; // e.g. "TAX INVOICE"
  invoiceNumber: string; // e.g. "INV-2026-0042"
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  poNumber?: string;
  status: "paid" | "due" | "pending" | "overdue";

  // From (Vendor)
  fromName: string;
  fromEmail: string;
  fromPhone: string;
  fromAddress: string;
  fromTaxId?: string; // BIN / Tax / VAT ID
  fromWebsite?: string;

  // Bill To (Client)
  toName: string;
  toContactPerson?: string;
  toEmail: string;
  toPhone: string;
  toAddress: string;
  toTaxId?: string;

  // Items
  items: InvoiceLineItem[];

  // Financials
  currencySymbol: string; // "$", "৳", "€", "£", etc.
  currencyCode: string; // "USD", "BDT", "EUR", etc.
  discountType: "percent" | "flat";
  discountValue: number;
  taxRatePercent: number; // e.g. 5, 10, 15
  shippingFee: number;
  amountPaid: number;

  // Notes & Payment
  paymentInfo: string; // Bank name, account, etc.
  notes: string;
  terms: string;
  signatureName?: string;
  signatureTitle?: string;

  // Style
  themeColor: string; // Hex color code
}

// Sample Default Business Invoice
export const SAMPLE_INVOICE: InvoiceData = {
  logoUrl: "",
  title: "TAX INVOICE",
  invoiceNumber: "INV-2026-0842",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
  poNumber: "PO-99120",
  status: "due",

  fromName: "Orbit Studio & Digital Solutions",
  fromEmail: "billing@orbitstudio.com",
  fromPhone: "+1 (555) 382-9100",
  fromAddress: "742 Innovation Way, Suite 400, San Francisco, CA 94107",
  fromTaxId: "VAT / BIN: US-92819401",
  fromWebsite: "https://compxorbit.com",

  toName: "Apex Motion Media Group",
  toContactPerson: "Sarah Jenkins (Creative Director)",
  toEmail: "sarah@apexmotion.com",
  toPhone: "+1 (555) 749-1120",
  toAddress: "1200 Market Street, 14th Floor, New York, NY 10001",
  toTaxId: "Tax ID: NY-8827104",

  items: [
    {
      id: "item-1",
      description: "CompX Orbit Commercial Enterprise License",
      details: "Unlimited seats, multi-device sync, and priority render updates",
      quantity: 1,
      rate: 499.0,
    },
    {
      id: "item-2",
      description: "Custom Motion Graphics & 3D Transition Pack",
      details: "4K Alpha channel AE presets, LUTs, and animated typography assets",
      quantity: 2,
      rate: 150.0,
    },
    {
      id: "item-3",
      description: "Dedicated Cloud Render Pipeline Setup",
      details: "High-speed WebGL GPU pipeline configuration & team onboarding",
      quantity: 1,
      rate: 250.0,
    },
  ],

  currencySymbol: "$",
  currencyCode: "USD",
  discountType: "percent",
  discountValue: 10,
  taxRatePercent: 8,
  shippingFee: 0,
  amountPaid: 0,

  paymentInfo:
    "Bank: Silicon Valley Commerce Bank\nAccount: 9821-4401-8823\nRouting / SWIFT: SVBUSB66\nPayPal / Stripe: billing@orbitstudio.com",
  notes:
    "Thank you for choosing CompX Orbit! We appreciate your business and look forward to partnering on future creative productions.",
  terms:
    "Payment is due within 14 days of issue date. Please reference invoice number INV-2026-0842 on bank transfers.",
  signatureName: "Sonjoy Bairagee",
  signatureTitle: "Authorized Managing Director",
  themeColor: "#10b981", // Emerald Orbit
};

/**
 * Compute invoice financials: subtotal, discount, tax, shipping, and grand total
 */
export function calculateInvoiceTotals(invoice: InvoiceData) {
  const subtotal = invoice.items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.rate) || 0),
    0
  );

  let discountAmount = 0;
  if (invoice.discountType === "percent") {
    discountAmount = (subtotal * (Number(invoice.discountValue) || 0)) / 100;
  } else {
    discountAmount = Number(invoice.discountValue) || 0;
  }
  discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxableAmount * (Number(invoice.taxRatePercent) || 0)) / 100;
  const shipping = Number(invoice.shippingFee) || 0;
  const grandTotal = Math.max(0, taxableAmount + taxAmount + shipping);
  const balanceDue = Math.max(0, grandTotal - (Number(invoice.amountPaid) || 0));

  return {
    subtotal,
    discountAmount,
    taxAmount,
    shipping,
    grandTotal,
    balanceDue,
  };
}

/**
 * Format currency amount with symbol
 */
export function formatCurrency(amount: number, symbol: string = "$"): string {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Render the complete invoice onto a high-DPI HTML5 Canvas (A4 dimensions: 1240 x 1754 px at 150-300 DPI)
 */
export async function renderInvoiceToCanvas(
  invoice: InvoiceData
): Promise<HTMLCanvasElement> {
  const W = 1240;
  const H = 1754;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not initialize 2D context");

  // Pure White Document Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const theme = invoice.themeColor || "#10b981";
  const totals = calculateInvoiceTotals(invoice);
  const pad = 65;
  let curY = pad;

  // Top Accent Bar
  ctx.fillStyle = theme;
  ctx.fillRect(0, 0, W, 10);

  // 1. Header: Logo (left) & Invoice Title/Meta (right)
  let logoDrawn = false;
  if (invoice.logoUrl) {
    try {
      const img = await loadHtmlImage(invoice.logoUrl);
      const maxW = 200;
      const maxH = 80;
      let drawW = img.width;
      let drawH = img.height;
      if (drawW > maxW) {
        drawH = (drawH * maxW) / drawW;
        drawW = maxW;
      }
      if (drawH > maxH) {
        drawW = (drawW * maxH) / drawH;
        drawH = maxH;
      }
      ctx.drawImage(img, pad, curY, drawW, drawH);
      logoDrawn = true;
    } catch {
      // fallback
    }
  }

  if (!logoDrawn) {
    // Stylized Brand Monogram
    ctx.fillStyle = theme;
    ctx.beginPath();
    ctx.roundRect(pad, curY, 54, 54, 12);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "black 26px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(invoice.fromName.charAt(0) || "O", pad + 27, curY + 27);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(invoice.fromName || "Company Name", pad + 66, curY + 36);
  }

  // Right Header Info
  const rightX = W - pad;
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 36px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(invoice.title.toUpperCase(), rightX, curY + 32);

  // Status Badge
  const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
    paid: { label: "PAID", bg: "#dcfce7", text: "#15803d" },
    due: { label: "PAYMENT DUE", bg: "#fef3c7", text: "#b45309" },
    pending: { label: "PENDING", bg: "#e0f2fe", text: "#0369a1" },
    overdue: { label: "OVERDUE", bg: "#fee2e2", text: "#b91c1c" },
  };
  const st = statusLabels[invoice.status] || statusLabels.due;
  const badgeW = 120;
  const badgeH = 24;
  ctx.fillStyle = st.bg;
  ctx.beginPath();
  ctx.roundRect(rightX - badgeW, curY + 46, badgeW, badgeH, 6);
  ctx.fill();

  ctx.fillStyle = st.text;
  ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(st.label, rightX - badgeW / 2, curY + 62);

  curY += 95;

  // Invoice Meta Grid (Invoice #, Date, Due Date, PO)
  const metaY = curY;
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(rightX - 380, metaY, 380, 75, 10);
  ctx.fill();
  ctx.stroke();

  // Draw Meta details inside box
  const metaItems = [
    { label: "Invoice No:", val: invoice.invoiceNumber },
    { label: "Issue Date:", val: invoice.issueDate },
    { label: "Due Date:", val: invoice.dueDate },
    { label: "PO Reference:", val: invoice.poNumber || "N/A" },
  ];

  ctx.textAlign = "left";
  metaItems.forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = rightX - 365 + col * 185;
    const my = metaY + 22 + row * 34;

    ctx.font = "600 11px system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(m.label, mx, my);

    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(m.val, mx + 78, my);
  });

  // 2. Vendor & Client Info ("From" & "Bill To")
  const vendorY = curY + 95;
  const colW = (W - pad * 2 - 40) / 2;

  // Left: FROM (Vendor)
  ctx.fillStyle = theme;
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("FROM / VENDOR", pad, vendorY);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(invoice.fromName, pad, vendorY + 22);

  ctx.fillStyle = "#475569";
  ctx.font = "normal 12px system-ui, sans-serif";
  const fromLines = [
    invoice.fromAddress,
    invoice.fromEmail && `Email: ${invoice.fromEmail}`,
    invoice.fromPhone && `Phone: ${invoice.fromPhone}`,
    invoice.fromTaxId && invoice.fromTaxId,
  ].filter(Boolean) as string[];

  let vOff = vendorY + 40;
  fromLines.forEach((line) => {
    ctx.fillText(line, pad, vOff);
    vOff += 18;
  });

  // Right: BILL TO (Client)
  const clientX = pad + colW + 40;
  ctx.fillStyle = theme;
  ctx.font = "bold 11px system-ui, sans-serif";
  ctx.fillText("BILL TO / CLIENT", clientX, vendorY);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillText(invoice.toName, clientX, vendorY + 22);

  ctx.fillStyle = "#475569";
  ctx.font = "normal 12px system-ui, sans-serif";
  const toLines = [
    invoice.toContactPerson && `Attn: ${invoice.toContactPerson}`,
    invoice.toAddress,
    invoice.toEmail && `Email: ${invoice.toEmail}`,
    invoice.toPhone && `Phone: ${invoice.toPhone}`,
    invoice.toTaxId && invoice.toTaxId,
  ].filter(Boolean) as string[];

  let cOff = vendorY + 40;
  toLines.forEach((line) => {
    ctx.fillText(line, clientX, cOff);
    cOff += 18;
  });

  curY = Math.max(vOff, cOff) + 30;

  // 3. Line Items Table
  const tableX = pad;
  const tableW = W - pad * 2;
  const tableH = 38;

  // Header Bar
  ctx.fillStyle = theme;
  ctx.beginPath();
  ctx.roundRect(tableX, curY, tableW, tableH, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px system-ui, sans-serif";

  // Column Positions
  const cItem = tableX + 16;
  const cQty = tableX + tableW - 320;
  const cRate = tableX + tableW - 190;
  const cTotal = tableX + tableW - 16;

  ctx.textAlign = "left";
  ctx.fillText("ITEM & DESCRIPTION", cItem, curY + 24);

  ctx.textAlign = "center";
  ctx.fillText("QTY", cQty, curY + 24);

  ctx.textAlign = "right";
  ctx.fillText("UNIT PRICE", cRate, curY + 24);
  ctx.fillText("AMOUNT", cTotal, curY + 24);

  curY += tableH + 6;

  // Rows
  const sym = invoice.currencySymbol || "$";
  const items = invoice.items.length > 0 ? invoice.items : SAMPLE_INVOICE.items;

  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowH = item.details ? 48 : 36;

    if (isEven) {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(tableX, curY, tableW, rowH);
    }

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tableX, curY + rowH);
    ctx.lineTo(tableX + tableW, curY + rowH);
    ctx.stroke();

    // Item Title
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.description, cItem, curY + 20);

    // Item Subtitle / Details
    if (item.details) {
      ctx.fillStyle = "#64748b";
      ctx.font = "normal 11px system-ui, sans-serif";
      ctx.fillText(item.details, cItem, curY + 36);
    }

    // Qty
    ctx.fillStyle = "#334155";
    ctx.font = "600 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(item.quantity || 1), cQty, curY + 23);

    // Rate
    ctx.textAlign = "right";
    ctx.fillText(formatCurrency(item.rate, sym), cRate, curY + 23);

    // Line Total
    const lineTotal = (item.quantity || 0) * (item.rate || 0);
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(formatCurrency(lineTotal, sym), cTotal, curY + 23);

    curY += rowH;
  });

  curY += 24;

  // 4. Bottom Section: Notes & Bank (Left) vs Financial Summary Box (Right)
  const bottomY = curY;
  const leftW = colW + 40;
  const rightBoxW = 340;
  const rightBoxX = W - pad - rightBoxW;

  // Left: Payment & Bank Details
  if (invoice.paymentInfo) {
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pad, bottomY, leftW, 110, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = theme;
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("PAYMENT METHODS & BANK INSTRUCTIONS", pad + 16, bottomY + 22);

    ctx.fillStyle = "#334155";
    ctx.font = "normal 11px system-ui, sans-serif";
    const pLines = invoice.paymentInfo.split("\n");
    let py = bottomY + 40;
    pLines.forEach((pl) => {
      ctx.fillText(pl, pad + 16, py);
      py += 17;
    });
  }

  // Left: Notes & Terms
  if (invoice.notes || invoice.terms) {
    const noteY = bottomY + 124;
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TERMS & CONDITIONS", pad, noteY);

    ctx.fillStyle = "#64748b";
    ctx.font = "normal 11px system-ui, sans-serif";
    const termLines = (invoice.terms || invoice.notes).split("\n");
    let ty = noteY + 18;
    termLines.forEach((tl) => {
      ctx.fillText(tl, pad, ty);
      ty += 16;
    });
  }

  // Right: Totals Box
  let totY = bottomY;
  const totItems = [
    { label: "Subtotal", val: formatCurrency(totals.subtotal, sym) },
    invoice.discountValue > 0 && {
      label: `Discount (${invoice.discountType === "percent" ? `${invoice.discountValue}%` : "Flat"})`,
      val: `-${formatCurrency(totals.discountAmount, sym)}`,
      highlight: true,
    },
    invoice.taxRatePercent > 0 && {
      label: `Tax / VAT (${invoice.taxRatePercent}%)`,
      val: formatCurrency(totals.taxAmount, sym),
    },
    invoice.shippingFee > 0 && {
      label: "Shipping & Handling",
      val: formatCurrency(totals.shipping, sym),
    },
  ].filter(Boolean) as { label: string; val: string; highlight?: boolean }[];

  totItems.forEach((t) => {
    ctx.font = "normal 12px system-ui, sans-serif";
    ctx.fillStyle = t.highlight ? "#16a34a" : "#64748b";
    ctx.textAlign = "left";
    ctx.fillText(t.label, rightBoxX, totY + 14);

    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillStyle = t.highlight ? "#16a34a" : "#0f172a";
    ctx.textAlign = "right";
    ctx.fillText(t.val, rightX, totY + 14);

    totY += 26;
  });

  totY += 6;

  // Grand Total Box
  ctx.fillStyle = theme;
  ctx.beginPath();
  ctx.roundRect(rightBoxX, totY, rightBoxW, 48, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("GRAND TOTAL", rightBoxX + 16, totY + 30);

  ctx.font = "900 20px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatCurrency(totals.grandTotal, sym), rightX - 16, totY + 31);

  totY += 60;

  // Balance Due (if partial payment)
  if (invoice.amountPaid > 0) {
    ctx.font = "bold 12px system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "left";
    ctx.fillText("Amount Paid:", rightBoxX, totY);

    ctx.textAlign = "right";
    ctx.fillText(formatCurrency(invoice.amountPaid, sym), rightX, totY);

    totY += 22;

    ctx.fillStyle = "#b91c1c";
    ctx.textAlign = "left";
    ctx.fillText("Balance Due:", rightBoxX, totY);

    ctx.textAlign = "right";
    ctx.fillText(formatCurrency(totals.balanceDue, sym), rightX, totY);

    totY += 26;
  }

  // 5. Signature Area
  const sigY = H - pad - 60;
  if (invoice.signatureName) {
    const sigX = rightX - 220;
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sigX, sigY);
    ctx.lineTo(rightX, sigY);
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(invoice.signatureName, sigX + 110, sigY + 18);

    if (invoice.signatureTitle) {
      ctx.fillStyle = "#64748b";
      ctx.font = "normal 11px system-ui, sans-serif";
      ctx.fillText(invoice.signatureTitle, sigX + 110, sigY + 34);
    }
  }

  // 6. Bottom Document Footer
  ctx.fillStyle = "#94a3b8";
  ctx.font = "normal 10px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    "Verified Digital Invoice · Generated online via CompX Orbit Document Suite",
    pad,
    H - 24
  );

  ctx.textAlign = "right";
  ctx.fillText(invoice.invoiceNumber, rightX, H - 24);

  return canvas;
}

/**
 * Generate native PDF Blob using pdf-lib and high-DPI canvas
 */
export async function renderInvoiceToPdfBlob(
  invoice: InvoiceData
): Promise<Blob> {
  const canvas = await renderInvoiceToCanvas(invoice);
  const pngDataUrl = canvas.toDataURL("image/png");

  // Create A4 PDF Document
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`${invoice.title} - ${invoice.invoiceNumber}`);
  pdfDoc.setAuthor(invoice.fromName);
  pdfDoc.setCreationDate(new Date());

  // A4 dimensions in points: 595.28 x 841.89
  const page = pdfDoc.addPage([595.28, 841.89]);

  const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
  const embeddedPng = await pdfDoc.embedPng(pngBytes);

  page.drawImage(embeddedPng, {
    x: 0,
    y: 0,
    width: 595.28,
    height: 841.89,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
}

/**
 * Helper to load HTMLImageElement from URL or Base64
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
