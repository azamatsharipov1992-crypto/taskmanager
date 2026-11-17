/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 3 Hi-Tech Light Accent Colors
        hicyan: {
          light: '#E0F2FE',
          DEFAULT: '#0284C7',
          dark: '#0369A1',
          neon: '#00D8F6',
        },
        himint: {
          light: '#ECFDF5',
          DEFAULT: '#059669',
          dark: '#047857',
          neon: '#00E599',
        },
        hiamber: {
          light: '#FFFBEB',
          DEFAULT: '#D97706',
          dark: '#B45309',
          neon: '#FFB020',
        },
        // Hi-Tech Clinical Base
        hibase: {
          canvas: '#F8FAFC',
          card: '#FFFFFF',
          sidebar: '#F1F5F9',
          border: '#E2E8F0',
          ink: '#090D16',
          sub: '#64748B'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
