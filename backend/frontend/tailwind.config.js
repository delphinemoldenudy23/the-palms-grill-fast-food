/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        secondary: "#F7931E",
        dark: "#0F0F0F",
      },
      fontFamily: {
        display: ["Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
