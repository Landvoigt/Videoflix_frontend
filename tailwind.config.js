module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      gradientColorStops: {
        'custom-to': '#3a0b4f',
        'custom-from': '#000510',
      },
      colors: {
        customGray: '#141414',
        default: 'rgb(29, 29, 29)',
        defaultTextColor: 'rgba(240, 248, 255, 0.92)',
        secondTextColor: 'rgba(240, 248, 255, 0.77)',
        accentColor: '#7400c2',
        accentColorHover: '#aa42f0',
        inputFocusColor: '#2528eb',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}