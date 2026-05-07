/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'primary-light': '#EFF6FF',
        success: '#10B981',
        'success-light': '#ECFDF5',
        warning: '#F59E0B',
        'warning-light': '#FFFBEB',
        error: '#EF4444',
        'error-light': '#FEF2F2',
        'error-border': '#FCA5A5',
        'error-text': '#991B1B',
        neutral: '#6B7280',
        surface: '#F9FAFB',
        card: '#FFFFFF',
        'card-border': '#E5E7EB',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-placeholder': '#9CA3AF',
      },
      borderRadius: {
        'sm': '8px',
        'xl': '12px',
        '2xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.1)',
        'elevated': '0 4px 6px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'monospace'],
      },
      spacing: {
        'screen': '16px',
        'card': '16px',
        'section': '12px',
        'element': '8px',
      },
      height: {
        'touch': '44px',
        'btn': '48px',
        'btn-primary': '56px',
        'header': '56px',
        'bottom-nav': '64px',
      },
      fontSize: {
        'heading': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'collapse': {
          '0%': { maxHeight: '500px', opacity: '1' },
          '100%': { maxHeight: '0', opacity: '0' },
        },
        'expand': {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '500px', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'collapse': 'collapse 0.2s ease-out forwards',
        'expand': 'expand 0.2s ease-out forwards',
      },
      transitionDuration: {
        '200': '200ms',
      },
    },
  },
  plugins: [],
}
