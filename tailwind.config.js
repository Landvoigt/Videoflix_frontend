/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#141414',
        default: '#aebfc1',
    },},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

