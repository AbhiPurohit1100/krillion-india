"use client";

import React, { useState } from "react";
import { Copy, Check, Crown, User, ShieldAlert } from "lucide-react";
import { PartyPlayer } from "@/types/party";

interface PartyLobbyProps {
  roomCode: string;
  players: PartyPlayer[];
  currentPlayerAnonId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isStarting: boolean;
  error?: string | null;
}

const KITE_COLORS = [
  "#ffa62b", // Saffron / Gold
  "#00e5ff", // Neon Cyan
  "#ff4f4f", // Coral Red
  "#34d399", // Emerald Green
  "#a855f7", // Purple
  "#fbbf24", // Amber
  "#38bdf8", // Sky Blue
  "#f43f5e", // Rose
];

export default function PartyLobby({
  roomCode,
  players,
  currentPlayerAnonId,
  isHost,
  onStartGame,
  onLeaveRoom,
  isStarting,
  error,
}: PartyLobbyProps) {
  const [copied, setCopied] = useState(false);

  const activePlayers = players.filter((p) => p.isActive);
  const canStart = isHost && activePlayers.length >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-6 animate-fade-in">
      {/* ── ROOM CODE BANNER ─────────────────────────────────── */}
      <div className="w-full krillion-border rounded-2xl bg-slate-950/90 p-5 text-center relative overflow-hidden shadow-2xl">
        <div className="text-[11px] font-pixel text-ocean-300 uppercase tracking-widest mb-1">
          PRIVATE PARTY ROOM
        </div>

        <div className="flex items-center justify-center gap-3 my-2">
          <span className="font-pixel text-4xl sm:text-5xl font-black text-white tracking-[0.25em]">
            {roomCode}
          </span>
          <button
            onClick={handleCopyCode}
            title="Copy room code"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-sunset-gold transition-all active:scale-95 flex items-center gap-1.5 text-xs font-pixel"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 font-pixel">
          Share this code with up to 7 friends · 5 rounds · 30s per prompt
        </p>
      </div>

      {/* ── PLAYERS IN LOBBY (Max 8) ─────────────────────────── */}
      <div className="w-full bg-slate-950/80 rounded-2xl border border-white/10 p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-pixel font-bold text-white uppercase tracking-wider">
              PLAYERS IN LOBBY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-pixel font-bold">
              {activePlayers.length} / 8
            </span>
          </div>

          {activePlayers.length < 2 && (
            <span className="text-xs font-pixel text-amber-400 animate-pulse">
              Waiting for 2nd player...
            </span>
          )}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activePlayers.map((player, idx) => {
            const isMe = player.anonId === currentPlayerAnonId;
            const color = KITE_COLORS[idx % KITE_COLORS.length];

            return (
              <div
                key={player.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                  isMe
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Kite Icon Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md"
                    style={{
                      backgroundColor: `${color}20`,
                      borderColor: color,
                      borderWidth: "1.5px",
                      color: color,
                    }}
                  >
                    🪁
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-sm font-bold text-white">
                        {player.nickname}
                      </span>
                      {isMe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-pixel">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      {player.isHost ? (
                        <span className="text-sunset-gold font-semibold flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Room Host
                        </span>
                      ) : (
                        <span>Ready</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ERROR ALERT ──────────────────────────────────────── */}
      {error && (
        <div className="w-full p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-pixel flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── ACTION CONTROLS ──────────────────────────────────── */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={onLeaveRoom}
          className="w-full sm:w-1/3 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 font-pixel text-sm font-bold transition-all active:scale-95"
        >
          LEAVE ROOM
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={!canStart || isStarting}
            className="w-full sm:w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-sunset-gold via-sunset-amber to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-pixel text-base font-black shadow-xl shadow-sunset-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <span>COMMENCING PARTY...</span>
            ) : canStart ? (
              <span>START PUFFER PARTY ({activePlayers.length}/8) →</span>
            ) : (
              <span>NEED 2+ PLAYERS TO START</span>
            )}
          </button>
        ) : (
          <div className="w-full sm:w-2/3 py-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-center font-pixel text-xs font-bold animate-pulse">
            WAITING FOR HOST TO START THE PARTY...
          </div>
        )}
      </div>
    </div>
  );
}

