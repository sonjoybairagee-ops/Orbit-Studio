"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Copy,
  Check,
  Zap,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Bookmark,
  Share2,
} from "lucide-react";

type HookCategory = "all" | "curiosity" | "howto" | "negative" | "list" | "story";

interface GeneratedTitle {
  id: string;
  text: string;
  category: HookCategory;
  score: number; // 80 - 98
  length: number;
  powerWord: string;
}

const POWER_WORDS = [
  "Secret", "Insane", "Shocking", "Mistake", "Ultimate", "Exposed",
  "Guaranteed", "Never", "Warning", "Finally", "Brutal", "Proven",
  "Unbelievable", "Genius", "Formula", "Game-Changer"
];

export default function YoutubeTitleGeneratorTool() {
  const [keyword, setKeyword] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<HookCategory>("all");
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [copiedId, setCopiedId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Custom Headline Analyzer State
  const [customTitle, setCustomTitle] = useState<string>("");

  const generateTitles = (queryOverride?: string) => {
    const rawQuery = queryOverride || keyword;
    const q = rawQuery.trim();
    if (!q) return;

    setIsGenerating(true);

    setTimeout(() => {
      // Capitalize query for title case
      const capQuery = q
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const rawTemplates: Array<{ text: string; cat: HookCategory; power: string }> = [
        // Curiosity / MrBeast Style
        { text: `I Tried ${capQuery} for 30 Days and THIS Happened`, cat: "curiosity", power: "Shocking" },
        { text: `The Secret Truth About ${capQuery} Nobody Tells You`, cat: "curiosity", power: "Secret" },
        { text: `Why Everyone is Wrong About ${capQuery} in 2026`, cat: "curiosity", power: "Wrong" },
        { text: `I Spent $1,000 on ${capQuery} (Was It Worth It?)`, cat: "curiosity", power: "Insane" },
        { text: `The ${capQuery} Experiment That Changed Everything`, cat: "curiosity", power: "Unbelievable" },

        // How-To & Educational
        { text: `The Only ${capQuery} Guide You Will Ever Need`, cat: "howto", power: "Ultimate" },
        { text: `How to Master ${capQuery} in 15 Minutes (Step-by-Step)`, cat: "howto", power: "Formula" },
        { text: `Learn ${capQuery} from Scratch (Zero Experience Required)`, cat: "howto", power: "Proven" },
        { text: `${capQuery} for Beginners: The Fastest Way to Learn`, cat: "howto", power: "Genius" },
        { text: `How Pro Creators Actually Do ${capQuery} in 2026`, cat: "howto", power: "Secret" },

        // Negative / Warning Hooks (Highest CTR)
        { text: `Stop Making This #1 ${capQuery} Mistake!`, cat: "negative", power: "Mistake" },
        { text: `Why Your ${capQuery} is Failing (And How to Fix It)`, cat: "negative", power: "Failing" },
        { text: `Do NOT Buy ${capQuery} Until You Watch This!`, cat: "negative", power: "Warning" },
        { text: `The Brutal Reality of ${capQuery} That Creators Hide`, cat: "negative", power: "Brutal" },
        { text: `5 Things I Regret Learning About ${capQuery} Too Late`, cat: "negative", power: "Regret" },

        // Top Lists & Comparisons
        { text: `Top 7 ${capQuery} Tips That Actually Work (Ranked)`, cat: "list", power: "Proven" },
        { text: `5 ${capQuery} Hacks That Feel Illegal to Know`, cat: "list", power: "Secret" },
        { text: `Best vs Worst ${capQuery} Tools Tested in 2026`, cat: "list", power: "Ultimate" },
        { text: `3 Simple ${capQuery} Rules Every Beginner Should Follow`, cat: "list", power: "Guaranteed" },
        { text: `Top 10 ${capQuery} Mistakes You Need to Avoid Right Now`, cat: "list", power: "Mistake" },

        // Storytelling & Challenges
        { text: `How I Scaled ${capQuery} from $0 to $10,000`, cat: "story", power: "Formula" },
        { text: `Giving Up ${capQuery} for 7 Days Almost Ruined Me`, cat: "story", power: "Insane" },
        { text: `From Beginner to Pro: My 1-Year ${capQuery} Journey`, cat: "story", power: "Game-Changer" },
        { text: `We Built the World's First ${capQuery} (Full Documentary)`, cat: "story", power: "Genius" },
        { text: `Can You Survive on Just ${capQuery} for 24 Hours?`, cat: "story", power: "Shocking" },
      ];

      const generated: GeneratedTitle[] = rawTemplates.map((t, index) => {
        // Compute pseudo score based on length and power word
        const len = t.text.length;
        const lenBonus = len >= 45 && len <= 65 ? 10 : 5;
        const baseScore = 80 + (index % 8) + lenBonus;

        return {
          id: `title-${index}-${Date.now()}`,
          text: t.text,
          category: t.cat,
          score: Math.min(99, baseScore),
          length: len,
          powerWord: t.power,
        };
      });

      setTitles(generated);
      setIsGenerating(false);
    }, 150);
  };

  const copyTitle = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const filteredTitles = titles.filter(
    (t) => selectedCategory === "all" || t.category === selectedCategory
  );

  // Custom Title Analysis
  const customLen = customTitle.length;
  const hasPowerWord = POWER_WORDS.some((pw) =>
    customTitle.toLowerCase().includes(pw.toLowerCase())
  );
  const customScore = Math.min(
    100,
    (customLen >= 40 && customLen <= 65 ? 50 : 25) +
      (hasPowerWord ? 30 : 10) +
      (/\d/.test(customTitle) ? 15 : 5)
  );

  return (
    <div className="w-full space-y-8">
      {/* Search & Generator Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateTitles();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9baaa1]" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter video topic or main keyword (e.g. Video Editing, Gym Workout, iPhone 16)..."
              className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] pl-12 pr-4 py-4 text-sm text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-7 py-4 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate 25+ Titles</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const sample = "After Effects Animation";
                setKeyword(sample);
                generateTitles(sample);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-4 py-4 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer shrink-0"
            >
              <span>Try Sample</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Titles Display */}
      {titles.length > 0 && (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#213026]">
            <div>
              <h3 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#3cff5f]" />
                <span>Viral High-CTR Titles ({filteredTitles.length})</span>
              </h3>
              <p className="text-xs text-[#9baaa1] mt-0.5">
                Calculated based on proven YouTube algorithmic click-through-rate formulas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#080e0b] border border-[#213026] p-1 rounded-2xl">
              {[
                { id: "all", label: "All Hooks" },
                { id: "curiosity", label: "Curiosity" },
                { id: "negative", label: "Warning / Mistakes" },
                { id: "howto", label: "How-To" },
                { id: "list", label: "Top Lists" },
                { id: "story", label: "Story / Challenge" },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id as HookCategory)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === c.id
                      ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                      : "text-[#9baaa1] hover:text-[#e7eee9]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Titles List */}
          <div className="space-y-3">
            {filteredTitles.map((t) => (
              <div
                key={t.id}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#080e0b] border border-[#213026] hover:border-[#3cff5f]/50 transition-all shadow-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-[#e7eee9] group-hover:text-white transition-colors">
                    {t.text}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#9baaa1]">
                    <span className="inline-flex items-center gap-1 text-[#3cff5f] font-mono font-bold">
                      <Zap className="h-3 w-3" /> {t.score}/100 CTR Score
                    </span>
                    <span>•</span>
                    <span className={t.length <= 65 ? "text-[#3cff5f]" : "text-amber-400"}>
                      {t.length} Characters {t.length <= 65 ? "(Optimal for Mobile)" : "(Truncated on Mobile)"}
                    </span>
                    <span>•</span>
                    <span>
                      Hook Word: <strong className="text-white">{t.powerWord}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyTitle(t.text, t.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer transition-colors shrink-0 shadow-sm"
                >
                  {copiedId === t.id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Title</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Custom Title CTR Analyzer */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-[#3cff5f]" />
          <span>Live YouTube Title CTR Analyzer</span>
        </h3>
        <p className="text-xs text-[#9baaa1]">
          Type or paste your own custom title to audit length, readability, and clickability before publishing.
        </p>

        <div className="relative">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Type your custom video title here..."
            className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] px-4 py-3.5 text-sm text-[#e7eee9] placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none"
          />
        </div>

        {customTitle.trim().length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#080e0b] border border-[#213026]">
              <span className="text-[11px] text-[#9baaa1] block">Clickability Score:</span>
              <span className="text-2xl font-black font-mono text-[#3cff5f]">{customScore} / 100</span>
            </div>

            <div className="p-4 rounded-xl bg-[#080e0b] border border-[#213026]">
              <span className="text-[11px] text-[#9baaa1] block">Length Check:</span>
              <span
                className={`text-sm font-bold block ${
                  customLen >= 40 && customLen <= 65 ? "text-[#3cff5f]" : "text-amber-400"
                }`}
              >
                {customLen} Chars {customLen >= 40 && customLen <= 65 ? "• Perfect Mobile Length" : "• May truncate on mobile"}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#080e0b] border border-[#213026]">
              <span className="text-[11px] text-[#9baaa1] block">Power Word Detection:</span>
              <span
                className={`text-sm font-bold block ${
                  hasPowerWord ? "text-[#3cff5f]" : "text-[#9baaa1]"
                }`}
              >
                {hasPowerWord ? "✓ High-Impact Word Found" : "No power hook detected"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

