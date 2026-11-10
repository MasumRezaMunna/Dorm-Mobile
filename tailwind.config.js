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
        // Primary brand gradient colors
        primary: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Accent blue
        accent: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // Dark backgrounds (matching web slate-950, slate-900, etc.)
        dark: {
          950: '#0f0f23',
          900: '#13131f',
          800: '#1a1a2e',
          700: '#16213e',
          600: '#1f2040',
          card: '#1e1e30',
          border: 'rgba(255,255,255,0.08)',
        },
        // Surface colors
        surface: {
          dark: '#1e1e30',
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
