/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        pastel: {
          // Pink shades
          pink: '#F8BBD9',
          'pink-light': '#FDE7F3',
          'pink-dark': '#F472B6',
          'pink-deep': '#EC4899',
          
          // Purple shades
          purple: '#DDD6FE',
          'purple-light': '#F3F4F6',
          'purple-dark': '#A855F7',
          'purple-deep': '#9333EA',
          
          // Lavender shades
          lavender: '#E9D5FF',
          'lavender-light': '#F5F3FF',
          'lavender-dark': '#C084FC',
          'lavender-deep': '#A855F7',
          
          // Rose shades
          rose: '#FECDD3',
          'rose-light': '#FFF1F2',
          'rose-dark': '#FB7185',
          'rose-deep': '#F43F5E',
          
          // Magenta shades
          magenta: '#F0ABFC',
          'magenta-light': '#FAE8FF',
          'magenta-dark': '#D946EF',
          'magenta-deep': '#C026D3',
          
          // Background colors
          cream: '#FEF7FF',
          gray: '#F8FAFC'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      }
    },
  },
  plugins: [],
};