"use client";

import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { RarityTier } from "@/types/game";

interface FishingCanvasProps {
  depth: number;
  maxDepth?: number;
  lastDepthGain?: number;
  lastRarityTier?: RarityTier | null;
  className?: string;
  isGameOver?: boolean;
}

export default function FishingCanvas({
  depth,
  maxDepth = 10000,
  lastDepthGain = 0,
  lastRarityTier = null,
  isGameOver = false,
}: FishingCanvasProps) {
  const [showGainAlert, setShowGainAlert] = useState(false);
  const [gainAmount, setGainAmount] = useState(0);

  // Trigger confetti on rare/ultra_rare catch
  useEffect(() => {
    if (lastDepthGain > 0) {
      setGainAmount(lastDepthGain);
      setShowGainAlert(true);

      if (lastRarityTier === "rare" || lastRarityTier === "ultra_rare") {
        try {
          confetti({
            particleCount: lastRarityTier === "ultra_rare" ? 90 : 45,
            spread: 75,
            origin: { y: 0.65 },
            colors: ["#ffa62b", "#ff6b35", "#00e5ff", "#a855f7", "#34d399", "#ffe66d"],
          });
        } catch {}
      }

      const timer = setTimeout(() => setShowGainAlert(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [depth, lastDepthGain, lastRarityTier]);

  const clampedDepth = Math.max(0, Math.min(depth, maxDepth));
  const depthRatio = clampedDepth / maxDepth;

  // Hook Y position: 36% (at waterline) → 88% (deep abyss)
  const hookYPercent = 36 + depthRatio * 52;
  const hookXPercent = 54;

  const hookedFish = useMemo(() => {
    if (!lastRarityTier || lastRarityTier === "invalid") return null;
    switch (lastRarityTier) {
      case "ultra_rare":
        return { name: "Mythic Golden Rohu", color: "#ffa62b", glow: "rgba(255,166,43,0.8)", emoji: "✨🦈" };
      case "rare":
        return { name: "Luminous Anglerfish", color: "#a855f7", glow: "rgba(168,85,247,0.7)", emoji: "🐡" };
      case "uncommon":
        return { name: "King Surmai", color: "#00e5ff", glow: "rgba(0,229,255,0.5)", emoji: "🐠" };
      case "common":
      default:
        return { name: "Silver Pomfret", color: "#94a3b8", glow: "rgba(148,163,184,0.4)", emoji: "🐟" };
    }
  }, [lastRarityTier]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden select-none pointer-events-none">
      {/* ── SKY SECTION (top 40%) ─────────────────────────────── */}
      <div
        className="absolute inset-x-0 top-0"
        style={{
          height: "40%",
          background: "linear-gradient(180deg, #87CEEB 0%, #aad4f0 50%, #c8e8f8 100%)",
        }}
      >
        {/* Fluffy Cloud 1 */}
        <div
          className="absolute"
          style={{ top: "15%", left: "8%", animation: "drift 40s linear infinite" }}
        >
          <svg viewBox="0 0 120 50" className="w-28 h-12 opacity-90">
            <ellipse cx="60" cy="35" rx="55" ry="18" fill="white" />
            <ellipse cx="35" cy="30" rx="28" ry="20" fill="white" />
            <ellipse cx="75" cy="28" rx="32" ry="22" fill="white" />
            <ellipse cx="55" cy="22" rx="22" ry="18" fill="white" />
          </svg>
        </div>

        {/* Fluffy Cloud 2 */}
        <div
          className="absolute"
          style={{ top: "25%", right: "15%", animation: "drift 55s linear infinite reverse" }}
        >
          <svg viewBox="0 0 100 42" className="w-24 h-10 opacity-80">
            <ellipse cx="50" cy="30" rx="45" ry="14" fill="white" />
            <ellipse cx="28" cy="24" rx="24" ry="18" fill="white" />
            <ellipse cx="65" cy="22" rx="28" ry="20" fill="white" />
            <ellipse cx="48" cy="17" rx="18" ry="15" fill="white" />
          </svg>
        </div>

        {/* Fluffy Cloud 3 */}
        <div
          className="absolute"
          style={{ top: "5%", left: "40%", animation: "drift 70s linear infinite" }}
        >
          <svg viewBox="0 0 80 36" className="w-20 h-9 opacity-70">
            <ellipse cx="40" cy="25" rx="36" ry="13" fill="white" />
            <ellipse cx="22" cy="20" rx="20" ry="16" fill="white" />
            <ellipse cx="55" cy="18" rx="22" ry="17" fill="white" />
          </svg>
        </div>

        {/* Sun */}
        <div
          className="absolute rounded-full"
          style={{
            top: "12%",
            right: "22%",
            width: 48,
            height: 48,
            background: "radial-gradient(circle, #ffe066 0%, #ffa62b 60%, transparent 100%)",
            boxShadow: "0 0 32px 12px rgba(255,214,0,0.25)",
          }}
        />
      </div>

      {/* ── OCEAN SECTION (bottom 60%) ───────────────────────── */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          top: "38%",
          background:
            clampedDepth < 2500
              ? "linear-gradient(180deg, #1a6ea8 0%, #0d4a7a 20%, #072a4e 50%, #041828 80%, #020c18 100%)"
              : clampedDepth < 6000
              ? "linear-gradient(180deg, #0d3a5e 0%, #072040 20%, #040e22 50%, #020810 80%, #010408 100%)"
              : "linear-gradient(180deg, #060e20 0%, #030810 30%, #010408 60%, #010204 100%)",
        }}
      />

      {/* ── WATERLINE WAVE ───────────────────────────────────── */}
      <div className="absolute inset-x-0 overflow-hidden" style={{ top: "37.5%", height: 32 }}>
        {/* Cyan shimmer line */}
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.5) 30%, rgba(255,255,255,0.7) 50%, rgba(0,229,255,0.5) 70%, transparent 100%)",
          }}
        />
        {/* Wave SVG */}
        <svg
          viewBox="0 0 1200 30"
          className="absolute top-0 left-0 w-[200%] h-full fill-none opacity-50"
          style={{ stroke: "rgba(0,229,255,0.4)", strokeWidth: 1.5, animation: "drift 18s linear infinite" }}
        >
          <path d="M0,12 Q75,3 150,12 T300,12 T450,12 T600,12 T750,12 T900,12 T1050,12 T1200,12" />
          <path d="M0,20 Q75,10 150,20 T300,20 T450,20 T600,20 T750,20 T900,20 T1050,20 T1200,20" opacity="0.5" />
        </svg>
      </div>

      {/* ── PIXEL-ART BOAT AT WATERLINE ──────────────────────── */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{ left: "14%", top: "calc(38% - 72px)" }}
      >
        <div className="animate-bob">
          <svg viewBox="0 0 200 90" className="w-36 h-20 sm:w-44 sm:h-24 drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]">
            <defs>
              <linearGradient id="fc-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="#0a0a0a" />
              </linearGradient>
            </defs>
            {/* Hull */}
            <path
              d="M 20 52 Q 50 68 100 68 Q 150 68 182 50 Q 168 60 100 64 Q 32 60 20 52 Z"
              fill="url(#fc-hull)"
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Cabin */}
            <rect x="62" y="34" width="52" height="22" rx="3" fill="#141414" stroke="#222" strokeWidth="1" />
            {/* Mast */}
            <line x1="118" y1="62" x2="118" y2="10" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
            {/* Red Flag */}
            <polygon points="118,10 148,18 118,26" fill="#cc2200" />
            {/* Cabin windows */}
            <rect x="68" y="40" width="10" height="8" rx="1" fill="#00e5ff" opacity="0.6" />
            <rect x="84" y="40" width="10" height="8" rx="1" fill="#00e5ff" opacity="0.6" />
            <rect x="100" y="40" width="10" height="8" rx="1" fill="#00e5ff" opacity="0.6" />
            {/* Fishing rod */}
            <line x1="90" y1="38" x2="168" y2="20" stroke="#555" strokeWidth="2" strokeLinecap="round" />
            {/* Fishing line from rod tip */}
            <line
              x1="168"
              y1="20"
              x2={`${hookXPercent * 2}`}
              y2={`${hookYPercent * 0.9}`}
              stroke="rgba(0,229,255,0.5)"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>

      {/* ── UNDERWATER BUBBLES ───────────────────────────────── */}
      <div className="absolute inset-x-0" style={{ top: "40%", bottom: 0, overflow: "hidden" }}>
        <div className="absolute w-2 h-2 rounded-full bg-cyan-300/30 blur-[0.5px] animate-bubble" style={{ left: "48%", bottom: "10%", animationDuration: "5s" }} />
        <div className="absolute w-3 h-3 rounded-full bg-cyan-200/20 blur-[0.5px] animate-bubble" style={{ left: "58%", bottom: "25%", animationDuration: "7s", animationDelay: "-2s" }} />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-white/25 blur-[0.5px] animate-bubble" style={{ left: "52%", bottom: "5%", animationDuration: "4s", animationDelay: "-1s" }} />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/20 blur-[0.5px] animate-bubble" style={{ left: "64%", bottom: "30%", animationDuration: "6s", animationDelay: "-3s" }} />

        {/* Swimming fish silhouettes */}
        <div className="absolute flex items-center gap-3 opacity-25 pointer-events-none" style={{ top: "20%", animation: "swim 16s linear infinite" }}>
          <svg viewBox="0 0 40 18" className="w-6 h-3 fill-cyan-400">
            <path d="M0,9 Q12,2 26,9 Q34,3 40,0 Q36,9 40,18 Q34,15 26,9 Q12,16 0,9 Z" />
          </svg>
          <svg viewBox="0 0 40 18" className="w-5 h-2.5 fill-cyan-300">
            <path d="M0,9 Q12,2 26,9 Q34,3 40,0 Q36,9 40,18 Q34,15 26,9 Q12,16 0,9 Z" />
          </svg>
        </div>

        <div className="absolute opacity-20 pointer-events-none" style={{ top: "50%", animation: "swimReverse 22s linear infinite" }}>
          <svg viewBox="0 0 60 24" className="w-10 h-4 fill-cyan-500">
            <path d="M60,12 Q45,2 24,12 Q14,4 0,0 Q6,12 0,24 Q14,20 24,12 Q45,22 60,12 Z" />
          </svg>
        </div>

        {/* Deep bioluminescent creature */}
        {clampedDepth > 3500 && (
          <div className="absolute opacity-35 pointer-events-none" style={{ top: "72%", left: "12%", animation: "swim 28s linear infinite" }}>
            <svg viewBox="0 0 80 35" className="w-14 h-7 fill-purple-400" style={{ filter: "drop-shadow(0 0 8px rgba(168,85,247,0.7))" }}>
              <path d="M0,17 Q25,5 50,17 Q65,8 80,2 Q72,17 80,32 Q65,26 50,17 Q25,29 0,17 Z" />
              <circle cx="20" cy="14" r="2.5" fill="#ffe66d" />
            </svg>
          </div>
        )}
      </div>

      {/* ── FISHING LINE (from boat rod tip to hook) ─────────── */}
      <svg className="absolute inset-0 w-full h-full z-20">
        <defs>
          <linearGradient id="fc-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d={`M ${(14 + 22) * 0.98}% ${38 - 3.5}% Q ${hookXPercent - 3}% ${(38 + hookYPercent) / 2}%, ${hookXPercent}% ${hookYPercent}%`}
          stroke="url(#fc-line-grad)"
          strokeWidth="1.4"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* ── FISHING HOOK ─────────────────────────────────────── */}
      <div
        className="absolute z-30 transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-2 pointer-events-none"
        style={{ left: `${hookXPercent}%`, top: `${hookYPercent}%` }}
      >
        <div className="relative">
          <svg viewBox="0 0 36 48" className="w-6 h-8 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <defs>
              <linearGradient id="fc-hook" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>
            <circle cx="18" cy="6" r="3.5" fill="none" stroke="url(#fc-hook)" strokeWidth="2" />
            <line x1="18" y1="9" x2="18" y2="30" stroke="url(#fc-hook)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 18 30 C 18 42, 6 42, 6 32 C 6 26, 12 24, 13 25" fill="none" stroke="url(#fc-hook)" strokeWidth="2.4" strokeLinecap="round" />
            <polygon points="12,24 15,22 14,27" fill="#ffffff" />
          </svg>

          {/* Bait glow */}
          <div className="absolute top-6 left-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400/80 blur-[1px] animate-ping" />

          {/* Hooked fish */}
          {hookedFish && (
            <div className="absolute -top-3 left-3 animate-fish-catch">
              <div
                className="px-2 py-0.5 rounded-full text-xs font-bold text-white flex items-center gap-1 backdrop-blur-md border"
                style={{ backgroundColor: "rgba(10,22,40,0.85)", borderColor: hookedFish.color, boxShadow: `0 0 16px ${hookedFish.glow}` }}
              >
                <span>{hookedFish.emoji}</span>
                <span className="whitespace-nowrap text-[11px]">{hookedFish.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DEPTH GAIN ALERT ─────────────────────────────────── */}
      {showGainAlert && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 font-black text-sm border font-pixel ${
              lastRarityTier === "ultra_rare"
                ? "bg-yellow-950/80 text-yellow-300 border-yellow-400"
                : lastRarityTier === "rare"
                ? "bg-purple-950/80 text-purple-200 border-purple-400"
                : lastRarityTier === "uncommon"
                ? "bg-cyan-950/80 text-cyan-200 border-cyan-400"
                : "bg-slate-900/80 text-slate-200 border-slate-600"
            }`}
          >
            <span>▼ +{gainAmount.toLocaleString()}m DIVE!</span>
            {lastRarityTier && (
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/10 font-bold tracking-wider">
                {lastRarityTier.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
