/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#0b0d12',
        'dashboard-card': '#111318',
        'dashboard-accent': '#6366F1',
        'dashboard-border': 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  plugins: [],
}
