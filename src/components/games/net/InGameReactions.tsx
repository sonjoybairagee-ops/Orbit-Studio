"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Sparkles, Smile } from "lucide-react";
import { GameSound } from "../GameAudio";
import { NetGameApi } from "./useNetGame";

export interface ReactionItem {
  id: string;
  emoji: string;
  label: string;
  soundId: string;
}

export const REACTION_LIST: ReactionItem[] = [
  { id: "nice", emoji: "🎯", label: "Nice Move!", soundId: "nice" },
  { id: "laugh", emoji: "😂", label: "Haha!", soundId: "laugh" },
  { id: "oops", emoji: "😱", label: "Oops!", soundId: "oops" },
  { id: "fire", emoji: "🔥", label: "On Fire!", soundId: "fire" },
  { id: "king", emoji: "👑", label: "I'm King!", soundId: "king" },
  { id: "gg", emoji: "👏", label: "GG!", soundId: "gg" },
  { id: "rip", emoji: "💀", label: "RIP!", soundId: "rip" },
];

export interface FloatingBubble {
  id: string;
  emoji: string;
  text: string;
  senderName: string;
}

export interface InGameReactionsProps {
  net?: NetGameApi;
  myName?: string;
  position?: "bottom" | "top";
  className?: string;
}

export default function InGameReactions({
  net,
  myName = "You",
  position = "bottom",
  className = "",
}: InGameReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const cooldownRef = useRef(false);

  // Trigger a reaction locally and via WebRTC
  const triggerReaction = (item: ReactionItem, sender = myName) => {
    if (cooldownRef.current && sender === myName) return;
    if (sender === myName) {
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 1000);
    }

    // Play synthesized meme sound
    try {
      GameSound.playReaction(item.soundId);
    } catch {
      // fallback
    }

    // Display floating speech bubble
    const newBubble: FloatingBubble = {
      id: `${Date.now()}-${Math.random()}`,
      emoji: item.emoji,
      text: item.label,
      senderName: sender,
    };

    setBubbles((prev) => [...prev.slice(-3), newBubble]);
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
    }, 2800);

    // If multiplayer, broadcast to peers
    if (net && net.isNet) {
      const payload = {
        type: "reaction",
        id: item.id,
        emoji: item.emoji,
        label: item.label,
        soundId: item.soundId,
        senderName: sender,
        fromSeat: net.seat,
      };
      if (net.role === "host") {
        net.broadcast(payload);
      } else {
        net.send(payload);
      }
    } else if (sender === myName) {
      // Solo Mode: Funny AI Bot replies 30% of the time after 1.2s
      if (Math.random() < 0.35) {
        setTimeout(() => {
          const aiReplies: ReactionItem[] = [
            { id: "laugh", emoji: "😂", label: "Haha!", soundId: "laugh" },
            { id: "nice", emoji: "🎯", label: "Nice Move!", soundId: "nice" },
            { id: "gg", emoji: "👏", label: "GG!", soundId: "gg" },
            { id: "fire", emoji: "🔥", label: "Watch Out!", soundId: "fire" },
          ];
          const chosen = aiReplies[Math.floor(Math.random() * aiReplies.length)];
          triggerReaction(chosen, "Smart Bot");
        }, 1200);
      }
    }
  };

  // Listen for peer reaction events
  useEffect(() => {
    if (!net) return;

    // Guest receiving broadcast from host
    if (net.role === "guest" && net.remote) {
      const r = net.remote as {
        type?: string;
        id?: string;
        emoji?: string;
        label?: string;
        soundId?: string;
        senderName?: string;
        fromSeat?: number;
      };
      if (r.type === "reaction" && r.fromSeat !== net.seat && r.id) {
        const item = REACTION_LIST.find((x) => x.id === r.id);
        if (item) {
          triggerReaction(item, r.senderName || `Player ${r.fromSeat! + 1}`);
        }
      }
    }

    // Host receiving action from guest
    if (net.role === "host") {
      net.onAction((rawA: unknown, fromSeat: number) => {
        const a = rawA as {
          type?: string;
          id?: string;
          emoji?: string;
          label?: string;
          soundId?: string;
          senderName?: string;
        };
        if (a && a.type === "reaction" && a.id) {
          const item = REACTION_LIST.find((x) => x.id === a.id);
          if (item) {
            triggerReaction(item, a.senderName || `Player ${fromSeat + 1}`);
            // Relink broadcast to all guests
            net.broadcast({ ...a, fromSeat });
          }
        }
      });
    }
  }, [net]);

  return (
    <>
      {/* Floating Animated Bubbles Container */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="flex items-center gap-2 rounded-full border-2 border-[#3cff5f] bg-[#0c1510]/95 px-4 py-2 text-white shadow-[0_0_25px_rgba(60,255,95,0.4)] backdrop-blur-md animate-in slide-in-from-bottom-4 zoom-in-90 fade-in duration-300"
          >
            <span className="text-xl sm:text-2xl animate-bounce">{b.emoji}</span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3cff5f]">
                {b.senderName}
              </span>
              <span className="text-xs sm:text-sm font-black text-[#e7eee9]">{b.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Reactions Bar / Trigger */}
      <div className={`relative z-40 flex items-center gap-1.5 ${className}`}>
        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-md ${
            isOpen
              ? "border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-[0_0_15px_rgba(60,255,95,0.3)]"
              : "border-[#213026] bg-[#0c1510]/90 text-[#8da194] hover:border-[#3cff5f]/50 hover:text-white"
          }`}
          title="In-Game Quick Chat Reactions"
        >
          <Smile className="h-4 w-4 text-[#3cff5f]" />
          <span className="hidden sm:inline">React</span>
        </button>

        {/* Reaction Emoji Palette */}
        {isOpen && (
          <div className="flex items-center gap-1 rounded-full border border-[#213026] bg-[#08100c]/95 p-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
            {REACTION_LIST.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerReaction(item);
                  setIsOpen(false);
                }}
                className="group relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full hover:bg-[#14231b] hover:scale-125 transition-all cursor-pointer"
                title={item.label}
              >
                <span className="text-base sm:text-lg group-active:scale-90 transition-transform">
                  {item.emoji}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
