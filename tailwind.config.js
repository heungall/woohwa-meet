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
        base: ['16px', { lineHeight: '1.75rem' }],
        lg:   ['18px', { lineHeight: '2rem'    }],
        xl:   ['20px', { lineHeight: '2.25rem' }],
        '2xl':['24px', { lineHeight: '2.5rem'  }],
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
