"use client";

import { useState } from "react";
import { getWordStats, WordStats } from "@/lib/text-utils";
import { 
  Type, 
  Copy, 
  Check, 
  Trash2, 
  Clock, 
  Mic, 
  BookOpen, 
  Hash, 
  Sparkles 
} from "lucide-react";

const SAMPLE_TEXT = `Welcome to iformat.io! This free online word counter lets you analyze text length, calculate estimated reading and speaking time, and check keyword density in real-time. Whether you are writing a blog article, an academic paper, or a social media post, our client-side tools give you instant, secure results without storing your text on any server.`;

export default function WordCounterTool() {
  const [text, setText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const stats: WordStats = getWordStats(text);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  const handleSample = () => {
    setText(SAMPLE_TEXT);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 text-center">
          <span className="text-xs font-semibold text-blue-700">Words</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{stats.words}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Characters</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.characters}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">No Spaces</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.charactersNoSpaces}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Sentences</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.sentences}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">Paragraphs</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{stats.paragraphs}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-center">
          <span className="text-xs font-semibold text-emerald-700">Reading Time</span>
          <div className="text-xl font-black text-emerald-900 mt-1">
            {stats.readingTimeMin} {stats.readingTimeMin === 1 ? "min" : "mins"}
          </div>
        </div>
      </div>

      {/* Main Textarea Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-700">Live Editor</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{stats.readingTimeMin}m read</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Mic className="h-3.5 w-3.5" />
              <span>{stats.speakingTimeMin}m speak</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!text && (
              <button
                type="button"
                onClick={handleSample}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Load Sample</span>
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
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to count words, characters, and reading time in real-time..."
          className="w-full resize-y text-slate-800 placeholder:text-slate-400 focus:outline-hidden text-sm leading-relaxed"
        />

        {/* Keyword Density / Top Words */}
        {stats.topWords.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Most Frequent Keywords:
            </span>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map((item) => (
                <span
                  key={item.word}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                >
                  <span className="font-bold text-slate-900">{item.word}</span>
                  <span className="text-[11px] text-slate-400">
                    ({item.count}x • {item.density}%)
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
