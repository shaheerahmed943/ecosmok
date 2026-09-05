import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        boutique: {
          bg: "#0A2540", // deep navy — brand ground
          accent: "#C5DC3B", // lime accent — CTAs, highlights
          ivory: "#F5F2EC", // warm neutral background
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
