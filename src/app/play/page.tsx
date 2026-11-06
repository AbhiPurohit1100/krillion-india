"use client";

import React, { useEffect, useRef, useState } from "react";
import FishingCanvas from "@/components/FishingCanvas";
import NicknameModal from "@/components/NicknameModal";
import QuestionCard from "@/components/QuestionCard";
import ResultsView from "@/components/ResultsView";
import { AnswerResult, GameQuestion, RarityTier } from "@/types/game";

export default function PlayPage() {
  const [nickname, setNickname] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [dailyGameId, setDailyGameId] = useState<string>("daily-default");
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);

  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  // lastResult is ONLY set for valid answers (shows result panel in QuestionCard)
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  // answerFeedback is set for invalid answers (shows toast, timer keeps running)
  const [answerFeedback, setAnswerFeedback] = useState<{ isValid: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentDepth, setCurrentDepth] = useState(150);
  const [lastDepthGain, setLastDepthGain] = useState(0);
  const [lastRarityTier, setLastRarityTier] = useState<RarityTier | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize player and load questions
  useEffect(() => {
    let savedNick =
      localStorage.getItem("krillion_nickname") ||
      localStorage.getItem("patang_nickname") ||
      "";
    let savedAnonId =
      localStorage.getItem("krillion_anonymous_id") ||
      localStorage.getItem("patang_anonymous_id") ||
      "";

    if (!savedAnonId) {
      savedAnonId = "anon_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("krillion_anonymous_id", savedAnonId);
      localStorage.setItem("patang_anonymous_id", savedAnonId);
    }
    setPlayerId(savedAnonId);

    if (savedNick) {
      setNickname(savedNick);
    } else {
      setIsNicknameModalOpen(true);
    }

    async function loadQuestions() {
      try {
        const res = await fetch("/api/game/today");
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            if (data.gameId) setDailyGameId(data.gameId);
            setIsTimerActive(true);
          }
        }
      } catch (e) {
        console.error("Failed to load today's questions:", e);
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    loadQuestions();
  }, []);

  // Timer — keeps running unless: (a) valid answer submitted, or (b) game over
  useEffect(() => {
    if (!isTimerActive || isGameOver || questions.length === 0) return;

    if (timeRemaining <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeRemaining, isTimerActive, isGameOver, questions.length]);

  // Auto-dismiss invalid answer feedback after 1.5s
  useEffect(() => {
    if (answerFeedback && !answerFeedback.isValid) {
      const t = setTimeout(() => {
        setAnswerFeedback(null);
        setInputValue("");
        if (inputRef.current) inputRef.current.focus();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [answerFeedback]);

  // Auto-advance after timeout
  const handleTimeOut = async () => {
    setIsTimerActive(false);
    await submitAnswer("");
  };

  // Core submission — handles both valid and invalid answers
  const submitAnswer = async (rawAnswer: string) => {
    if (questions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    const currentQuestion = questions[currentIndex];
    const trimmed = rawAnswer.trim();

    try {
      const res = await fetch("/api/game/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          rawAnswer: trimmed,
          playerId,
          nickname: nickname || "Captain",
          dailyGameId,
        }),
      });

      if (!res.ok) throw new Error("Server submission error");

      const data = await res.json();
      const gain = data.depthGained ?? data.altitudeGained ?? 0;

      const result: AnswerResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        category: currentQuestion.category,
        rawAnswer: trimmed,
        canonicalName: data.canonicalName,
        isValid: data.isValid,
        rarityTier: data.rarityTier,
        rarityScore: data.rarityScore,
        altitudeGained: gain,
        depthGained: gain,
        explanation: data.explanation || currentQuestion.explanation,
      };

      if (data.isValid) {
        // Valid answer: stop timer, show result panel
        setIsTimerActive(false);
        setLastResult(result);
        setAnswers((prev) => [...prev, result]);
        setLastDepthGain(gain);
        setLastRarityTier(data.rarityTier);
        setCurrentDepth((prev) => prev + gain);
        setInputValue("");
      } else {
        // Invalid answer: DON'T stop timer, show toast feedback only
        setAnswerFeedback({ isValid: false, message: "INCORRECT — try thinking rarer!" });
        // Still record the attempt if time ran out (empty answer)
        if (!trimmed) {
          setLastResult(result);
          setAnswers((prev) => [...prev, result]);
          setLastDepthGain(0);
          setLastRarityTier(data.rarityTier);
        }
        // Otherwise let timer keep running, don't set lastResult
      }
    } catch (err) {
      console.error("Submission failed, using fallback:", err);
      const fallbackResult: AnswerResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        category: currentQuestion.category,
        rawAnswer: trimmed,
        isValid: Boolean(trimmed),
        rarityTier: trimmed ? "uncommon" : "invalid",
        rarityScore: trimmed ? 300 : 0,
        altitudeGained: trimmed ? 450 : 0,
        depthGained: trimmed ? 450 : 0,
      };
      if (trimmed) {
        setIsTimerActive(false);
        setLastResult(fallbackResult);
        setAnswers((prev) => [...prev, fallbackResult]);
        setLastDepthGain(fallbackResult.altitudeGained);
        setLastRarityTier(fallbackResult.rarityTier);
        setCurrentDepth((prev) => prev + fallbackResult.altitudeGained);
      } else {
        setLastResult(fallbackResult);
        setAnswers((prev) => [...prev, fallbackResult]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = (rawAnswer: string) => {
    submitAnswer(rawAnswer);
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setLastResult(null);
      setAnswerFeedback(null);
      setTimeRemaining(25);
      setIsTimerActive(true);
      setLastDepthGain(0);
      setInputValue("");
    } else {
      const finalScore = answers.reduce((sum, a) => sum + a.rarityScore, 0);
      try {
        await fetch("/api/game/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            nickname: nickname || "Captain",
            dailyGameId,
            totalScore: finalScore,
            altitude: currentDepth,
            depth: currentDepth,
          }),
        });
      } catch (err) {
        console.error("Failed to post complete game:", err);
      }
      setIsGameOver(true);
    }
  };

  const handlePlayAgain = () => {
    setCurrentIndex(0);
    setTimeRemaining(25);
    setIsTimerActive(true);
    setAnswers([]);
    setLastResult(null);
    setAnswerFeedback(null);
    setCurrentDepth(150);
    setLastDepthGain(0);
    setLastRarityTier(null);
    setIsGameOver(false);
    setInputValue("");
  };

  const totalScore = answers.reduce((sum, a) => sum + a.rarityScore, 0);
  const currentQuestion = questions[currentIndex];
  const timerPercent = (timeRemaining / 25) * 100;
  const isTimeCritical = timeRemaining <= 5;

  // ── Loading State ──────────────────────────────────────────────
  if (isLoadingQuestions) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-6 sky-bg"
        style={{ zIndex: 10 }}
      >
        <div
          className="w-16 h-16 rounded-full border-2 flex items-center justify-center animate-spin font-pixel text-2xl"
          style={{ borderColor: "#00e5ff", color: "#00e5ff" }}
        >
          ⚓
        </div>
        <p className="font-pixel text-sm text-cyan-300 tracking-widest">LOADING EXPEDITION...</p>
      </div>
    );
  }

  // ── Game Over → show ResultsView ───────────────────────────────
  if (isGameOver) {
    return (
      <div className="fixed inset-0 sky-bg flex flex-col items-center justify-center overflow-auto pt-16">
        <FishingCanvas
          depth={currentDepth}
          lastDepthGain={lastDepthGain}
          lastRarityTier={lastRarityTier}
          isGameOver={isGameOver}
        />
        <div className="relative z-10 w-full max-w-2xl px-4 py-8">
          <ResultsView
            answers={answers}
            totalScore={totalScore}
            finalAltitude={currentDepth}
            nickname={nickname}
            onPlayAgain={handlePlayAgain}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 sky-bg overflow-hidden">
      {/* Nickname Modal */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={(name) => setNickname(name)}
        currentNickname={nickname}
      />

      {/* Full-screen animated background */}
      <FishingCanvas
        depth={currentDepth}
        lastDepthGain={lastDepthGain}
        lastRarityTier={lastRarityTier}
        isGameOver={isGameOver}
      />

      {/* ── TOP HUD ─────────────────────────────────────────── */}
      <div
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-2"
        style={{
          background: "rgba(5, 12, 26, 0.85)",
          borderBottom: "1px solid rgba(0,229,255,0.2)",
          backdropFilter: "blur(10px)",
          marginTop: 64, // below navbar
        }}
      >
        {/* Left: DEPTH */}
        <div className="flex flex-col items-start">
          <span className="font-pixel text-[10px] text-cyan-500 tracking-widest uppercase">DEPTH</span>
          <span className="font-pixel text-base font-black text-cyan-300" style={{ textShadow: "0 0 10px rgba(0,229,255,0.6)" }}>
            {currentDepth.toLocaleString()}m
          </span>
        </div>

        {/* Center: Progress Dots */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, i) => {
            const isAnswered = i < currentIndex;
            const isCurrent = i === currentIndex;
            const hasResult = isAnswered || (isCurrent && lastResult !== null);
            return (
              <div
                key={i}
                className="w-3 h-3 rounded-sm transition-all duration-300"
                style={{
                  background: hasResult
                    ? "#00e5ff"
                    : isCurrent
                    ? "#ff6b9d"
                    : "rgba(255,255,255,0.1)",
                  boxShadow: isCurrent && !hasResult ? "0 0 8px rgba(255,107,157,0.6)" : hasResult ? "0 0 6px rgba(0,229,255,0.5)" : "none",
                  border: isCurrent ? "1px solid #ff6b9d" : hasResult ? "1px solid #00e5ff" : "1px solid rgba(255,255,255,0.15)",
                }}
              />
            );
          })}
        </div>

        {/* Right: SCORE */}
        <div className="flex flex-col items-end">
          <span className="font-pixel text-[10px] text-cyan-500 tracking-widest uppercase">SCORE</span>
          <span className="font-pixel text-base font-black text-white" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
            {totalScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ── QUESTION PANEL (centered in ocean area) ─────────── */}
      {currentQuestion && (
        <div
          className="fixed inset-x-0 z-30 flex flex-col items-center px-4"
          style={{ top: "calc(64px + 56px + 2vh)", maxHeight: "calc(100vh - 64px - 56px - 100px)", overflowY: "auto" }}
        >
          <div className="w-full max-w-xl">
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              timeRemaining={timeRemaining}
              onAnswerSubmit={handleAnswerSubmit}
              lastResult={lastResult}
              onNextQuestion={handleNextQuestion}
              isSubmitting={isSubmitting}
              answerFeedback={answerFeedback}
              inputValue={inputValue}
              onInputChange={setInputValue}
              inputRef={inputRef as React.RefObject<HTMLInputElement>}
            />
          </div>
        </div>
      )}

      {/* ── BOTTOM HUD BAR ───────────────────────────────────── */}
      {!lastResult && currentQuestion && (
        <div
          className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-3 px-4 py-3"
          style={{
            background: "rgba(5, 12, 26, 0.92)",
            borderTop: "2px solid rgba(0,229,255,0.25)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Circular Timer */}
          <div className="relative shrink-0 w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="rgba(0,229,255,0.15)"
                strokeWidth="4"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke={isTimeCritical ? "#ef4444" : "#00e5ff"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - timerPercent / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div
              className="absolute inset-0 flex items-center justify-center font-pixel font-black text-sm"
              style={{ color: isTimeCritical ? "#ef4444" : "#00e5ff", textShadow: isTimeCritical ? "0 0 8px #ef444480" : "0 0 8px rgba(0,229,255,0.6)" }}
            >
              {timeRemaining}
            </div>
          </div>

          {/* Input */}
          <form
            className="flex-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isSubmitting && inputValue.trim()) {
                handleAnswerSubmit(inputValue.trim());
              }
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSubmitting}
              placeholder="type your answer..."
              autoComplete="off"
              className="flex-1 px-4 py-3 rounded-xl font-mono text-white font-semibold text-base placeholder:text-slate-500 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "2px solid rgba(0,229,255,0.3)",
                boxShadow: "inset 0 0 12px rgba(0,0,0,0.3)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#00e5ff";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(0,229,255,0.2), inset 0 0 12px rgba(0,0,0,0.3)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,229,255,0.3)";
                e.currentTarget.style.boxShadow = "inset 0 0 12px rgba(0,0,0,0.3)";
              }}
            />
            {/* DIVE Button */}
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting}
              className="shrink-0 px-5 py-3 rounded-xl font-pixel font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-30"
              style={{
                background: isSubmitting ? "rgba(255,153,51,0.3)" : "#FF9933",
                color: "#1a0a00",
                boxShadow: "0 4px 16px rgba(255,153,51,0.3)",
              }}
            >
              {isSubmitting ? "..." : "DIVE"}
            </button>
          </form>
        </div>
      )}

      {/* TIME'S UP Toast (shown briefly before auto-advance) */}
      {answerFeedback?.isValid === false && timeRemaining <= 0 && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 font-pixel text-lg font-black text-red-400 px-6 py-4 rounded-2xl animate-bounce"
          style={{ background: "rgba(5,12,26,0.95)", border: "2px solid #ef4444", boxShadow: "0 0 24px rgba(239,68,68,0.3)" }}
        >
          ⏱ TIME&apos;S UP!
        </div>
      )}
    </div>
  );
}
