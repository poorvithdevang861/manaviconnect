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
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(24, 24, 27, 0.04)",
        subtle: "0 1px 2px 0 rgba(24, 24, 27, 0.03)",
        card: "0 1px 2px 0 rgba(24, 24, 27, 0.04), 0 8px 24px -16px rgba(24, 24, 27, 0.12)",
        lift: "0 2px 4px 0 rgba(24, 24, 27, 0.04), 0 16px 32px -16px rgba(24, 24, 27, 0.18)",
        dropdown: "0 2px 6px -1px rgba(24, 24, 27, 0.06), 0 18px 40px -12px rgba(24, 24, 27, 0.18)",
        tile: "inset 0 1px 0 0 rgba(255, 255, 255, 0.7), 0 1px 2px 0 rgba(154, 52, 18, 0.12)",
        focus: "0 0 0 4px rgba(249, 115, 22, 0.14)",
      },
      keyframes: {
        enter: { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pop-in": { from: { opacity: "0", transform: "scale(0.96) translateY(-4px)" }, to: { opacity: "1", transform: "scale(1) translateY(0)" } },
        pop: { "0%": { transform: "scale(1)" }, "40%": { transform: "scale(1.28)" }, "100%": { transform: "scale(1)" } },
        "toast-in": { from: { opacity: "0", transform: "translateY(12px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        shimmer: { from: { backgroundPosition: "-200% 0" }, to: { backgroundPosition: "200% 0" } },
      },
      animation: {
        enter: "enter 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pop-in": "pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        pop: "pop 0.34s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "toast-in": "toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
