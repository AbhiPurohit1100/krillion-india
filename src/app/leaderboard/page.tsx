"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Crown, Flame, Medal, Sparkles, Trophy, Wind } from "lucide-react";
import { LeaderboardEntry } from "@/types/game";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"daily" | "allTime">("daily");
  const [playerNickname, setPlayerNickname] = useState("");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("patang_nickname");
    if (saved) setPlayerNickname(saved);

    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const endpoint =
          tab === "daily" ? "/api/leaderboard/daily" : "/api/leaderboard/all-time";
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (data.entries) {
            setEntries(data.entries);
          }
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [tab]);

  const top3 = entries.slice(0, 3);

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <span>Patang Leaderboard</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Top kite pilots soaring through the stratosphere with the rarest answers!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-white/70 border border-sky-200 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setTab("daily")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "daily"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Today&apos;s Flight
          </button>
          <button
            onClick={() => setTab("allTime")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === "allTime"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All-Time Legends
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm font-bold text-slate-600">
          Gathering radar signals from the sky...
        </div>
      ) : (
        <>
          {/* Top 3 Podium Visual */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              {/* Rank 2 */}
              <div className="glass-panel p-4 rounded-3xl text-center space-y-1.5 order-1 sm:order-1 flex flex-col justify-end border-t-4 border-slate-400">
                <div className="w-8 h-8 mx-auto rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-700 text-sm">
                  2
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {top3[1].nickname}
                </div>
                <div className="text-xs font-bold text-sky-700">
                  {top3[1].altitude.toLocaleString()}m
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {top3[1].totalScore} pts
                </div>
              </div>

              {/* Rank 1 (Apex) */}
              <div className="glass-panel p-5 rounded-3xl text-center space-y-2 order-2 sm:order-2 bg-gradient-to-b from-amber-100/80 to-white/90 border-t-4 border-amber-500 shadow-xl scale-105">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-400 border-2 border-amber-200 flex items-center justify-center text-amber-950 font-black shadow">
                  <Crown className="w-5 h-5 text-amber-900" />
                </div>
                <div className="font-black text-sm sm:text-base text-slate-900 truncate">
                  {top3[0].nickname}
                </div>
                <div className="text-sm font-black text-amber-700">
                  {top3[0].altitude.toLocaleString()}m
                </div>
                <div className="text-xs text-amber-900 font-bold">
                  {top3[0].totalScore} pts
                </div>
              </div>

              {/* Rank 3 */}
              <div className="glass-panel p-4 rounded-3xl text-center space-y-1.5 order-3 sm:order-3 flex flex-col justify-end border-t-4 border-amber-700">
                <div className="w-8 h-8 mx-auto rounded-full bg-amber-200 flex items-center justify-center font-black text-amber-900 text-sm">
                  3
                </div>
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {top3[2].nickname}
                </div>
                <div className="text-xs font-bold text-sky-700">
                  {top3[2].altitude.toLocaleString()}m
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {top3[2].totalScore} pts
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-white/70 shadow-xl">
            <div className="p-4 sm:p-5 border-b border-sky-100 bg-white/50 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Pilot Rankings ({entries.length} active)
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Finalized server scores
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {entries.map((entry) => {
                const isYou = playerNickname && entry.nickname.toLowerCase() === playerNickname.toLowerCase();

                return (
                  <div
                    key={entry.rank}
                    className={`p-4 sm:px-6 flex items-center justify-between hover:bg-sky-50/50 transition-colors ${
                      isYou ? "bg-amber-50/70 border-l-4 border-amber-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-7 text-center font-black text-sm ${
                          entry.rank === 1
                            ? "text-amber-500 text-base"
                            : entry.rank === 2
                            ? "text-slate-500"
                            : entry.rank === 3
                            ? "text-amber-700"
                            : "text-slate-400"
                        }`}
                      >
                        #{entry.rank}
                      </span>

                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{entry.nickname}</span>
                          {isYou && (
                            <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {entry.completedAt}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-6">
                      <div>
                        <div className="text-xs text-slate-400 uppercase font-semibold">Altitude</div>
                        <div className="text-sm font-black text-sky-800">
                          {entry.altitude.toLocaleString()}m
                        </div>
                      </div>

                      <div className="w-20 text-right">
                        <div className="text-xs text-slate-400 uppercase font-semibold">Score</div>
                        <div className="text-sm font-black text-amber-600">
                          {entry.totalScore}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
