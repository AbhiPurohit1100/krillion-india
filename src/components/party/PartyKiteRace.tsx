"use client";

import React from "react";
import { PartyPlayer } from "@/types/party";

interface PartyKiteRaceProps {
  players: PartyPlayer[];
  currentPlayerAnonId?: string;
  maxScore?: number;
}

const KITE_COLORS = [
  "#ffa62b",
  "#00e5ff",
  "#ff4f4f",
  "#34d399",
  "#a855f7",
  "#fbbf24",
  "#38bdf8",
  "#f43f5e",
];

export default function PartyKiteRace({
  players,
  currentPlayerAnonId,
  maxScore = 50, // 5 rounds * 10 max points = 50
}: PartyKiteRaceProps) {
  // Sort players descending by score
  const sortedPlayers = [...players]
    .filter((p) => p.isActive)
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 text-[11px] font-pixel text-slate-400">
        <span className="uppercase tracking-wider">KITE ALTITUDE RACE</span>
        <span className="text-cyan-400 font-bold">TOP FLIER AT PEAK 🪁</span>
      </div>

      <div className="space-y-2.5">
        {sortedPlayers.map((player, idx) => {
          const isMe = player.anonId === currentPlayerAnonId;
          const color = KITE_COLORS[idx % KITE_COLORS.length];
          // Altitude percentage 0% to 100%
          const pct = Math.min(100, Math.max(8, (player.totalScore / maxScore) * 100));

          return (
            <div key={player.id} className="relative flex flex-col gap-1">
              {/* Player Info Row */}
              <div className="flex items-center justify-between text-xs font-pixel">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-slate-500 font-bold text-[10px]">#{idx + 1}</span>
                  <span
                    className={`font-bold ${
                      isMe ? "text-cyan-300 underline" : "text-slate-200"
                    }`}
                  >
                    {player.nickname} {isMe && "(You)"}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-sunset-gold">{player.totalScore} pts</span>
                  <span className="text-slate-500 text-[10px]">({Math.round(player.totalScore * 180)}m)</span>
                </div>
              </div>

              {/* Sky Track + Flying Kite */}
              <div className="relative w-full h-7 bg-white/5 rounded-lg overflow-hidden border border-white/5">
                {/* Kite String */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-white/20 transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />

                {/* Animated Flying Kite */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out flex items-center gap-1"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className="w-5 h-5 flex items-center justify-center text-xs animate-bob drop-shadow-md"
                    style={{
                      filter: `drop-shadow(0 0 6px ${color})`,
                    }}
                  >
                    🪁
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

