/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        foo: 'var(--color-foo)',
      },
      fontSize: {
        h4: ['1.125rem', '1.75rem'] /* 18px, 28px */,
        h3: ['1.25rem', '2rem'] /* 20px, 32px */,
        h2: ['1.5rem', '2rem'] /* 24px, 32px */,
        h1: ['2rem', '2.5rem'] /* 32px, 40px */,
        d2: ['2.5rem', '2.75rem'] /* 40px, 48px */,
        d1: ['4rem', 1] /* 64px, 64px */,
      },
      spacing: {
        4.5: '1.125rem',
        5.5: '1.375rem',
        6.5: '1.525rem',
        7.5: '1.875rem',
      },
    },
  },
  plugins: [],
};
