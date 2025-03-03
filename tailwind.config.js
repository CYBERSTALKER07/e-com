/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5A2B',
          light: '#A67C52',
          dark: '#6B4423',
        },
        secondary: {
          DEFAULT: '#D2B48C',
          light: '#E6D2B8',
          dark: '#BFA37A',
        },
        accent: {
          DEFAULT: '#F5F5DC',
          light: '#FFFFF0',
          dark: '#E8E8C8',
        }
      }
    },
  },
  plugins: [],
};