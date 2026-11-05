import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patang Trivia — Krillion India",
  description: "An Indian daily rarity trivia game. Fly your kite into the stratosphere with the rarest valid answers!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-900 text-slate-900 antialiased selection:bg-amber-400 selection:text-slate-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="py-4 text-center text-xs text-sky-900/60 border-t border-sky-300/30">
          <p>© {new Date().getFullYear()} Patang Trivia · Krillion India · Inspired by Deep Ball & Krillion</p>
        </footer>
      </body>
    </html>
  );
}

