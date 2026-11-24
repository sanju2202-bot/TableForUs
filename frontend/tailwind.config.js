/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FAF8F5',
        espresso: '#2C1E16',
        latte: '#B86B35',
        sand: '#EFEAE2'
      }
    }
  },
  plugins: []
};
