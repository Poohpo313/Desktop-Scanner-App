/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: "#323b42",
          "deep-teal": "#003534",
          "rain-forest": "#007a5e",
          "persian-green": "#00a7a5",
          nevada: "#5e7074",
          mystic: "#dde8e7",
          white: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        display: "52px",
        "display-sm": "38px",
        h1: "26px",
        h2: "20px",
        body: "14px",
        caption: "13px",
        small: "12px",
        micro: "11px",
      },
    },
  },
  plugins: [],
};
