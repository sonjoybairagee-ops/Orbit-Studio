"use client";

import { useState, useMemo, useRef } from "react";
import {
  FileText,
  Copy,
  Check,
  Download,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Table,
  Eye,
  Columns,
  Maximize2,
  Trash2,
  Sparkles,
} from "lucide-react";

const SAMPLE_MARKDOWN = `# 🚀 Project Overview & Documentation

Welcome to **ToolHub**, the ultimate client-side productivity suite! All processing runs securely in your browser with **zero server uploads**.

> [!NOTE]
> This editor supports full **GitHub Flavored Markdown (GFM)**, including task lists, tables, callouts, and code blocks.

---

## ⚡ Key Features

- **Fast & Private:** 100% in-browser processing with client-side Web APIs.
- **Clean Interface:** Designed with curated pastel themes and dark-mode friendly tokens.
- **Export Everywhere:** Download rendered HTML or standard Markdown files.

### 📋 Interactive Task Checklist

- [x] Implement Unit Converter with 10+ categories
- [x] Add World Clock & Time Zone Planner
- [x] Build Work Hours & Timesheet Calculator
- [x] Integrate Markdown Live Previewer
- [ ] Add PDF signature support

---

## 📊 Feature Comparison Matrix

| Feature | ToolHub | Traditional Web Tools |
| :--- | :---: | :---: |
| **Privacy** | 🔒 100% Client-Side | ⚠️ Uploads to server |
| **Offline Mode** | ✅ Fully Supported | ❌ Requires connection |
| **File Limits** | ♾️ No file size limits | ⚠️ Strict 10MB limits |
| **Pricing** | 💸 100% Free Forever | 💳 Monthly Subscriptions |

---

## 💻 Sample Code Block

\`\`\`typescript
interface UserProfile {
  id: string;
  username: string;
  isPremium: boolean;
}

export function formatGreeting(user: UserProfile): string {
  return \`Welcome back, \${user.username}!\`;
}
\`\`\`

> *"Simplicity is prerequisite for reliability."* — Edsger W. Dijkstra
`;

