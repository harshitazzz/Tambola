/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        foreground: '#f8fafc',
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#2563eb'
        },
        accent: '#f59e0b',
        success: '#10b981',
      }
    },
  },
  plugins: [],
}
