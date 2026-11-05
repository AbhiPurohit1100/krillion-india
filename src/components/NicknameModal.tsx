"use client";

import React, { useState } from "react";
import { Sparkles, User, X } from "lucide-react";

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nickname: string) => void;
  currentNickname?: string;
}

export default function NicknameModal({
  isOpen,
  onClose,
  onSave,
  currentNickname = "",
}: NicknameModalProps) {
  const [name, setName] = useState(currentNickname);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length >= 2) {
      localStorage.setItem("patang_nickname", trimmed);
      if (!localStorage.getItem("patang_anonymous_id")) {
        localStorage.setItem("patang_anonymous_id", "anon_" + Math.random().toString(36).substring(2, 11));
      }
      onSave(trimmed);
      onClose();
    }
  };

  const handleGenerateRandom = () => {
    const prefixes = ["Desi", "Masala", "Patang", "Gully", "Bollywood", "Chai", "Curry", "Biryani"];
    const suffixes = ["Ustaad", "Master", "Boss", "Legend", "Rider", "Pilot", "Khiladi", "Hero"];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }${Math.floor(10 + Math.random() * 89)}`;
    setName(randomName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose Your Nickname</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No registration needed. This name appears on the Daily Patang Leaderboard!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Player Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MasalaKhiladi99"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-semibold text-slate-800 text-base"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleGenerateRandom}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Generate Random Name
            </button>
            <span className="text-[11px] text-slate-400">{name.length}/20 chars</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-patang-saffron to-amber-500 hover:from-amber-600 hover:to-patang-saffron text-white font-bold text-sm shadow-md disabled:opacity-50 transition-all"
            >
              Start Flying
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

