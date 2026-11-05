"use client";

import React, { useState } from "react";
import { Anchor, Sparkles, User, X } from "lucide-react";

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
      localStorage.setItem("krillion_nickname", trimmed);
      localStorage.setItem("patang_nickname", trimmed); // backward compatibility
      if (!localStorage.getItem("krillion_anonymous_id") && !localStorage.getItem("patang_anonymous_id")) {
        const anonId = "anon_" + Math.random().toString(36).substring(2, 11);
        localStorage.setItem("krillion_anonymous_id", anonId);
        localStorage.setItem("patang_anonymous_id", anonId);
      }
      onSave(trimmed);
      onClose();
    }
  };

  const handleGenerateRandom = () => {
    const prefixes = [
      "Sagar",
      "Kaveri",
      "Ganga",
      "Sundarbans",
      "Monsoon",
      "DeepSea",
      "Machhli",
      "Desi",
      "Chai",
      "Malabar",
    ];
    const suffixes = [
      "Angler",
      "Captain",
      "Fisher",
      "Khiladi",
      "Master",
      "Ustaad",
      "Navigator",
      "Diver",
    ];
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${
      suffixes[Math.floor(Math.random() * suffixes.length)]
    }${Math.floor(10 + Math.random() * 89)}`;
    setName(randomName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-ocean-950/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-sunset-gold/15 border border-sunset-gold/30 flex items-center justify-center text-sunset-gold">
            <Anchor className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Captain&apos;s Name
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            No registration needed. Set your captain name for today&apos;s catch report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Player Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SagarAngler88"
              maxLength={20}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:outline-none focus:ring-2 focus:ring-sunset-gold/50 focus:border-sunset-gold font-semibold text-white placeholder-slate-500 text-base"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleGenerateRandom}
              className="text-xs text-sunset-gold hover:text-sunset-amber font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Angler Name
            </button>
            <span className="text-[11px] text-slate-500">{name.length}/20 chars</span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white font-bold hover:bg-white/5 transition-colors text-sm"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sunset-gold to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-bold text-sm shadow-md disabled:opacity-40 transition-all"
            >
              Set Sail
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
