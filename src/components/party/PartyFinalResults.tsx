"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Trophy, Crown, ArrowRight, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { PartyPlayer } from "@/types/party";
import PartyKiteRace from "./PartyKiteRace";

interface PartyFinalResultsProps {
  players: PartyPlayer[];
  currentPlayerAnonId: string;
  isHost: boolean;
  onPlayAgain: () => void;
  isResetting: boolean;
}

export default function PartyFinalResults({
  players,
  currentPlayerAnonId,
  isHost,
  onPlayAgain,
  isResetting,
}: PartyFinalResultsProps) {
  // Sort players descending
  const sorted = [...players]
    .filter((p) => p.isActive)
    .sort((a, b) => b.totalScore - a.totalScore);

  const winner = sorted[0];

  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#ffa62b", "#00e5ff", "#ff4f4f", "#34d399", "#ffe66d"],
      });
    } catch {}
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6 animate-fade-in pb-12">
      {/* ── WINNER PODIUM ────────────────────────────────────── */}
      <div className="w-full krillion-border rounded-3xl bg-slate-950/95 p-6 sm:p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-sunset-gold/15 border border-sunset-gold/40 flex items-center justify-center text-sunset-gold shadow-lg shadow-sunset-gold/20">
          <Trophy className="w-8 h-8" />
        </div>

        <span className="text-xs font-pixel text-ocean-300 uppercase tracking-widest font-bold">
          PUFFER PARTY CHAMPION
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white font-pixel my-2 flex items-center justify-center gap-2">
          <span>{winner?.nickname || "Winner"}</span>
          <Crown className="w-7 h-7 text-sunset-gold" />
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunset-gold/20 border border-sunset-gold/40 text-sunset-gold font-pixel font-bold text-sm">
          <span>{winner?.totalScore || 0} TOTAL POINTS</span>
          <span>·</span>
          <span>{Math.round((winner?.totalScore || 0) * 180)}m KITE ALTITUDE</span>
        </div>
      </div>

      {/* ── FINAL STANDINGS TABLE ────────────────────────────── */}
      <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] font-pixel text-slate-400">
          <span>RANK & PLAYER</span>
          <span>KITE ALTITUDE / SCORE</span>
        </div>

        {sorted.map((player, idx) => {
          const isMe = player.anonId === currentPlayerAnonId;
          const isFirst = idx === 0;

          return (
            <div
              key={player.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                isFirst
                  ? "bg-sunset-gold/10 border-sunset-gold/40 shadow-md"
                  : isMe
                  ? "bg-cyan-950/40 border-cyan-500/50"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-pixel font-black text-xs ${
                    idx === 0
                      ? "bg-sunset-gold text-slate-950"
                      : idx === 1
                      ? "bg-slate-300 text-slate-950"
                      : idx === 2
                      ? "bg-amber-700 text-white"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </span>

                <div>
                  <div className="font-pixel text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{player.nickname}</span>
                    {isMe && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-pixel">
                    {Math.round(player.totalScore * 180)}m final altitude
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-lg font-pixel font-black text-white">
                  {player.totalScore}
                </span>
                <span className="text-xs text-slate-400 font-pixel ml-1">pts</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── KITE VISUAL RACE FINAL ────────────────────────────── */}
      <PartyKiteRace players={players} currentPlayerAnonId={currentPlayerAnonId} />

      {/* ── ACTIONS ─────────────────────────────────────────── */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-1/2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-pixel text-sm font-bold transition-all text-center flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>RETURN HOME</span>
        </Link>

        {isHost ? (
          <button
            onClick={onPlayAgain}
            disabled={isResetting}
            className="w-full sm:w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-pixel font-black text-sm shadow-xl shadow-sunset-gold/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN WITH SAME ROOM</span>
          </button>
        ) : (
          <div className="w-full sm:w-1/2 py-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-center font-pixel text-xs font-bold animate-pulse">
            WAITING FOR HOST TO DECIDE NEXT MATCH...
          </div>
        )}
      </div>
    </div>
  );
}

