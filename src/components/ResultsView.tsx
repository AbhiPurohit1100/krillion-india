"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Anchor, Check, RotateCcw, Share2, Sparkles, Trophy } from "lucide-react";
import { AnswerResult } from "@/types/game";

interface ResultsViewProps {
  answers: AnswerResult[];
  totalScore: number;
  finalAltitude: number; // Represents final depth in fishing theme
  nickname: string;
  onPlayAgain: () => void;
}

export default function ResultsView({
  answers,
  totalScore,
  finalAltitude: finalDepth,
  nickname,
  onPlayAgain,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  // Trigger celebration on load
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 110,
        spread: 85,
        origin: { y: 0.55 },
        colors: ["#ffa62b", "#ff6b35", "#2596be", "#a855f7", "#34d399", "#ffe66d"],
      });
    } catch {}
  }, []);

  const validAnswersCount = answers.filter((a) => a.isValid).length;

  // Determine Fishing Honor Title
  const expeditionTitle =
    finalDepth >= 8000
      ? "Abyssal Leviathan Hunter 🔱"
      : finalDepth >= 5000
      ? "Deep Sea Master Angler 🦈"
      : finalDepth >= 3000
      ? "Midnight Voyager 🐡"
      : finalDepth >= 1500
      ? "Reef Navigator 🐠"
      : "Shallow Water Fisher 🐟";

  // Share card generator (Emoji grid like Krillion / Wordle)
  const generateShareText = () => {
    const emojis = answers
      .map((a) => {
        if (!a.isValid) return "⬛";
        if (a.rarityTier === "ultra_rare") return "🟨"; // radiant gold / ultra rare
        if (a.rarityTier === "rare") return "🟪"; // purple
        if (a.rarityTier === "uncommon") return "🟦"; // ocean blue
        return "🟩"; // green common
      })
      .join("");

    return `🎣 Krillion India — Daily Expedition\n${
      nickname || "Captain"
    } plunged ${finalDepth.toLocaleString()}m into the depths!\nScore: ${totalScore} pts · Valid Catches: ${validAnswersCount}/7\nCatch Grid: ${emojis}\nCast your line at: ${
      typeof window !== "undefined" ? window.location.origin : "https://krillionindia.vercel.app"
    }`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Krillion India Catch Report",
          text,
        });
        return;
      } catch {}
    }
    // Fallback copy to clipboard
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in p-2 sm:p-4 pb-12">
      {/* ── EXPEDITION HERO REPORT CARD ───────────────────────── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow behind title */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-sunset-gold/15 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sunset-gold/15 border border-sunset-gold/30 text-sunset-gold text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Expedition Completed</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {expeditionTitle}
        </h1>

        <p className="text-sm text-slate-300 font-medium">
          Well done, <strong className="text-white">{nickname || "Captain"}</strong>! Your rarity choices plunged your hook deep into the Indian ocean!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-ocean-300 uppercase tracking-wider">
              Max Depth
            </div>
            <div className="text-xl sm:text-3xl font-black text-white mt-1">
              {finalDepth.toLocaleString()}
              <span className="text-xs font-bold text-slate-400 ml-0.5">m</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-sunset-gold uppercase tracking-wider">
              Total Score
            </div>
            <div className="text-xl sm:text-3xl font-black text-white mt-1">
              {totalScore}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Valid Catches
            </div>
            <div className="text-xl sm:text-3xl font-black text-white mt-1">
              {validAnswersCount} <span className="text-xs font-bold text-slate-400">/ 7</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-black text-sm shadow-lg shadow-sunset-gold/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Copied Catch Card!" : "Share Catch Card"}</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cast Again Today</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-semibold text-sm transition-colors text-center"
          >
            Return to Harbor
          </Link>
        </div>
      </div>

      {/* ── QUESTION BREAKDOWN LOG ────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10 shadow-2xl">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          <Anchor className="w-5 h-5 text-sunset-gold" />
          <span>Expedition Log & Catch Breakdown</span>
          <span className="text-xs bg-white/10 text-slate-300 font-bold px-2.5 py-0.5 rounded-full ml-auto">
            7 Questions
          </span>
        </h2>

        <div className="space-y-3">
          {answers.map((ans, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all ${
                ans.isValid
                  ? ans.rarityTier === "ultra_rare"
                    ? "bg-sunset-gold/10 border-sunset-gold/40 shadow-md shadow-sunset-gold/10"
                    : ans.rarityTier === "rare"
                    ? "bg-purple-950/30 border-purple-500/30"
                    : ans.rarityTier === "uncommon"
                    ? "bg-ocean-950/30 border-ocean-500/30"
                    : "bg-emerald-950/30 border-emerald-500/30"
                  : "bg-white/5 border-white/10 opacity-70"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <span>Cast #{idx + 1}</span>
                    <span>·</span>
                    <span className="text-sunset-gold">{ans.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{ans.questionText}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      ans.isValid
                        ? ans.rarityTier === "ultra_rare"
                          ? "bg-sunset-gold text-slate-950 font-black"
                          : ans.rarityTier === "rare"
                          ? "bg-purple-600 text-white"
                          : ans.rarityTier === "uncommon"
                          ? "bg-ocean-600 text-white"
                          : "bg-emerald-600 text-white"
                        : "bg-slate-600 text-slate-200"
                    }`}
                  >
                    {ans.isValid ? ans.rarityTier.replace("_", " ") : "Invalid"}
                  </span>
                  <div className="text-xs font-black text-white mt-1">
                    +{ans.rarityScore} pts ({ans.depthGained ?? ans.altitudeGained}m)
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold">Your submission: </span>
                  <strong className="text-white font-bold">
                    &ldquo;{ans.rawAnswer || "Time Out"}&rdquo;
                  </strong>
                  {ans.canonicalName && (
                    <span className="text-slate-300 ml-1">
                      (Matched: <em>{ans.canonicalName}</em>)
                    </span>
                  )}
                </div>

                {ans.explanation && (
                  <p className="text-[11px] text-slate-400 italic w-full">
                    {ans.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
