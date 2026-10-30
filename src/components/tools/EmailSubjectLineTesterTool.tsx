"use client";

import { useState, useMemo } from "react";
import {
  Mail,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Monitor,
  Flame,
  Zap,
} from "lucide-react";

const SPAM_WORDS = [
  "100% free",
  "act now",
  "apply now",
  "as seen on",
  "buy direct",
  "call now",
  "cash bonus",
  "cheap",
  "clearance",
  "click here",
  "congratulations",
  "credit card offers",
  "cure",
  "deal",
  "direct email",
  "discount",
  "double your",
  "earn extra cash",
  "earn money",
  "eliminate debt",
  "extra income",
  "fast cash",
  "financial freedom",
  "free gift",
  "free info",
  "free investment",
  "free trial",
  "get out of debt",
  "get paid",
  "giveaway",
  "guaranteed",
  "hidden assets",
  "increase sales",
  "instant cash",
  "limited time",
  "lowest price",
  "make money",
  "million dollars",
  "miracle",
  "money back",
  "no catch",
  "no cost",
  "no credit check",
  "no fees",
  "no gimmick",
  "no obligation",
  "no purchase necessary",
  "no risk",
  "no strings attached",
  "not spam",
  "one time",
  "online marketing",
  "open immediately",
  "order now",
  "passwords",
  "pennies a day",
  "potential earnings",
  "prize",
  "promise",
  "pure profit",
  "refund",
  "remove",
  "reverses",
  "risk-free",
  "save big",
  "score",
  "see for yourself",
  "send $",
  "special promotion",
  "terms and conditions",
  "unlimited",
  "urgent",
  "valuable",
  "viagra",
  "warrantee",
  "warranty",
  "weight loss",
  "while supplies last",
  "win",
  "winner",
  "winning",
];

const POWER_WORDS = [
  "exclusive",
  "secret",
  "proven",
  "boost",
  "discover",
  "reveal",
  "breakthrough",
  "limited",
  "ultimate",
  "unlock",
  "essential",
  "insider",
  "quick",
  "effortless",
  "transform",
  "master",
  "announcing",
  "sneak peek",
  "invitation",
  "vip",
];

const QUICK_EMOJIS = ["🔥", "🚀", "⚡", "✨", "💡", "🎯", "🎉", "📈", "🎁", "⏰", "👀", "🙌"];

