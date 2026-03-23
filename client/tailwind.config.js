/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#edf2fb',
          100: '#d0dff5',
          200: '#a3bfea',
          300: '#6e97d9',
          400: '#3d72c4',
          500: '#1A6BBF',
          600: '#1358a0',
          700: '#0D2B6E',
          800: '#091f52',
          900: '#061438',
        },
        brand: {
          green:      '#3BAB35',
          'green-lt': '#e8f7e7',
          'green-md': '#c6edC3',
          blue:       '#1A6BBF',
          'blue-lt':  '#e3f0fb',
          navy:       '#0D2B6E',
          'navy-lt':  '#edf2fb',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body:    ['"Figtree"', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 1px 4px rgba(13,43,110,0.07), 0 4px 16px rgba(13,43,110,0.06)',
        'card-hover': '0 4px 24px rgba(13,43,110,0.13)',
        glow:  '0 0 24px rgba(59,171,53,0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};