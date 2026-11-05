import Link from "next/link";
import { ArrowRight, Flame, Sparkles, Trophy, Wind } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Background clouds & sky ambient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-12 left-10 w-48 h-16 bg-white/30 rounded-full blur-xl animate-drift"></div>
        <div className="absolute top-36 right-16 w-72 h-20 bg-white/25 rounded-full blur-2xl animate-drift [animation-delay:6s]"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8 py-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-sky-300 shadow-sm text-sky-900 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>India&apos;s Daily Rarity Trivia</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight drop-shadow-sm">
            Fly Higher with <br />
            <span className="bg-gradient-to-r from-patang-saffron via-amber-500 to-patang-turquoise bg-clip-text text-transparent">
              Rarer Answers
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-700 max-w-lg mx-auto font-medium leading-relaxed">
            Every day, answer 7 India-centric trivia questions. Obvious answers keep you near the ground.
            Unearth the rarest valid gems to launch your kite to the clouds!
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="glass-panel p-4 rounded-2xl border border-white/60">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
              <Wind className="w-4 h-4 text-amber-700" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">7 Daily Questions</h3>
            <p className="text-xs text-slate-600 mt-1">25 seconds each. One shot per question. Same questions for everyone.</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/60">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center mb-2">
              <Flame className="w-4 h-4 text-sky-700" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Rarity Scoring</h3>
            <p className="text-xs text-slate-600 mt-1">Don&apos;t just answer. Think of valid answers others will forget.</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-white/60">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
              <Trophy className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">The Flying Kite</h3>
            <p className="text-xs text-slate-600 mt-1">Watch your kite soar in real time based on your rarity performance.</p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Link
            href="/play"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-patang-saffron via-amber-500 to-amber-600 hover:from-amber-600 hover:to-patang-saffron text-white font-bold text-lg shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Play Today&apos;s Game</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

