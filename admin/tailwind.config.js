/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        gold: '#b8964e',
        'gold-light': '#d4af6a',
        'iron-dark': '#1e2530',
        'iron-mid': '#3a4555',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
