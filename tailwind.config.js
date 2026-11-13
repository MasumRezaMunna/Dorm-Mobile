/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 content pattern
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand green color palette
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Main primary green
          600: '#059669', // Emerald green
          700: '#047857',
          800: '#065f46',
          900: '#064e3b', // Forest green
        },
        emerald: {
          50:  '#ecfdf5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        mint: {
          300: '#a7f3d0',
          400: '#34d399',
          500: '#10b981',
        },
        // Dark theme surfaces
        dark: {
          950: '#0b1120',
          900: '#0f172a', // Main dark background
          800: '#1e293b', // Dark surface / card
          700: '#334155',
          600: '#475569',
          card: '#1e293b',
          border: 'rgba(255,255,255,0.08)',
        },
        // Surface colors
        surface: {
          dark: '#1e293b',
          light: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
