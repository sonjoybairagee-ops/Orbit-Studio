"use client";

import { useState } from "react";
import { getCharacterStats, CharacterStats } from "@/lib/text-utils";
import { 
  FileText, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  Share2,
  AlertCircle 
} from "lucide-react";

const SAMPLE_TEXT = `Character Counter lets you monitor real-time text length for social media posts, meta tags, and SMS messages with precision breakdown.`;

export default function CharacterCounterTool() {
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const stats: CharacterStats = getCharacterStats(text);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  const socialPlatforms = [
    { name: "Twitter / X Post", limit: 280 },
    { name: "SEO Meta Description", limit: 160 },
    { name: "SMS Message", limit: 160 },
    { name: "Instagram Caption", limit: 2200 },
    { name: "LinkedIn Post", limit: 3000 },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top character stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-4 text-center">
          <span className="text-xs font-semibold text-indigo-700">Total Characters</span>
          <div className="text-2xl font-black text-indigo-900 mt-1">{stats.total}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Without Spaces</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.withoutSpaces}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Letters</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.letters}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Digits (0-9)</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.digits}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Spaces / Tabs</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.whitespace}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Punctuation</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.punctuation}</div>
        </div>
      </div>

      {/* Editor & Social Trackers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-700">Live Text Input</span>
              <div className="flex items-center gap-2">
                {!text && (
                  <button
                    type="button"
                    onClick={() => setText(SAMPLE_TEXT)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Sample Text</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-30 shadow-2xs transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={!text}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type text to inspect detailed character composition and platform limits..."
              className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Social Media Character Limits */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Share2 className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Platform Limits</h3>
          </div>

          <div className="space-y-4">
            {socialPlatforms.map((p) => {
              const remaining = p.limit - stats.total;
              const percent = Math.min(100, Math.round((stats.total / p.limit) * 100));
              const isOver = remaining < 0;

              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{p.name}</span>
                    <span
                      className={`font-mono font-bold ${
                        isOver ? "text-red-600" : remaining <= 20 ? "text-amber-600" : "text-slate-500"
                      }`}
                    >
                      {stats.total}/{p.limit} ({isOver ? `${Math.abs(remaining)} over` : `${remaining} left`})
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-200 ${
                        isOver
                          ? "bg-red-500"
                          : percent > 85
                          ? "bg-amber-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
