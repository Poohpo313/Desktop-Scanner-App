/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          darkest: "#0A2E20",
          dark: "#0D3D2E",
          deep: "#003534",
          primary: "#166534",
          emerald: "#059669",
          bright: "#10B981",
          mint: "#D1FAE5",
          bg: "#F0FBF6",
          surface: "#FFFFFF",
          border: "#E2F0EB",
          green: "#00a7a5",
          forest: "#007a5e",
          squeeze: "#f4faf8",
          powder: "#bdeae5",
          panel: "#eaf6f4",
          "tower-gray": "#a8b5b8",
          inactive: "#6B7280"
        },
        status: {
          active: "#059669",
          inactive: "#6B7280",
          warning: "#D97706",
          error: "#DC2626"
        }
      },
      fontFamily: {
        sans: ["Poppins", "Segoe UI", "sans-serif"]
      },
      keyframes: {
        loadingBar: { "0%": { width: "0%" }, "100%": { width: "100%" } },
        spin: { to: { transform: "rotate(360deg)" } }
      },
      animation: {
        "loading-bar": "loadingBar 2.3s ease-in-out forwards",
        spin: "spin 1s linear infinite"
      },
      boxShadow: {
        card: "0 4px 24px rgba(0, 53, 52, 0.08)"
      }
    }
  },
  plugins: []
};
