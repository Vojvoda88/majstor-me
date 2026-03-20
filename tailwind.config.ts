import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#0a1628",
          "navy-soft": "#111f36",
          accent: "#f59e0b",
          "accent-deep": "#d97706",
          cream: "#f6f8fc",
          page: "#eef2f9",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgb(0 0 0 / 0.05), 0 4px 16px -4px rgb(0 0 0 / 0.05)",
        card: "0 10px 30px rgba(15,23,42,0.06)",
        "card-hover": "0 16px 40px rgba(15,23,42,0.10)",
        marketplace:
          "0 24px 48px -12px rgba(10, 22, 40, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.05)",
        "marketplace-sm":
          "0 12px 28px -8px rgba(10, 22, 40, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        sticky: "0 -8px 24px rgba(15,23,42,0.08)",
        "btn-primary": "0 10px 25px rgba(37,99,235,0.30)",
        "btn-cta": "0 14px 32px -6px rgba(29, 78, 216, 0.45)",
        premium: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        "premium-lg": "0 32px 64px -12px rgba(0, 0, 0, 0.18)",
        glow: "0 0 40px -10px rgba(37, 99, 235, 0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
