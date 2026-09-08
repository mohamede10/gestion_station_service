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
        total: {
          red: "#E2001A",
          darkred: "#B30014",
          blue: "#00205B",
          navy: "#0A192F",
          gold: "#FFB800",
          lightbg: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
export default config;
