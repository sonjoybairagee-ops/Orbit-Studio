"use client";

import { useEffect, useState } from "react";
import {
  Wifi,
  Copy,
  Check,
  Users,
  Globe,
  Bot,
  Link2,
  LogOut,
  RefreshCcw,
  Sparkles,
  Share2,
  X,
  Play,
  UserCheck,
  UserX,
  Crown,
  Handshake,
  MessageCircle,
} from "lucide-react";
import { NetGameApi } from "./useNetGame";
export type { NetGameApi };

/* ────────────────────────────────────────────────────────────────────────────
   NetBar — Full-Featured Multiplayer Lobby & Team Invite System
   - Simple 1-Click Room Creation & Code Join (#AB39X)
   - Direct Shareable Invite Links (WhatsApp, Discord, Messenger)
   - Instant Join Invite Pop-up on URL link visits (?room=CODE)
   - Live Player Slots with Ready/Not Ready status, Color/Team selector
   - Host controls: Kick player & Launch Game
   - Peer-to-peer WebRTC via PeerJS — 100% Zero-Server Lag
──────────────────────────────────────────────────────────────────────────── */

const COLOR_MAP: Record<string, { name: string; hex: string; bg: string }> = {
  red: { name: "Red", hex: "#ef4444", bg: "bg-red-500" },
  green: { name: "Green", hex: "#22c55e", bg: "bg-emerald-500" },
  yellow: { name: "Yellow", hex: "#eab308", bg: "bg-yellow-500" },
  blue: { name: "Blue", hex: "#3b82f6", bg: "bg-blue-500" },
  purple: { name: "Purple", hex: "#a855f7", bg: "bg-purple-500" },
  cyan: { name: "Cyan", hex: "#06b6d4", bg: "bg-cyan-500" },
};

