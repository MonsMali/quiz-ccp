import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Azure blue accent for "Alucinacoes de IA"
        brand: {
          50: '#e4eefc',
          100: '#c3dbf9',
          200: '#93bdf2',
          300: '#5b97e8',
          400: '#2b75d6',
          500: '#0061C2',
          600: '#0a539f',
          700: '#0a447f',
          800: '#08335f',
          900: '#06223f',
          DEFAULT: '#0061C2',
        },
        ink: '#15151a',
        // Soft, slightly cool off-white used for page backgrounds
        paper: '#F7F9FC',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        // Soft, layered surface shadow for cards
        card: '0 1px 2px rgba(21,21,26,0.04), 0 12px 32px -16px rgba(21,21,26,0.18)',
        // Higher-lift shadow for projected / hero surfaces
        pop: '0 2px 4px rgba(21,21,26,0.05), 0 24px 60px -24px rgba(10,68,127,0.45)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
