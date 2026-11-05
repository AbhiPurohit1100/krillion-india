import Link from "next/link";
import {
  Anchor,
  ArrowRight,
  Compass,
  Fish,
  Flame,
  ShieldCheck,
  Sparkles,
  Timer,
  Waves,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-start overflow-hidden pt-24 pb-20 px-4 sm:px-6">
      {/* ── ATMOSPHERIC BACKGROUND EFFECTS ────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Warm Indian Sunset Horizon Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-sunset-saffron/15 via-sunset-amber/10 to-transparent rounded-full blur-3xl" />

        {/* Deep Ocean Ambient Light */}
        <div className="absolute top-[35%] left-1/4 w-[600px] h-[500px] bg-ocean-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px]" />

        {/* Ambient Subtle Wave Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-12">
        {/* ── TOP BADGE: DAILY EXPEDITION ──────────────────────── */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border border-sunset-gold/30 text-xs sm:text-sm font-semibold text-slate-200 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sunset-gold opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sunset-gold"></span>
          </span>
          <span className="text-sunset-gold font-bold tracking-wide uppercase text-[11px]">
            Daily India Expedition
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-medium">7 Questions · 25s Per Cast</span>
        </div>

        {/* ── HERO HEADLINE & METAPHOR ─────────────────────────── */}
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white">
            THE RARER THE ANSWER, <br />
            <span className="text-gradient-gold">THE DEEPER THE CATCH.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
            Cast your line into Indian cinema, cricket, geography, and history. Common answers float on the surface. Obscure, forgotten truths plunge your hook into the midnight ocean to reel in legendary sea creatures.
          </p>
        </div>

        {/* ── PRIMARY CTA & INSTANT SPECS ──────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/play"
            className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 rounded-2xl bg-gradient-to-r from-sunset-gold via-sunset-amber to-sunset-saffron hover:from-sunset-saffron hover:to-sunset-gold text-slate-950 font-black text-lg shadow-xl shadow-sunset-gold/25 hover:shadow-sunset-gold/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
          >
            <span>CAST YOUR LINE TODAY</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            {/* Shimmer effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
            </div>
          </Link>
        </div>

        {/* ── EXPEDITION SPEC HIGHLIGHTS ───────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl pt-2 text-left">
          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sunset-gold/10 border border-sunset-gold/20 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-sunset-gold" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Daily Game</div>
              <div className="text-sm font-bold text-white">7 Questions</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-ocean-400" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Time Limit</div>
              <div className="text-sm font-bold text-white">25s Per Turn</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Waves className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Scoring Engine</div>
              <div className="text-sm font-bold text-white">Bayesian Rarity</div>
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Fair Play</div>
              <div className="text-sm font-bold text-white">Same for All</div>
            </div>
          </div>
        </div>

        {/* ── THE RARITY FIELD GUIDE (Krillion Depth Tiers) ─────── */}
        <div className="w-full max-w-4xl pt-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-ocean-400">
              Oceanic Expedition Manual
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              What Will You Reel In From The Depths?
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Your score is governed by how many other players guessed your answer. Rare answers sink your hook deeper.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Tier 1: Common */}
            <div className="glass-panel-hover p-5 rounded-2xl border border-emerald-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🐟</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Common
                </span>
              </div>
              <div className="text-xs font-semibold text-emerald-400 mb-1">0 - 1,500m Depth</div>
              <h3 className="font-bold text-white text-base">Silver Pomfret</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The obvious, popular answers that instantly come to mind. Safe and valid, but barely wets the hook.
              </p>
            </div>

            {/* Tier 2: Uncommon */}
            <div className="glass-panel-hover p-5 rounded-2xl border border-ocean-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-ocean-500/5 rounded-full blur-xl group-hover:bg-ocean-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🐠</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-ocean-500/10 text-ocean-400 border border-ocean-500/30">
                  Uncommon
                </span>
              </div>
              <div className="text-xs font-semibold text-ocean-400 mb-1">1,500 - 4,000m Depth</div>
              <h3 className="font-bold text-white text-base">King Surmai</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sharp answers that require real cultural memory. Only a modest slice of players will identify these.
              </p>
            </div>

            {/* Tier 3: Rare */}
            <div className="glass-panel-hover p-5 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🐡</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Rare
                </span>
              </div>
              <div className="text-xs font-semibold text-purple-400 mb-1">4,000 - 7,500m Depth</div>
              <h3 className="font-bold text-white text-base">Luminous Angler</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Obscure, brilliant trivia gems. Deep water answers that prove your mastery of Indian lore.
              </p>
            </div>

            {/* Tier 4: Ultra Rare */}
            <div className="glass-panel-hover p-5 rounded-2xl border border-sunset-gold/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sunset-gold/10 rounded-full blur-xl group-hover:bg-sunset-gold/20 transition-colors" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">✨🦈</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sunset-gold/20 text-sunset-gold border border-sunset-gold/40">
                  Ultra Rare
                </span>
              </div>
              <div className="text-xs font-semibold text-sunset-gold mb-1">7,500m+ Trench</div>
              <h3 className="font-bold text-white text-base">Mythic Golden Rohu</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The ultimate catch. A valid answer so niche that barely anyone else thinks of it. Maximum depth points!
              </p>
            </div>
          </div>
        </div>

        {/* ── HOW TO PLAY ─────────────────────────────────────── */}
        <div className="w-full max-w-4xl pt-6 pb-4">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sunset-gold" />
              <span>How To Play Krillion India</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-sunset-gold/15 text-sunset-gold font-black flex items-center justify-center text-sm border border-sunset-gold/30">
                  1
                </div>
                <h4 className="font-bold text-white text-sm">Read the Challenge</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every question has dozens of possible valid answers (e.g. &ldquo;Name a movie starring Amitabh Bachchan&rdquo;).
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-ocean-400/15 text-ocean-300 font-black flex items-center justify-center text-sm border border-ocean-400/30">
                  2
                </div>
                <h4 className="font-bold text-white text-sm">Target the Rarest Gem</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Avoid the obvious blockbuster or mega-hit. Think of the critically acclaimed, obscure, or forgotten valid answer.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-8 h-8 rounded-full bg-purple-400/15 text-purple-300 font-black flex items-center justify-center text-sm border border-purple-400/30">
                  3
                </div>
                <h4 className="font-bold text-white text-sm">Watch the Hook Plunge</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our Bayesian scoring engine calculates your answer&apos;s rarity against all players in real time and plunges your line!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FINAL LAUNCH BANNER ──────────────────────────────── */}
        <div className="pt-4 w-full max-w-md">
          <Link
            href="/play"
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-base transition-all duration-300 hover:scale-[1.02]"
          >
            <Anchor className="w-4 h-4 text-sunset-gold" />
            <span>Begin Expedition</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
          <p className="text-[11px] text-slate-500 mt-3">
            Expedition resets daily at 00:00 IST · No account required
          </p>
        </div>
      </div>
    </div>
  );
}
