"use client";

import { useEffect, useState } from "react";
import { Wifi, Copy, Check, Users, Globe, Bot, Link2, LogOut, RefreshCcw } from "lucide-react";
import { NetGameApi } from "./useNetGame";
export type { NetGameApi };

/* ────────────────────────────────────────────────────────────────────────────
   NetBar — shared online-play lobby strip for every CompX Orbit game.
   Solo (default) · Create Room (host gets a shareable link + code) ·
   Join Room (code or ?room= link)
──────────────────────────────────────────────────────────────────────────── */

export default function NetBar({ gameTitle, net }: { gameTitle: string; net: NetGameApi }) {
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [autoJoinTried, setAutoJoinTried] = useState(false);

  /* invite links: /games/xxx?room=CODE → auto-join OR ?mode=room → auto-create */
  useEffect(() => {
    if (autoJoinTried || net.role !== "solo") return;
    const m = /[\?&]room=([A-Za-z0-9]{4,6})/.exec(window.location.search);
    if (m) {
      setAutoJoinTried(true);
      setJoinCode(m[1].toUpperCase());
      net.guestJoin(m[1]);
      return;
    }
    const modeParam = /[\?&]mode=room/.exec(window.location.search);
    if (modeParam) {
      setAutoJoinTried(true);
      net.hostStart();
    }
  }, [net, autoJoinTried]);

  const copy = async (what: "code" | "link") => {
    const text =
      what === "link"
        ? `${window.location.origin}${window.location.pathname}?room=${net.code}`
        : net.code;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard blocked — code is visible anyway */
    }
    setCopied(what);
    setTimeout(() => setCopied(null), 1600);
  };

  /* solo lobby */
  if (net.role === "solo" && !autoJoinTried) {
    return (
      <div className="mb-4 rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <Globe className="h-4 w-4 shrink-0 text-[#3cff5f]" />
          <span className="text-xs font-bold text-[#e7eee9]">{gameTitle} Online</span>
          <span className="text-[10px] text-[#62776a]">Play with friends over a room code — empty seats become AI bots.</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={net.hostStart}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#3cff5f] px-3.5 py-2 text-xs font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/15 transition-all hover:bg-[#52ff71]"
            >
              <Wifi className="h-3.5 w-3.5" /> Create Google-style Code Room
            </button>
            <div className="flex items-center gap-1.5">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="CODE"
                className="w-24 rounded-xl border border-[#2a5234] bg-[#102a16] px-2.5 py-2 text-center font-mono text-xs uppercase tracking-widest text-[#3cff5f] placeholder:text-[#40514a] focus:outline-none focus:ring-1 focus:ring-[#3cff5f]"
              />
              <button
                type="button"
                onClick={() => net.guestJoin(joinCode)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-2 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
              >
                Join
              </button>
            </div>
          </div>
        </div>
        {net.status && <p className="mt-2 text-[10px] text-amber-300">{net.status}</p>}
      </div>
    );
  }

  /* active room strip */
  return (
    <div className="mb-4 rounded-2xl border border-[#2a5234]/70 bg-[#0c1510] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3cff5f]/50 bg-[#3cff5f]/10 px-2.5 py-1 text-[10px] font-bold text-[#3cff5f]">
          <Wifi className="h-3 w-3" /> {net.role === "host" ? "HOSTING" : "CONNECTED"}
        </span>

        {net.role === "host" && (
          <>
            <span className="font-mono text-lg font-black tracking-[0.3em] text-[#3cff5f]">
              {net.code}
            </span>
            <button
              type="button"
              onClick={() => copy("code")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#2a5234] bg-[#102a16] px-2 py-1 text-[10px] font-semibold text-[#9baaa1] hover:text-[#e7eee9]"
            >
              {copied === "code" ? <Check className="h-3 w-3 text-[#3cff5f]" /> : <Copy className="h-3 w-3" />}
              code
            </button>
            <button
              type="button"
              onClick={() => copy("link")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#2a5234] bg-[#102a16] px-2 py-1 text-[10px] font-semibold text-[#9baaa1] hover:text-[#e7eee9]"
            >
              {copied === "link" ? <Check className="h-3 w-3 text-[#3cff5f]" /> : <Link2 className="h-3 w-3" />}
              invite link
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Join my ${gameTitle} room on CompX Orbit! Code: ${net.code}\n${typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?room=${net.code}` : ""}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#2a5234] bg-[#102a16] px-2 py-1 text-[10px] font-semibold text-[#9baaa1] hover:text-[#e7eee9]"
            >
              WhatsApp
            </a>
          </>
        )}
        {net.role === "guest" && (
          <span className="font-mono text-lg font-black tracking-[0.3em] text-[#3cff5f]">{net.code}</span>
        )}

        {/* seats */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#62776a]" />
          {(net.players ?? []).slice(0, 6).map((p) => (
            <span
              key={p.seat}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                p.seat === net.seat
                  ? "border-[#3cff5f]/60 bg-[#3cff5f]/10 text-[#3cff5f]"
                  : p.kind === "bot"
                  ? "border-[#213026] bg-[#080e0b] text-[#62776a]"
                  : "border-[#2a5234] bg-[#102a16] text-[#9baaa1]"
              }`}
            >
              {p.kind === "bot" ? <Bot className="h-3 w-3" /> : null}
              {p.name}
              {p.seat === net.seat ? " (you)" : ""}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={net.goSolo}
          className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#453022] bg-[#2a1608] px-2.5 py-1 text-[10px] font-semibold text-amber-300/90 hover:text-amber-200"
          title="Leave the online room and go back to solo-vs-bots"
        >
          <LogOut className="h-3 w-3" /> {net.role === "host" ? "Close Room" : "Leave"}
        </button>
      </div>

      {net.status && (
        <p className="mt-2 inline-flex items-center gap-1 text-[10px] text-amber-300">
          <RefreshCcw className="h-3 w-3" /> {net.status}
        </p>
      )}
    </div>
  );
}