// Helper: Custom lightweight yet complete Markdown to HTML Parser
function renderMarkdownToHtml(md: string): string {
  if (!md) return "";

  let html = md;

  // 1. Code blocks (```lang ... ```)
  const codeBlocks: string[] = [];
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<div class="my-4 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-xs">
        <div class="flex items-center justify-between px-4 py-1.5 bg-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <span>${lang || "code"}</span>
        </div>
        <pre class="p-4 overflow-x-auto"><code>${escapedCode}</code></pre>
      </div>`
    );
    return placeholder;
  });

  // 2. Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 text-pink-600 px-1.5 py-0.5 font-mono text-xs border border-slate-200">$1</code>');

  // 3. GitHub Callout Alerts (> [!NOTE], > [!TIP], > [!WARNING])
  html = html.replace(
    /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n([\s\S]*?)(?=\n\n|$)/gim,
    (_, type, content) => {
      const t = type.toUpperCase();
      let border = "border-blue-500 bg-blue-50 text-blue-900";
      if (t === "TIP") border = "border-emerald-500 bg-emerald-50 text-emerald-900";
      if (t === "WARNING" || t === "CAUTION") border = "border-amber-500 bg-amber-50 text-amber-900";
      if (t === "IMPORTANT") border = "border-purple-500 bg-purple-50 text-purple-900";

      return `<div class="my-4 rounded-xl border-l-4 p-4 text-xs ${border}">
        <div class="font-bold uppercase tracking-wider mb-1">${t}</div>
        <div>${content.replace(/^>\s*/gm, "")}</div>
      </div>`;
    }
  );

  // 4. Blockquotes (> quote)
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-slate-300 pl-4 py-1 my-3 text-slate-600 italic text-sm">$1</blockquote>');

  // 5. Headings (# H1 to ###### H6)
  html = html.replace(/^######\s+(.+)$/gm, '<h6 class="text-xs font-bold text-slate-900 mt-4 mb-1 uppercase tracking-wider">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="text-sm font-bold text-slate-900 mt-4 mb-2">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 class="text-base font-bold text-slate-900 mt-5 mb-2">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-lg font-bold text-slate-900 mt-6 mb-2 border-b border-slate-100 pb-1">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl sm:text-2xl font-extrabold text-slate-900 mt-8 mb-3 border-b border-slate-200 pb-2">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-2xl sm:text-3xl font-black text-slate-900 mt-6 mb-4">$1</h1>');

  // 6. Horizontal Rules (--- or ***)
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr class="my-6 border-slate-200" />');

  // 7. Tables (| Col 1 | Col 2 |)
  html = html.replace(/((?:^\|.+?\|\s*\n?)+)/gm, (tableMatch) => {
    const lines = tableMatch.trim().split("\n");
    if (lines.length < 2) return tableMatch;

    const headerCols = lines[0].split("|").slice(1, -1).map((c) => c.trim());
    // skip separator line lines[1]
    const bodyRows = lines.slice(2).map((l) =>
      l.split("|").slice(1, -1).map((c) => c.trim())
    );

    let tableHtml = `<div class="my-4 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
      <table class="w-full text-left text-xs border-collapse">
        <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
          <tr>
            ${headerCols.map((h) => `<th class="py-2.5 px-4">${h}</th>`).join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${bodyRows
            .map(
              (r) =>
                `<tr class="hover:bg-slate-50/50">${r
                  .map((cell) => `<td class="py-2.5 px-4 text-slate-700">${cell}</td>`)
                  .join("")}</tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
    return tableHtml;
  });

  // 8. Task lists (- [x] or - [ ])
  html = html.replace(/^-\s+\[([ xX])\]\s+(.+)$/gm, (_, checked, label) => {
    const isChecked = checked.toLowerCase() === "x";
    return `<div class="flex items-center gap-2 my-1 text-xs sm:text-sm ${isChecked ? "text-slate-400 line-through" : "text-slate-700"}">
      <input type="checkbox" disabled ${isChecked ? "checked" : ""} class="rounded text-blue-600 h-4 w-4" />
      <span>${label}</span>
    </div>`;
  });

  // 9. Unordered Lists (- or *)
  html = html.replace(/^\s*[-*]\s+(.+)$/gm, '<li class="text-xs sm:text-sm text-slate-700 leading-relaxed">$1</li>');
  html = html.replace(/((?:<li class="[^"]*">[\s\S]*?<\/li>\s*)+)/g, '<ul class="list-disc pl-5 my-3 space-y-1">$1</ul>');

  // 10. Ordered Lists (1. 2. 3.)
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="text-xs sm:text-sm text-slate-700 leading-relaxed">$1</li>');

  // 11. Bold, Italic, Strikethrough
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.*?)~~/g, "<del class='line-through text-slate-400'>$1</del>");

  // 12. Images and Links
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl border my-4 max-h-96 object-cover" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline font-semibold hover:text-blue-800">$1</a>');

  // 13. Paragraphs (lines separated by double newlines)
  html = html.split(/\n\s*\n/).map((block) => {
    if (
      block.startsWith("<div") ||
      block.startsWith("<h") ||
      block.startsWith("<ul") ||
      block.startsWith("<blockquote") ||
      block.startsWith("<hr") ||
      block.startsWith("<table") ||
      block.startsWith("__CODE_BLOCK")
    ) {
      return block;
    }
    return `<p class="my-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">${block.trim()}</p>`;
  }).join("\n");

  // Restore code blocks
  codeBlocks.forEach((cb, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, cb);
  });

  return html;
}

export default function MarkdownPreviewerTool() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rendered HTML
  const renderedHtml = useMemo(() => renderMarkdownToHtml(markdown), [markdown]);

  // Statistics
  const stats = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
    const readingTimeMins = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readingTimeMins };
  }, [markdown]);

  // Toolbar Insert Action
  const insertSyntax = (before: string, after: string = "", defaultText: string = "text") => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = markdown.substring(start, end) || defaultText;
    const replacement = `${before}${selected}${after}`;

    const newMd = markdown.substring(0, start) + replacement + markdown.substring(end);
    setMarkdown(newMd);

    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 10);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopiedKey("md");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderedHtml);
    setCopiedKey("html");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rendered Markdown</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
    pre { background: #1e293b; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
    th { background: #f1f5f9; }
    blockquote { border-left: 4px solid #94a3b8; margin: 0; padding-left: 16px; color: #64748b; font-style: italic; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Modes */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                GitHub Markdown Editor & Live Previewer
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span>{stats.words.toLocaleString()} words</span>
                <span>•</span>
                <span>{stats.chars.toLocaleString()} characters</span>
                <span>•</span>
                <span>~{stats.readingTimeMins} min read</span>
              </div>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl bg-slate-100 p-1 mr-1">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  viewMode === "edit" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  viewMode === "split" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  viewMode === "preview" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copiedKey === "md" ? <Check className="h-3.5 w-3.5 text-emerald-600 inline mr-1" /> : <Copy className="h-3.5 w-3.5 inline mr-1" />}
              {copiedKey === "md" ? "Copied MD!" : "Copy MD"}
            </button>
            <button
              type="button"
              onClick={handleCopyHtml}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copiedKey === "html" ? <Check className="h-3.5 w-3.5 text-emerald-600 inline mr-1" /> : <Copy className="h-3.5 w-3.5 inline mr-1" />}
              {copiedKey === "html" ? "Copied HTML!" : "Copy HTML"}
            </button>
            <button
              type="button"
              onClick={handleDownloadMd}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5 inline mr-1" />
              Download .md
            </button>
          </div>
        </div>

        {/* Markdown Toolbar */}
        <div className="flex flex-wrap items-center gap-1 text-slate-600 pt-1">
          <button
            type="button"
            onClick={() => insertSyntax("**", "**", "bold text")}
            title="Bold"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("*", "*", "italic text")}
            title="Italic"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("~~", "~~", "strikethrough text")}
            title="Strikethrough"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => insertSyntax("# ", "", "Heading 1")}
            title="Heading 1"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("## ", "", "Heading 2")}
            title="Heading 2"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => insertSyntax("`", "`", "code")}
            title="Inline Code"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Code className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("> ", "", "Quote text")}
            title="Blockquote"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Quote className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("- ", "", "List item")}
            title="Unordered List"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("1. ", "", "Ordered item")}
            title="Numbered List"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("- [ ] ", "", "Task to do")}
            title="Task List"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <CheckSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSyntax("[", "](https://example.com)", "link text")}
            title="Link"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSyntax(
                "\n| Header 1 | Header 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |\n",
                "",
                ""
              )
            }
            title="Table"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700"
          >
            <Table className="h-4 w-4" />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMarkdown(SAMPLE_MARKDOWN)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Sample
            </button>
            <button
              type="button"
              onClick={() => setMarkdown("")}
              className="text-xs text-slate-400 hover:text-rose-600"
              title="Clear"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Panes */}
      <div
        className={`grid gap-6 ${
          viewMode === "split"
            ? "grid-cols-1 lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* Editor Pane */}
        {(viewMode === "split" || viewMode === "edit") && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Markdown Source
              </span>
              <span className="text-[11px] text-slate-400 font-mono">GFM Syntax</span>
            </div>
            <textarea
              ref={textareaRef}
              rows={24}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type or paste your Markdown here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Live Rendered HTML Preview
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Live Sync
              </span>
            </div>
            <div
              className="prose prose-slate max-w-none min-h-[500px] max-h-[620px] overflow-y-auto p-4 rounded-2xl border border-slate-100 bg-slate-50/30"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
