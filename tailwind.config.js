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
        'nestwise-pop': {
          '0%':   { transform: 'scale(0.7) rotate(-4deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.18) rotate(2deg)', opacity: '1' },
          '80%':  { transform: 'scale(0.95) rotate(-1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      animation: {
        'nestwise-pop': 'nestwise-pop 0.65s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
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
