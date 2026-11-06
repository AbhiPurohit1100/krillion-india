"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
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
  answerFeedback?: { isValid: boolean; message: string } | null;
  inputValue?: string;
  onInputChange?: (val: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
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
  answerFeedback,
  inputValue: externalInput,
  onInputChange,
  inputRef: externalRef,
}: QuestionCardProps) {
  const [localInput, setLocalInput] = useState("");
  const localRef = useRef<HTMLInputElement>(null);

  const inputValue = externalInput !== undefined ? externalInput : localInput;
  const setInputValue = onInputChange ?? setLocalInput;
  const inputRef = externalRef ?? localRef;

  // Reset local input when question changes
  useEffect(() => {
    if (externalInput === undefined) {
      setLocalInput("");
    }
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

  const isTimeCritical = timeRemaining <= 5;

  const rarityColor =
    lastResult?.rarityTier === "ultra_rare"
      ? "#ffa62b"
      : lastResult?.rarityTier === "rare"
      ? "#a855f7"
      : lastResult?.rarityTier === "uncommon"
      ? "#00e5ff"
      : lastResult?.rarityTier === "common"
      ? "#34d399"
      : "#ef4444";

  const rarityLabel =
    lastResult?.rarityTier === "ultra_rare"
      ? "ULTRA RARE"
      : lastResult?.rarityTier === "rare"
      ? "RARE"
      : lastResult?.rarityTier === "uncommon"
      ? "UNCOMMON"
      : lastResult?.rarityTier === "common"
      ? "COMMON"
      : "INVALID";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden scanlines"
      style={{
        background: "rgba(5, 12, 26, 0.92)",
        border: "2px solid #00e5ff",
        boxShadow: "0 0 24px rgba(0,229,255,0.15), inset 0 0 24px rgba(0,229,255,0.04)",
      }}
    >
      {/* Top Label */}
      <div className="px-5 pt-4 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center justify-between">
          <span
            className="font-pixel text-xs uppercase tracking-wider"
            style={{ color: "#ff6b9d", textShadow: "0 0 8px rgba(255,107,157,0.5)" }}
          >
            🇮🇳 PROMPT {currentIndex + 1} OF {totalQuestions}
          </span>
          <span
            className={`font-pixel text-xs font-bold tracking-widest px-2 py-0.5 rounded border ${
              isTimeCritical
                ? "text-red-400 border-red-500/50 bg-red-950/40 animate-pulse"
                : "text-cyan-400 border-cyan-500/40 bg-cyan-950/20"
            }`}
          >
            {question.category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Question Text */}
      <div className="px-5 py-5">
        <h2
          className="font-mono text-xl sm:text-2xl font-bold leading-snug text-white"
          style={{ letterSpacing: "0.02em" }}
        >
          {question.questionText}
        </h2>
      </div>

      {/* Tagline */}
      <div className="px-5 pb-4">
        <p
          className="font-pixel text-xs"
          style={{ color: "#00e5ff", opacity: 0.7, textShadow: "0 0 6px rgba(0,229,255,0.4)" }}
        >
          ▼ rarer answers sink deeper ▼
        </p>
      </div>

      {/* Answer Feedback Toast (inline, for invalid answers) */}
      {answerFeedback && !answerFeedback.isValid && (
        <div
          className="mx-5 mb-3 px-4 py-2 rounded-lg border flex items-center gap-2 font-pixel text-sm"
          style={{
            background: "rgba(220,38,38,0.15)",
            borderColor: "rgba(220,38,38,0.5)",
            color: "#fca5a5",
          }}
        >
          <span className="text-red-400">✗</span>
          <span>{answerFeedback.message}</span>
        </div>
      )}

      {/* Result View (after valid answer) */}
      {lastResult ? (
        <div className="px-5 pb-5 space-y-4 animate-fade-in">
          {/* Result Card */}
          <div
            className="rounded-xl p-4 border"
            style={{
              background: `rgba(5,12,26,0.95)`,
              borderColor: rarityColor,
              boxShadow: `0 0 16px ${rarityColor}30`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs text-slate-400 uppercase">Your Answer</span>
              <span
                className="font-pixel text-xs font-bold uppercase px-2.5 py-1 rounded"
                style={{ background: `${rarityColor}25`, color: rarityColor, border: `1px solid ${rarityColor}60` }}
              >
                {lastResult.isValid ? rarityLabel : "INVALID"}
              </span>
            </div>

            <p className="font-mono text-white font-semibold text-base mb-1">
              &ldquo;{lastResult.rawAnswer || "— Time Out —"}&rdquo;
            </p>

            {lastResult.canonicalName && (
              <p className="font-pixel text-xs text-slate-300 mt-2">
                CANONICAL:{" "}
                <span className="font-bold" style={{ color: rarityColor }}>
                  {lastResult.canonicalName}
                </span>
              </p>
            )}

            {lastResult.explanation && (
              <p className="font-mono text-xs text-slate-400 mt-2 italic leading-relaxed">
                {lastResult.explanation}
              </p>
            )}

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="font-pixel text-xs text-slate-400">POINTS EARNED</span>
              <span
                className="font-pixel text-base font-black"
                style={{ color: rarityColor, textShadow: `0 0 10px ${rarityColor}60` }}
              >
                +{lastResult.rarityScore} pts
              </span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="font-pixel text-xs text-slate-400">DEPTH PLUNGED</span>
              <span className="font-pixel text-sm font-bold text-cyan-300" style={{ textShadow: "0 0 8px rgba(0,229,255,0.5)" }}>
                +{(lastResult.depthGained ?? lastResult.altitudeGained).toLocaleString()}m
              </span>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={onNextQuestion}
            className="w-full py-3.5 rounded-xl font-pixel text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "rgba(0,229,255,0.12)",
              border: "2px solid #00e5ff",
              color: "#00e5ff",
              boxShadow: "0 0 16px rgba(0,229,255,0.2)",
            }}
          >
            <span>
              {currentIndex + 1 < totalQuestions ? "NEXT PROMPT" : "VIEW RESULTS"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
