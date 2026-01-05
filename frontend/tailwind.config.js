/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0a1428',
        slate: '#1c2b3f',
        accent: '#0397ab',
        gold: '#d4af37',
      },
    },
  },
  plugins: [],
}

