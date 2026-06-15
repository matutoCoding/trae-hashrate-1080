/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        amber: {
          50: "#FFF8E7",
          100: "#F5E6C8",
          200: "#E8D4A8",
          300: "#D4A574",
          400: "#CD853F",
          500: "#B8860B",
          600: "#8B4513",
          700: "#6B3410",
          800: "#4A2308",
          900: "#2D1604",
        },
        clay: {
          50: "#FAF0E6",
          100: "#F5E0CC",
          200: "#E8C9A8",
          300: "#D4A574",
          400: "#C4884A",
          500: "#A06830",
          600: "#7A4E24",
          700: "#5A3818",
          800: "#3D2610",
          900: "#1F1308",
        },
        pine: {
          50: "#EFF5F5",
          100: "#D1E0E0",
          200: "#A3C1C1",
          300: "#75A2A2",
          400: "#4F7F7F",
          500: "#2F4F4F",
          600: "#244040",
          700: "#1A3030",
          800: "#112020",
          900: "#081010",
        },
        rice: {
          50: "#FFFDF5",
          100: "#FFF8E7",
          200: "#FFF0D0",
          300: "#FFE4B0",
          400: "#FFD68C",
          500: "#F5C76A",
          600: "#E0B040",
          700: "#B88A20",
          800: "#8A6810",
          900: "#5C4808",
        },
      },
      fontFamily: {
        serif: ['"Source Serif Pro"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'amber': '0 4px 20px -2px rgba(139, 69, 19, 0.15)',
        'amber-lg': '0 10px 40px -5px rgba(139, 69, 19, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
