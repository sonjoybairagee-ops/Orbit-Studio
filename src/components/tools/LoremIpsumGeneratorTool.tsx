"use client";

import { useState, useEffect, useCallback } from "react";
import { AlignLeft, Copy, Check, Download, RefreshCw } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do",
  "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim",
  "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip",
  "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat",
  "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
  "architecto", "beatae", "vitae", "dicta", "explicabo", "nemo", "ipsam", "voluptatem", "quia", "voluptas",
  "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni", "dolores", "ratione", "sequi", "nesciunt"
];

const DEFAULT_LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

export default function LoremIpsumGeneratorTool() {
  const [type, setType] = useState<"paragraphs" | "sentences" | "words" | "lists">("paragraphs");
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [wrapHtml, setWrapHtml] = useState<boolean>(false);
  const [output, setOutput] = useState<string>(DEFAULT_LOREM);
  const [copied, setCopied] = useState<boolean>(false);

  const generate = useCallback(() => {
    const generateWords = (num: number): string[] => {
      const list: string[] = [];
      for (let i = 0; i < num; i++) {
        list.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      return list;
    };

    const generateSentence = (): string => {
      const len = Math.floor(Math.random() * 8) + 8;
      const words = generateWords(len);
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      return words.join(" ") + ".";
    };

    const generateParagraph = (): string => {
      const numSentences = Math.floor(Math.random() * 4) + 4;
      const sentences: string[] = [];
      for (let i = 0; i < numSentences; i++) {
        sentences.push(generateSentence());
      }
      return sentences.join(" ");
    };

    let result = "";
    if (type === "words") {
      const w = generateWords(count);
      if (startWithLorem && count >= 8) {
        w[0] = "Lorem";
        w[1] = "ipsum";
        w[2] = "dolor";
        w[3] = "sit";
        w[4] = "amet,";
        w[5] = "consectetur";
        w[6] = "adipiscing";
        w[7] = "elit";
      }
      result = w.join(" ");
    } else if (type === "sentences") {
      const s: string[] = [];
      for (let i = 0; i < count; i++) {
        s.push(generateSentence());
      }
      if (startWithLorem && s.length > 0) {
        s[0] = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + s[0];
      }
      result = wrapHtml ? s.map((sent) => `<p>${sent}</p>`).join("\n") : s.join(" ");
    } else if (type === "lists") {
      const items: string[] = [];
      for (let i = 0; i < count; i++) {
        items.push(generateWords(Math.floor(Math.random() * 6) + 3).join(" "));
      }
      result = wrapHtml
        ? `<ul>\n${items.map((it) => `  <li>${it}</li>`).join("\n")}\n</ul>`
        : items.map((it, i) => `${i + 1}. ${it}`).join("\n");
    } else {
      const p: string[] = [];
      for (let i = 0; i < count; i++) {
        p.push(generateParagraph());
      }
      if (startWithLorem && p.length > 0) {
        p[0] =
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
          p[0];
      }
      result = wrapHtml ? p.map((para) => `<p>${para}</p>`).join("\n\n") : p.join("\n\n");
    }
    setOutput(result);
  }, [type, count, startWithLorem, wrapHtml]);

  useEffect(() => {
    generate();
  }, [generate]);

  const wordCount = output.trim() ? output.trim().split(/\s+/).length : 0;
  const charCount = output.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lorem-ipsum.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Generation Type */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Generate</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-amber-500"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
              <option value="lists">List Items</option>
            </select>
          </div>

          {/* Count */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Quantity ({count})</label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-amber-500"
            />
          </div>

          {/* Options */}
          <div className="sm:col-span-2 flex flex-col justify-end gap-2.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <span>Start with &quot;Lorem ipsum dolor sit amet...&quot;</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wrapHtml}
                onChange={(e) => setWrapHtml(e.target.checked)}
                className="rounded accent-amber-600"
              />
              <span>Wrap in HTML tags (&lt;p&gt;, &lt;ul&gt;, &lt;li&gt;)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download .txt
            </button>
          </div>
        </div>

        <textarea
          readOnly
          value={output}
          rows={12}
          className="w-full font-serif text-sm text-slate-800 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-200 focus:outline-amber-500 resize-y"
        />
      </div>
    </div>
  );
}
