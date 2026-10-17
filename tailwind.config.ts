import type { Config } from "tailwindcss";

// Theme colors are full CSS colors (e.g. `--primary: hsl(...)`), which Tailwind
// can't apply `/opacity` modifiers to on its own — `bg-primary/10` used to
// compile to nothing. Mix with transparent instead so modifiers work.
const themeColor =
  (name: string) =>
  ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined
      ? `var(${name})`
      : `color-mix(in srgb, var(${name}) calc(${opacityValue} * 100%), transparent)`;

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: themeColor("--background"),
        foreground: themeColor("--foreground"),
        card: {
          DEFAULT: themeColor("--card"),
          foreground: themeColor("--card-foreground"),
        },
        popover: {
          DEFAULT: themeColor("--popover"),
          foreground: themeColor("--popover-foreground"),
        },
        primary: {
          DEFAULT: themeColor("--primary"),
          foreground: themeColor("--primary-foreground"),
        },
        secondary: {
          DEFAULT: themeColor("--secondary"),
          foreground: themeColor("--secondary-foreground"),
        },
        muted: {
          DEFAULT: themeColor("--muted"),
          foreground: themeColor("--muted-foreground"),
        },
        accent: {
          DEFAULT: themeColor("--accent"),
          foreground: themeColor("--accent-foreground"),
        },
        destructive: {
          DEFAULT: themeColor("--destructive"),
          foreground: themeColor("--destructive-foreground"),
        },
        border: themeColor("--border"),
        input: themeColor("--input"),
        ring: themeColor("--ring"),
        chart: {
          "1": themeColor("--chart-1"),
          "2": themeColor("--chart-2"),
          "3": themeColor("--chart-3"),
          "4": themeColor("--chart-4"),
          "5": themeColor("--chart-5"),
        },
        sidebar: {
          DEFAULT: themeColor("--sidebar"),
          foreground: themeColor("--sidebar-foreground"),
          primary: themeColor("--sidebar-primary"),
          "primary-foreground": themeColor("--sidebar-primary-foreground"),
          accent: themeColor("--sidebar-accent"),
          "accent-foreground": themeColor("--sidebar-accent-foreground"),
          border: themeColor("--sidebar-border"),
          ring: themeColor("--sidebar-ring"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        space: ["var(--font-space)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: themeColor("--radix-accordion-content-height"),
          },
        },
        "accordion-up": {
          from: {
            height: themeColor("--radix-accordion-content-height"),
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