export default function EmailSubjectLineTesterTool() {
  const [subject, setSubject] = useState<string>(
    "🚀 Discover 5 Proven Strategies to Boost Your App Conversions"
  );
  const [senderName, setSenderName] = useState<string>("ToolHub Team");
  const [copied, setCopied] = useState<boolean>(false);

  // Analysis
  const analysis = useMemo(() => {
    const raw = subject.trim();
    const chars = raw.length;
    const words = raw ? raw.split(/\s+/).length : 0;

    // Check for spam words
    const lower = raw.toLowerCase();
    const detectedSpam = SPAM_WORDS.filter((sw) => lower.includes(sw));

    // Check for power words
    const detectedPower = POWER_WORDS.filter((pw) => lower.includes(pw));

    // Check emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = raw.match(emojiRegex) || [];

    // All Caps Check
    const uppercaseLetters = (raw.match(/[A-Z]/g) || []).length;
    const totalLetters = (raw.match(/[a-zA-Z]/g) || []).length;
    const isShouting = totalLetters > 6 && uppercaseLetters / totalLetters > 0.6;

    // Punctuation check
    const excessPunctuation = /(!{2,}|\?{2,})/.test(raw);

    // Scoring Algorithm (0 to 100)
    let score = 50;

    // Character length (optimal 35-50 for mobile, 40-60 desktop)
    if (chars >= 30 && chars <= 55) {
      score += 25;
    } else if (chars >= 20 && chars <= 70) {
      score += 15;
    } else {
      score -= 10;
    }

    // Word count (optimal 5-9 words)
    if (words >= 5 && words <= 9) {
      score += 15;
    } else if (words >= 4 && words <= 12) {
      score += 8;
    }

    // Power words reward
    if (detectedPower.length > 0) {
      score += Math.min(15, detectedPower.length * 8);
    }

    // Emoji reward (1 or 2 is optimal)
    if (emojis.length >= 1 && emojis.length <= 2) {
      score += 10;
    } else if (emojis.length > 3) {
      score -= 10;
    }

    // Penalties
    if (detectedSpam.length > 0) {
      score -= detectedSpam.length * 15;
    }
    if (isShouting) {
      score -= 25;
    }
    if (excessPunctuation) {
      score -= 15;
    }

    score = Math.min(100, Math.max(10, score));

    // Grade label
    let grade = "C";
    let gradeColor = "text-amber-600 bg-amber-50 border-amber-200";
    if (score >= 85) {
      grade = "A+";
      gradeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    } else if (score >= 70) {
      grade = "B";
      gradeColor = "text-blue-700 bg-blue-50 border-blue-200";
    }

    return {
      chars,
      words,
      detectedSpam,
      detectedPower,
      emojis,
      isShouting,
      excessPunctuation,
      score,
      grade,
      gradeColor,
      mobileCutoff: chars > 41 ? subject.slice(0, 41) + "..." : subject,
      desktopCutoff: chars > 70 ? subject.slice(0, 70) + "..." : subject,
    };
  }, [subject]);

  const handleInsertEmoji = (emoji: string) => {
    setSubject((prev) => `${emoji} ${prev}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Input & Score Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Pane (8 cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xl font-extrabold text-slate-900">
              Email Subject Line Analyzer
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Subject"}
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Enter Email Subject Line
            </label>
            <div className="relative">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. 5 Proven Ways to Grow Your Business in 2026"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 px-4 text-base sm:text-lg font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* Quick Emojis & Sender Name */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold mr-1">Add Emoji:</span>
              {QUICK_EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleInsertEmoji(em)}
                  className="h-8 w-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-sm transition-transform active:scale-95"
                >
                  {em}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sender:</span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Key Metrics Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Characters</span>
              <div className="font-mono text-2xl font-black text-slate-900 mt-0.5">
                {analysis.chars}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Optimal: 35-50</span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Words</span>
              <div className="font-mono text-2xl font-black text-slate-900 mt-0.5">
                {analysis.words}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Optimal: 6-10</span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Power Words</span>
              <div className="font-mono text-2xl font-black text-purple-700 mt-0.5">
                {analysis.detectedPower.length}
              </div>
              <span className="text-[10px] text-purple-600 font-medium">Boosts Open Rate</span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Spam Words</span>
              <div
                className={`font-mono text-2xl font-black mt-0.5 ${
                  analysis.detectedSpam.length > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {analysis.detectedSpam.length}
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Goal: 0 flags</span>
            </div>
          </div>
        </div>

        {/* Right Scorecard (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Deliverability Score
          </span>

          <div className="relative flex items-center justify-center my-2">
            <div className="flex flex-col items-center justify-center h-36 w-36 rounded-full border-4 border-slate-100 shadow-inner bg-slate-50/50">
              <span className="font-mono text-4xl sm:text-5xl font-black text-slate-900">
                {analysis.score}
              </span>
              <span className="text-[11px] font-bold text-slate-400 mt-1 uppercase">/ 100</span>
            </div>
          </div>

          <div className="space-y-2">
            <span
              className={`inline-block font-mono text-sm font-black px-3.5 py-1 rounded-full border ${analysis.gradeColor}`}
            >
              Grade {analysis.grade} Subject Line
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              {analysis.score >= 80
                ? "Excellent! High open-rate potential with balanced length and emotional hooks."
                : analysis.score >= 60
                ? "Good subject line, but could be tightened for better mobile inbox visibility."
                : "Needs optimization. Remove spam triggers or reduce character length."}
            </p>
          </div>
        </div>
      </div>

      {/* Inbox Mockup Previews */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Live Inbox Cutoff Simulation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mobile Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-blue-600" />
                Mobile Gmail / Apple Mail (~41 chars)
              </span>
              <span className="font-mono text-[10px] text-slate-400">375px viewport</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{senderName}</span>
                <span className="text-[10px] text-slate-400">10:45 AM</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {analysis.mobileCutoff}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Click to read the latest product announcement and case study...
              </div>
            </div>
          </div>

          {/* Desktop Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Monitor className="h-4 w-4 text-emerald-600" />
                Desktop Outlook / Gmail (~70 chars)
              </span>
              <span className="font-mono text-[10px] text-slate-400">Desktop viewport</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">{senderName}</span>
                <span className="text-[10px] text-slate-400">Today</span>
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {analysis.desktopCutoff}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Click to read the latest product announcement and case study...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
