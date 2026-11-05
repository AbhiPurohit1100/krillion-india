"use client";

import React, { useEffect, useState } from "react";
import KiteCanvas from "@/components/KiteCanvas";
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
  const [lastResult, setLastResult] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentAltitude, setCurrentAltitude] = useState(250); // initial low altitude
  const [lastAltitudeGain, setLastAltitudeGain] = useState(0);
  const [lastRarityTier, setLastRarityTier] = useState<RarityTier | null>(null);

  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize player and load daily questions from backend API
  useEffect(() => {
    let savedNick = localStorage.getItem("patang_nickname") || "";
    let savedAnonId = localStorage.getItem("patang_anonymous_id") || "";

    if (!savedAnonId) {
      savedAnonId = "anon_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("patang_anonymous_id", savedAnonId);
    }
    setPlayerId(savedAnonId);

    if (savedNick) {
      setNickname(savedNick);
    } else {
      setIsNicknameModalOpen(true);
    }

    // Fetch questions from backend
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

  // 25s Countdown Timer
  useEffect(() => {
    if (!isTimerActive || lastResult !== null || isGameOver || questions.length === 0) return;

    if (timeRemaining <= 0) {
      handleAnswerSubmit(""); // Timed out submission
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isTimerActive, lastResult, isGameOver, questions.length]);

  // Submit Answer to Backend API
  const handleAnswerSubmit = async (rawAnswer: string) => {
    if (questions.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setIsTimerActive(false);

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
          nickname: nickname || "Guest",
          dailyGameId,
        }),
      });

      if (!res.ok) {
        throw new Error("Server submission error");
      }

      const data = await res.json();

      const result: AnswerResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        category: currentQuestion.category,
        rawAnswer: trimmed,
        canonicalName: data.canonicalName,
        isValid: data.isValid,
        rarityTier: data.rarityTier,
        rarityScore: data.rarityScore,
        altitudeGained: data.altitudeGained,
        explanation: data.explanation || currentQuestion.explanation,
      };

      setLastResult(result);
      setAnswers((prev) => [...prev, result]);
      setLastAltitudeGain(data.altitudeGained);
      setLastRarityTier(data.rarityTier);
      setCurrentAltitude((prev) => prev + data.altitudeGained);
    } catch (err) {
      console.error("Submission failed, using fallback:", err);
      // Fallback local resolution if network error
      const fallbackResult: AnswerResult = {
        questionId: currentQuestion.id,
        questionText: currentQuestion.questionText,
        category: currentQuestion.category,
        rawAnswer: trimmed,
        isValid: Boolean(trimmed),
        rarityTier: trimmed ? "uncommon" : "invalid",
        rarityScore: trimmed ? 300 : 0,
        altitudeGained: trimmed ? 450 : 0,
      };
      setLastResult(fallbackResult);
      setAnswers((prev) => [...prev, fallbackResult]);
      setLastAltitudeGain(fallbackResult.altitudeGained);
      setLastRarityTier(fallbackResult.rarityTier);
      setCurrentAltitude((prev) => prev + fallbackResult.altitudeGained);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setLastResult(null);
      setTimeRemaining(25);
      setIsTimerActive(true);
      setLastAltitudeGain(0);
    } else {
      // Finalize game score on server
      const finalScore = answers.reduce((sum, a) => sum + a.rarityScore, 0);
      try {
        await fetch("/api/game/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId,
            nickname: nickname || "Guest",
            dailyGameId,
            totalScore: finalScore,
            altitude: currentAltitude,
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
    setCurrentAltitude(250);
    setLastAltitudeGain(0);
    setLastRarityTier(null);
    setIsGameOver(false);
  };

  const totalScore = answers.reduce((sum, a) => sum + a.rarityScore, 0);

  if (isLoadingQuestions) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-300 animate-spin flex items-center justify-center text-amber-600 font-black">
          🪁
        </div>
        <p className="text-sm font-bold text-slate-700">Checking sky conditions and daily questions...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
      {/* Nickname Selection Modal */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onSave={(name) => setNickname(name)}
        currentNickname={nickname}
      />

      {/* Flight Canvas (Animated Patang in the Sky) */}
      <div className="w-full">
        <KiteCanvas
          altitude={currentAltitude}
          lastAltitudeGain={lastAltitudeGain}
          lastRarityTier={lastRarityTier}
        />
      </div>

      {/* Game Play Area or Results Screen */}
      {!isGameOver && questions.length > 0 ? (
        <div className="w-full max-w-2xl">
          <QuestionCard
            question={questions[currentIndex]}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            timeRemaining={timeRemaining}
            onAnswerSubmit={handleAnswerSubmit}
            lastResult={lastResult}
            onNextQuestion={handleNextQuestion}
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <ResultsView
          answers={answers}
          totalScore={totalScore}
          finalAltitude={currentAltitude}
          nickname={nickname}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
