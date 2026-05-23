/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#F7931E",
        dark: "#1A1A1A",
      },
    },
  },
  plugins: [],
};
