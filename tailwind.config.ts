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
        sans: ["var(--font-public-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        canvas: "#fafafa",
        surface: "#ffffff",
        raised: "#f4f4f5",
        line: "#e4e4e7",
        lineActive: "#d4d4d8",
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
        },
        ink: {
          900: "#09090b",
          800: "#18181b",
          700: "#27272a",
          600: "#52525b",
          500: "#71717a",
          400: "#a1a1aa",
          300: "#d4d4d8",
        },
        // Navodaya Campus House Metaphor Palette
        house: {
          aravali: {
            bg: "#f0fdf4",
            text: "#15803d",
            border: "#bbf7d0",
          },
          nilgiri: {
            bg: "#eff6ff",
            text: "#1d4ed8",
            border: "#bfdbfe",
          },
          shivalik: {
            bg: "#fff1f2",
            text: "#be123c",
            border: "#fecdd3",
          },
          udaygiri: {
            bg: "#fffbeb",
            text: "#b45309",
            border: "#fde68a",
          },
        },
      },
      borderRadius: {
        control: "6px",
        card: "10px",
        panel: "12px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        dropdown: "0 4px 16px -2px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
