/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        military: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f8',
          500: '#0e8ce9',
          600: '#026fc7',
          700: '#0358a1',
          800: '#074b83',
          900: '#0b3f6d',
          950: '#072849',
        },
        navy: {
          800: '#0f172a',
          850: '#0d1527',
          900: '#0b1120',
          950: '#060a12',
        },
        tactical: {
          dark: '#080d1a',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(56, 168, 248, 0.25)',
          accent: '#38bdf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
