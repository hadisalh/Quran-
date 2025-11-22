/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Amiri', 'serif'],
        serif: ['Amiri', 'serif'],
        quran: ['UthmanicHafs', 'Amiri', 'serif'],
        ui: ['Lateef', 'cursive'],
      },
    },
  },
  plugins: [],
}