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
        surface: '#1e293b',
        border: '#334155',
        primary: '#3b82f6',
        primary_hover: '#2563eb',
        text: '#f8fafc',
        text_muted: '#94a3b8',
        danger: '#ef4444',
        warning: '#eab308',
        success: '#22c55e',
      }
    },
  },
  plugins: [],
}
