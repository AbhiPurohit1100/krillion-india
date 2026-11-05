"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Award, Compass, HelpCircle, History, Sparkles, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("patang_nickname");
    if (saved) {
      setNickname(saved);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-sky-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-patang-saffron via-amber-400 to-patang-turquoise p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-patang-saffron fill-current">
                {/* Stylized Patang */}
                <polygon points="12,2 22,12 12,22 2,12" fill="url(#patang-grad)" />
                <line x1="12" y1="2" x2="12" y2="22" stroke="#fff" strokeWidth="1.5" />
                <line x1="2" y1="12" x2="22" y2="12" stroke="#fff" strokeWidth="1.5" />
                <defs>
                  <linearGradient id="patang-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF6F00" />
                    <stop offset="100%" stopColor="#00ACC1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-800 tracking-tight flex items-center gap-1.5">
              PATANG <span className="text-xs bg-amber-500/10 text-amber-700 border border-amber-300 font-semibold px-2 py-0.5 rounded-full">TRIVIA</span>
            </span>
            <span className="block text-[10px] text-slate-500 -mt-1 font-medium tracking-wide">
              KRILLION INDIA
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-4 text-sm font-semibold text-slate-700">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Daily Game</span>
          </Link>
          <Link
            href="/leaderboard"
            className="px-3 py-1.5 rounded-lg hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
          <Link
            href="/archive"
            className="px-3 py-1.5 rounded-lg hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Archive</span>
          </Link>
          <Link
            href="/admin"
            className="px-2.5 py-1.5 rounded-lg hover:bg-amber-100/70 text-amber-900 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Quizmaster Admin Panel"
          >
            <span>🛡️</span>
            <span className="hidden md:inline">Admin</span>
          </Link>

          {/* Nickname pill */}
          <div className="ml-2 pl-2 border-l border-slate-200 flex items-center">
            {nickname ? (
              <div className="flex items-center gap-1.5 bg-sky-50 text-sky-900 border border-sky-200/80 px-2.5 py-1 rounded-full text-xs font-medium">
                <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                <span className="max-w-[100px] truncate">{nickname}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Guest
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

