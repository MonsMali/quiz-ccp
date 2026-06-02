import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Magenta accent for "Alucinacoes de IA"
        brand: {
          50: '#fce4f1',
          100: '#f9c8e3',
          200: '#f191c7',
          300: '#e85bab',
          400: '#d62f8d',
          500: '#C2006C',
          600: '#a80b60',
          700: '#86094c',
          800: '#640738',
          900: '#420425',
          DEFAULT: '#C2006C',
        },
        ink: '#15151a',
      },
    },
  },
  plugins: [],
};

export default config;
