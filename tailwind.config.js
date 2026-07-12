/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: '#1B1D22',
          700: '#24262D',
          600: '#2E3038',
          500: '#3A3D47',
        },
        concrete: {
          DEFAULT: '#EDEFEC',
          100: '#F6F7F5',
          200: '#E3E5E0',
          300: '#C9CCC5',
        },
        lane: {
          DEFAULT: '#F5B400',
          600: '#D89C00',
        },
        signal: {
          DEFAULT: '#1E8E5A',
          100: '#E1F3EA',
        },
        beacon: {
          DEFAULT: '#D6493B',
          100: '#FBE7E4',
        },
        steel: {
          DEFAULT: '#3E5C88',
          100: '#E6EAF1',
        },
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        hazard:
          'repeating-linear-gradient(135deg, #F5B400 0 10px, #1B1D22 10px 20px)',
      },
    },
  },
  plugins: [],
}
