import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        serif: ["Lora", ...defaultTheme.fontFamily.serif],
      },
      colors: {
        warm: {
          50: "#f5f2ef",
          100: "#f5f5f5",
          200: "#f6f6f6",
          300: "#e5e5e5",
          gray: "#777169",
          dark: "#4e4e4e",
        },
      },
      boxShadow: {
        "el-card": "rgba(0,0,0,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 1px 2px, rgba(0,0,0,0.04) 0px 2px 4px",
        "el-card-hover": "rgba(0,0,0,0.08) 0px 0px 0px 1px, rgba(0,0,0,0.06) 0px 2px 4px, rgba(0,0,0,0.04) 0px 4px 8px",
        "el-button": "rgba(0,0,0,0.4) 0px 0px 1px, rgba(0,0,0,0.04) 0px 4px 4px",
        "el-warm": "rgba(78,50,23,0.04) 0px 6px 16px",
        "el-inset": "rgba(0,0,0,0.075) 0px 0px 0px 0.5px inset",
        /* dark mode variants */
        "el-card-dark": "rgba(255,255,255,0.06) 0px 0px 0px 1px, rgba(0,0,0,0.2) 0px 2px 4px",
        "el-card-dark-hover": "rgba(255,255,255,0.1) 0px 0px 0px 1px, rgba(0,0,0,0.3) 0px 4px 8px",
      },
      letterSpacing: {
        "body": "0.16px",
        "body-wide": "0.18px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
