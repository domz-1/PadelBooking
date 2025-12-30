import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        "plex-arabic": ["IBM Plex Sans Arabic", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0066cc",
          dark: "#0052a3",
          light: "#3380ff",
        },
        secondary: {
          DEFAULT: "#64748b",
          dark: "#475569",
          light: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
