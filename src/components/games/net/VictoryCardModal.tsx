"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Trophy,
  Download,
  Share2,
  Copy,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { fireVictoryConfetti, GameSound } from "../GameAudio";

export interface VictoryStat {
  label: string;
  value: string;
}

export interface VictoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
  gameTitle: string;
  gameSlug?: string;
  stats?: VictoryStat[];
  victoryQuote?: string;
  onRematch?: () => void;
  isHost?: boolean;
}

export default function VictoryCardModal({
  isOpen,
  onClose,
  winnerName,
  gameTitle,
  gameSlug,
  stats = [
    { label: "Rank", value: "🏆 1st Place" },
    { label: "Difficulty", value: "Pro Match" },
    { label: "Status", value: "Undefeated" },
  ],
  victoryQuote = "Crushed the competition and conquered the board!",
  onRematch,
}: VictoryCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Trigger celebration effects on open
  useEffect(() => {
    if (isOpen) {
      fireVictoryConfetti();
      try {
        GameSound.playPocketChime();
      } catch {
        // audio fallback
      }
    }
  }, [isOpen]);

  // Render high-res Canvas card
  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 480;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#050f09");
    bgGrad.addColorStop(0.5, "#0b1f13");
    bgGrad.addColorStop(1, "#040a06");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative glow aura
    const aura = ctx.createRadialGradient(W / 2, 120, 20, W / 2, 120, 320);
    aura.addColorStop(0, "rgba(60, 255, 95, 0.22)");
    aura.addColorStop(0.6, "rgba(60, 255, 95, 0.05)");
    aura.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = aura;
    ctx.fillRect(0, 0, W, H);

    // Elegant gold/neon border
    ctx.strokeStyle = "#3cff5f";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, W - 32, H - 32);

    ctx.strokeStyle = "rgba(60, 255, 95, 0.25)";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, W - 48, H - 48);

    // Header branding
    ctx.fillStyle = "#3cff5f";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.textAlign = "center";
    ctx.fillText("★ COMPX ORBIT · OFFICIAL CHAMPION CERTIFICATE ★", W / 2, 58);

    // Trophy icon / crown emoji
    ctx.font = "46px system-ui";
    ctx.fillText("🏆", W / 2, 118);

    // Game Title
    ctx.fillStyle = "#9baaa1";
    ctx.font = "bold 15px system-ui, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(gameTitle.toUpperCase(), W / 2, 150);

    // Winner Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px system-ui, sans-serif";
    ctx.shadowColor = "rgba(60, 255, 95, 0.8)";
    ctx.shadowBlur = 18;
    ctx.fillText(winnerName, W / 2, 196);
    ctx.shadowBlur = 0; // reset

    // Victory Quote
    ctx.fillStyle = "#8da194";
    ctx.font = "italic 14px system-ui, sans-serif";
    ctx.fillText(`“${victoryQuote}”`, W / 2, 228);

    // Stat Badges Row
    const cardY = 265;
    const cardH = 80;
    const cardW = 210;
    const startX = (W - (cardW * 3 + 24 * 2)) / 2;

    stats.slice(0, 3).forEach((stat, i) => {
      const x = startX + i * (cardW + 24);

      // Card box
      ctx.fillStyle = "rgba(16, 42, 22, 0.75)";
      ctx.strokeStyle = "rgba(60, 255, 95, 0.35)";
      ctx.lineWidth = 1.5;

      // rounded rect
      const r = 12;
      ctx.beginPath();
      ctx.moveTo(x + r, cardY);
      ctx.lineTo(x + cardW - r, cardY);
      ctx.quadraticCurveTo(x + cardW, cardY, x + cardW, cardY + r);
      ctx.lineTo(x + cardW, cardY + cardH - r);
      ctx.quadraticCurveTo(x + cardW, cardY + cardH, x + cardW - r, cardY + cardH);
      ctx.lineTo(x + r, cardY + cardH);
      ctx.quadraticCurveTo(x, cardY + cardH, x, cardY + cardH - r);
      ctx.lineTo(x, cardY + r);
      ctx.quadraticCurveTo(x, cardY, x + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label
      ctx.fillStyle = "#6e8577";
      ctx.font = "bold 11px system-ui, sans-serif";
      ctx.letterSpacing = "1px";
      ctx.textAlign = "center";
      ctx.fillText(stat.label.toUpperCase(), x + cardW / 2, cardY + 28);

      // Value
      ctx.fillStyle = "#3cff5f";
      ctx.font = "bold 17px system-ui, sans-serif";
      ctx.letterSpacing = "0px";
      ctx.fillText(stat.value, x + cardW / 2, cardY + 56);
    });

    // Footer divider line
    ctx.strokeStyle = "rgba(60, 255, 95, 0.2)";
    ctx.beginPath();
    ctx.moveTo(40, 395);
    ctx.lineTo(W - 40, 395);
    ctx.stroke();

    // Footer watermark & link
    ctx.fillStyle = "#6e8577";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "left";
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    ctx.fillText(`Verified Match · ${dateStr}`, 45, 428);

    ctx.fillStyle = "#3cff5f";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("compxorbit.com/games", W - 45, 428);
  }, [gameTitle, winnerName, stats, victoryQuote]);

  useEffect(() => {
    if (isOpen) {
      // slight delay to let DOM render canvas
      const timer = setTimeout(drawCard, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, drawCard]);

  if (!isOpen) return null;

  // Download Card as PNG Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `CompX-Champion-${gameTitle.replace(/\s+/g, "-")}.png`;
      a.click();
    } catch {
      // fallback
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // Share to WhatsApp
  const handleWhatsApp = () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const msg = `🏆 I just won the match in *${gameTitle}* on CompX Orbit!\n\nCan you beat my record?\nPlay free right now in your browser: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Copy Brag Link
  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl border-2 border-[#3cff5f] bg-[#0c1510] p-5 sm:p-6 shadow-[0_0_80px_rgba(60,255,95,0.3)] animate-in zoom-in-95 duration-200 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[#8da194] hover:bg-[#14231b] hover:text-white transition-all cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Top Header */}
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#102a16] border-2 border-[#3cff5f] text-[#3cff5f] shadow-[0_0_20px_rgba(60,255,95,0.4)]">
          <Trophy className="h-7 w-7 fill-current" />
        </div>

        <h3 className="text-2xl font-black text-[#e7eee9] tracking-tight">
          Victory! {winnerName} Wins!
        </h3>
        <p className="mt-1 text-xs text-[#8da194]">
          Congratulations! Download your official victory certificate or brag to friends!
        </p>

        {/* Real-time Generated Canvas Preview */}
        <div className="my-4 overflow-hidden rounded-2xl border border-[#213026] bg-black/60 shadow-xl">
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-[260px] object-contain block mx-auto"
          />
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3">
          {/* Download Image Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#3cff5f] hover:bg-[#52ff71] py-2.5 px-3 text-xs font-black text-black shadow-lg shadow-[#3cff5f]/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>{downloading ? "Saving..." : "Download Card"}</span>
          </button>

          {/* Share on WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/60 hover:bg-[#25D366]/30 py-2.5 px-3 text-xs font-bold text-[#25D366] transition-all cursor-pointer active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Share WhatsApp</span>
          </button>

          {/* Copy Challenge Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#213026] bg-[#08100c] hover:bg-[#14231b] hover:border-[#3cff5f]/40 py-2.5 px-3 text-xs font-bold text-[#e7eee9] transition-all cursor-pointer active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-[#3cff5f]" />
                <span className="text-[#3cff5f]">Link Copied! ✓</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-[#3cff5f]" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Rematch CTA */}
        {onRematch && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onRematch();
            }}
            className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#8da194] hover:text-[#3cff5f] transition-all cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Play Again / Rematch</span>
          </button>
        )}
      </div>
    </div>
  );
}
