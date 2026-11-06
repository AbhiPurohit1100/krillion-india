import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: "#eef8ff",
          100: "#d8eeff",
          200: "#b9e0ff",
          300: "#89cfff",
          400: "#52b4ff",
          500: "#2a93ff",
          600: "#1373f5",
          700: "#0c5ce1",
          800: "#104ab6",
          900: "#13418f",
          950: "#0a1628",
        },
        sunset: {
          gold: "#ffa62b",
          amber: "#ff8c42",
          saffron: "#ff6b35",
          coral: "#ff4f4f",
          marigold: "#ffe66d",
        },
        depths: {
          shallow: "#2596be",
          mid: "#1a6b8a",
          deep: "#0f3d5c",
          abyss: "#071a2e",
        },
      },
      animation: {
        "bob": "bob 3s ease-in-out infinite",
        "wave": "wave 4s ease-in-out infinite",
        "wave-slow": "wave 6s ease-in-out infinite",
        "float-up": "floatUp 4s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
        "ripple": "ripple 2s ease-out infinite",
        "swim": "swim 8s ease-in-out infinite",
        "swim-reverse": "swimReverse 10s ease-in-out infinite",
        "bubble": "bubble 4s ease-in infinite",
        "hook-drop": "hookDrop 1s ease-out forwards",
        "fish-catch": "fishCatch 0.6s ease-out forwards",
        "drift": "drift 25s linear infinite",
        "krillion-glow": "krillionGlow 2s ease-in-out infinite",
        "cloud-drift": "cloudDrift 20s linear infinite",
        "toast-in": "toastIn 0.3s ease-out forwards",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        wave: {
          "0%, 100%": { transform: "translateX(0) scaleY(1)" },
          "50%": { transform: "translateX(-15px) scaleY(1.05)" },
        },
        floatUp: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        ripple: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        swim: {
          "0%": { transform: "translateX(-100%) scaleX(1)" },
          "49%": { transform: "translateX(100vw) scaleX(1)" },
          "50%": { transform: "translateX(100vw) scaleX(-1)" },
          "100%": { transform: "translateX(-100%) scaleX(-1)" },
        },
        swimReverse: {
          "0%": { transform: "translateX(100vw) scaleX(-1)" },
          "49%": { transform: "translateX(-100%) scaleX(-1)" },
          "50%": { transform: "translateX(-100%) scaleX(1)" },
          "100%": { transform: "translateX(100vw) scaleX(1)" },
        },
        bubble: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "100%": { transform: "translateY(-80px) scale(0.3)", opacity: "0" },
        },
        hookDrop: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fishCatch: {
          "0%": { transform: "scale(0) rotate(-20deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        drift: {
          "0%": { transform: "translateX(-10%)" },
          "100%": { transform: "translateX(110%)" },
        },
        krillionGlow: {
          "0%, 100%": { boxShadow: "0 0 8px #00e5ff40" },
          "50%": { boxShadow: "0 0 24px #00e5ff80" },
        },
        cloudDrift: {
          "0%": { transform: "translateX(0px)" },
          "100%": { transform: "translateX(60px)" },
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        toastOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-16px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
