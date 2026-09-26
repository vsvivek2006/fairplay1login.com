/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-dark': '#0a0d14',
        'bg-dark-secondary': '#0f1420',
        'bg-card': 'rgba(18, 24, 38, 0.7)',
        'bg-card-hover': 'rgba(26, 35, 56, 0.85)',
        'accent-gold': '#d4af37',
        'accent-gold-light': '#f3e5ab',
        'accent-gold-hover': '#b89628',
        'accent-green': '#25d366',
        'accent-green-hover': '#1ebd56',
        'accent-blue': '#1e6091',
        'accent-cyan': '#00f2fe',
        'text-main': '#f1f5f9',
        'text-muted': '#94a3b8',
        'border-glass': 'rgba(212, 175, 55, 0.2)',
        'border-light': 'rgba(255, 255, 255, 0.08)',
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px rgba(212, 175, 55, 0.15)',
        'glow-gold': '0 0 35px rgba(212, 175, 55, 0.3)',
        'glow-green': '0 0 25px rgba(37, 211, 102, 0.35)',
      },
    },
  },
  plugins: [],
};
