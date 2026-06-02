/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange':      '#F0A30A',
        'brand-orange-deep': '#FF6F00',
        'brand-slate':       '#1A1D21',
        'brand-sand':        '#FAF8F5',
        'brand-charcoal':    '#2D3436',
        'brand-green':       '#2E7D32',
        'brand-mist':        '#B0BEC5',
      },
      animation: {
        'fade-in':            'fadeIn 0.3s ease-out',
        'fade-in-up':         'fadeInUp 0.4s ease-out',
        'fade-in-soft':       'fadeIn 0.6s ease-out',
        'fade-up':            'fadeUp 0.5s ease-out',
        'fade-up-delay-1':    'fadeUp 0.5s ease-out 0.1s both',
        'fade-up-delay-2':    'fadeUp 0.5s ease-out 0.2s both',
        'fade-up-delay-3':    'fadeUp 0.5s ease-out 0.35s both',
        'soft-float':         'softFloat 4s ease-in-out infinite',
        'pulse-orange':       'pulseOrange 2s ease-in-out infinite',
        'slide-in-left':      'slideInLeft 0.5s ease-out both',
        'slide-in-right':     'slideInRight 0.5s ease-out both',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        softFloat: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseOrange: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(240,163,10,0)' },
          '50%':      { transform: 'scale(1.03)', boxShadow: '0 0 0 6px rgba(240,163,10,0.15)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
