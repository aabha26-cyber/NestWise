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
      colors: {
        dark: {
          bg: '#0a0a0a',
          surface: '#1a1a1a',
          card: '#1f1f1f',
          border: '#2a2a2a',
          text: {
            primary: '#f5f5f5',
            secondary: '#a0a0a0',
            muted: '#6b6b6b',
          },
          accent: {
            green: '#10b981',
            blue: '#3b82f6',
          },
        },
      },
    },
  },
  plugins: [],
}
