/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: {
          50:  "#FFFEF C",
          100: "#FAF8F5",
          200: "#F2EDE6",
          300: "#E8E0D6",
          400: "#DDD3C8",
          500: "#C8BAB0",
        },
        warm: {
          100: "#F5EDE6",
          200: "#E8D8CC",
          300: "#D4B8A8",
          400: "#B8917E",
          500: "#8B6B5B",
          600: "#7A5A4A",
          700: "#64493C",
          800: "#3E2D26",
          900: "#1C1410",
        },
      },
    },
  },
  plugins: [],
};
