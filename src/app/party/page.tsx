"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Plus, ArrowRight, ShieldAlert, Sparkles, Home } from "lucide-react";

export default function PartyEntryPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [anonId, setAnonId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let savedNick = localStorage.getItem("krillion_nickname") || "";
    let savedAnon = localStorage.getItem("krillion_anonymous_id") || "";

    if (!savedAnon) {
      savedAnon = "anon_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("krillion_anonymous_id", savedAnon);
    }
    setAnonId(savedAnon);
    if (savedNick) setNickname(savedNick);
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedNick = nickname.trim();
    if (!trimmedNick) {
      setError("Please enter a display nickname.");
      return;
    }

    setIsCreating(true);
    localStorage.setItem("krillion_nickname", trimmedNick);

    try {
      const res = await fetch("/api/party/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostAnonId: anonId,
          nickname: trimmedNick,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create room.");
      }

      router.push(`/party/${data.roomCode}`);
    } catch (err: any) {
      setError(err?.message || "Failed to create room.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedNick = nickname.trim();
    const code = roomCodeInput.trim().toUpperCase();

    if (!trimmedNick) {
      setError("Please enter a display nickname.");
      return;
    }
    if (!code || code.length < 4) {
      setError("Please enter a valid room code.");
      return;
    }

    setIsJoining(true);
    localStorage.setItem("krillion_nickname", trimmedNick);

    try {
      const res = await fetch(`/api/party/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonId,
          nickname: trimmedNick,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to join room.");
      }

      router.push(`/party/${code}`);
    } catch (err: any) {
      setError(err?.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="relative min-h-screen sky-bg flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden select-none">
      {/* Background clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[8%] left-[10%] opacity-80">
          <svg viewBox="0 0 140 56" className="w-36 h-14">
            <ellipse cx="70" cy="40" rx="62" ry="20" fill="white" />
            <ellipse cx="42" cy="34" rx="32" ry="24" fill="white" />
            <ellipse cx="88" cy="30" rx="36" ry="26" fill="white" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* ── TITLE BANNER ───────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-pixel font-bold">
            <Users className="w-3.5 h-3.5" />
            <span>REAL-TIME MULTIPLAYER (UP TO 8 PLAYERS)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white font-pixel tracking-wider drop-shadow-md">
            PUFFER PARTY
          </h1>

          <p className="text-xs text-slate-300 font-pixel max-w-xs mx-auto leading-relaxed">
            Compete live against friends. Rarer answers sink deeper & fly your kite highest!
          </p>
        </div>

        {/* ── CARD CONTAINER ─────────────────────────────────── */}
        <div className="krillion-border rounded-3xl bg-slate-950/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Display Nickname Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-pixel text-slate-300 font-bold uppercase tracking-wider">
              Your Sailor Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              placeholder="e.g. CaptainSachin"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-white font-pixel text-base"
            />
          </div>

          <div className="border-t border-white/10 pt-4 space-y-4">
            {/* Create Room Option */}
            <form onSubmit={handleCreateRoom} className="space-y-2">
              <button
                type="submit"
                disabled={isCreating || isJoining}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sunset-gold via-sunset-amber to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-pixel font-black text-sm shadow-xl shadow-sunset-gold/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreating ? "CREATING ROOM..." : "HOST A NEW PARTY"}</span>
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-[10px] font-pixel text-slate-500 uppercase">OR JOIN</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>

            {/* Join Room Option */}
            <form onSubmit={handleJoinRoom} className="space-y-3">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ENTER 6-CHAR CODE"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:outline-none focus:border-cyan-400 text-center text-white font-pixel text-lg uppercase tracking-[0.25em] placeholder:tracking-normal placeholder:text-xs"
              />

              <button
                type="submit"
                disabled={isJoining || isCreating || !roomCodeInput.trim()}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-pixel font-bold text-sm shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30"
              >
                <span>{isJoining ? "JOINING..." : "ENTER ROOM"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-pixel flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-pixel transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Solo Descent</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

