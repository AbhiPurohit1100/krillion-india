"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Anchor, Menu, X, Shield } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/play", label: "Play" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [nickname, setNickname] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("krillion_nickname");
    if (saved) setNickname(saved);

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-ocean-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Anchor className="w-6 h-6 text-sunset-gold transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute -inset-1 bg-sunset-gold/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-gradient-gold">KRILLION</span>
              <span className="text-slate-400 font-normal ml-1.5">India</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                pathname === "/admin"
                  ? "text-white bg-white/10"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </Link>

            {nickname && (
              <div className="ml-3 pl-3 border-l border-white/10">
                <span className="text-xs text-slate-500">Playing as</span>
                <span className="ml-1.5 text-sm text-ocean-300 font-medium">
                  {nickname}
                </span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="sm:hidden p-2 text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isMobileOpen && (
          <div className="sm:hidden pb-4 border-t border-white/5 mt-1 pt-3 animate-fade-in">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white bg-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/admin"
                onClick={() => setIsMobileOpen(false)}
                className="px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            </div>
            {nickname && (
              <div className="mt-3 px-4 pt-3 border-t border-white/5">
                <span className="text-xs text-slate-500">Playing as </span>
                <span className="text-sm text-ocean-300 font-medium">{nickname}</span>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
