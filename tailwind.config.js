/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="style-1"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg-primary)',
          'bg-sec': 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          hover: 'var(--color-bg-hover)',
          text: 'var(--color-text-primary)',
          'text-sec': 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          accent: 'var(--color-accent-primary)',
          'accent-hover': 'var(--color-accent-primary-hover)',
          'accent-light': 'var(--color-accent-primary-light)',
          'accent-sec': 'var(--color-accent-secondary)',
          border: 'var(--color-border)',
          'border-hover': 'var(--color-border-hover)',
        },
        accent: {
          primary: {
            DEFAULT: 'var(--color-accent-primary)',
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: 'var(--color-accent-primary-hover)',
            400: 'var(--color-accent-primary)',
            500: 'var(--color-accent-primary)',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
          },
          secondary: 'var(--color-accent-secondary)',
          success: {
            DEFAULT: '#10b981',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
          },
        },
        surface: {
          DEFAULT: 'var(--color-bg-primary)',
          light: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          border: 'var(--color-border)',
          hover: 'var(--color-bg-hover)',
        },
        muted: {
          DEFAULT: 'var(--color-text-muted)',
          light: 'var(--color-text-secondary)',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
