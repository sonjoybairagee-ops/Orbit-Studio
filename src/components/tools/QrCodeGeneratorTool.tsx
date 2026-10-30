"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QrCode, Download, Copy, Check, Link, Type, Wifi, Mail, Phone, Palette } from "lucide-react";

type QrType = "url" | "text" | "wifi" | "email" | "phone";

export default function QrCodeGeneratorTool() {
  const [qrType, setQrType] = useState<QrType>("url");

  // Inputs
  const [urlInput, setUrlInput] = useState<string>("https://iformat.io");
  const [textInput, setTextInput] = useState<string>("Hello, World!");
  const [wifiSsid, setWifiSsid] = useState<string>("MyHomeWiFi");
  const [wifiPass, setWifiPass] = useState<string>("SecretPass123");
  const [wifiEnc, setWifiEnc] = useState<string>("WPA");
  const [emailTo, setEmailTo] = useState<string>("support@example.com");
  const [emailSubj, setEmailSubj] = useState<string>("Inquiry");
  const [emailBody, setEmailBody] = useState<string>("Hi there,");
  const [phoneInput, setPhoneInput] = useState<string>("+1234567890");

  // Styling Options
  const [fgColor, setFgColor] = useState<string>("#0f172a");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [size, setSize] = useState<number>(280);
  const [margin, setMargin] = useState<number>(2);
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute text to encode
  const getPayload = (): string => {
    switch (qrType) {
      case "url":
        return urlInput.trim();
      case "text":
        return textInput;
      case "wifi":
        return `WIFI:S:${wifiSsid};T:${wifiEnc};P:${wifiPass};;`;
      case "email":
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubj)}&body=${encodeURIComponent(emailBody)}`;
      case "phone":
        return `tel:${phoneInput.trim()}`;
      default:
        return urlInput;
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const payload = getPayload();
    if (!payload) return;

    QRCode.toCanvas(canvasRef.current, payload, {
      width: size,
      margin: margin,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorLevel,
    }).catch((err) => {
      console.error("QR Code generation error:", err);
    });
  }, [qrType, urlInput, textInput, wifiSsid, wifiPass, wifiEnc, emailTo, emailSubj, emailBody, phoneInput, fgColor, bgColor, size, margin, errorLevel]);

  const downloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrcode_${qrType}.png`;
    a.click();
  };

  const copyImage = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Fallback: copy payload
      navigator.clipboard.writeText(getPayload());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form & Customizer */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Type selector tabs */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">QR Content Type</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "url", label: "URL / Link", icon: Link },
              { id: "text", label: "Plain Text", icon: Type },
              { id: "wifi", label: "WiFi Login", icon: Wifi },
              { id: "email", label: "Email", icon: Mail },
              { id: "phone", label: "Phone", icon: Phone },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setQrType(t.id as QrType)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    qrType === t.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields based on type */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {qrType === "url" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Website URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-indigo-500"
              />
            </div>
          )}

          {qrType === "text" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Plain Text</label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={4}
                placeholder="Enter text to encode..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-indigo-500 resize-y"
              />
            </div>
          )}

          {qrType === "wifi" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Network Name (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Security</label>
                  <select
                    value={wifiEnc}
                    onChange={(e) => setWifiEnc(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                  >
                    <option value="WPA">WPA/WPA2/WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {qrType === "email" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubj}
                  onChange={(e) => setEmailSubj(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message Body</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-sm font-medium focus:outline-indigo-500"
                />
              </div>
            </div>
          )}

          {qrType === "phone" && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (with Country Code)</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium focus:outline-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Styling Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-5">
          {/* Colors */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Foreground</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
              <span className="text-xs font-mono font-medium text-slate-600">{fgColor}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
              />
              <span className="text-xs font-mono font-medium text-slate-600">{bgColor}</span>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Size ({size}px)</label>
            <input
              type="range"
              min="160"
              max="400"
              step="20"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Error Correction */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Error Level</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-medium focus:outline-indigo-500"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Column: Live QR Preview & Download */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-6">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Live QR Code Preview</h4>
          <p className="text-xs text-slate-400 mt-0.5">Scannable with any smartphone camera</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-inner">
          <canvas ref={canvasRef} className="rounded-lg shadow-xs max-w-full h-auto" />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            onClick={downloadPng}
            className="flex-1 w-full px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download PNG
          </button>

          <button
            onClick={copyImage}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
