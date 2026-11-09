/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        gov: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c5dbff',
          500: '#0054d1',
          600: '#0043aa',
          700: '#003385',
          800: '#03235b',
          900: '#06173a',
        },
        health: {
          500: '#ef4444',
          600: '#dc2626',
        },
        water: {
          500: '#0284c7',
          600: '#0369a1',
        },
        econ: {
          500: '#10b981',
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}

