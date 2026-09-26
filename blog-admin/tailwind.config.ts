import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fairplay: {
          // Modern, elegant Indigo-Violet primary theme
          primary: '#6366F1',
          'primary-hover': '#4F46E5',
          'primary-light': '#818CF8',
          secondary: '#8B5CF6',
          'secondary-hover': '#7C3AED',
          accent: '#38BDF8',
          
          // Friendly status accents
          emerald: '#10B981',
          'emerald-light': '#34D399',
          amber: '#F59E0B',
          rose: '#F43F5E',

          // Rich slate dark mode backgrounds (pleasant on eyes, clean)
          obsidian: '#0B0F19',
          dark: '#0E1322',
          card: '#131A2B',
          'card-hover': '#182035',
          surface: '#1E263D',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(99, 102, 241, 0.3)',

          // Compatibility fallback
          gold: '#6366F1',
          'gold-light': '#818CF8',
          'gold-dark': '#4F46E5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'primary-glow': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
        'emerald-glow': '0 0 25px -4px rgba(16, 185, 129, 0.3)',
        'gold-glow': '0 0 25px -4px rgba(99, 102, 241, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
