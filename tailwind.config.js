/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'san-serif'],
      },
    },
  },
  plugins: ['prettier-plugin-tailwindcss'],
};
