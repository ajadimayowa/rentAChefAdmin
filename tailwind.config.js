export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        'base-color': 'var(--base-color)',
        buttons: 'var(--buttons)',
        light: 'var(--light)',
        ink: {
          50: '#f6f6f7',
          100: '#e7e7e9',
          200: '#d1d1d5',
          300: '#adadb4',
          400: '#83838c',
          500: '#68686f',
          600: '#57575d',
          700: '#4a4a4e',
          800: '#3f3f43',
          900: '#1c1c1f',
          950: '#0d0d0f'
        },
        amber: {
          50: '#fdf7ed',
          100: '#f9ead0',
          200: '#f2d29c',
          300: '#ebb867',
          400: '#e5a343',
          500: '#E39325',
          600: '#c4761c',
          700: '#a05a19',
          800: '#82481b',
          900: '#6b3c19'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,13,15,0.04), 0 8px 24px -12px rgba(13,13,15,0.12)'
      }
    }
  }
}
