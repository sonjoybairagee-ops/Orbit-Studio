"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Share2,
  Trash2,
  Smile,
  Flame,
} from "lucide-react";

// Unicode Font Map Converters
function toUnicodeFont(text: string, style: "bold" | "italic" | "mono" | "script" | "fraktur" | "double"): string {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const FONT_MAPS: Record<string, string> = {
    bold: "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
    italic: "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻0123456789",
    mono: "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
    script: "𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏0123456789",
    fraktur: "𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔴0123456789",
    double: "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
  };

  const targetChars = FONT_MAPS[style];
  if (!targetChars) return text;

  // Split UTF-8 unicode graphemes properly
  const targetArray = Array.from(targetChars);

  return text
    .split("")
    .map((c) => {
      const idx = normal.indexOf(c);
      return idx !== -1 ? targetArray[idx] || c : c;
    })
    .join("");
}

const TEMPLATES = [
  {
    name: "Founder / Entrepreneur",
    bio: `🚀 Building @ToolHub | $1M+ ARR\n💡 Sharing actionable SaaS & growth playbooks\n👇 Grab the 100% free tool suite\n🔗 toolhub.io/free`,
  },
  {
    name: "Creator & Influencer",
    bio: `✨ Visual Storyteller & Tech Creator\n🎥 100k+ subscribers exploring AI tools\n📍 San Francisco, CA\n👇 Download my free Notion templates`,
  },
  {
    name: "Freelancer & Agency",
    bio: `💼 Senior Product Designer & Brand Strategist\n🏆 Helped 50+ startups raise $20M+\n📬 Inquiries: hello@alexmorgan.design\n👇 View latest portfolio case studies`,
  },
];

const PLATFORMS = [
  { name: "Instagram", limit: 150 },
  { name: "X / Twitter", limit: 160 },
  { name: "TikTok", limit: 80 },
  { name: "Threads", limit: 150 },
  { name: "LinkedIn", limit: 220 },
];

export default function SocialMediaBioFormatterTool() {
  const [bioText, setBioText] = useState<string>(TEMPLATES[0].bio);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("Instagram");
  const [copied, setCopied] = useState<boolean>(false);

  // Platform limits check
  const activeLimit = useMemo(() => {
    return PLATFORMS.find((p) => p.name === selectedPlatform)?.limit || 150;
  }, [selectedPlatform]);

  const charCount = bioText.length;
  const isOverLimit = charCount > activeLimit;
  const remaining = activeLimit - charCount;

  // Transform entire text into a font style
  const handleApplyFont = (style: "bold" | "italic" | "mono" | "script" | "fraktur" | "double") => {
    setBioText((prev) => toUnicodeFont(prev, style));
  };

  // Insert line break with invisible Braille space (\u2800) so Instagram won't collapse it
  const handleInsertSpacer = () => {
    setBioText((prev) => `${prev}\n⠀\n`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(bioText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Platform Tabs & Character Limit Indicators */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {PLATFORMS.map((p) => {
          const isSelected = selectedPlatform === p.name;
          const exceeds = charCount > p.limit;
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelectedPlatform(p.name)}
              className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{p.name}</span>
              <span
                className={`font-mono text-[11px] px-1.5 py-0.2 rounded-md ${
                  exceeds
                    ? "bg-rose-100 text-rose-700 font-black"
                    : isSelected
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {charCount}/{p.limit}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Editor & Live Preview Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Editor (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Craft Your Social Media Bio
              </h2>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className={isOverLimit ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                  {charCount} / {activeLimit} characters
                </span>
                <span className="text-slate-400">•</span>
                <span className={isOverLimit ? "text-rose-600 font-bold" : "text-slate-500"}>
                  {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over limit!`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied Bio!" : "Copy Bio"}
              </button>
            </div>
          </div>

          <textarea
            rows={7}
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            placeholder="Write your bio here..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 font-sans text-sm text-slate-900 focus:border-purple-500 focus:bg-white focus:outline-none"
          />

          {/* Quick Font Stylers */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Transform Fonts (Unicode Safe for Instagram & X)
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleApplyFont("bold")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold hover:bg-slate-100"
              >
                𝗕𝗼𝗹𝗱
              </button>
              <button
                type="button"
                onClick={() => handleApplyFont("italic")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 italic hover:bg-slate-100"
              >
                𝘐𝘵𝘢𝘭𝘪𝘤
              </button>
              <button
                type="button"
                onClick={() => handleApplyFont("mono")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono hover:bg-slate-100"
              >
                𝙼𝚘𝚗𝚘
              </button>
              <button
                type="button"
                onClick={() => handleApplyFont("script")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 hover:bg-slate-100"
              >
                𝒮𝒸𝓇𝒾𝓅𝓉
              </button>
              <button
                type="button"
                onClick={() => handleApplyFont("double")}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 hover:bg-slate-100"
              >
                𝔻𝕠𝕦𝕓𝕝𝕖
              </button>
              <button
                type="button"
                onClick={handleInsertSpacer}
                className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-purple-700 font-bold hover:bg-purple-100"
                title="Inserts invisible space character that prevents Instagram from collapsing blank lines"
              >
                + Empty Line Break (Anti-Collapse)
              </button>
            </div>
          </div>

          {/* Bio Templates Scaffolder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              High-Converting Bio Templates
            </span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => setBioText(tmpl.bio)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Phone Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block text-center">
            {selectedPlatform} Profile Preview
          </span>

          <div className="max-w-[320px] mx-auto rounded-3xl border-4 border-slate-800 bg-white p-5 shadow-lg space-y-4">
            {/* Header / Avatar */}
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5">
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center font-bold text-slate-700">
                  You
                </div>
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">your_username</div>
                <div className="text-xs text-slate-500">Creator &amp; Founder</div>
              </div>
            </div>

            {/* Live Bio Text */}
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed border-t border-slate-100 pt-3">
              {bioText || "Your bio will appear here..."}
            </div>

            {/* Profile Action Buttons */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 py-1.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 text-center">
                Follow
              </div>
              <div className="flex-1 py-1.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 text-center">
                Message
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
