"use client";

import React, { useState, useEffect, useRef } from "react";
import { Clock, Send, Sparkles, AlertCircle, CheckCircle2, User, Eye } from "lucide-react";
import { PartyRound, PartyPlayer } from "@/types/party";
import PartyKiteRace from "./PartyKiteRace";

interface PartyGameProps {
  round: PartyRound;
  players: PartyPlayer[];
  currentPlayerAnonId: string;
  activePlayerId: string | null;
  turnOrder: string[];
  activeTurnIndex: number;
  onSubmitAnswer: (rawAnswer: string) => Promise<{ isValid: boolean; message?: string } | undefined>;
  isSubmitting: boolean;
  error?: string | null;
}

export default function PartyGame({
  round,
  players,
  currentPlayerAnonId,
  activePlayerId,
  turnOrder,
  activeTurnIndex,
  onSubmitAnswer,
  isSubmitting,
  error,
}: PartyGameProps) {
  const [inputValue, setInputValue] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [inlineFeedback, setInlineFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const me = players.find((p) => p.anonId === currentPlayerAnonId);
  const isMyTurn = Boolean(me && activePlayerId && me.id === activePlayerId);
  const activePlayer = players.find((p) => p.id === activePlayerId);

  // Sync turn countdown timer with round deadline
  useEffect(() => {
    const target = new Date(round.deadline).getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((target - now) / 1000));
      setSecondsLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 400);
    return () => clearInterval(interval);
  }, [round.deadline, activeTurnIndex]);

  // Focus input when it becomes my turn
  useEffect(() => {
    setInputValue("");
    setInlineFeedback(null);
    if (isMyTurn && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMyTurn, activeTurnIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || isSubmitting) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    setInlineFeedback(null);
    const res = await onSubmitAnswer(trimmed);
    if (res && !res.isValid) {
      setInlineFeedback({
        message: res.message || "Invalid answer! Try another valid answer before time runs out.",
        isError: true,
      });
      // Allow re-attempting immediately
      if (inputRef.current) {
        inputRef.current.select();
      }
    }
  };

  const isTimeCritical = secondsLeft <= 5;
  const timerPct = (secondsLeft / 30) * 100;
  const previousSubmissions = round.submissions || [];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
      {/* ── QUESTION CARD ────────────────────────────────────── */}
      <div className="w-full krillion-border rounded-3xl bg-slate-950/90 p-6 sm:p-8 shadow-2xl relative">
        {/* Top bar: Prompt label & Timer */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-pixel font-bold text-neon-pink uppercase tracking-widest">
              🇮🇳 ROUND {round.roundNumber} OF 5
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-sunset-gold/15 border border-sunset-gold/30 text-sunset-gold text-[11px] font-pixel">
              {round.question.category}
            </span>
          </div>

          {/* 30s Countdown timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-pixel font-bold border transition-all ${
              isTimeCritical
                ? "bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse scale-105"
                : isMyTurn
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20"
                : "bg-white/5 text-slate-300 border-white/10"
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isTimeCritical ? "animate-spin" : ""}`} />
            <span>{secondsLeft}s</span>
          </div>
        </div>

        {/* Turn Indicator Banner */}
        <div className="mb-5 flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-pixel">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Current Turn:</span>
            <span
              className={`font-black ${
                isMyTurn ? "text-sunset-gold underline font-bold" : "text-white"
              }`}
            >
              {isMyTurn ? "YOUR TURN!" : activePlayer?.nickname || "Waiting..."}
            </span>
          </div>
          <span className="text-slate-400">
            Player {activeTurnIndex + 1} of {turnOrder.length}
          </span>
        </div>

        {/* Progress Bar of Timer */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-400 ease-linear rounded-full ${
              isTimeCritical
                ? "bg-rose-500"
                : isMyTurn
                ? "bg-gradient-to-r from-sunset-gold to-sunset-saffron"
                : "bg-gradient-to-r from-cyan-400 to-ocean-500"
            }`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* The Question Text */}
        <div className="text-center my-3 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white font-pixel leading-snug tracking-wide">
            {round.question.questionText}
          </h2>
          <p className="text-xs text-cyan-400 font-pixel tracking-wider">
            ▼ First to answer a name gets 10 pts · duplicates get 0 pts ▼
          </p>
        </div>
      </div>

      {/* ── LIVE ROUND ANSWER HISTORY (Broadcast to All) ─────── */}
      <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-pixel text-slate-400 border-b border-white/10 pb-2">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>ANSWERS SUBMITTED THIS ROUND ({previousSubmissions.length}/{turnOrder.length})</span>
          </span>
          <span className="text-slate-500">Duplicate = 0 pts</span>
        </div>

        {previousSubmissions.length === 0 ? (
          <div className="text-center py-3 text-xs font-pixel text-slate-500 italic">
            No answers submitted yet this round. First player gets a free pick!
          </div>
        ) : (
          <div className="space-y-2">
            {previousSubmissions.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs font-pixel"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">#{idx + 1}</span>
                  <span className="text-white font-bold">{sub.playerNickname}:</span>
                  <span className="text-slate-200">
                    {sub.rawAnswer ? (
                      <span>
                        &ldquo;{sub.rawAnswer}&rdquo;
                        {sub.canonicalName && (
                          <span className="text-slate-400 ml-1">({sub.canonicalName})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-rose-400 italic">Timed Out</span>
                    )}
                  </span>
                </div>

                <div className="font-bold">
                  {sub.roundPoints === 10 ? (
                    <span className="text-neon-cyan">+10 pts (Unique)</span>
                  ) : sub.isValid ? (
                    <span className="text-amber-400">+0 pts (Duplicate)</span>
                  ) : (
                    <span className="text-rose-400">+0 pts (Invalid)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIVE PLAYER FORM VS WAITING SCREEN ──────────────── */}
      {isMyTurn ? (
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSubmitting || secondsLeft === 0}
              placeholder="type your unique answer..."
              className="w-full px-5 py-4 rounded-2xl bg-slate-950/95 border-2 border-sunset-gold focus:outline-none focus:border-sunset-saffron focus:ring-4 focus:ring-sunset-gold/25 text-white font-pixel text-lg placeholder:text-slate-600 shadow-2xl"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isSubmitting || secondsLeft === 0}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-pixel font-black text-sm shadow-lg shadow-sunset-gold/30 disabled:opacity-30 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>{isSubmitting ? "CHECKING..." : "LOCK IN"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {inlineFeedback && (
            <div
              className={`p-3 rounded-xl text-xs font-pixel flex items-center gap-2 ${
                inlineFeedback.isError
                  ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                  : "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{inlineFeedback.message}</span>
            </div>
          )}

          <p className="text-[11px] text-sunset-gold font-pixel text-center">
            ★ YOUR TURN! Think fast and pick an answer not already used above.
          </p>
        </form>
      ) : (
        /* Waiting Player Screen */
        <div className="w-full p-6 rounded-2xl bg-slate-950/85 border border-cyan-500/30 text-center space-y-2 backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-cyan-300 font-pixel font-bold text-sm">
            <Sparkles className="w-4 h-4 text-sunset-gold animate-spin" />
            <span>WAITING FOR {activePlayer?.nickname?.toUpperCase() || "PLAYER"} TO DIVE...</span>
          </div>
          <p className="text-xs text-slate-400 font-pixel">
            Watch the live answers above. Your turn will begin immediately after!
          </p>
        </div>
      )}

      {error && (
        <div className="w-full p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-pixel text-center">
          {error}
        </div>
      )}

      {/* ── LIVE KITE RACE & LEADERBOARD ─────────────────────── */}
      <PartyKiteRace players={players} currentPlayerAnonId={currentPlayerAnonId} />
    </div>
  );
}
