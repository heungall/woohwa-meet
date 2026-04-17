/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        woohwa: {
          green: '#9BC53D',
          'green-light': '#B6D157',
          'green-dark': '#86A934',
          cream: '#FBF9F7',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
}
