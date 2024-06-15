/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#141414',
        default: 'rgb(29, 29, 29)',
        defaultTextColor: 'rgba(240, 248, 255, 0.92)',
        accentColor: '#7400c2',
        accentColorHover: '#aa42f0',
    },},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

