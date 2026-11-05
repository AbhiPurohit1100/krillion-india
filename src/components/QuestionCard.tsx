"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Clock, HelpCircle, Send, Sparkles } from "lucide-react";
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
    <div className="glass-panel w-full rounded-3xl p-6 sm:p-8 shadow-xl border border-white/70 relative">
      {/* Top Bar: Question Index, Category, Timer */}
      <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black tracking-wider uppercase">
            Q {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-300 text-amber-800 text-xs font-bold">
            {question.category}
          </span>
        </div>

        {/* 25s Circular Timer */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide border transition-all ${
            isTimeCritical
              ? "bg-red-50 text-red-600 border-red-300 animate-pulse scale-105"
              : "bg-sky-50 text-sky-900 border-sky-200"
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? "text-red-500 animate-spin" : "text-sky-600"}`} />
          <span>{timeRemaining}s</span>
        </div>
      </div>

      {/* Progress Bar of Timer */}
      {!lastResult && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              isTimeCritical
                ? "bg-red-500"
                : timerPercentage > 40
                ? "bg-amber-500"
                : "bg-amber-600"
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
      )}

      {/* The Question Text */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
          {question.questionText}
        </h2>
        <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Tip: Rarest valid answers launch your kite highest into the sky!
        </p>
      </div>

      {/* Form or Result View */}
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
              className="w-full px-5 py-4 rounded-2xl border-2 border-sky-200 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-slate-900 font-semibold text-lg placeholder:text-slate-400 bg-white/90 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-patang-saffron to-amber-500 hover:from-amber-600 hover:to-patang-saffron text-white font-bold text-sm shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>{isSubmitting ? "Scoring..." : "Launch"}</span>
              <Send className="w-4 h-4" />
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
                  ? "bg-purple-50/80 border-purple-200"
                  : lastResult.rarityTier === "rare"
                  ? "bg-amber-50/80 border-amber-200"
                  : "bg-sky-50/80 border-sky-200"
                : "bg-rose-50/80 border-rose-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                Your Answer: <strong className="text-slate-900">&ldquo;{lastResult.rawAnswer || "Time Out"}&rdquo;</strong>
              </span>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                  lastResult.isValid
                    ? lastResult.rarityTier === "ultra_rare"
                      ? "bg-purple-600 text-white"
                      : lastResult.rarityTier === "rare"
                      ? "bg-amber-500 text-white"
                      : "bg-sky-600 text-white"
                    : "bg-rose-500 text-white"
                }`}
              >
                {lastResult.isValid ? lastResult.rarityTier.replace("_", " ") : "Invalid / Missed"}
              </span>
            </div>

            {lastResult.canonicalName && (
              <p className="text-sm font-semibold text-slate-700">
                Canonical Match: <span className="text-slate-900 underline font-bold">{lastResult.canonicalName}</span>
              </p>
            )}

            {lastResult.explanation && (
              <p className="text-xs text-slate-600 mt-2 italic leading-relaxed">
                {lastResult.explanation}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Points Earned:</span>
              <span className="font-black text-amber-600 text-base">
                +{lastResult.rarityScore} pts
              </span>
            </div>

            <div className="flex items-center justify-between text-sm mt-1">
              <span className="font-semibold text-slate-600">Altitude Lift:</span>
              <span className="font-black text-sky-700 text-base">
                +{lastResult.altitudeGained.toLocaleString()} m
              </span>
            </div>
          </div>

          <button
            onClick={onNextQuestion}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-base shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{currentIndex + 1 < totalQuestions ? "Next Question" : "View Final Flight Results"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

