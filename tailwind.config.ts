import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#EEF3FF",
          100: "#DEE7FF",
          200: "#C5D5FF",
          300: "#A9BFFF",
          400: "#7F99FF",
          500: "#5B7FFF",
          600: "#3C6FFF", // primary
          700: "#2E56CC",
          800: "#2443A3",
          900: "#1C347F",
          primary: "#3C6FFF",
          DEFAULT: "#3C6FFF"
        },
        accent: {
          // accents
          mint: "#24D6A5",
          sun: "#FFB020",
        },

        // neutrals / surfaces
        background: "#F6F7FB",
        line: "#E7EAF1",
        ink: {
          900: "#0F172A",
          600: "#475569",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(16, 24, 40, 0.08)",
      },
      borderRadius: {
        xl: "20px",
        "2xl": "28px",
      },
      fontFamily: {
        // will be wired via next/font (CSS var)
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
