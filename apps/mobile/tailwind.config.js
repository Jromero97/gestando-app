/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FBF0EF',
        surface: '#FFFFFF',
        ink: '#2B2A33',
        // Darkened from #9C98A6 / primaryDark from #C96A80 - the originals failed
        // WCAG AA contrast (2.5:1 / 2.8:1) against this app's light backgrounds;
        // these pass 4.5:1+ everywhere they're used. See accessibility audit.
        muted: '#615C69',
        primary: '#E28A96',
        primaryDark: '#9C4457',
        rose: '#F7DFE2',
        lavender: '#E3DEF6',
        lavenderText: '#5B5470',
        iceblue: '#DCE7F5',
        iceblueText: '#3A5A80',
      },
      fontFamily: {
        sans: ['Nunito_400Regular'],
        semi: ['Nunito_600SemiBold'],
        display: ['Nunito_800ExtraBold'],
      },
      borderRadius: {
        card: '28px',
      },
    },
  },
  plugins: [],
};
