/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          100: 'rgba(255, 255, 255, 0.05)',
          200: 'rgba(255, 255, 255, 0.1)',
          300: 'rgba(255, 255, 255, 0.2)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        nexus: {
          dark: '#0f172a',   // Slate 900
          accent: '#3b82f6', // Blue 500
        }
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}