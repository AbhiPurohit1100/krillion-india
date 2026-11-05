"use client";

import React, { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Wind } from "lucide-react";

interface KiteCanvasProps {
  altitude: number; // in meters, typically 50 to 10,000+
  maxAltitude?: number;
  lastAltitudeGain?: number;
  lastRarityTier?: "common" | "uncommon" | "rare" | "ultra_rare" | "invalid" | null;
  className?: string;
}

export default function KiteCanvas({
  altitude,
  maxAltitude = 10000,
  lastAltitudeGain = 0,
  lastRarityTier = null,
  className = "",
}: KiteCanvasProps) {
  const [showGainAlert, setShowGainAlert] = useState(false);
  const [gainAmount, setGainAmount] = useState(0);

  // Trigger celebration on rare/ultra_rare answer
  useEffect(() => {
    if (lastAltitudeGain > 0) {
      setGainAmount(lastAltitudeGain);
      setShowGainAlert(true);

      if (lastRarityTier === "rare" || lastRarityTier === "ultra_rare") {
        try {
          confetti({
            particleCount: lastRarityTier === "ultra_rare" ? 80 : 40,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#FF6F00", "#FFB300", "#00ACC1", "#D81B60", "#4CAF50"],
          });
        } catch {}
      }

      const timer = setTimeout(() => {
        setShowGainAlert(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [altitude, lastAltitudeGain, lastRarityTier]);

  // Calculate vertical position percentage (from 80% at bottom to 15% at top)
  // Clamp altitude between 0 and maxAltitude
  const clampedAltitude = Math.max(0, Math.min(altitude, maxAltitude));
  const altitudeRatio = clampedAltitude / maxAltitude;

  // Kite top percentage: 80% (low) -> 12% (high)
  const kiteYPercent = 78 - altitudeRatio * 64;

  // Kite horizontal sway offset (center around 50% + slight natural drift)
  const kiteXPercent = 52;

  // Sky zone name
  const skyZone = useMemo(() => {
    if (clampedAltitude < 1500) return { name: "City Skyline", level: "Low Sky", color: "text-amber-300" };
    if (clampedAltitude < 4000) return { name: "Cloud Layer", level: "Mid Sky", color: "text-sky-200" };
    if (clampedAltitude < 7500) return { name: "Jetstream", level: "High Sky", color: "text-cyan-200" };
    return { name: "Stratosphere", level: "Apex Flight", color: "text-fuchsia-300" };
  }, [clampedAltitude]);

  return (
    <div
      className={`relative w-full h-[360px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-1000 select-none ${className}`}
      style={{
        background:
          clampedAltitude < 2500
            ? "linear-gradient(180deg, #0284c7 0%, #38bdf8 50%, #bae6fd 100%)"
            : clampedAltitude < 6000
            ? "linear-gradient(180deg, #0f172a 0%, #0369a1 40%, #0284c7 100%)"
            : "linear-gradient(180deg, #090d16 0%, #1e1b4b 35%, #075985 100%)",
      }}
    >
      {/* Background Starfield (visible at higher altitudes) */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: Math.max(0, (clampedAltitude - 3500) / 4500) }}
      >
        <div className="absolute top-8 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute top-16 right-1/3 w-1.5 h-1.5 bg-amber-200 rounded-full"></div>
        <div className="absolute top-24 left-1/6 w-1 h-1 bg-cyan-200 rounded-full"></div>
        <div className="absolute top-10 right-1/4 w-1 h-1 bg-white rounded-full"></div>
      </div>

      {/* Drifting Clouds Layer 1 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute w-56 h-20 bg-white/30 rounded-full blur-xl animate-drift"
          style={{ top: "35%", animationDuration: "28s" }}
        />
        <div
          className="absolute w-72 h-24 bg-white/20 rounded-full blur-2xl animate-drift"
          style={{ top: "60%", animationDuration: "35s", animationDelay: "-12s" }}
        />
        <div
          className="absolute w-44 h-16 bg-white/25 rounded-full blur-lg animate-drift"
          style={{ top: "15%", animationDuration: "22s", animationDelay: "-5s" }}
        />
      </div>

      {/* SVG String (Manja) connecting bottom spool to Kite */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="manjaGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
          <filter id="stringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#f43f5e" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Curved string tension line */}
        <path
          d={`M 15% 98% Q ${kiteXPercent - 10}% ${(kiteYPercent + 98) / 2}%, ${kiteXPercent}% ${kiteYPercent + 5}%`}
          stroke="url(#manjaGrad)"
          strokeWidth="1.8"
          fill="none"
          strokeDasharray="4 1"
          filter="url(#stringGlow)"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* The Animated Indian Kite (Patang) */}
      <div
        className="absolute z-20 transition-all duration-1000 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${kiteXPercent}%`,
          top: `${kiteYPercent}%`,
        }}
      >
        <div className="animate-sway origin-top">
          <div className="relative animate-float">
            {/* Patang SVG */}
            <svg
              viewBox="0 0 120 120"
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
            >
              <defs>
                <linearGradient id="saffronGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6F00" />
                  <stop offset="100%" stopColor="#FF8F00" />
                </linearGradient>
                <linearGradient id="turquoiseGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00ACC1" />
                  <stop offset="100%" stopColor="#00838F" />
                </linearGradient>
                <linearGradient id="marigoldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFC107" />
                  <stop offset="100%" stopColor="#FFA000" />
                </linearGradient>
                <linearGradient id="crimsonGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E91E63" />
                  <stop offset="100%" stopColor="#C2185B" />
                </linearGradient>
              </defs>

              {/* Four Quadrants of the Patang */}
              {/* Top Quadrant */}
              <polygon points="60,6 114,60 60,60" fill="url(#saffronGrad)" />
              {/* Left Quadrant */}
              <polygon points="60,6 6,60 60,60" fill="url(#marigoldGrad)" />
              {/* Bottom-Left Quadrant */}
              <polygon points="6,60 60,114 60,60" fill="url(#turquoiseGrad)" />
              {/* Bottom-Right Quadrant */}
              <polygon points="114,60 60,114 60,60" fill="url(#crimsonGrad)" />

              {/* Center Decorative Diamond Emblem */}
              <polygon points="60,40 76,60 60,80 44,60" fill="#ffffff" opacity="0.92" />
              <circle cx="60" cy="60" r="5" fill="#FF6F00" />

              {/* Bamboo Spine: Taddi (Vertical Stiff Bamboo) */}
              <line
                x1="60"
                y1="4"
                x2="60"
                y2="116"
                stroke="#6D4C41"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Bamboo Bow: Kampa (Bent Curved Bamboo) */}
              <path
                d="M 6 60 Q 60 12 114 60"
                fill="none"
                stroke="#5D4037"
                strokeWidth="2.2"
                strokeLinecap="round"
              />

              {/* Paper Tail (Poonch / Tukkal) */}
              <polygon points="60,114 50,130 70,130" fill="url(#marigoldGrad)" />
              <polygon points="60,126 53,138 67,138" fill="url(#saffronGrad)" />
            </svg>

            {/* Trailing Paper Ribbons */}
            <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 flex items-center gap-1 opacity-80">
              <span className="w-0.5 h-6 bg-amber-400 rotate-12 animate-pulse" />
              <span className="w-0.5 h-8 bg-pink-500 -rotate-12" />
              <span className="w-0.5 h-6 bg-cyan-400 rotate-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Wooden Spool (Charkhi) Anchor in Bottom Left */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs">
        <div className="w-5 h-5 rounded-full bg-amber-600 border border-amber-300 flex items-center justify-center text-[10px] shadow">
          🧵
        </div>
        <span className="font-semibold text-slate-200">Charkhi Anchor</span>
      </div>

      {/* Floating Altitude Gain Alert */}
      {showGainAlert && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div
            className={`px-4 py-2 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 font-black text-sm sm:text-base border ${
              lastRarityTier === "ultra_rare"
                ? "bg-purple-900/90 text-purple-200 border-purple-400"
                : lastRarityTier === "rare"
                ? "bg-amber-900/90 text-amber-200 border-amber-400"
                : lastRarityTier === "uncommon"
                ? "bg-sky-900/90 text-sky-200 border-sky-400"
                : "bg-slate-900/80 text-slate-200 border-slate-500"
            }`}
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>+{gainAmount.toLocaleString()} m Altitude!</span>
            {lastRarityTier && (
              <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-white/20 font-bold tracking-wider">
                {lastRarityTier.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top HUD: Real-time Altitude & Zone */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
        <div className="bg-slate-950/75 backdrop-blur-md border border-white/25 px-4 py-2 rounded-2xl text-white shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-patang-saffron to-amber-400 flex items-center justify-center shadow">
            <Wind className="w-4 h-4 text-white" />
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
              Kite Altitude
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight flex items-baseline gap-1">
              {clampedAltitude.toLocaleString()} <span className="text-xs font-semibold text-white">m</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={skyZone.color}>{skyZone.name}</span>
          <span className="text-slate-400 text-[10px]">({skyZone.level})</span>
        </div>
      </div>
    </div>
  );
}

