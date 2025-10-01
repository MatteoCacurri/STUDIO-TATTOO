// tailwind.config.cjs
/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: { soft: "0 18px 60px -20px rgba(0,0,0,.55)" },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    darkTheme: "studio",
    themes: [
      {
        studio: {
          primary: "#e11d48",
          "primary-content": "#fff",
          secondary: "#0ea5e9",
          accent: "#f59e0b",
          neutral: "#171923",
          "base-100": "#0b0f14",
          "base-200": "#0f1620",
          "base-300": "#111827",
          info: "#38bdf8",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
  },
};
