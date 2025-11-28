/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2196F3',
        secondary: '#4CAF50',
        accent: '#FF9800'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
