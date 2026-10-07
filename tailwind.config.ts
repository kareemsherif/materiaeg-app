import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fdf2f4",
          100: "#fce7eb",
          200: "#f9d0d9",
          300: "#f4a9ba",
          400: "#ec7491",
          500: "#e04a6e",
          600: "#cc2952",
          700: "#ac1d42",
          800: "#801B23", // Updated to match new logo exactly
          900: "#64151B", // Darker shade for contrast
          950: "#420d17",
        },
        charcoal: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#4f4f4f",
          700: "#2B2B2B", // Updated to match logo text color
          800: "#222222",
          900: "#1a1a1a",
          950: "#0d0d0d",
        },
        cream: {
          50: "#fdfcfa",
          100: "#faf8f3",
          200: "#f5f2ea",
          300: "#ede7d8",
          400: "#e2d9c5",
          500: "#d4c9ad",
          600: "#bfad8f",
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
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.25rem" }], // 13px
        sm: ["0.9375rem", { lineHeight: "1.375rem" }], // 15px
        base: ["1.0625rem", { lineHeight: "1.625rem" }], // 17px
        lg: ["1.1875rem", { lineHeight: "1.75rem" }], // 19px
        xl: ["1.3125rem", { lineHeight: "1.875rem" }], // 21px
        "2xl": ["1.625rem", { lineHeight: "2.125rem" }], // 26px
        "3xl": ["2rem", { lineHeight: "2.375rem" }], // 32px
        "4xl": ["2.5rem", { lineHeight: "2.75rem" }], // 40px
        "5xl": ["3.25rem", { lineHeight: "1" }], // 52px
        "6xl": ["4rem", { lineHeight: "1" }], // 64px
        "7xl": ["5rem", { lineHeight: "1" }], // 80px
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
