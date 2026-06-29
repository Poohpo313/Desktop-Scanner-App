/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { dark: "#003534", mid: "#007a5e", light: "#00a7a5", accent: "#005f4a" },
      },
      fontFamily: { sans: ["Poppins", "sans-serif"] },
    },
  },
  plugins: [],
};
