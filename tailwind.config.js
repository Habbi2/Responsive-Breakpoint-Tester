/**************** Tailwind Config ****************/
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        base: {
          bg: 'var(--color-bg)',
          fg: 'var(--color-fg)',
          muted: 'var(--color-muted)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)'
        }
      }
    }
  },
  plugins: []
};
