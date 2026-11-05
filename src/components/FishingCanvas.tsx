"use client";

import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Anchor, Sparkles, Waves } from "lucide-react";
import { RarityTier } from "@/types/game";

interface FishingCanvasProps {
  depth: number; // in meters, typically 50 to 10,000+
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
  className = "",
  isGameOver = false,
}: FishingCanvasProps) {
  const [showGainAlert, setShowGainAlert] = useState(false);
  const [gainAmount, setGainAmount] = useState(0);

  // Trigger celebration on rare/ultra_rare catch
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
            colors: ["#ffa62b", "#ff6b35", "#2596be", "#a855f7", "#34d399", "#ffe66d"],
          });
        } catch {}
      }

      const timer = setTimeout(() => {
        setShowGainAlert(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [depth, lastDepthGain, lastRarityTier]);

  // Clamp depth between 0 and maxDepth
  const clampedDepth = Math.max(0, Math.min(depth, maxDepth));
  const depthRatio = clampedDepth / maxDepth;

  // Hook vertical position: moves from ~38% (shallow just below boat) down to ~86% (deep abyss)
  const hookYPercent = 38 + depthRatio * 48;
  const hookXPercent = 54;

  // Depth Zone information
  const oceanZone = useMemo(() => {
    if (clampedDepth < 1500) {
      return {
        name: "Sunlit Shallows",
        level: "0 - 1,500m",
        fishType: "Silver Pomfret & Bangda",
        color: "text-amber-400",
        badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      };
    }
    if (clampedDepth < 4000) {
      return {
        name: "Twilight Waters",
        level: "1,500 - 4,000m",
        fishType: "Surmai & Reef Sharks",
        color: "text-ocean-300",
        badgeBg: "bg-ocean-500/10 border-ocean-500/30 text-ocean-300",
      };
    }
    if (clampedDepth < 7500) {
      return {
        name: "Midnight Depths",
        level: "4,000 - 7,500m",
        fishType: "Bioluminescent Angler",
        color: "text-purple-400",
        badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
      };
    }
    return {
      name: "Abyssal Trench",
      level: "7,500m+",
      fishType: "Mythic Golden Leviathan",
      color: "text-sunset-gold",
      badgeBg: "bg-sunset-gold/20 border-sunset-gold/50 text-sunset-gold shadow-lg shadow-sunset-gold/20",
    };
  }, [clampedDepth]);

  // Hooked fish details based on last rarity tier
  const hookedFish = useMemo(() => {
    if (!lastRarityTier || lastRarityTier === "invalid") return null;
    switch (lastRarityTier) {
      case "ultra_rare":
        return {
          name: "Mythic Golden Rohu",
          color: "#ffa62b",
          glow: "rgba(255, 166, 43, 0.8)",
          size: "scale-125",
          emoji: "✨🦈",
        };
      case "rare":
        return {
          name: "Luminous Anglerfish",
          color: "#a855f7",
          glow: "rgba(168, 85, 247, 0.7)",
          size: "scale-110",
          emoji: "🐡",
        };
      case "uncommon":
        return {
          name: "King Surmai",
          color: "#38bdf8",
          glow: "rgba(56, 189, 248, 0.5)",
          size: "scale-100",
          emoji: "🐠",
        };
      case "common":
      default:
        return {
          name: "Silver Pomfret",
          color: "#94a3b8",
          glow: "rgba(148, 163, 184, 0.4)",
          size: "scale-90",
          emoji: "🐟",
        };
    }
  }, [lastRarityTier]);

  return (
    <div
      className={`relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 transition-all duration-1000 select-none ${className}`}
      style={{
        background:
          clampedDepth < 2500
            ? "linear-gradient(180deg, #1e112a 0%, #17223b 16%, #0d3859 34%, #0a2540 68%, #051424 100%)"
            : clampedDepth < 6000
            ? "linear-gradient(180deg, #160c22 0%, #0e1c33 16%, #08223d 34%, #061729 68%, #030a14 100%)"
            : "linear-gradient(180deg, #0f0717 0%, #081122 16%, #041220 34%, #020b14 68%, #010408 100%)",
      }}
    >
      {/* ── SKY SECTION (Top 22%) ────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[22%] overflow-hidden pointer-events-none">
        {/* Indian Sunset Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sunset-saffron/30 via-sunset-amber/20 to-transparent" />

        {/* Setting Sun Silhouette Glow */}
        <div className="absolute -top-10 left-1/4 w-40 h-40 bg-gradient-to-b from-sunset-gold/30 via-sunset-saffron/15 to-transparent rounded-full blur-2xl" />

        {/* Distant Palm Shoreline Silhouette */}
        <svg
          viewBox="0 0 1000 60"
          preserveAspectRatio="none"
          className="absolute bottom-1 left-0 w-full h-8 opacity-25 text-slate-900 fill-current"
        >
          <path d="M0,60 L0,35 Q40,20 80,35 Q130,10 180,38 Q250,15 320,40 Q400,22 470,38 Q550,12 630,42 Q700,20 780,38 Q850,15 920,35 Q960,25 1000,38 L1000,60 Z" />
        </svg>

        {/* Distant Stars in Nightfall (appear when diving deep) */}
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: Math.min(1, clampedDepth / 3000) }}
        >
          <div className="absolute top-3 left-[15%] w-1 h-1 bg-amber-200/80 rounded-full animate-ping" />
          <div className="absolute top-6 left-[65%] w-1.5 h-1.5 bg-white/70 rounded-full" />
          <div className="absolute top-4 right-[20%] w-1 h-1 bg-amber-100/60 rounded-full" />
        </div>
      </div>

      {/* ── WATER SURFACE & WAVES (Around 20-24%) ─────────────── */}
      <div className="absolute top-[20%] left-0 right-0 h-8 pointer-events-none z-10 overflow-hidden">
        {/* Golden Sunset Reflection on Surface */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sunset-gold/60 to-transparent animate-pulse" />

        {/* Shimmering Animated Wave Lines */}
        <svg
          viewBox="0 0 1200 40"
          className="absolute top-0 left-0 w-[200%] h-full opacity-40 fill-none stroke-sunset-gold/40 stroke-[1.5]"
          style={{
            animation: "drift 18s linear infinite",
          }}
        >
          <path d="M0,15 Q75,5 150,15 T300,15 T450,15 T600,15 T750,15 T900,15 T1050,15 T1200,15" />
          <path d="M0,22 Q75,12 150,22 T300,22 T450,22 T600,22 T750,22 T900,22 T1050,22 T1200,22" opacity="0.5" />
        </svg>
      </div>

      {/* ── TRADITIONAL INDIAN FISHING BOAT (Bobbing on Surface) ─ */}
      <div
        className="absolute z-20 pointer-events-none transition-all duration-700"
        style={{
          left: "22%",
          top: "16%",
        }}
      >
        <div className="animate-bob">
          <svg
            viewBox="0 0 180 80"
            className="w-32 h-16 sm:w-40 sm:h-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          >
            <defs>
              <linearGradient id="boatHullWood" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8d5b31" />
                <stop offset="50%" stopColor="#5c381c" />
                <stop offset="100%" stopColor="#371e0c" />
              </linearGradient>
              <linearGradient id="brassLantern" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe66d" />
                <stop offset="100%" stopColor="#ff8c42" />
              </linearGradient>
              <filter id="lanternGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffa62b" floodOpacity="0.9" />
              </filter>
            </defs>

            {/* Indian Teak Boat Hull (Curved Machhua / Canoe) */}
            <path
              d="M 15 42 Q 40 56 90 56 Q 140 56 168 38 Q 155 48 90 52 Q 25 48 15 42 Z"
              fill="url(#boatHullWood)"
              stroke="#2e1909"
              strokeWidth="1.5"
            />
            {/* Hull side rim with decorative brass studs */}
            <path
              d="M 20 43 Q 90 53 162 40"
              fill="none"
              stroke="#ffa62b"
              strokeWidth="0.8"
              strokeDasharray="2 6"
              opacity="0.85"
            />

            {/* Fisherman Silhouette */}
            <circle cx="82" cy="27" r="5" fill="#1e130c" />
            <path
              d="M 76 34 Q 82 31 88 34 L 86 44 L 78 44 Z"
              fill="#1e130c"
            />
            {/* Saffron Turban / Pagri accent */}
            <ellipse cx="82" cy="25" rx="5.5" ry="3.5" fill="#ff6b35" />

            {/* Long Bamboo Fishing Rod (Angled over water to the right) */}
            <line
              x1="86"
              y1="34"
              x2="155"
              y2="18"
              stroke="#d4a373"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Rod guides / rings */}
            <circle cx="108" cy="29" r="1.2" fill="#ffe66d" />
            <circle cx="132" cy="23" r="1.2" fill="#ffe66d" />
            <circle cx="154" cy="18" r="1.5" fill="#ffe66d" />

            {/* Brass Diya / Lantern at Boat Stern with warm glow */}
            <circle
              cx="26"
              cy="38"
              r="3.5"
              fill="url(#brassLantern)"
              filter="url(#lanternGlow)"
              className="animate-pulse"
            />
            <line x1="26" y1="41" x2="26" y2="44" stroke="#4a3018" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* ── UNDERWATER PARTICLES & BUBBLES ───────────────────── */}
      <div className="absolute inset-x-0 bottom-0 top-[22%] pointer-events-none overflow-hidden">
        {/* Floating Ambient Bubbles */}
        <div
          className="absolute w-2 h-2 rounded-full bg-cyan-300/30 blur-[0.5px] animate-bubble"
          style={{ left: "48%", bottom: "10%", animationDuration: "5s" }}
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-cyan-200/20 blur-[0.5px] animate-bubble"
          style={{ left: "58%", bottom: "25%", animationDuration: "7s", animationDelay: "-2s" }}
        />
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-white/30 blur-[0.5px] animate-bubble"
          style={{ left: "52%", bottom: "5%", animationDuration: "4s", animationDelay: "-1s" }}
        />
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/20 blur-[0.5px] animate-bubble"
          style={{ left: "64%", bottom: "30%", animationDuration: "6s", animationDelay: "-3s" }}
        />

        {/* Background Swimming Fish Silhouettes */}
        {/* Shallow School of Fish */}
        <div
          className="absolute flex items-center gap-3 opacity-30 pointer-events-none"
          style={{
            top: "28%",
            animation: "swim 16s linear infinite",
          }}
        >
          <svg viewBox="0 0 40 18" className="w-6 h-3 fill-cyan-400">
            <path d="M0,9 Q12,2 26,9 Q34,3 40,0 Q36,9 40,18 Q34,15 26,9 Q12,16 0,9 Z" />
          </svg>
          <svg viewBox="0 0 40 18" className="w-5 h-2.5 fill-cyan-300">
            <path d="M0,9 Q12,2 26,9 Q34,3 40,0 Q36,9 40,18 Q34,15 26,9 Q12,16 0,9 Z" />
          </svg>
        </div>

        {/* Mid-Depth Fish swimming reverse */}
        <div
          className="absolute opacity-25 pointer-events-none"
          style={{
            top: "52%",
            animation: "swimReverse 22s linear infinite",
          }}
        >
          <svg viewBox="0 0 60 24" className="w-10 h-4 fill-ocean-300">
            <path d="M60,12 Q45,2 24,12 Q14,4 0,0 Q6,12 0,24 Q14,20 24,12 Q45,22 60,12 Z" />
          </svg>
        </div>

        {/* Deep Abyss Bioluminescent Creature (Only in deep water) */}
        {clampedDepth > 3500 && (
          <div
            className="absolute opacity-40 pointer-events-none animate-pulse-soft"
            style={{
              top: "76%",
              left: "15%",
              animation: "swim 28s linear infinite",
            }}
          >
            <svg viewBox="0 0 80 35" className="w-14 h-7 fill-purple-400 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]">
              <path d="M0,17 Q25,5 50,17 Q65,8 80,2 Q72,17 80,32 Q65,26 50,17 Q25,29 0,17 Z" />
              <circle cx="20" cy="14" r="2.5" fill="#ffe66d" />
            </svg>
          </div>
        )}
      </div>

      {/* ── FISHING LINE (From Boat Rod to Hook) ─────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        <defs>
          <linearGradient id="fishingLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe66d" stopOpacity="0.9" />
            <stop offset="30%" stopColor="#89cfff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#89cfff" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Rod Tip Coordinates approx: Left ~37%, Top ~19% */}
        {/* Hook Coordinates: Left `hookXPercent%`, Top `hookYPercent%` */}
        <path
          d={`M 36.5% 19% Q ${hookXPercent - 4}% ${(19 + hookYPercent) / 2}%, ${hookXPercent}% ${hookYPercent}%`}
          stroke="url(#fishingLineGrad)"
          strokeWidth="1.6"
          fill="none"
          filter="url(#lineGlow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* ── THE FISHING HOOK & CAUGHT FISH ────────────────────── */}
      <div
        className="absolute z-30 transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-2 pointer-events-none"
        style={{
          left: `${hookXPercent}%`,
          top: `${hookYPercent}%`,
        }}
      >
        <div className="relative">
          {/* Metallic Fishing Hook SVG */}
          <svg
            viewBox="0 0 36 48"
            className="w-7 h-9 text-slate-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter"
          >
            <defs>
              <linearGradient id="metalHook" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
            </defs>

            {/* Eye of hook */}
            <circle cx="18" cy="6" r="3.5" fill="none" stroke="url(#metalHook)" strokeWidth="2" />
            {/* Shank */}
            <line x1="18" y1="9" x2="18" y2="30" stroke="url(#metalHook)" strokeWidth="2.2" strokeLinecap="round" />
            {/* Bend & Barb */}
            <path
              d="M 18 30 C 18 42, 6 42, 6 32 C 6 26, 12 24, 13 25"
              fill="none"
              stroke="url(#metalHook)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Sharp Point */}
            <polygon points="12,24 15,22 14,27" fill="#ffffff" />
          </svg>

          {/* Scent/Bait Glow */}
          <div className="absolute top-7 left-1 w-2.5 h-2.5 rounded-full bg-sunset-coral/90 blur-[1px] animate-ping" />

          {/* Hooked Fish Visual (if last answer was valid) */}
          {hookedFish && (
            <div
              className={`absolute -top-3 left-3 flex items-center gap-1.5 transition-all duration-500 animate-fish-catch ${hookedFish.size}`}
            >
              <div
                className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-xl flex items-center gap-1.5 backdrop-blur-md border"
                style={{
                  backgroundColor: "rgba(10, 22, 40, 0.85)",
                  borderColor: hookedFish.color,
                  boxShadow: `0 0 16px ${hookedFish.glow}`,
                }}
              >
                <span>{hookedFish.emoji}</span>
                <span className="whitespace-nowrap">{hookedFish.name}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING DEPTH GAIN ALERT ───────────────────────── */}
      {showGainAlert && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <div
            className={`px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 font-black text-sm sm:text-base border ${
              lastRarityTier === "ultra_rare"
                ? "bg-sunset-gold/20 text-sunset-gold border-sunset-gold shadow-sunset-gold/30"
                : lastRarityTier === "rare"
                ? "bg-purple-950/80 text-purple-200 border-purple-400 shadow-purple-500/20"
                : lastRarityTier === "uncommon"
                ? "bg-ocean-950/80 text-ocean-200 border-ocean-400 shadow-ocean-500/20"
                : "bg-slate-900/80 text-slate-200 border-slate-600"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sunset-gold animate-spin" />
            <span>+{gainAmount.toLocaleString()} m Plunge!</span>
            {lastRarityTier && (
              <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-white/10 font-bold tracking-wider">
                {lastRarityTier.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── TOP RIGHT HUD: Real-time Depth Meter ─────────────── */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-1.5 pointer-events-none">
        <div className="bg-ocean-950/85 backdrop-blur-xl border border-white/15 px-4 py-2.5 rounded-2xl text-white shadow-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ocean-600 to-ocean-400 flex items-center justify-center shadow-lg shadow-ocean-500/30">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Current Depth
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
              <span className="text-gradient-gold">{clampedDepth.toLocaleString()}</span>
              <span className="text-xs font-semibold text-slate-400">m</span>
            </div>
          </div>
        </div>

        {/* Ocean Zone Pill */}
        <div
          className={`text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md border flex items-center gap-1.5 ${oceanZone.badgeBg}`}
        >
          <Waves className="w-3.5 h-3.5" />
          <span>{oceanZone.name}</span>
          <span className="text-[10px] opacity-75">({oceanZone.level})</span>
        </div>
      </div>

      {/* ── BOTTOM LEFT: Expedition Status Pill ──────────────── */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 bg-ocean-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs text-slate-300 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-200">
          Target: <span className="text-ocean-300 font-normal">{oceanZone.fishType}</span>
        </span>
      </div>
    </div>
  );
}

