"use client";

import { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import {
  Contact,
  Download,
  Copy,
  Check,
  QrCode as QrIcon,
  Sparkles,
  Phone,
  Mail,
  Building,
  User,
  Globe,
  MapPin,
  FileDown,
} from "lucide-react";

export default function QrBusinessCardGeneratorTool() {
  const [firstName, setFirstName] = useState<string>("Alex");
  const [lastName, setLastName] = useState<string>("Morgan");
  const [company, setCompany] = useState<string>("ToolHub Technologies");
  const [title, setTitle] = useState<string>("Director of Growth");
  const [workPhone, setWorkPhone] = useState<string>("+1 (555) 234-5678");
  const [mobilePhone, setMobilePhone] = useState<string>("+1 (555) 876-5432");
  const [email, setEmail] = useState<string>("alex.morgan@toolhub.io");
  const [website, setWebsite] = useState<string>("https://toolhub.io");
  const [street, setStreet] = useState<string>("100 Market Street");
  const [city, setCity] = useState<string>("San Francisco");
  const [state, setState] = useState<string>("CA");
  const [zip, setZip] = useState<string>("94105");
  const [country, setCountry] = useState<string>("United States");
  const [note, setNote] = useState<string>("Met at Tech Summit 2026");

  // QR Customization
  const [fgColor, setFgColor] = useState<string>("#0f172a");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [qrCodeDataUri, setQrCodeDataUri] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string>("");

  // Construct standard vCard 3.0 payload
  const vCardPayload = useMemo(() => {
    const fn = `${firstName} ${lastName}`.trim();
    const n = `${lastName};${firstName};;;`;

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${n}`,
      `FN:${fn || "Contact"}`,
    ];

    if (company.trim()) lines.push(`ORG:${company.trim()}`);
    if (title.trim()) lines.push(`TITLE:${title.trim()}`);
    if (workPhone.trim()) lines.push(`TEL;TYPE=WORK,VOICE:${workPhone.trim()}`);
    if (mobilePhone.trim()) lines.push(`TEL;TYPE=CELL,VOICE:${mobilePhone.trim()}`);
    if (email.trim()) lines.push(`EMAIL;TYPE=PREF,INTERNET:${email.trim()}`);
    if (website.trim()) lines.push(`URL:${website.trim()}`);

    const adrParts = [street, city, state, zip, country].map((s) => s.trim());
    if (adrParts.some(Boolean)) {
      lines.push(`ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}`);
    }

    if (note.trim()) lines.push(`NOTE:${note.trim()}`);
    lines.push("END:VCARD");

    return lines.join("\n");
  }, [firstName, lastName, company, title, workPhone, mobilePhone, email, website, street, city, state, zip, country, note]);

  // Generate QR Code on change
  useEffect(() => {
    QRCode.toDataURL(vCardPayload, {
      width: 320,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: "M",
    })
      .then((dataUri) => setQrCodeDataUri(dataUri))
      .catch(() => {});
  }, [vCardPayload, fgColor, bgColor]);

  const handleDownloadQr = () => {
    if (!qrCodeDataUri) return;
    const a = document.createElement("a");
    a.href = qrCodeDataUri;
    a.download = `vcard_qr_${firstName}_${lastName}.png`.toLowerCase();
    a.click();
  };

  const handleDownloadVcf = () => {
    const blob = new Blob([vCardPayload], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${firstName}_${lastName}.vcf`.toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyVcard = () => {
    navigator.clipboard.writeText(vCardPayload);
    setCopiedKey("vcard");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Grid: Inputs (7 cols) + QR Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-5">
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
            Contact Information (vCard 3.0)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Company / Organization
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
                Job Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Work Email
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
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mobile Phone
              </label>
              <input
                type="text"
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Work Phone
              </label>
              <input
                type="text"
                value={workPhone}
                onChange={(e) => setWorkPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Address Details */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Office Address
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street Address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* QR Colors */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">QR Color:</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-8 w-10 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Background:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-10 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right QR Output (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Scan with Smartphone Camera
          </span>

          <div className="flex justify-center">
            {qrCodeDataUri ? (
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-md inline-block">
                <img
                  src={qrCodeDataUri}
                  alt="vCard QR Code"
                  className="h-56 w-56 sm:h-64 sm:w-64 rounded-xl"
                />
              </div>
            ) : (
              <div className="h-64 w-64 rounded-2xl bg-slate-100 animate-pulse" />
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            📱 Pointing your iPhone or Android camera at this code prompts <strong>&quot;Add to Contacts&quot;</strong> instantly.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadQr}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Download QR Image
            </button>
            <button
              type="button"
              onClick={handleDownloadVcf}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download .vcf
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
