"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  CreditCard,
  Percent,
  DollarSign,
  Palette,
  Eye,
  RefreshCw,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  ZoomIn,
  ZoomOut,
  ChevronDown,
} from "lucide-react";
import {
  InvoiceData,
  InvoiceLineItem,
  SAMPLE_INVOICE,
  calculateInvoiceTotals,
  formatCurrency,
  renderInvoiceToCanvas,
  renderInvoiceToPdfBlob,
  downloadBlob,
} from "@/lib/invoice-pdf-generator";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "BDT", symbol: "৳", label: "BDT (৳) - Bangladeshi Taka" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "CAD", symbol: "CA$", label: "CAD (CA$) - Canadian Dollar" },
  { code: "AUD", symbol: "AU$", label: "AUD (AU$) - Australian Dollar" },
  { code: "JPY", symbol: "¥", label: "JPY (¥) - Japanese Yen" },
];

const THEME_COLORS = [
  { name: "Emerald", hex: "#10b981", label: "CompX Emerald" },
  { name: "Blue", hex: "#2563eb", label: "Corporate Blue" },
  { name: "Slate", hex: "#334155", label: "Charcoal Slate" },
  { name: "Purple", hex: "#8b5cf6", label: "Royal Purple" },
  { name: "Amber", hex: "#d97706", label: "Warm Gold" },
];

const INVOICE_TITLES = [
  "TAX INVOICE",
  "COMMERCIAL INVOICE",
  "PROFORMA INVOICE",
  "INVOICE",
  "BILL / CASH MEMO",
  "RECEIPT",
];

