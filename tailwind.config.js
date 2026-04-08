/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        playful: '0 4px 0 0 rgba(15, 23, 42, 0.35)',
        'playful-sm': '0 2px 0 0 rgba(15, 23, 42, 0.2)',
      },
      keyframes: {
        'home-hero-title': {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'home-hero-sub': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'home-cta': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'home-card-in': {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'home-hero-title': 'home-hero-title 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'home-hero-sub': 'home-hero-sub 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards',
        'home-cta': 'home-cta 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards',
        'home-card-in': 'home-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      colors: {
        dark: {
          /* Softer than pure black — playful “app” feel (Duolingo-adjacent, not a copy) */
          bg: '#0f172a',
          surface: '#1e293b',
          card: '#1a2634',
          border: '#334155',
          text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            muted: '#94a3b8',
          },
          accent: {
            green: '#58cc02',
            'green-dark': '#46a302',
            blue: '#1cb0f6',
          },
        },
      },
    },
  },
  plugins: [],
}
