"use client";

import React, { useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Award, Check, Copy, Flame, RotateCcw, Share2, Trophy, Wind, X } from "lucide-react";
import { AnswerResult } from "@/types/game";

interface ResultsViewProps {
  answers: AnswerResult[];
  totalScore: number;
  finalAltitude: number;
  nickname: string;
  onPlayAgain: () => void;
}

export default function ResultsView({
  answers,
  totalScore,
  finalAltitude,
  nickname,
  onPlayAgain,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  // Trigger celebration on load
  React.useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ["#FF6F00", "#FFB300", "#00ACC1", "#D81B60", "#4CAF50"],
      });
    } catch {}
  }, []);

  const validAnswersCount = answers.filter((a) => a.isValid).length;

  // Determine Flight Honor Title
  const flightTitle =
    finalAltitude >= 8000
      ? "Stratosphere Apex Kite Pilot 🚀"
      : finalAltitude >= 5000
      ? "High Altitude Master 🦅"
      : finalAltitude >= 3000
      ? "Sky Voyager 🪁"
      : "Rooftop Flyer 🏠";

  // Share card generator (Emoji grid like Krillion / Wordle)
  const generateShareText = () => {
    const emojis = answers
      .map((a) => {
        if (!a.isValid) return "⬛";
        if (a.rarityTier === "ultra_rare") return "🟪";
        if (a.rarityTier === "rare") return "🟨";
        if (a.rarityTier === "uncommon") return "🟦";
        return "🟩";
      })
      .join("");

    return `🪁 Patang Trivia (Krillion India)\n${nickname} reached ${finalAltitude.toLocaleString()}m altitude!\nTotal Score: ${totalScore} pts\nFlight Grid: ${emojis}\nFly your kite at: ${window.location.origin}`;
  };

  const handleShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Patang Trivia Score",
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
      {/* Flight Hero Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-4 border border-white/80 shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Daily Flight Completed</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {flightTitle}
        </h1>

        <p className="text-sm text-slate-600 font-medium">
          Congratulations <strong className="text-slate-900">{nickname || "Kite Flyer"}</strong>! Your rarity choices lifted your patang high above India!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="bg-sky-50/80 border border-sky-200/70 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
              Peak Altitude
            </div>
            <div className="text-xl sm:text-3xl font-black text-sky-900 mt-1">
              {finalAltitude.toLocaleString()}<span className="text-xs font-bold text-sky-600 ml-0.5">m</span>
            </div>
          </div>

          <div className="bg-amber-50/80 border border-amber-200/70 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              Total Score
            </div>
            <div className="text-xl sm:text-3xl font-black text-amber-900 mt-1">
              {totalScore}
            </div>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-200/70 p-3 sm:p-4 rounded-2xl">
            <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              Valid Answers
            </div>
            <div className="text-xl sm:text-3xl font-black text-emerald-900 mt-1">
              {validAnswersCount} <span className="text-xs font-bold text-emerald-600">/ 7</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-patang-saffron to-amber-500 hover:from-amber-600 hover:to-patang-saffron text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Copied Flight Card!" : "Share Flight Card"}</span>
          </button>

          <Link
            href="/leaderboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>View Leaderboard</span>
          </Link>

          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Today</span>
          </button>
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4 border border-white/70 shadow-xl">
        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Flight Log & Rarity Breakdown</span>
          <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
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
                    ? "bg-purple-50/70 border-purple-200"
                    : ans.rarityTier === "rare"
                    ? "bg-amber-50/70 border-amber-200"
                    : ans.rarityTier === "uncommon"
                    ? "bg-sky-50/70 border-sky-200"
                    : "bg-emerald-50/70 border-emerald-200"
                  : "bg-slate-50 border-slate-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <span>Q{idx + 1}</span>
                    <span>·</span>
                    <span>{ans.category}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{ans.questionText}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      ans.isValid
                        ? ans.rarityTier === "ultra_rare"
                          ? "bg-purple-600 text-white"
                          : ans.rarityTier === "rare"
                          ? "bg-amber-500 text-white"
                          : "bg-sky-600 text-white"
                        : "bg-slate-400 text-white"
                    }`}
                  >
                    {ans.isValid ? ans.rarityTier.replace("_", " ") : "Invalid"}
                  </span>
                  <div className="text-xs font-black text-slate-900 mt-1">
                    +{ans.rarityScore} pts ({ans.altitudeGained}m)
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold">Your submission: </span>
                  <strong className="text-slate-900 font-bold">&ldquo;{ans.rawAnswer || "Time Out"}&rdquo;</strong>
                  {ans.canonicalName && (
                    <span className="text-slate-600 ml-1">
                      (Matched: <em>{ans.canonicalName}</em>)
                    </span>
                  )}
                </div>

                {ans.explanation && (
                  <p className="text-[11px] text-slate-500 italic w-full">
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

