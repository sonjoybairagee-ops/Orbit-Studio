"use client";

import { useState, useMemo, useRef } from "react";
import {
  Mail,
  Copy,
  Check,
  Download,
  Sparkles,
  Phone,
  Globe,
  MapPin,
  Building,
  User,
  RotateCcw,
} from "lucide-react";

export default function EmailSignatureGeneratorTool() {
  const [fullName, setFullName] = useState<string>("Alex Morgan");
  const [jobTitle, setJobTitle] = useState<string>("Head of Growth & Marketing");
  const [department, setDepartment] = useState<string>("Growth Team");
  const [company, setCompany] = useState<string>("ToolHub Technologies");
  const [email, setEmail] = useState<string>("alex.morgan@toolhub.io");
  const [phone, setPhone] = useState<string>("+1 (555) 234-5678");
  const [website, setWebsite] = useState<string>("https://toolhub.io");
  const [location, setLocation] = useState<string>("San Francisco, CA");
  const [avatarUrl, setAvatarUrl] = useState<string>(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces"
  );
  const [accentColor, setAccentColor] = useState<string>("#2563eb");
  const [layoutStyle, setLayoutStyle] = useState<"modern" | "classic" | "compact" | "corporate">("modern");

  // Social Links
  const [linkedin, setLinkedin] = useState<string>("https://linkedin.com/in/alexmorgan");
  const [twitter, setTwitter] = useState<string>("https://x.com/alexmorgan");
  const [github, setGithub] = useState<string>("");

  const [copiedKey, setCopiedKey] = useState<string>("");
  const previewRef = useRef<HTMLDivElement>(null);

  // Generate pure inline HTML signature compatible with Gmail, Outlook, Apple Mail
  const rawHtmlSignature = useMemo(() => {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #334155;">
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align: top; padding-right: 16px;">
      <img src="${avatarUrl}" alt="${fullName}" width="70" height="70" style="border-radius: 50%; display: block; object-fit: cover; border: 2px solid ${accentColor};" />
    </td>`
        : ""
    }
    <td style="vertical-align: top; border-left: 2px solid ${accentColor}; padding-left: 16px;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="font-size: 16px; font-weight: 700; color: #0f172a; padding-bottom: 2px;">
            ${fullName}
          </td>
        </tr>
        <tr>
          <td style="font-size: 13px; font-weight: 600; color: ${accentColor}; padding-bottom: 6px;">
            ${jobTitle}${company ? ` · ${company}` : ""}
          </td>
        </tr>
        <tr>
          <td style="font-size: 12px; color: #64748b; line-height: 1.5;">
            ${email ? `<div><span style="color: #94a3b8;">✉</span> <a href="mailto:${email}" style="color: #334155; text-decoration: none;">${email}</a></div>` : ""}
            ${phone ? `<div><span style="color: #94a3b8;">📞</span> <a href="tel:${phone}" style="color: #334155; text-decoration: none;">${phone}</a></div>` : ""}
            ${website ? `<div><span style="color: #94a3b8;">🌐</span> <a href="${website}" target="_blank" style="color: ${accentColor}; text-decoration: none; font-weight: 600;">${website.replace(/^https?:\/\//, "")}</a></div>` : ""}
            ${location ? `<div><span style="color: #94a3b8;">📍</span> ${location}</div>` : ""}
          </td>
        </tr>
        ${
          linkedin || twitter || github
            ? `<tr>
          <td style="padding-top: 8px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${linkedin ? `<td style="padding-right: 8px;"><a href="${linkedin}" target="_blank" style="text-decoration: none; color: #0077b5; font-size: 11px; font-weight: bold;">LinkedIn</a></td>` : ""}
                ${twitter ? `<td style="padding-right: 8px;"><a href="${twitter}" target="_blank" style="text-decoration: none; color: #0f172a; font-size: 11px; font-weight: bold;">X (Twitter)</a></td>` : ""}
                ${github ? `<td><a href="${github}" target="_blank" style="text-decoration: none; color: #24292e; font-size: 11px; font-weight: bold;">GitHub</a></td>` : ""}
              </tr>
            </table>
          </td>
        </tr>`
            : ""
        }
      </table>
    </td>
  </tr>
</table>`;
  }, [fullName, jobTitle, company, email, phone, website, location, avatarUrl, accentColor, linkedin, twitter, github]);

  // Copy as rich text (DOM selection for direct paste into Gmail/Outlook)
  const handleCopyRichText = () => {
    if (!previewRef.current) return;
    const range = document.createRange();
    range.selectNode(previewRef.current);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
        selection.removeAllRanges();
        setCopiedKey("rich");
        setTimeout(() => setCopiedKey(""), 1800);
      } catch {}
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(rawHtmlSignature);
    setCopiedKey("html");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const handleDownloadHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${rawHtmlSignature}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email_signature.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Configuration & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Pane (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Signature Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Job Title
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Direct Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Avatar / Photo URL
              </label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Preview Pane (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Signature Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyRichText}
                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
              >
                {copiedKey === "rich" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "rich" ? "Copied Signature!" : "Copy for Gmail"}
              </button>
            </div>
          </div>

          {/* Rendered Signature Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs overflow-x-auto">
            <div ref={previewRef} dangerouslySetInnerHTML={{ __html: rawHtmlSignature }} />
          </div>

          {/* Quick Copy Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {copiedKey === "html" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedKey === "html" ? "Copied Raw HTML!" : "Copy HTML Code"}
              </button>
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                .html
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              💡 <strong>Gmail / Apple Mail tip:</strong> Click &quot;Copy for Gmail&quot;, open Settings &gt; Signature in your mail client, and press <code>Ctrl+V</code> (or <code>Cmd+V</code>) to paste with styles intact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
