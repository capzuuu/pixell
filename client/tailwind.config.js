/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        netflix: {
          red: '#E50914',
          hover: '#C11119',
          darkRed: '#8B0000',
          black: '#141414',
          deepBlack: '#000000',
          darkGray: '#181818',
          midGray: '#232323',
          lightGray: '#2F2F2F',
          textMuted: '#AAAAAA',
          textDim: '#808080',
          matchGreen: '#46D369',
        },
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#E50914',
          700: '#C11119',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        dark: {
          950: '#0c0c0c',
          900: '#141414',
          850: '#181818',
          800: '#232323',
          700: '#2F2F2F',
          600: '#404040',
        }
      },
      fontFamily: {
        sans: ['Netflix Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'netflix-card': '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
        'netflix-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.9)',
        'netflix-red': '0 0 25px 0 rgba(229, 9, 20, 0.5)',
        'glow-brand': '0 0 25px -5px rgba(229, 9, 20, 0.5)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'card-hover': 'cardHover 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        cardHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.25)', zIndex: '40' },
        }
      }
    },
  },
  plugins: [],
}
