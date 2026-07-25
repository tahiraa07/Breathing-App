/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Quicksand"', 'system-ui', 'sans-serif'],
        sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#effbf7',
          100: '#d8f5ea',
          200: '#b3ebd9',
          300: '#7fdac1',
          400: '#4ac1a4',
          500: '#2aa689',
          600: '#1e8670',
          700: '#1c6b5c',
          800: '#1b544a',
          900: '#194640',
          950: '#0a2823',
        },
        accent: {
          50: '#fff6ed',
          100: '#ffead4',
          200: '#ffd2a8',
          300: '#ffb471',
          400: '#ff943d',
          500: '#fb7919',
          600: '#ec5f0d',
          700: '#c4470c',
          800: '#9c3912',
          900: '#7e3112',
        },
        night: {
          50: '#f0f5f6',
          100: '#dde9ec',
          200: '#bcd3da',
          300: '#8fb3bf',
          400: '#5d8a99',
          500: '#3e6c7d',
          600: '#345767',
          700: '#2f4853',
          800: '#283b44',
          900: '#1c2a31',
          950: '#101c22',
        },
        success: {
          400: '#4ac1a4',
          500: '#2aa689',
          600: '#1e8670',
        },
        warning: {
          400: '#ffb471',
          500: '#fb7919',
        },
        error: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        'soft-pulse': 'soft-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
