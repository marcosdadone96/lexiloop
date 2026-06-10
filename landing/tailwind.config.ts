import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
          dark: '#1d4ed8',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        teal: {
          DEFAULT: '#06b6d4',
          light: 'rgba(6,182,212,0.12)',
        },
        navy: '#0f172a',
        gray: {
          brand: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hero: 'var(--shadow-hero)',
      },
      borderRadius: {
        card: '16px',
        md: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
