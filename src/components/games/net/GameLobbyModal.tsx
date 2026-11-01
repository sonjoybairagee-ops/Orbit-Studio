"use client";

import React, { useEffect, useState } from "react";
import {
  Crown,
  Users,
  Bot,
  Play,
  Copy,
  Link2,
  MessageCircle,
  Wifi,
  BookOpen,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NetGameApi } from "./useNetGame";

export interface SeatTokenInfo {
  name: string;
  icon: string;
  color: string;
}

export interface RuleHighlight {
  title: string;
  desc: string;
}

export interface GameLobbyModalProps {
  gameTitle: string;
  gameIcon?: React.ReactNode;
  tagline?: string;
  net: NetGameApi;
  maxSeats?: number;
  seatTokens?: SeatTokenInfo[];
  rulesHighlights?: RuleHighlight[];
  officialRulesSummary?: string;
  onOpenRules?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onStartGame: () => void;
  onStartSolo?: () => void;
  playButtonText?: string;
  soloButtonText?: string;
  whatsappMessage?: string;
}

export default function GameLobbyModal({
  gameTitle,
  gameIcon = <Crown className="h-6 w-6 text-[#3cff5f]" />,
  tagline = "Create a team room, invite friends with room codes, or play solo vs AI bots!",
  net,
  maxSeats = 4,
  seatTokens,
  rulesHighlights = [
    { title: "1. Instant Play", desc: "Zero downloads, 60 FPS" },
    { title: "2. Live Sync", desc: "Peer-to-peer WebRTC" },
    { title: "3. Smart AI", desc: "Empty seats handled by bots" },
  ],
  officialRulesSummary = "💡 CompX Orbit Multiplayer • Low Latency WebRTC • Instant Browser Matchmaking",
  onOpenRules,
  isMuted = false,
  onToggleMute,
  onStartGame,
  onStartSolo,
  playButtonText = "Start Game Now",
  soloButtonText = "Play Solo vs AI",
  whatsappMessage,
}: GameLobbyModalProps) {
  const [lobbyTab, setLobbyTab] = useState<"create" | "join" | "solo">("create");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [copiedLobby, setCopiedLobby] = useState<"code" | "link" | null>(null);

  // Auto-detect invite link ?room=CODE
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const r = params.get("room");
      if (r) {
        setJoinCodeInput(r.toUpperCase().trim());
        setLobbyTab("join");
      }
    }
  }, []);

  // Listen for host launch event (for guests)
  useEffect(() => {
    net.onGameStart(() => {
      onStartGame();
    });
  }, [net, onStartGame]);

  const handleStartLobbyGame = () => {
    if (net.isHost) {
      net.startGame();
    }
    onStartGame();
  };

  const handleStartSolo = () => {
    net.goSolo();
    if (onStartSolo) {
      onStartSolo();
    } else {
      onStartGame();
    }
  };

  const copyLobby = async (what: "code" | "link") => {
    if (typeof window === "undefined") return;
    const text =
      what === "link"
        ? `${window.location.origin}${window.location.pathname}?room=${net.code}`
        : net.code;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLobby(what);
      setTimeout(() => setCopiedLobby(null), 2000);
    } catch {
      // fallback
    }
  };

  const shareWhatsApp = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}${window.location.pathname}?room=${net.code}`;
    const defaultMsg = `🎮 Join my ${gameTitle} match! Room Code: #${net.code}\nClick here to play instantly in your browser: ${url}`;
    const text = encodeURIComponent(whatsappMessage ? `${whatsappMessage}\n${url}` : defaultMsg);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleJoinLobbyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().replace(/^#/, "");
    if (!clean) return;
    net.guestJoin(clean);
  };

  // Default tokens if not provided
  const seatsArray = Array.from({ length: maxSeats }, (_, i) => i);
  const defaultSeatTokens: SeatTokenInfo[] = seatTokens || [
    { name: "Player 1", icon: "👑", color: "#ef4444" },
    { name: "Player 2", icon: "⚡", color: "#22c55e" },
    { name: "Player 3", icon: "🎯", color: "#eab308" },
    { name: "Player 4", icon: "💎", color: "#3b82f6" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl border-2 border-[#3cff5f]/50 bg-[#0c1510] shadow-[0_0_60px_rgba(60,255,95,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Lobby Top Header */}
        <div className="flex items-center justify-between border-b border-[#213026] bg-[#08100c] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shadow-inner">
              {gameIcon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#e7eee9] tracking-wide flex items-center gap-2">
                <span>{gameTitle}</span>
                <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] font-bold text-[#3cff5f] uppercase tracking-wider">
                  Team Hub
                </span>
              </h2>
              <p className="text-xs text-[#8da194] mt-0.5 hidden sm:block">{tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRules && (
              <button
                type="button"
                onClick={onOpenRules}
                className="flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-1.5 text-xs font-bold text-[#e7eee9] hover:bg-[#14231b] hover:border-[#3cff5f]/40 transition-all cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#3cff5f]" />
                <span className="hidden sm:inline">Rules</span>
              </button>
            )}

            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#213026] bg-[#0c1510] text-[#8da194] hover:text-white transition-all cursor-pointer"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-rose-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#8da194]" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        <div className="grid grid-cols-3 border-b border-[#213026] bg-[#08100c] text-xs font-bold">
          <button
            type="button"
            onClick={() => setLobbyTab("create")}
            className={`flex items-center justify-center gap-2 py-3 transition-all cursor-pointer border-b-2 ${
              lobbyTab === "create"
                ? "border-[#3cff5f] bg-[#102417] text-[#3cff5f]"
                : "border-transparent text-[#7e9386] hover:text-[#e7eee9]"
            }`}
          >
            <Crown className="h-4 w-4" />
            <span>Create Team</span>
          </button>

          <button
            type="button"
            onClick={() => setLobbyTab("join")}
            className={`flex items-center justify-center gap-2 py-3 transition-all cursor-pointer border-b-2 ${
              lobbyTab === "join"
                ? "border-[#3cff5f] bg-[#102417] text-[#3cff5f]"
                : "border-transparent text-[#7e9386] hover:text-[#e7eee9]"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Join with Code</span>
          </button>

          <button
            type="button"
            onClick={() => setLobbyTab("solo")}
            className={`flex items-center justify-center gap-2 py-3 transition-all cursor-pointer border-b-2 ${
              lobbyTab === "solo"
                ? "border-[#3cff5f] bg-[#102417] text-[#3cff5f]"
                : "border-transparent text-[#7e9386] hover:text-[#e7eee9]"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>{maxSeats > 2 ? `Solo vs ${maxSeats - 1} AI` : "Solo vs AI"}</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] space-y-4">
          {/* TAB 1: CREATE TEAM & HOST ROOM */}
          {lobbyTab === "create" && (
            <div className="space-y-4">
              {!net.code || net.role !== "host" ? (
                <div className="rounded-2xl border border-[#213026] bg-[#08100c] p-6 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                    <Crown className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-[#e7eee9]">
                    Create a Private {gameTitle.replace(/ LOBBY$/i, "")} Room
                  </h3>
                  <p className="mt-1 text-xs text-[#8da194] max-w-md mx-auto">
                    Generate a unique room code to invite your friends via direct link or WhatsApp.
                    Empty seats will automatically be handled by intelligent AI bots!
                  </p>
                  <button
                    type="button"
                    onClick={() => net.hostStart()}
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-xs font-black text-black shadow-lg shadow-[#3cff5f]/30 hover:bg-[#52ff71] hover:scale-105 active:scale-95 transition-all"
                  >
                    <Crown className="h-4 w-4 fill-black" />
                    <span>Create Team Room Now</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Room Code & Invite Link Share Card */}
                  <div className="rounded-2xl border border-[#2a5234] bg-[#0c1f13] p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3cff5f] block">
                          Active Room Code
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-2xl font-black text-[#e7eee9] tracking-wider">
                            #{net.code}
                          </span>
                          <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2 py-0.5 text-[9px] font-bold text-[#3cff5f]">
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Quick Share Buttons */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => copyLobby("code")}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-bold text-[#e7eee9] hover:bg-[#14231b] hover:border-[#3cff5f]/40 transition-all cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5 text-[#3cff5f]" />
                          <span>{copiedLobby === "code" ? "Copied! ✓" : "Copy Code"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => copyLobby("link")}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2 text-xs font-bold text-[#e7eee9] hover:bg-[#14231b] hover:border-[#3cff5f]/40 transition-all cursor-pointer"
                        >
                          <Link2 className="h-3.5 w-3.5 text-[#3cff5f]" />
                          <span>{copiedLobby === "link" ? "Link Copied! ✓" : "Copy Link"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={shareWhatsApp}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 px-3.5 py-2 text-xs font-bold text-[#25D366] hover:bg-[#25D366]/30 transition-all cursor-pointer"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team Roster Seats */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#e7eee9]">
                        Team Roster ({maxSeats} Seats)
                      </span>
                      <span className="text-[11px] text-[#8da194]">
                        Empty seats will play as smart AI Bots
                      </span>
                    </div>

                    <div
                      className={`grid gap-2.5 ${
                        maxSeats === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"
                      }`}
                    >
                      {seatsArray.map((seat) => {
                        const p = net.players?.[seat];
                        const token = defaultSeatTokens[seat % defaultSeatTokens.length];
                        const isHost = seat === 0;
                        const isBot = !p || p.kind === "bot";

                        return (
                          <div
                            key={seat}
                            className={`rounded-xl border p-3 flex flex-col items-center text-center transition-all ${
                              isHost
                                ? "border-[#3cff5f]/50 bg-[#102a16]"
                                : "border-[#213026] bg-[#08100c]"
                            }`}
                          >
                            <span className="text-xl mb-1">{token.icon}</span>
                            <span className="text-xs font-bold text-[#e7eee9] line-clamp-1">
                              {isHost ? "You (Host)" : p?.name ? p.name : `AI Bot ${seat + 1}`}
                            </span>
                            <span
                              className="text-[10px] font-semibold mt-0.5"
                              style={{ color: token.color }}
                            >
                              {isHost ? "Host • Ready" : isBot ? "AI Rival" : p?.ready ? "Ready ✓" : "Waiting"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Start Game Action */}
                  <button
                    type="button"
                    onClick={handleStartLobbyGame}
                    className="w-full py-4 rounded-2xl bg-[#3cff5f] text-sm font-black text-[#050a08] shadow-[0_0_30px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                  >
                    <Play className="h-5 w-5 fill-current" />
                    <span>{playButtonText}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: JOIN WITH CODE */}
          {lobbyTab === "join" && (
            <div className="space-y-4">
              {net.role !== "guest" ? (
                <div className="rounded-2xl border border-[#213026] bg-[#08100c] p-6">
                  <div className="text-center max-w-sm mx-auto">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                      <Users className="h-7 w-7" />
                    </div>
                    <h3 className="text-base font-bold text-[#e7eee9]">Join a Friend&apos;s Room</h3>
                    <p className="mt-1 text-xs text-[#8da194]">
                      Enter the 4 to 6-character room code shared by the host to connect.
                    </p>

                    <form onSubmit={handleJoinLobbyCode} className="mt-5 space-y-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-lg text-[#3cff5f]">
                          #
                        </span>
                        <input
                          type="text"
                          value={joinCodeInput}
                          onChange={(e) => setJoinCodeInput(e.target.value)}
                          placeholder="ABC12"
                          maxLength={6}
                          className="w-full rounded-2xl border border-[#213026] bg-[#0c1510] py-3.5 pl-9 pr-4 font-mono text-lg font-black uppercase text-white tracking-widest placeholder:text-[#526459] focus:border-[#3cff5f] focus:outline-none"
                        />
                      </div>

                      {net.status && (
                        <p className="text-xs text-rose-400 font-medium">{net.status}</p>
                      )}

                      <button
                        type="submit"
                        disabled={joinCodeInput.trim().length < 3}
                        className="w-full py-3.5 rounded-2xl bg-[#3cff5f] text-xs font-black text-black shadow-lg shadow-[#3cff5f]/20 hover:bg-[#52ff71] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        Join Game Team
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#2a5234] bg-[#0c1f13] p-5 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#102a16] border border-[#2a5234] px-3.5 py-1 text-xs font-bold text-[#3cff5f]">
                    <Wifi className="h-4 w-4" />
                    <span>Connected to Room #{net.code}</span>
                  </div>

                  <p className="text-xs text-[#8da194]">
                    You are in the room as <b>{net.myName}</b> (Seat {net.seat + 1}). Waiting for
                    the host to launch the game...
                  </p>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = net.players?.find((p) => p.seat === net.seat);
                        net.setReady(!cur?.ready);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-[#3cff5f] bg-[#102a16] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] transition-all cursor-pointer"
                    >
                      Toggle Ready Status
                    </button>

                    <button
                      type="button"
                      onClick={() => net.goSolo()}
                      className="px-5 py-2.5 rounded-xl border border-rose-500/40 bg-rose-950/20 text-xs font-bold text-rose-400 hover:bg-rose-900/30 transition-all cursor-pointer"
                    >
                      Leave Room
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SOLO VS AI */}
          {lobbyTab === "solo" && (
            <div className="rounded-2xl border border-[#213026] bg-[#08100c] p-6 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#e7eee9]">
                  Quick Play: {maxSeats > 2 ? `Solo vs ${maxSeats - 1} AI Rivals` : "Solo vs AI"}
                </h3>
                <p className="mt-1 text-xs text-[#8da194] max-w-md mx-auto">
                  Jump straight into an instant match against smart AI opponents with full official
                  rules, instant responses, and zero waiting!
                </p>
              </div>

              <div
                className={`grid gap-2.5 text-left text-xs max-w-md mx-auto pt-2 ${
                  rulesHighlights.length === 2 ? "grid-cols-2" : "grid-cols-3"
                }`}
              >
                {rulesHighlights.map((rh, idx) => (
                  <div key={idx} className="rounded-xl border border-[#1d2a23] bg-[#0c1510] p-2.5">
                    <span className="text-[10px] font-bold text-[#3cff5f] block">{rh.title}</span>
                    <span className="font-mono text-xs text-[#e7eee9]">{rh.desc}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleStartSolo}
                className="w-full max-w-md mx-auto py-3.5 rounded-2xl bg-[#3cff5f] text-sm font-black text-[#050a08] shadow-[0_0_25px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{soloButtonText}</span>
              </button>
            </div>
          )}
        </div>

        {/* Lobby Footer */}
        <div className="border-t border-[#213026] bg-[#08100c] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6e8577]">
          <span className="line-clamp-1">{officialRulesSummary}</span>
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              className="text-[#3cff5f] hover:underline flex items-center gap-1 font-semibold cursor-pointer shrink-0"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Read Full Official Rules</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
