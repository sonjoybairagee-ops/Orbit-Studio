"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  FileText,
  Upload,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Table as TableIcon,
  Link as LinkIcon,
  Minus,
  Search,
  Replace,
  Maximize2,
  Minimize2,
  Printer,
  ChevronDown,
  Trash2,
  Plus,
  Clock,
  Eye,
  FileCode,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import {
  parseDocxFile,
  exportToDocx,
  exportToHtml,
  exportToMarkdown,
  exportToText,
  SAMPLE_WORD_DOCUMENT,
} from "@/lib/docx-engine";

const FONTS = [
  { name: "Default (Inter)", value: "Inter, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"];

const COLOR_PALETTE = [
  "#000000",
  "#1e293b",
  "#475569",
  "#dc2626",
  "#ea580c",
  "#d97706",
  "#16a34a",
  "#059669",
  "#0284c7",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

const HIGHLIGHT_PALETTE = [
  "transparent",
  "#fef08a",
  "#bbf7d0",
  "#bae6fd",
  "#fbcfe8",
  "#fed7aa",
  "#e2e8f0",
];

export default function WordViewerTool() {
  const [docTitle, setDocTitle] = useState<string>("CompX-Project-Roadmap");
  const [activeFont, setActiveFont] = useState<string>("Inter, sans-serif");
  const [activeFontSize, setActiveFontSize] = useState<string>("16px");
  const [textColor, setTextColor] = useState<string>("#1e293b");
  const [highlightColor, setHighlightColor] = useState<string>("transparent");

  // View modes
  const [viewMode, setViewMode] = useState<"page" | "web">("page");
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Search & Replace bar
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");
  const [matchCount, setMatchCount] = useState<number>(0);

  // Status & notifications
  const [status, setStatus] = useState<string>("");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);

  // Table modal
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);

  // Editor ref
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with sample document
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = SAMPLE_WORD_DOCUMENT;
      updateStats();
    }
  }, []);

  // Live Statistics
  const [stats, setStats] = useState({
    words: 0,
    chars: 0,
    charsNoSpaces: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0,
    pagesEst: 1,
  });

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, "").length;
    const paragraphs = editorRef.current.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote").length || 1;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);
    const pagesEst = Math.max(1, Math.ceil(words / 450));

    setStats({
      words,
      chars,
      charsNoSpaces,
      paragraphs,
      readingTime,
      speakingTime,
      pagesEst,
    });
  }, []);

  // Format command wrapper using document.execCommand
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    updateStats();
  };

  const setHeading = (tag: string) => {
    execCmd("formatBlock", `<${tag}>`);
  };

  const handleFontChange = (font: string) => {
    setActiveFont(font);
    execCmd("fontName", font);
  };

  const handleTextColor = (color: string) => {
    setTextColor(color);
    execCmd("foreColor", color);
  };

  const handleHighlight = (color: string) => {
    setHighlightColor(color);
    execCmd("hiliteColor", color);
  };

  const insertLink = () => {
    const url = prompt("Enter hyperlink URL (https://...):");
    if (url) {
      execCmd("createLink", url);
    }
  };

  const insertTable = () => {
    if (!editorRef.current) return;
    let html = `<table class="word-table" border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;"><thead><tr>`;
    for (let c = 0; c < tableCols; c++) {
      html += `<th style="border: 1px solid #cbd5e1; padding: 8px 12px; background: #f1f5f9; text-align: left;">Header ${c + 1}</th>`;
    }
    html += `</tr></thead><tbody>`;
    for (let r = 0; r < tableRows - 1; r++) {
      html += `<tr>`;
      for (let c = 0; c < tableCols; c++) {
        html += `<td style="border: 1px solid #cbd5e1; padding: 8px 12px;">Cell ${r + 1},${c + 1}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br/></p>`;
    execCmd("insertHTML", html);
    setShowTableModal(false);
  };

  // Upload handler
  const handleFileUpload = async (file: File) => {
    try {
      setStatus("Loading and parsing document...");
      const fileName = file.name;
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      setDocTitle(baseName);

      if (fileName.endsWith(".docx")) {
        const result = await parseDocxFile(file);
        if (editorRef.current) {
          editorRef.current.innerHTML = result.html;
          updateStats();
        }
        setStatus(`Successfully opened "${fileName}" (${result.wordCount} words)`);
      } else if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        const text = await file.text();
        if (editorRef.current) {
          editorRef.current.innerHTML = text;
          updateStats();
        }
        setStatus(`Loaded HTML file "${fileName}"`);
      } else {
        // Plain text or fallback
        const text = await file.text();
        const paragraphs = text
          .split(/\n\s*\n/)
          .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
          .join("\n");
        if (editorRef.current) {
          editorRef.current.innerHTML = paragraphs || "<p></p>";
          updateStats();
        }
        setStatus(`Loaded text document "${fileName}"`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse document";
      setStatus(`Error: ${msg}`);
    }
  };

  // Drag and Drop
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Find & Replace
  const handleFind = () => {
    if (!findText || !editorRef.current) return;
    const text = editorRef.current.innerText;
    const regex = new RegExp(findText, "gi");
    const matches = text.match(regex);
    setMatchCount(matches ? matches.length : 0);
  };

  const handleReplaceAll = () => {
    if (!findText || !editorRef.current) return;
    const currentHtml = editorRef.current.innerHTML;
    // Replace text while preserving tags
    const escapedFind = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedFind, "gi");
    editorRef.current.innerHTML = currentHtml.replace(regex, replaceText);
    updateStats();
    setStatus(`Replaced occurrences of "${findText}" with "${replaceText}"`);
    handleFind();
  };

  // Export handlers
  const handleExportDocx = async () => {
    if (!editorRef.current) return;
    try {
      setIsExporting(true);
      setStatus("Building Microsoft Word (.docx) archive...");
      const blob = await exportToDocx(editorRef.current.innerHTML, docTitle);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle || "Document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus("Downloaded Microsoft Word (.docx) file successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to export DOCX";
      setStatus(`Export Error: ${msg}`);
    } finally {
      setIsExporting(false);
      setExportMenuOpen(false);
    }
  };

  const handleExportHtml = () => {
    if (!editorRef.current) return;
    const html = exportToHtml(editorRef.current.innerHTML, docTitle);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle || "Document"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded HTML document!");
    setExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!editorRef.current) return;
    const md = exportToMarkdown(editorRef.current.innerHTML);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle || "Document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded Markdown file!");
    setExportMenuOpen(false);
  };

  const handleExportText = () => {
    if (!editorRef.current) return;
    const txt = exportToText(editorRef.current.innerHTML);
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docTitle || "Document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded plain text file!");
    setExportMenuOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setExportMenuOpen(false);
  };

  const handleCopyRichText = async () => {
    if (!editorRef.current) return;
    try {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([text], { type: "text/plain" });
      const item = new ClipboardItem({
        "text/html": blobHtml,
        "text/plain": blobText,
      });
      await navigator.clipboard.write([item]);
      setCopiedType("rich");
      setTimeout(() => setCopiedType(null), 2500);
      setStatus("Copied formatted rich text to clipboard!");
    } catch {
      // Fallback
      if (editorRef.current) {
        await navigator.clipboard.writeText(editorRef.current.innerText);
        setCopiedType("rich");
        setTimeout(() => setCopiedType(null), 2500);
        setStatus("Copied text to clipboard!");
      }
    }
  };

  const loadSample = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = SAMPLE_WORD_DOCUMENT;
      setDocTitle("CompX-Project-Roadmap");
      updateStats();
      setStatus("Loaded sample Word document template.");
    }
  };

  const handleNewDoc = () => {
    if (confirm("Start a new blank document? Any unsaved edits will be cleared.")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "<h1>Untitled Document</h1><p>Start typing your document here...</p>";
        setDocTitle("Untitled-Document");
        updateStats();
        setStatus("Created blank document.");
      }
    }
  };

  const handleClear = () => {
    if (confirm("Clear all text from document?")) {
      if (editorRef.current) {
        editorRef.current.innerHTML = "<p><br/></p>";
        updateStats();
        setStatus("Document cleared.");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`word-viewer-engine ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#090d0b] p-4 overflow-y-auto" : "relative"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag & Drop Visual Indicator */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#050a08]/90 backdrop-blur-md border-2 border-dashed border-[#3cff5f] rounded-3xl">
          <div className="text-center p-6">
            <Upload className="w-14 h-14 mx-auto text-[#3cff5f] animate-bounce mb-3" />
            <h3 className="text-xl font-bold text-white">Drop Word (.docx) File Here</h3>
            <p className="text-sm text-[#9cb1a5] mt-1">Instant client-side OpenXML parsing with zero uploads</p>
          </div>
        </div>
      )}

      {/* Top Application Bar */}
      <div className="rounded-2xl border border-[#223328] bg-[#0c1410] p-4 mb-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* File Name & Badge */}
          <div className="flex items-center gap-3 min-w-[280px]">
            <div className="w-10 h-10 rounded-xl bg-[#142319] border border-[#233829] flex items-center justify-center text-[#3cff5f] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-[#3cff5f]/50 focus:border-[#3cff5f] focus:outline-none text-white font-bold text-sm sm:text-base px-1 py-0.5 rounded transition-colors"
                  title="Click to rename document"
                />
                <span className="text-xs text-[#3cff5f] font-mono px-2 py-0.5 rounded-full bg-[#142319] border border-[#233829]">
                  .docx
                </span>
              </div>
              <p className="text-xs text-[#8da096]">OpenXML Word Engine · In-Browser Privacy</p>
            </div>
          </div>

          {/* Quick File Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.txt,.html,.htm,.rtf"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-[#e7eee9] hover:bg-[#1a2f22] hover:border-[#3cff5f]/50 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#3cff5f]" />
              Open Word (.docx)
            </button>

            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101914] border border-[#1e2d24] text-xs font-medium text-[#a2b4a9] hover:text-white hover:border-[#2d4235] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f5a524]" />
              Sample
            </button>

            <button
              type="button"
              onClick={handleNewDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101914] border border-[#1e2d24] text-xs font-medium text-[#a2b4a9] hover:text-white hover:border-[#2d4235] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#3cff5f]" />
              New
            </button>

            {/* 1-Click Copy */}
            <button
              type="button"
              onClick={handleCopyRichText}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#142319] border border-[#233829] text-xs font-bold text-white hover:border-[#3cff5f]/70 transition-all cursor-pointer"
            >
              {copiedType === "rich" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#3cff5f]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#3cff5f]" />
                  <span>Copy Formatted</span>
                </>
              )}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3cff5f] text-black font-extrabold text-xs shadow-lg shadow-[#3cff5f]/20 hover:bg-[#34e253] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export &amp; Download</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {exportMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#233829] bg-[#0c1410] p-2 shadow-2xl z-50">
                    <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#8da096]">
                      Export Formats
                    </p>
                    <button
                      type="button"
                      onClick={handleExportDocx}
                      disabled={isExporting}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#142319] text-left text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#3cff5f]" />
                        Microsoft Word (.docx)
                      </span>
                      <span className="text-[10px] text-[#3cff5f] font-mono">OpenXML</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#142319] text-left text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Printer className="w-4 h-4 text-[#60a5fa]" />
                        Save as PDF / Print
                      </span>
                      <span className="text-[10px] text-[#60a5fa] font-mono">PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportHtml}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#142319] text-left text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#f5a524]" />
                        Web Page (.html)
                      </span>
                      <span className="text-[10px] text-[#8da096] font-mono">HTML5</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportMarkdown}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#142319] text-left text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#c084fc]" />
                        Markdown (.md)
                      </span>
                      <span className="text-[10px] text-[#8da096] font-mono">GFM</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportText}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#142319] text-left text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#94a3b8]" />
                        Plain Text (.txt)
                      </span>
                      <span className="text-[10px] text-[#8da096] font-mono">TXT</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-[#101914] border border-[#1e2d24] text-[#a2b4a9] hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {status && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-[#142319] border border-[#233829] text-xs text-[#3cff5f] flex items-center justify-between">
            <span>{status}</span>
            <button
              type="button"
              onClick={() => setStatus("")}
              className="text-[#8da096] hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Editor Main Card */}
      <div className="rounded-3xl border border-[#1e2d24] bg-[#080d0a] shadow-2xl overflow-hidden">
        {/* Full Feature Rich Text Toolbar */}
        <div className="border-b border-[#1c2921] bg-[#0c1410] p-2.5 sm:p-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Font Family Picker */}
          <select
            value={activeFont}
            onChange={(e) => handleFontChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#142319] border border-[#233829] text-xs font-medium text-white focus:outline-none focus:border-[#3cff5f]/50 cursor-pointer"
            title="Font Family"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Font Size Picker */}
          <select
            value={activeFontSize}
            onChange={(e) => {
              setActiveFontSize(e.target.value);
              execCmd("fontSize", "3"); // base command
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#142319] border border-[#233829] text-xs font-medium text-white focus:outline-none focus:border-[#3cff5f]/50 cursor-pointer"
            title="Font Size"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Paragraph Style Selector */}
          <select
            onChange={(e) => {
              if (e.target.value) setHeading(e.target.value);
            }}
            defaultValue="p"
            className="px-2.5 py-1.5 rounded-lg bg-[#142319] border border-[#233829] text-xs font-medium text-white focus:outline-none focus:border-[#3cff5f]/50 cursor-pointer"
            title="Heading / Style"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="blockquote">Quote Callout</option>
          </select>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Core Formatting (B, I, U, S) */}
          <button
            type="button"
            onClick={() => execCmd("bold")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] active:bg-[#1f3325] transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("italic")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] active:bg-[#1f3325] transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("underline")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] active:bg-[#1f3325] transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("strikeThrough")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] active:bg-[#1f3325] transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Text Color Picker */}
          <div className="relative flex items-center gap-1">
            <label className="text-[10px] text-[#8da096] uppercase font-bold">Color:</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleTextColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-[#233829] bg-transparent"
              title="Text Color"
            />
          </div>

          {/* Highlight Picker */}
          <div className="relative flex items-center gap-1">
            <label className="text-[10px] text-[#8da096] uppercase font-bold">Highlight:</label>
            <select
              value={highlightColor}
              onChange={(e) => handleHighlight(e.target.value)}
              className="px-2 py-1 rounded bg-[#142319] border border-[#233829] text-[11px] text-white cursor-pointer"
              title="Highlight Background"
            >
              <option value="transparent">None</option>
              <option value="#fef08a">Yellow</option>
              <option value="#bbf7d0">Green</option>
              <option value="#bae6fd">Cyan</option>
              <option value="#fbcfe8">Pink</option>
              <option value="#fed7aa">Orange</option>
            </select>
          </div>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => execCmd("justifyLeft")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyCenter")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyRight")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("justifyFull")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCmd("insertUnorderedList")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertOrderedList")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Insert Elements */}
          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4 text-[#3cff5f]" />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd("insertHorizontalRule")}
            className="p-1.5 sm:p-2 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319] transition-colors"
            title="Insert Divider"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-[#1f3026] mx-0.5" />

          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
              showFindReplace ? "bg-[#142319] text-[#3cff5f]" : "text-[#cbd5e1] hover:text-white hover:bg-[#142319]"
            }`}
            title="Find & Replace"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* View Mode Toggle */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "page" ? "web" : "page")}
              className="px-2.5 py-1 rounded-lg bg-[#142319] border border-[#233829] text-[11px] font-bold text-[#e7eee9] hover:border-[#3cff5f]/50 transition-colors"
              title="Toggle View Mode"
            >
              {viewMode === "page" ? "📄 Page View" : "🌐 Web View"}
            </button>

            <button
              type="button"
              onClick={() => execCmd("undo")}
              className="p-1.5 rounded-lg text-[#cbd5e1] hover:text-white hover:bg-[#142319]"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-[#f87171] hover:bg-[#2e1517] transition-colors"
              title="Clear Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Find & Replace Drawer */}
        {showFindReplace && (
          <div className="border-b border-[#1c2921] bg-[#101713] p-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8da096]">Find:</span>
              <input
                type="text"
                placeholder="Search text..."
                value={findText}
                onChange={(e) => {
                  setFindText(e.target.value);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleFind()}
                className="px-2.5 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-xs text-white placeholder-[#5d7367] focus:outline-none focus:border-[#3cff5f]"
              />
              <button
                type="button"
                onClick={handleFind}
                className="px-2.5 py-1 rounded-lg bg-[#142319] text-xs font-bold text-[#3cff5f] hover:bg-[#1b3323]"
              >
                Find
              </button>
              {matchCount > 0 && (
                <span className="text-xs text-[#3cff5f] font-mono">({matchCount} found)</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8da096]">Replace:</span>
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#0c1410] border border-[#233829] text-xs text-white placeholder-[#5d7367] focus:outline-none focus:border-[#3cff5f]"
              />
              <button
                type="button"
                onClick={handleReplaceAll}
                className="px-2.5 py-1 rounded-lg bg-[#3cff5f] text-xs font-bold text-black hover:bg-[#34e253]"
              >
                Replace All
              </button>
            </div>
          </div>
        )}

        {/* Editor Document Canvas */}
        <div className="p-4 sm:p-8 bg-[#090e0b] overflow-x-auto min-h-[600px] flex justify-center">
          <div
            className={`transition-all duration-200 ${
              viewMode === "page"
                ? "w-full max-w-[850px] min-h-[1050px] bg-white text-[#1e293b] rounded-lg shadow-2xl p-10 sm:p-16 border border-slate-200"
                : "w-full max-w-4xl min-h-[600px] bg-white text-[#1e293b] rounded-2xl p-8 sm:p-12 shadow-xl border border-slate-200"
            }`}
            style={{
              fontFamily: activeFont,
              fontSize: activeFontSize,
              lineHeight: 1.7,
            }}
          >
            {/* Native editable document surface */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={updateStats}
              className="word-document-canvas focus:outline-none min-h-[800px]"
              style={{
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Live Document Metrics Bar */}
        <div className="border-t border-[#1c2921] bg-[#0c1410] px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs text-[#8da096]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <span className="flex items-center gap-1.5">
              <strong className="text-white font-bold">{stats.words}</strong> words
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-white font-bold">{stats.chars}</strong> characters
            </span>
            <span className="flex items-center gap-1.5 hidden sm:inline-flex">
              <strong className="text-white font-bold">{stats.paragraphs}</strong> paragraphs
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#3cff5f]" />
              ~{stats.readingTime} min read
            </span>
            <span className="flex items-center gap-1.5 hidden md:inline-flex">
              <BookOpen className="w-3.5 h-3.5 text-[#60a5fa]" />
              ~{stats.pagesEst} pages (A4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#3cff5f] font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3cff5f] animate-pulse" />
              100% In-Browser Privacy
            </span>
          </div>
        </div>
      </div>

      {/* Insert Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#233829] bg-[#0c1410] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-[#3cff5f]" />
              Insert Table
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8da096] mb-1">Rows:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#142319] border border-[#233829] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#8da096] mb-1">Columns:</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#142319] border border-[#233829] text-white text-sm focus:outline-none focus:border-[#3cff5f]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-[#8da096] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  className="px-4 py-2 rounded-xl bg-[#3cff5f] text-black font-bold text-xs hover:bg-[#34e253]"
                >
                  Insert Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles for Word Document Rendering */}
      <style jsx global>{`
        .word-document-canvas h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.4rem;
          line-height: 1.25;
        }
        .word-document-canvas h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }
        .word-document-canvas h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.4rem;
        }
        .word-document-canvas p {
          margin: 0.75rem 0;
          color: #1e293b;
        }
        .word-document-canvas ul,
        .word-document-canvas ol {
          padding-left: 1.75rem;
          margin: 0.75rem 0;
        }
        .word-document-canvas li {
          margin-bottom: 0.35rem;
        }
        .word-document-canvas blockquote {
          border-left: 4px solid #3cff5f;
          padding-left: 1rem;
          margin: 1.25rem 0;
          color: #475569;
          font-style: italic;
          background: #f8fafc;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          border-radius: 0 8px 8px 0;
        }
        .word-document-canvas table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.9rem;
        }
        .word-document-canvas th,
        .word-document-canvas td {
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          text-align: left;
        }
        .word-document-canvas th {
          background-color: #f1f5f9;
          font-weight: 700;
          color: #0f172a;
        }
        .word-document-canvas hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 1.5rem 0;
        }
        .word-document-canvas code {
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.88em;
          color: #0f172a;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          .word-document-canvas,
          .word-document-canvas * {
            visibility: visible;
          }
          .word-document-canvas {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 20mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}

