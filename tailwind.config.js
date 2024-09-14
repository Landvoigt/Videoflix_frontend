module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      gradientColorStops: {
        'default-to': '#320e4d',
        'default-from': '#000510',

        'welcome-to': '#3a0b4f',
        'welcome-from': '#000510',

        'nav-to': '#2c246b',
        'nav-from': '#9727a5cf',
      },
      colors: {
        defaultColor: 'rgb(29, 29, 29)',
        accentColor: '#7400c2',
        accentColorHover: '#aa42f0',

        textColorPrimary: 'rgba(240, 248, 255, 0.92)',
        textColorSecondary: 'rgba(240, 248, 255, 0.77)',
        textColorHover: 'rgb(207 135 255)',

        borderColorPopup: '#e3d9ffb8',
        borderColorLight: '#e5e7eb38',
        borderColorVideoBox: 'rgba(241, 248, 253, 0.25)',

        inputColorFocus: '#2528eb',

        navColorHover: 'rgb(186 213 255 / 44%)',

        greyTransparent: '#9f9f9fa3',

        videoflixRed: '#d90505',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    function ({ addUtilities }) {
      addUtilities({
        '.text-shadow-sm': {
          'text-shadow': '1px 1px 2px rgba(0, 0, 0, 0.75)',
        },
        '.text-shadow-md': {
          'text-shadow': '2px 2px 4px rgba(0, 0, 0, 0.75)',
        },
        '.text-shadow-lg': {
          'text-shadow': '3px 3px 6px rgba(0, 0, 0, 1)',
        },
        '.text-shadow-xl': {
          'text-shadow': '4px 4px 8px rgba(0, 0, 0, 1)',
        },
        '.text-shadow-none': {
          'text-shadow': 'none',
        },
      });
    },
  ],
}