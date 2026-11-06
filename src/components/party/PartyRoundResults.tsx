"use client";

import React from "react";
import { ArrowRight, Trophy } from "lucide-react";
import { PartyRound, PartyPlayer } from "@/types/party";
import PartyKiteRace from "./PartyKiteRace";

interface PartyRoundResultsProps {
  round: PartyRound;
  players: PartyPlayer[];
  currentPlayerAnonId: string;
  isHost: boolean;
  onAdvance: () => void;
  isAdvancing: boolean;
}

export default function PartyRoundResults({
  round,
  players,
  currentPlayerAnonId,
  isHost,
  onAdvance,
  isAdvancing,
}: PartyRoundResultsProps) {
  const submissions = round.submissions || [];

  // Group submissions by player ID
  const playerSubMap = new Map(submissions.map((s) => [s.playerId, s]));

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
      {/* ── HEADER ───────────────────────────────────────────── */}
      <div className="w-full text-center space-y-1">
        <span className="text-xs font-pixel text-neon-pink uppercase tracking-widest font-bold">
          ROUND {round.roundNumber} OF 5 RESULTS
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white font-pixel">
          &ldquo;{round.question.questionText}&rdquo;
        </h2>
      </div>

      {/* ── REVEALED ANSWERS GRID ────────────────────────────── */}
      <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] font-pixel text-slate-400">
          <span>PLAYER & ANSWER</span>
          <span>SCORE EARNED</span>
        </div>

        {players
          .filter((p) => p.isActive)
          .map((player) => {
            const sub = playerSubMap.get(player.id);
            const isMe = player.anonId === currentPlayerAnonId;

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isMe
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-xs font-bold text-white">
                      {player.nickname} {isMe && "(You)"}
                    </span>
                  </div>
                  <div className="text-sm font-pixel font-bold text-slate-200">
                    {sub ? (
                      sub.rawAnswer ? (
                        <span>
                          &ldquo;{sub.rawAnswer}&rdquo;
                          {sub.canonicalName && (
                            <span className="text-xs text-slate-400 ml-1 font-normal">
                              ({sub.canonicalName})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-rose-400 italic">No Answer</span>
                      )
                    ) : (
                      <span className="text-slate-500 italic">Timed Out</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {sub && sub.isValid ? (
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-base font-pixel font-black ${
                          sub.roundPoints === 10
                            ? "text-neon-cyan"
                            : sub.roundPoints >= 6
                            ? "text-sunset-gold"
                            : "text-slate-300"
                        }`}
                      >
                        +{sub.roundPoints} pts
                      </span>
                      <span className="text-[10px] font-pixel text-slate-400">
                        {sub.roundPoints === 10 ? "⭐ Unique answer!" : "Shared answer"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-pixel font-bold text-rose-400">+0 pts</span>
                      <span className="text-[10px] font-pixel text-rose-400/80">Invalid / None</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* ── KITE ALTITUDE PROGRESSION ─────────────────────────── */}
      <PartyKiteRace players={players} currentPlayerAnonId={currentPlayerAnonId} />

      {/* ── NEXT ROUND CTA ──────────────────────────────────── */}
      <div className="w-full">
        {isHost ? (
          <button
            onClick={onAdvance}
            disabled={isAdvancing}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sunset-gold via-sunset-amber to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-pixel font-black text-base shadow-xl shadow-sunset-gold/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span>
              {round.roundNumber < 5
                ? `ADVANCE TO ROUND ${round.roundNumber + 1} OF 5`
                : "VIEW FINAL EXPEDITION PODIUM"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-full py-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-center font-pixel text-xs font-bold animate-pulse">
            WAITING FOR HOST TO ADVANCE NEXT ROUND...
          </div>
        )}
      </div>
    </div>
  );
}

