"use client";

import { useState, useEffect, useCallback } from "react";
import { KeyRound, RefreshCw, Copy, Check, ShieldCheck, ShieldAlert, Sliders } from "lucide-react";

export default function RandomPasswordGeneratorTool() {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(false);
  const [bulkCount, setBulkCount] = useState<number>(1);

  const [passwords, setPasswords] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generatePassword = useCallback(() => {
    let charset = "";
    if (includeUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLower) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "");
    }

    if (!charset) {
      setPasswords(["Please select at least one character set"]);
      return;
    }

    const newPassList: string[] = [];
    const count = Math.max(1, Math.min(20, bulkCount));

    for (let c = 0; c < count; c++) {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      let pass = "";
      for (let i = 0; i < length; i++) {
        pass += charset[array[i] % charset.length];
      }
      newPassList.push(pass);
    }

    setPasswords(newPassList);
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar, bulkCount]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const copyPassword = (pass: string, idx: number) => {
    navigator.clipboard.writeText(pass);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  // Strength calculation based on length and charset pool size
  const getPoolSize = () => {
    let size = 0;
    if (includeUpper) size += 26;
    if (includeLower) size += 26;
    if (includeNumbers) size += 10;
    if (includeSymbols) size += 28;
    return size;
  };

  const pool = getPoolSize();
  const entropy = Math.round(length * Math.log2(pool || 1));

  let strengthLabel = "Weak";
  let strengthColor = "bg-red-500 text-red-700";
  let strengthPercent = 25;

  if (entropy >= 80) {
    strengthLabel = "Very Strong";
    strengthColor = "bg-emerald-500 text-emerald-700";
    strengthPercent = 100;
  } else if (entropy >= 60) {
    strengthLabel = "Strong";
    strengthColor = "bg-green-500 text-green-700";
    strengthPercent = 75;
  } else if (entropy >= 40) {
    strengthLabel = "Good";
    strengthColor = "bg-amber-500 text-amber-700";
    strengthPercent = 50;
  }

  return (
    <div className="space-y-6">
      {/* Primary Password Display Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
          <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 tracking-wider break-all text-center sm:text-left select-all">
            {passwords[0] || "Generating..."}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => copyPassword(passwords[0], 0)}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedIdx === 0 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedIdx === 0 ? "Copied" : "Copy"}
            </button>
            <button
              onClick={generatePassword}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
              title="Regenerate Password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-600">Password Strength: <strong className={strengthColor.split(" ")[1]}>{strengthLabel}</strong></span>
            <span className="text-slate-400 font-mono">~{entropy} bits entropy</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strengthColor.split(" ")[0]}`}
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="space-y-5 border-t border-slate-100 pt-6">
          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Password Length: {length} characters</span>
              <span className="text-slate-400 font-mono">6 - 64</span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-violet-600"
            />
          </div>

          {/* Checkbox Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Numbers (0-9)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Symbols (!@#$)</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="rounded accent-violet-600"
              />
              <span>Exclude ambiguous characters (l, 1, I, o, 0, O)</span>
            </label>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Bulk Count:</span>
              <select
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-violet-500 font-bold"
              >
                <option value={1}>1 Password</option>
                <option value={5}>5 Passwords</option>
                <option value={10}>10 Passwords</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Passwords List */}
      {bulkCount > 1 && passwords.length > 1 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
            Generated Passwords ({passwords.length})
          </h4>
          <div className="space-y-2">
            {passwords.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono"
              >
                <span className="font-bold text-slate-800 truncate pr-4">{p}</span>
                <button
                  onClick={() => copyPassword(p, idx)}
                  className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors shrink-0"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
