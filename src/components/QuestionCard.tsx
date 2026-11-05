"use client";

import React, { useEffect, useRef, useState } from "react";
import { Anchor, ArrowRight, Clock, HelpCircle, Send, Sparkles } from "lucide-react";
import { AnswerResult, GameQuestion } from "@/types/game";

interface QuestionCardProps {
  question: GameQuestion;
  currentIndex: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswerSubmit: (rawAnswer: string) => void;
  lastResult: AnswerResult | null;
  onNextQuestion: () => void;
  isSubmitting: boolean;
}

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  timeRemaining,
  onAnswerSubmit,
  lastResult,
  onNextQuestion,
  isSubmitting,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input whenever question changes
  useEffect(() => {
    setInputValue("");
    if (!lastResult && inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id, lastResult]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || lastResult) return;
    const trimmed = inputValue.trim();
    if (trimmed) {
      onAnswerSubmit(trimmed);
    }
  };

  // Timer percentage (25s max)
  const timerPercentage = (timeRemaining / 25) * 100;
  const isTimeCritical = timeRemaining <= 5;

  return (
    <div className="glass-panel w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 relative">
      {/* ── TOP BAR: Q Number, Category, Timer ─────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-black tracking-wider uppercase">
            Cast {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="px-3 py-1 rounded-full bg-sunset-gold/15 border border-sunset-gold/30 text-sunset-gold text-xs font-bold">
            {question.category}
          </span>
        </div>

        {/* 25s Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
            isTimeCritical
              ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse scale-105"
              : "bg-white/5 text-slate-300 border-white/10"
          }`}
        >
          <Clock
            className={`w-3.5 h-3.5 ${
              isTimeCritical ? "text-red-400 animate-spin" : "text-ocean-400"
            }`}
          />
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Progress Bar of Timer */}
      {!lastResult && (
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isTimeCritical
                ? "bg-red-500"
                : timerPercentage > 40
                ? "bg-gradient-to-r from-ocean-400 to-sunset-gold"
                : "bg-sunset-gold"
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      )}

      {/* ── THE QUESTION PROMPT ───────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
          {question.questionText}
        </h2>
        <p className="text-xs text-slate-400 mt-2.5 font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sunset-gold" />
          Tip: Obscure valid answers plunge your hook deepest into the ocean!
        </p>
      </div>

      {/* ── INPUT FORM OR RESULT VIEW ─────────────────────────── */}
      {!lastResult ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSubmitting}
              placeholder="Type your rare answer..."
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border-2 border-white/10 focus:outline-none focus:border-sunset-gold focus:ring-4 focus:ring-sunset-gold/20 text-white font-semibold text-lg placeholder:text-slate-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-black text-sm shadow-lg shadow-sunset-gold/20 disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Anchor className="w-4 h-4" />
              <span>{isSubmitting ? "Scoring..." : "Cast Hook"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Result Feedback after Answer */
        <div className="space-y-6 animate-fade-in">
          <div
            className={`p-5 rounded-2xl border ${
              lastResult.isValid
                ? lastResult.rarityTier === "ultra_rare"
                  ? "bg-sunset-gold/10 border-sunset-gold/40 shadow-lg shadow-sunset-gold/10"
                  : lastResult.rarityTier === "rare"
                  ? "bg-purple-950/40 border-purple-500/30"
                  : "bg-ocean-950/40 border-ocean-500/30"
                : "bg-rose-950/40 border-rose-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Your Answer:{" "}
                <strong className="text-white">
                  &ldquo;{lastResult.rawAnswer || "Time Out"}&rdquo;
                </strong>
              </span>

              <span
                className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider ${
                  lastResult.isValid
                    ? lastResult.rarityTier === "ultra_rare"
                      ? "bg-sunset-gold text-slate-950 shadow-md shadow-sunset-gold/30"
                      : lastResult.rarityTier === "rare"
                      ? "bg-purple-600 text-white"
                      : "bg-ocean-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {lastResult.isValid
                  ? lastResult.rarityTier.replace("_", " ")
                  : "Invalid / Missed"}
              </span>
            </div>

            {lastResult.canonicalName && (
              <p className="text-sm font-semibold text-slate-300">
                Canonical Match:{" "}
                <span className="text-white underline font-bold">
                  {lastResult.canonicalName}
                </span>
              </p>
            )}

            {lastResult.explanation && (
              <p className="text-xs text-slate-400 mt-2 italic leading-relaxed">
                {lastResult.explanation}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-400">Points Earned:</span>
              <span className="font-black text-sunset-gold text-base">
                +{lastResult.rarityScore} pts
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-semibold text-slate-400">Depth Plunged:</span>
              <span className="font-black text-ocean-300 text-base">
                +{(lastResult.depthGained ?? lastResult.altitudeGained).toLocaleString()} m
              </span>
            </div>
          </div>

          <button
            onClick={onNextQuestion}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-ocean-500 hover:from-ocean-500 hover:to-ocean-600 text-white font-black text-base shadow-lg shadow-ocean-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>
              {currentIndex + 1 < totalQuestions
                ? "Next Cast"
                : "View Final Expedition Report"}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