export default function NetBar({ gameTitle, net }: { gameTitle: string; net: NetGameApi }) {
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [lobbyModalOpen, setLobbyModalOpen] = useState(false);
  const [pendingInviteCode, setPendingInviteCode] = useState<string | null>(null);

  /* Auto-detect ?room=CODE invite link on page load */
  useEffect(() => {
    if (net.role !== "solo") return;
    const m = /[\?&]room=([A-Za-z0-9]{4,6})/.exec(window.location.search);
    if (m && !pendingInviteCode) {
      setPendingInviteCode(m[1].toUpperCase());
    }
  }, [net.role, pendingInviteCode]);

  /* Open lobby modal automatically when room connects */
  useEffect(() => {
    if (net.role !== "solo" && net.code) {
      setLobbyModalOpen(true);
    }
  }, [net.role, net.code]);

  const copy = async (what: "code" | "link") => {
    const text =
      what === "link"
        ? `${window.location.origin}${window.location.pathname}?room=${net.code}`
        : net.code;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard fallback */
    }
    setCopied(what);
    setTimeout(() => setCopied(null), 1600);
  };

  const currentPl = (net.players ?? []).find((p) => p.seat === net.seat);
  const myReady = currentPl?.ready ?? (net.isHost ? true : false);

  return (
    <>
      {/* ── 1. Top Compact In-Game Strip ── */}
      <div className="mb-4 rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5 sm:p-4">
        {net.role === "solo" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#102a16] text-[#3cff5f] border border-[#2a4d33]">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-bold text-[#e7eee9] block">{gameTitle} Multiplayer</span>
                <span className="text-[10px] text-[#62776a]">Play online with friends or AI bots over WebRTC.</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  net.hostStart();
                  setLobbyModalOpen(true);
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-bold text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.25)] hover:bg-[#52ff71] transition-all"
              >
                <Wifi className="h-3.5 w-3.5" />
                <span>Create Room</span>
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
                  onClick={() => {
                    if (joinCode.length >= 4) {
                      net.guestJoin(joinCode);
                      setLobbyModalOpen(true);
                    }
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3cff5f]/50 bg-[#3cff5f]/10 px-2.5 py-1 text-[10px] font-bold text-[#3cff5f]">
                <Wifi className="h-3 w-3 animate-pulse" /> {net.role === "host" ? "HOSTING" : "CONNECTED"}
              </span>

              <span className="font-mono text-base font-black tracking-widest text-[#3cff5f]">
                #{net.code}
              </span>

              {/* Connected Players Badges */}
              <div className="hidden md:flex items-center gap-1.5">
                {(net.players ?? []).map((p) => (
                  <span
                    key={p.seat}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                      p.seat === net.seat
                        ? "border-[#3cff5f]/60 bg-[#3cff5f]/10 text-[#3cff5f]"
                        : p.kind === "bot"
                        ? "border-[#213026] bg-[#08100c] text-[#62776a]"
                        : "border-[#2a5234] bg-[#102a16] text-[#9baaa1]"
                    }`}
                  >
                    {p.kind === "bot" ? <Bot className="h-3 w-3" /> : null}
                    {p.name}
                    {p.seat === net.seat ? " (you)" : ""}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLobbyModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#3cff5f]/50 bg-[#102a16] px-3 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] transition-all"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Lobby ({(net.players ?? []).filter((p) => p.kind !== "bot").length}/{(net.players ?? []).length})</span>
              </button>

              <button
                type="button"
                onClick={() => copy("link")}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#2a5234] bg-[#102a16] px-2.5 py-1.5 text-xs text-[#9baaa1] hover:text-[#e7eee9]"
                title="Copy Invite Link"
              >
                {copied === "link" ? <Check className="h-3.5 w-3.5 text-[#3cff5f]" /> : <Link2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Copy Link</span>
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Join my ${gameTitle} multiplayer game on CompX Orbit!\nRoom Code: #${net.code}\n${typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?room=${net.code}` : ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/20"
                title="Invite via WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={net.goSolo}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#453022] bg-[#2a1608] px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200"
                title="Leave room"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Leave</span>
              </button>
            </div>
          </div>
        )}

        {net.status && (
          <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-300">
            <RefreshCcw className="h-3 w-3 animate-spin" /> {net.status}
          </p>
        )}
      </div>

      {/* ── 2. Full Multiplayer Lobby Modal ── */}
      {lobbyModalOpen && net.role !== "solo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-[#3cff5f]/40 bg-[#0c1510] shadow-[0_0_50px_rgba(60,255,95,0.2)] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213026] bg-[#101b14] p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#14281c] text-[#3cff5f] border border-[#2a5234]">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#e7eee9]">
                    {gameTitle} Multiplayer Lobby
                  </h3>
                  <p className="text-xs text-[#8ea396]">
                    Real-time P2P WebRTC room · Invite friends or play with AI bots
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLobbyModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#8ea396] hover:text-white cursor-pointer"
                title="Minimize lobby"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Room Code & Invite Share Center */}
            <div className="p-4 sm:p-5 border-b border-[#213026] bg-[#08100c]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8ea396] block">
                    Room Code
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-[#3cff5f]">
                      #{net.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => copy("code")}
                      className="p-1.5 rounded-lg border border-[#2a5234] bg-[#102a16] text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                      title="Copy Code"
                    >
                      {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Instant Share Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copy("link")}
                    className="flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-all cursor-pointer"
                  >
                    {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                    <span>Copy Invite Link</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Join my ${gameTitle} game on CompX Orbit!\nRoom Code: #${net.code}\n${typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?room=${net.code}` : ""}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Players & Seats Grid */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3cff5f]">
                  Player Slots &amp; Team Colors
                </span>
                <span className="text-[11px] text-[#8ea396]">
                  {(net.players ?? []).filter((p) => p.kind !== "bot").length} Humans connected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(net.players ?? []).map((pl) => {
                  const isMe = pl.seat === net.seat;
                  const isHostSeat = pl.kind === "host";
                  const isBot = pl.kind === "bot";
                  const colorConfig = COLOR_MAP[pl.color || "red"] || COLOR_MAP.red;

                  return (
                    <div
                      key={pl.seat}
                      className={`relative rounded-2xl border p-3.5 transition-all ${
                        isMe
                          ? "border-[#3cff5f] bg-[#102a16]/60 shadow-[0_0_15px_rgba(60,255,95,0.15)]"
                          : isBot
                          ? "border-[#1d2a23] bg-[#08100c] opacity-80"
                          : "border-[#213026] bg-[#0c1611]"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Seat Token Avatar */}
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white shadow-md"
                            style={{ backgroundColor: colorConfig.hex }}
                          >
                            {isBot ? <Bot className="h-5 w-5" /> : pl.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#e7eee9]">
                                {pl.name}
                              </span>
                              {isMe && <span className="text-[10px] text-[#3cff5f] font-mono">(You)</span>}
                            </div>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8ea396]">
                              {isHostSeat ? "👑 Room Host" : isBot ? "🤖 AI Bot" : "👤 Guest Player"}
                            </span>
                          </div>
                        </div>

                        {/* Kick Control for Host */}
                        {net.isHost && !isMe && !isBot && (
                          <button
                            type="button"
                            onClick={() => net.kickPlayer(pl.seat)}
                            className="p-1 rounded-lg text-[#8ea396] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Kick player from room"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Color Picker & Ready State */}
                      <div className="mt-3 pt-2.5 border-t border-[#1a2920] flex items-center justify-between text-xs">
                        {/* Color Selector */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#8ea396]">Color:</span>
                          {isMe ? (
                            <div className="flex items-center gap-1">
                              {Object.entries(COLOR_MAP).slice(0, 4).map(([cKey, cVal]) => (
                                <button
                                  key={cKey}
                                  type="button"
                                  onClick={() => net.setColor(cKey)}
                                  className={`h-4 w-4 rounded-full transition-transform ${
                                    pl.color === cKey ? "scale-125 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                                  }`}
                                  style={{ backgroundColor: cVal.hex }}
                                  title={cVal.name}
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="flex items-center gap-1 font-semibold text-[11px]" style={{ color: colorConfig.hex }}>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorConfig.hex }} />
                              {colorConfig.name}
                            </span>
                          )}
                        </div>

                        {/* Ready Indicator */}
                        <div>
                          {isMe ? (
                            <button
                              type="button"
                              onClick={() => net.setReady(!myReady)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                                myReady
                                  ? "bg-[#3cff5f] text-[#050a08]"
                                  : "border border-amber-400/40 bg-amber-400/10 text-amber-300"
                              }`}
                            >
                              {myReady ? <Check className="h-3 w-3 stroke-[3]" /> : null}
                              <span>{myReady ? "READY" : "SET READY"}</span>
                            </button>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                                pl.ready ? "text-[#3cff5f]" : "text-amber-400"
                              }`}
                            >
                              {pl.ready ? <Check className="h-3 w-3" /> : "⏳"}
                              <span>{pl.ready ? "READY" : "WAITING"}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 border-t border-[#213026] bg-[#101b14] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setLobbyModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#08100c] text-xs font-semibold text-[#c0d0c6] hover:text-white"
              >
                Minimize &amp; View Board
              </button>

              {net.isHost ? (
                <button
                  type="button"
                  onClick={() => {
                    net.startGame();
                    setLobbyModalOpen(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] shadow-[0_0_20px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Launch Game (Start)</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-[#8ea396]">
                  <span className="h-2 w-2 rounded-full bg-[#3cff5f] animate-ping" />
                  <span>Waiting for host to start the game…</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. Instant Join Invitation Pop-up (when URL has ?room=CODE) ── */}
      {pendingInviteCode && net.role === "solo" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#3cff5f]/50 bg-[#0c1510] shadow-[0_0_50px_rgba(60,255,95,0.3)] p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shadow-[0_0_20px_rgba(60,255,95,0.3)]">
              <Handshake className="h-7 w-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3 py-1 text-[10px] font-semibold text-[#3cff5f] border border-[#2a4d33] mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Multiplayer Invite</span>
            </div>

            <h3 className="text-xl font-black text-[#e7eee9]">
              You&apos;re Invited to {gameTitle}!
            </h3>
            <p className="mt-1 text-xs text-[#9baaa1] leading-relaxed">
              Your friend has invited you to join their live online room:
            </p>

            <div className="my-4 rounded-2xl border border-[#2a5234] bg-[#08100c] p-3 text-center">
              <span className="text-[10px] uppercase font-mono text-[#8ea396] block">Room Code</span>
              <span className="font-mono text-3xl font-black text-[#3cff5f] tracking-widest block">
                #{pendingInviteCode}
              </span>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  net.guestJoin(pendingInviteCode);
                  setPendingInviteCode(null);
                  setLobbyModalOpen(true);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#3cff5f] text-xs font-black text-[#050a08] shadow-[0_0_20px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                <span>Join Lobby Now</span>
              </button>
              <button
                type="button"
                onClick={() => setPendingInviteCode(null)}
                className="flex-1 py-3 rounded-2xl border border-white/15 bg-[#080e0b] text-xs font-bold text-[#9baaa1] hover:text-white transition-all cursor-pointer"
              >
                Play Solo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
