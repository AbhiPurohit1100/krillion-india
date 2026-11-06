import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Krillion India — Daily Trivia",
  description:
    "Cast your line into Indian trivia. The rarer your answer, the deeper you go. Play 7 questions daily and see what you catch.",
  keywords: ["trivia", "india", "daily game", "krillion", "fishing", "quiz"],
  openGraph: {
    title: "Krillion India — Daily Trivia",
    description: "The rarer your answer, the deeper you go. Play 7 questions daily.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen flex flex-col antialiased scanlines bg-[#030712] text-slate-200 selection:bg-cyan-500/30 selection:text-white`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