export default function InvoiceGeneratorTool() {
  const [invoice, setInvoice] = useState<InvoiceData>(SAMPLE_INVOICE);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [previewTab, setPreviewTab] = useState<"document" | "canvas">("document");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Compute Financials
  const totals = calculateInvoiceTotals(invoice);

  // Re-render Canvas Preview whenever invoice data changes
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const canvas = await renderInvoiceToCanvas(invoice);
        if (active) {
          setPreviewDataUrl(canvas.toDataURL("image/png"));
        }
      } catch (err) {
        console.error("Preview render error:", err);
      }
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [invoice]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setInvoice((prev) => ({ ...prev, logoUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // Add Line Item
  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: "New Product / Creative Service",
      details: "",
      quantity: 1,
      rate: 100.0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  // Update Line Item
  const handleUpdateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  };

  // Delete Line Item
  const handleDeleteItem = (id: string) => {
    if (invoice.items.length <= 1) {
      alert("An invoice must contain at least one line item!");
      return;
    }
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== id),
    }));
  };

  // 1-Click PDF Download via pdf-lib
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await renderInvoiceToPdfBlob(invoice);
      downloadBlob(pdfBlob, `${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      alert("PDF Generation error: " + String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    setIsGenerating(true);
    try {
      const canvas = await renderInvoiceToCanvas(invoice);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${invoice.invoiceNumber}.png`);
        }
      }, "image/png");
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser Direct Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Reset to Blank Form
  const handleReset = () => {
    if (confirm("Reset invoice form to blank?")) {
      setInvoice({
        ...SAMPLE_INVOICE,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        items: [
          {
            id: `item-${Date.now()}`,
            description: "Product or Service Description",
            details: "",
            quantity: 1,
            rate: 100.0,
          },
        ],
        amountPaid: 0,
      });
    }
  };

  // Quick Due Date Increments
  const setQuickDueDate = (days: number) => {
    const d = new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
    setInvoice((prev) => ({ ...prev, dueDate: d }));
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden File Input for Logo */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleLogoUpload}
      />

      {/* Top Banner Toolbar */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                <FileText className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#e7eee9]">
                CompX Professional Invoice Generator & PDF Exporter
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#8da194]">
              Create custom invoices with logo, billing details, products, auto-calculated taxes & discounts, and export directly to <b>Print-Ready PDF</b>.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setInvoice(SAMPLE_INVOICE)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Load Sample</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-bold text-[#8da194] hover:text-[#e7eee9] hover:bg-[#14231b] transition-all cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3cff5f] px-4 py-1.5 text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isGenerating ? "Generating..." : "Download PDF (.pdf)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left (Editor Form) | Right (Live A4 Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ========================================================= */}
        {/* LEFT COLUMN: FORM INPUTS (6 COLS) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section 1: Invoice Header & Theme */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2720] pb-3">
              <h3 className="text-sm font-black text-[#e7eee9] flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#3cff5f]" />
                <span>Invoice Identity & Logo</span>
              </h3>
              {/* Theme Color Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#8da194] mr-1">Theme:</span>
                {THEME_COLORS.map((th) => (
                  <button
                    key={th.hex}
                    type="button"
                    onClick={() => setInvoice((prev) => ({ ...prev, themeColor: th.hex }))}
                    className={`h-5 w-5 rounded-full border transition-all cursor-pointer ${
                      invoice.themeColor === th.hex
                        ? "ring-2 ring-[#3cff5f] ring-offset-2 ring-offset-[#0c1510] scale-110"
                        : "border-[#213026] opacity-75"
                    }`}
                    style={{ backgroundColor: th.hex }}
                    title={th.label}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo Upload Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Business Logo:</label>
                {invoice.logoUrl ? (
                  <div className="flex items-center justify-between rounded-2xl border border-[#213026] bg-[#080e0b] p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invoice.logoUrl}
                      alt="Logo"
                      className="h-10 max-w-[120px] object-contain rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setInvoice((prev) => ({ ...prev, logoUrl: "" }))}
                      className="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#2a5234] bg-[#080e0b] p-2.5 text-xs font-bold text-[#3cff5f] hover:bg-[#102a16] transition-all cursor-pointer"
                  >
                    <ImageIcon className="h-4 w-4" />
                    <span>Upload Logo Image</span>
                  </button>
                )}
              </div>

              {/* Invoice Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Invoice Title:</label>
                <input
                  type="text"
                  value={invoice.title}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs font-bold text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              {/* Invoice Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Invoice #:</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-xs font-mono font-bold text-[#3cff5f] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Status:</label>
                <select
                  value={invoice.status}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs font-bold text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                >
                  <option value="due">PAYMENT DUE</option>
                  <option value="paid">PAID</option>
                  <option value="pending">PENDING</option>
                  <option value="overdue">OVERDUE</option>
                </select>
              </div>

              {/* Issue Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8da194]">Issue Date:</label>
                <input
                  type="date"
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              {/* Due Date & Quick Increments */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8da194]">Due Date:</label>
                  <div className="flex items-center gap-1 text-[10px] text-[#3cff5f]">
                    <button type="button" onClick={() => setQuickDueDate(7)} className="hover:underline">
                      +7d
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => setQuickDueDate(14)} className="hover:underline">
                      +14d
                    </button>
                    <span>·</span>
                    <button type="button" onClick={() => setQuickDueDate(30)} className="hover:underline">
                      +30d
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: "From" (Vendor) & "Bill To" (Client) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* FROM (Vendor) */}
            <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-[#3cff5f] uppercase tracking-wider flex items-center gap-2 border-b border-[#1b2720] pb-2">
                <Building2 className="h-3.5 w-3.5" />
                <span>From (Your Business)</span>
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Business / Company Name"
                  value={invoice.fromName}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, fromName: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs font-bold text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <input
                  type="email"
                  placeholder="Billing Email"
                  value={invoice.fromEmail}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, fromEmail: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={invoice.fromPhone}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, fromPhone: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <textarea
                  placeholder="Address (Street, City, Country, ZIP)"
                  rows={2}
                  value={invoice.fromAddress}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, fromAddress: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f] resize-none"
                />
                <input
                  type="text"
                  placeholder="Tax ID / BIN / VAT Number"
                  value={invoice.fromTaxId || ""}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, fromTaxId: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#8da194] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
            </div>

            {/* BILL TO (Client) */}
            <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl space-y-3">
              <h3 className="text-xs font-black text-[#38bdf8] uppercase tracking-wider flex items-center gap-2 border-b border-[#1b2720] pb-2">
                <User className="h-3.5 w-3.5" />
                <span>Bill To (Client / Customer)</span>
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={invoice.toName}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, toName: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs font-bold text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <input
                  type="text"
                  placeholder="Contact Person / Attention"
                  value={invoice.toContactPerson || ""}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, toContactPerson: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <input
                  type="email"
                  placeholder="Client Email"
                  value={invoice.toEmail}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, toEmail: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <input
                  type="tel"
                  placeholder="Client Phone Number"
                  value={invoice.toPhone}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, toPhone: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-2 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
                <textarea
                  placeholder="Client Address (Street, City, State, Country)"
                  rows={2}
                  value={invoice.toAddress}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, toAddress: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Products & Line Items Table */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1b2720] pb-3">
              <div>
                <h3 className="text-sm font-black text-[#e7eee9]">
                  Products & Services Line Items
                </h3>
                <p className="text-xs text-[#8da194]">
                  Add goods, creative deliverables, software licenses, or hours worked.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8da194] font-bold">Currency:</span>
                <select
                  value={invoice.currencyCode}
                  onChange={(e) => {
                    const sel = CURRENCIES.find((c) => c.code === e.target.value);
                    if (sel) {
                      setInvoice((prev) => ({
                        ...prev,
                        currencyCode: sel.code,
                        currencySymbol: sel.symbol,
                      }));
                    }
                  }}
                  className="rounded-xl border border-[#213026] bg-[#080e0b] px-2.5 py-1 text-xs font-bold text-[#3cff5f] focus:outline-none focus:border-[#3cff5f]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#1b2720] bg-[#080e0b] p-3.5 space-y-2 hover:border-[#2a5234] transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#102a16] text-[10px] font-bold text-[#3cff5f] mt-1">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Item Title / Service Name"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                      className="flex-1 rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-1.5 text-xs font-bold text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded-lg p-1.5 text-[#62776a] hover:text-red-400 hover:bg-[#1a1215] transition-all cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Specification / Details note (optional)"
                    value={item.details || ""}
                    onChange={(e) => handleUpdateItem(item.id, "details", e.target.value)}
                    className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-1 text-[11px] text-[#8da194] focus:outline-none focus:border-[#3cff5f]"
                  />

                  {/* Quantity & Rate */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#8da194]">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                          className="w-16 rounded-xl border border-[#213026] bg-[#0c1510] px-2.5 py-1 text-xs font-bold text-center text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-[#8da194]">Rate:</span>
                        <div className="flex items-center rounded-xl border border-[#213026] bg-[#0c1510] px-2 py-1">
                          <span className="text-xs text-[#3cff5f] font-bold mr-1">{invoice.currencySymbol}</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, "rate", Number(e.target.value))}
                            className="w-20 bg-transparent text-xs font-mono font-bold text-[#e7eee9] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <span className="text-[10px] text-[#62776a] block">Total</span>
                      <span className="font-mono text-xs font-bold text-[#3cff5f]">
                        {formatCurrency((item.quantity || 0) * (item.rate || 0), invoice.currencySymbol)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 rounded-2xl border border-dashed border-[#2a5234] bg-[#102a16]/50 hover:bg-[#102a16] text-xs font-bold text-[#3cff5f] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Section 4: Discounts, Tax, Shipping & Notes */}
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-[#e7eee9] border-b border-[#1b2720] pb-2">
              Financial Adjustments & Payment Notes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Discount */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8da194]">
                  Discount ({invoice.discountType === "percent" ? "%" : invoice.currencySymbol}):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={invoice.discountValue}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, discountValue: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-mono text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setInvoice((prev) => ({
                        ...prev,
                        discountType: prev.discountType === "percent" ? "flat" : "percent",
                      }))
                    }
                    className="rounded-xl border border-[#213026] bg-[#102a16] px-2 py-1.5 text-xs font-bold text-[#3cff5f]"
                  >
                    {invoice.discountType === "percent" ? "%" : invoice.currencySymbol}
                  </button>
                </div>
              </div>

              {/* Tax / VAT */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8da194]">Tax / VAT (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={invoice.taxRatePercent}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, taxRatePercent: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-mono text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>

              {/* Shipping */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8da194]">Shipping Fee:</label>
                <input
                  type="number"
                  min="0"
                  value={invoice.shippingFee}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, shippingFee: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-mono text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
            </div>

            {/* Payment & Terms Input */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8da194]">
                  Bank / Payment Instructions:
                </label>
                <textarea
                  rows={3}
                  value={invoice.paymentInfo}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, paymentInfo: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#8da194]">Terms & Conditions / Note:</label>
                <textarea
                  rows={2}
                  value={invoice.terms}
                  onChange={(e) => setInvoice((prev) => ({ ...prev, terms: e.target.value }))}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] p-3 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f] resize-none"
                />
              </div>

              {/* Signatory */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8da194]">Authorized Signatory Name:</label>
                  <input
                    type="text"
                    value={invoice.signatureName || ""}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, signatureName: e.target.value }))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#8da194]">Signatory Designation:</label>
                  <input
                    type="text"
                    value={invoice.signatureTitle || ""}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, signatureTitle: e.target.value }))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#e7eee9] focus:outline-none focus:border-[#3cff5f]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LIVE A4 PREVIEW & EXPORT ACTIONS (6 COLS) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-20 h-fit">
          <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5 shadow-2xl space-y-4">
            {/* Preview Toolbar */}
            <div className="flex items-center justify-between border-b border-[#1b2720] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#3cff5f]" />
                <h3 className="text-sm font-black text-[#e7eee9]">
                  Live A4 Document Preview
                </h3>
              </div>

              {/* Total Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8da194]">Due:</span>
                <span className="font-mono text-sm font-black text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 rounded-lg">
                  {formatCurrency(totals.grandTotal, invoice.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Live A4 Render Box */}
            <div className="relative w-full rounded-2xl border border-[#213026] bg-[#050a08] overflow-hidden flex items-center justify-center p-2 sm:p-4 shadow-inner min-h-[480px]">
              {previewDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewDataUrl}
                  alt="Invoice Preview"
                  className="w-full max-h-[700px] object-contain rounded-lg shadow-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                />
              ) : (
                <div className="text-center py-20 text-xs text-[#8da194]">
                  Rendering invoice preview...
                </div>
              )}
            </div>

            {/* Export Buttons Hub */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownloadPdf}
                className="py-3.5 px-4 rounded-2xl bg-[#3cff5f] text-xs font-black text-[#050a08] hover:bg-[#52ff71] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#3cff5f]/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF (.pdf)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3.5 px-4 rounded-2xl border border-[#2a5234] bg-[#102a16] text-xs font-bold text-[#3cff5f] hover:bg-[#183d21] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8da194] pt-2 border-t border-[#1b2720]">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="hover:text-[#3cff5f] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download High-Res PNG</span>
              </button>
              <span>100% Private · Client-Side PDF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
