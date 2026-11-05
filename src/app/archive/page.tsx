"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, History, Sparkles, Trophy, Wind } from "lucide-react";

interface ArchiveGame {
  id: string;
  date: string;
  formattedDate: string;
  theme: string;
  questionCount: number;
  totalPlayers: number;
  topAltitude: number;
}

const MOCK_ARCHIVE_GAMES: ArchiveGame[] = [
  {
    id: "game-2026-11-04",
    date: "2026-11-04",
    formattedDate: "Nov 4, 2026",
    theme: "Cricket World Cups & 90s Indipop",
    questionCount: 7,
    totalPlayers: 1420,
    topAltitude: 9480,
  },
  {
    id: "game-2026-11-03",
    date: "2026-11-03",
    formattedDate: "Nov 3, 2026",
    theme: "Mughal Architecture & South Cinema",
    questionCount: 7,
    totalPlayers: 1190,
    topAltitude: 8950,
  },
  {
    id: "game-2026-11-02",
    date: "2026-11-02",
    formattedDate: "Nov 2, 2026",
    theme: "Indian Street Foods & Doordarshan Classics",
    questionCount: 7,
    totalPlayers: 1350,
    topAltitude: 9210,
  },
  {
    id: "game-2026-11-01",
    date: "2026-11-01",
    formattedDate: "Nov 1, 2026",
    theme: "Indian Nobel Laureates & Indie Music",
    questionCount: 7,
    totalPlayers: 980,
    topAltitude: 8740,
  },
];

export default function ArchivePage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 animate-fade-in">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 hover:text-sky-950 mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <History className="w-8 h-8 text-sky-600" />
          <span>Flight Archives</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Catch up on previous daily trivia flights and test your rarity knowledge against past games.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_ARCHIVE_GAMES.map((game) => (
          <div
            key={game.id}
            className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/70 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                <span className="flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3 text-sky-600" />
                  {game.formattedDate}
                </span>
                <span>{game.questionCount} Questions</span>
              </div>

              <h2 className="text-lg font-black text-slate-900 leading-snug">
                {game.theme}
              </h2>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {game.totalPlayers.toLocaleString()} Pilots Flew
                </span>
                <span className="font-bold text-amber-700 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Peak: {game.topAltitude.toLocaleString()}m
                </span>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <Link
                href="/play"
                className="w-full py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Fly This Challenge</span>
                <Wind className="w-3.5 h-3.5 text-sky-600" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

