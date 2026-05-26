import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linho: "#EFE9DF",
        pedra: "#D5CCB8",
        rose: "#D4A89A",
        travertino: "#8A7E6B",
        carvao: "#1F1D1B",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widestplus: "0.22em",
      },
      maxWidth: {
        prose: "640px",
        hero: "720px",
      },
    },
  },
  plugins: [],
};

export default config;
