import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden sky-bg">
      {/* ── CLOUDS (decorative, behind everything) ───────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Cloud 1 */}
        <div className="absolute" style={{ top: "6%", left: "5%", animation: "drift 50s linear infinite" }}>
          <svg viewBox="0 0 140 56" className="w-36 h-14 opacity-90">
            <ellipse cx="70" cy="40" rx="62" ry="20" fill="white" />
            <ellipse cx="42" cy="34" rx="32" ry="24" fill="white" />
            <ellipse cx="88" cy="30" rx="36" ry="26" fill="white" />
            <ellipse cx="65" cy="22" rx="24" ry="20" fill="white" />
          </svg>
        </div>
        {/* Cloud 2 */}
        <div className="absolute" style={{ top: "12%", right: "8%", animation: "drift 65s linear infinite reverse" }}>
          <svg viewBox="0 0 110 46" className="w-28 h-12 opacity-80">
            <ellipse cx="55" cy="33" rx="50" ry="16" fill="white" />
            <ellipse cx="30" cy="27" rx="26" ry="20" fill="white" />
            <ellipse cx="72" cy="24" rx="30" ry="22" fill="white" />
            <ellipse cx="52" cy="18" rx="20" ry="16" fill="white" />
          </svg>
        </div>
        {/* Cloud 3 */}
        <div className="absolute" style={{ top: "3%", left: "38%", animation: "drift 80s linear infinite" }}>
          <svg viewBox="0 0 90 38" className="w-24 h-10 opacity-70">
            <ellipse cx="45" cy="27" rx="40" ry="13" fill="white" />
            <ellipse cx="25" cy="22" rx="22" ry="17" fill="white" />
            <ellipse cx="60" cy="20" rx="25" ry="18" fill="white" />
          </svg>
        </div>

        {/* Dark Gloomy Blood Moon / Retro Amber Orb */}
        <div
          className="absolute rounded-full"
          style={{
            top: "5%",
            right: "26%",
            width: 60,
            height: 60,
            background: "radial-gradient(circle, #ffa62b 0%, #ff4f4f 60%, rgba(255, 79, 79, 0) 100%)",
            boxShadow: "0 0 45px 12px rgba(255, 79, 79, 0.25)",
            filter: "contrast(1.2)",
          }}
        />


        {/* Ashoka Chakra subtle watermark */}
        <div
          className="absolute font-black text-[180px] select-none"
          style={{ color: "rgba(255,153,51,0.04)", bottom: "10%", right: "-2%", lineHeight: 1 }}
        >
          ☸
        </div>
      </div>

      {/* ── PIXEL-ART BOAT AT WATERLINE (ocean starts ~63%) ─── */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{ left: "18%", top: "calc(63% - 90px)" }}
      >
        <div className="animate-bob">
          <svg viewBox="0 0 220 100" className="w-40 h-20 sm:w-52 sm:h-24 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="hp-hull" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#181818" />
                <stop offset="100%" stopColor="#080808" />
              </linearGradient>
            </defs>
            {/* Hull */}
            <path
              d="M 22 60 Q 55 76 110 76 Q 165 76 198 56 Q 183 68 110 72 Q 37 68 22 60 Z"
              fill="url(#hp-hull)"
              stroke="#222"
              strokeWidth="1.5"
            />
            {/* Cabin */}
            <rect x="68" y="38" width="60" height="26" rx="4" fill="#111" stroke="#1e1e1e" strokeWidth="1" />
            {/* Mast */}
            <line x1="130" y1="72" x2="130" y2="12" stroke="#161616" strokeWidth="3.5" strokeLinecap="round" />
            {/* Red Flag */}
            <polygon points="130,12 164,21 130,30" fill="#cc2200" />
            {/* Cabin windows */}
            <rect x="74" y="46" width="12" height="10" rx="1.5" fill="#00e5ff" opacity="0.55" />
            <rect x="92" y="46" width="12" height="10" rx="1.5" fill="#00e5ff" opacity="0.55" />
            <rect x="110" y="46" width="12" height="10" rx="1.5" fill="#00e5ff" opacity="0.55" />
            {/* Fishing rod */}
            <line x1="100" y1="42" x2="188" y2="22" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
            {/* Fishing line */}
            <line x1="188" y1="22" x2="192" y2="80" stroke="rgba(0,229,255,0.4)" strokeWidth="1" />
          </svg>
        </div>
      </div>

      {/* ── WATERLINE WAVE ───────────────────────────────────── */}
      <div className="absolute inset-x-0 overflow-hidden z-10" style={{ top: "62.5%", height: 32 }}>
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,229,255,0.5) 25%, rgba(255,255,255,0.8) 50%, rgba(0,229,255,0.5) 75%, transparent 100%)",
          }}
        />
        <svg
          viewBox="0 0 1200 30"
          className="absolute top-0 left-0 w-[200%] h-full fill-none opacity-50"
          style={{ stroke: "rgba(0,229,255,0.4)", strokeWidth: 1.5, animation: "drift 20s linear infinite" }}
        >
          <path d="M0,12 Q75,3 150,12 T300,12 T450,12 T600,12 T750,12 T900,12 T1050,12 T1200,12" />
        </svg>
      </div>

      {/* ── MAIN CONTENT (centered in sky area) ─────────────── */}
      <div className="relative z-20 flex flex-col items-center justify-start pt-24 pb-10 px-4 min-h-screen">
        {/* Title block */}
        <div className="text-center space-y-2 mb-6">
          {/* Indian flair badges */}
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <span className="font-pixel text-xs px-3 py-1 rounded-full" style={{ background: "rgba(255,153,51,0.15)", color: "#FF9933", border: "1px solid rgba(255,153,51,0.4)" }}>
              🏏 CRICKET
            </span>
            <span className="font-pixel text-xs px-3 py-1 rounded-full" style={{ background: "rgba(0,229,255,0.1)", color: "#00e5ff", border: "1px solid rgba(0,229,255,0.3)" }}>
              🎬 BOLLYWOOD
            </span>
            <span className="font-pixel text-xs px-3 py-1 rounded-full" style={{ background: "rgba(19,135,67,0.15)", color: "#138743", border: "1px solid rgba(19,135,67,0.4)" }}>
              🇮🇳 INDIA
            </span>
          </div>

          {/* KRILLION title */}
          <h1
            className="font-pixel font-black uppercase"
            style={{
              fontSize: "clamp(3rem, 10vw, 6rem)",
              color: "#ff6b6b",
              textShadow:
                "0 0 0 2px #00e5ff, 0 0 20px rgba(0,229,255,0.4), 0 0 40px rgba(0,229,255,0.2), 2px 2px 0 #cc0000",
              letterSpacing: "0.12em",
              lineHeight: 1,
            }}
          >
            KRILLION
          </h1>

          {/* India Edition subtitle */}
          <p
            className="font-pixel uppercase tracking-widest"
            style={{
              fontSize: "clamp(0.75rem, 2.5vw, 1.1rem)",
              color: "#00e5ff",
              textShadow: "0 0 10px rgba(0,229,255,0.5)",
              letterSpacing: "0.3em",
            }}
          >
            INDIA EDITION ☸
          </p>

          {/* THE DAILY DIVE subtitle */}
          <p
            className="font-pixel text-sm"
            style={{ color: "#FF9933", letterSpacing: "0.2em", textShadow: "0 0 8px rgba(255,153,51,0.4)" }}
          >
            ▼ THE DAILY DIVE ▼
          </p>

          {/* Tagline */}
          <p className="font-pixel text-xs text-slate-300 tracking-wide mt-1">
            7 prompts · 25 seconds each · rarer answers sink deeper
          </p>
        </div>

        {/* Game Mode Card */}
        <div
          className="w-full max-w-sm mb-5 rounded-2xl px-5 py-4 scanlines"
          style={{
            background: "rgba(5, 12, 26, 0.85)",
            border: "2px solid #00e5ff",
            boxShadow: "0 0 20px rgba(0,229,255,0.15), inset 0 0 20px rgba(0,229,255,0.04)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="font-pixel text-xs font-black uppercase tracking-widest"
              style={{ color: "#ff6b9d", textShadow: "0 0 8px rgba(255,107,157,0.5)" }}
            >
              🏏 TODAY&apos;S EXPEDITION
            </span>
            <span
              className="font-pixel text-[10px] px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,229,255,0.1)",
                border: "1px solid rgba(0,229,255,0.4)",
                color: "#00e5ff",
              }}
            >
              ● LIVE
            </span>
          </div>

          <p className="font-pixel text-xs text-slate-300 mb-3">
            India Edition — Cricket, Cinema, History &amp; More
          </p>

          {/* Tricolor accent bar */}
          <div className="flex h-1 rounded-full overflow-hidden gap-0.5">
            <div className="flex-1 rounded-full" style={{ background: "#FF9933" }} />
            <div className="flex-1 rounded-full" style={{ background: "#ffffff" }} />
            <div className="flex-1 rounded-full" style={{ background: "#138743" }} />
          </div>
        </div>

        {/* PUFFER PARTY MULTIPLAYER CTA */}
        <Link
          href="/party"
          className="w-full max-w-sm mb-3 font-pixel font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl flex items-center justify-between transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{
            background: "linear-gradient(135deg, rgba(255,166,43,0.15) 0%, rgba(255,107,53,0.2) 100%)",
            border: "2px solid #ffa62b",
            color: "#ffa62b",
            boxShadow: "0 0 16px rgba(255,166,43,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🐡</span>
            <div className="text-left">
              <div className="text-xs font-black">PUFFER PARTY</div>
              <div className="text-[10px] text-amber-200/80 font-normal">Real-Time Multiplayer (2-8 Players)</div>
            </div>
          </div>
          <span className="text-xs font-black">JOIN / HOST →</span>
        </Link>

        {/* BEGIN DESCENT CTA */}
        <Link
          href="/play"
          className="w-full max-w-sm mb-5 font-pixel font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center transition-all hover:scale-[1.03] active:scale-[0.97]"

          style={{
            background: "rgba(0,229,255,0.08)",
            border: "2px solid #00e5ff",
            color: "#00e5ff",
            fontSize: "1rem",
            letterSpacing: "0.15em",
            textShadow: "0 0 10px rgba(0,229,255,0.5)",
            boxShadow: "0 0 24px rgba(0,229,255,0.15), inset 0 0 24px rgba(0,229,255,0.04)",
          }}
        >
          ▼ BEGIN DESCENT ▼
        </Link>

        {/* Footer links */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="font-pixel text-[11px] text-slate-500">DIVE #001</span>
          <span className="text-slate-700">·</span>
          <Link
            href="/play"
            className="font-pixel text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ARCHIVE ↻
          </Link>
          <span className="text-slate-700">·</span>
          <Link
            href="/play"
            className="font-pixel text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            LEADERBOARD ↑
          </Link>
        </div>

        {/* Rarity Guide (compact) */}
        <div className="w-full max-w-sm mt-8">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: "rgba(5, 12, 26, 0.75)",
              border: "1px solid rgba(0,229,255,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <p
              className="font-pixel text-[10px] uppercase tracking-widest mb-3"
              style={{ color: "#00e5ff", opacity: 0.7 }}
            >
              RARITY TIERS
            </p>
            <div className="space-y-2">
              {[
                { emoji: "🐟", label: "COMMON", depth: "0–1,500m", color: "#34d399" },
                { emoji: "🐠", label: "UNCOMMON", depth: "1,500–4,000m", color: "#00e5ff" },
                { emoji: "🐡", label: "RARE", depth: "4,000–7,500m", color: "#a855f7" },
                { emoji: "✨🦈", label: "ULTRA RARE", depth: "7,500m+", color: "#ffa62b" },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tier.emoji}</span>
                    <span
                      className="font-pixel text-[10px] font-bold uppercase"
                      style={{ color: tier.color, textShadow: `0 0 6px ${tier.color}50` }}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <span className="font-pixel text-[10px] text-slate-500">{tier.depth}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom padding for ocean area */}
        <div className="h-[38vh]" />
      </div>
    </div>
  );
}
