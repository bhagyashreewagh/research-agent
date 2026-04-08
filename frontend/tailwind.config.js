/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#edfcfc",
          100: "#d2f6f6",
          200: "#a9eded",
          300: "#6fe0e0",
          400: "#2ecbcb",
          500: "#14b0b0",
          600: "#0e8d8d",
          700: "#0f7070",
          800: "#115a5a",
          900: "#134b4b",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#e2e8f0",
            a: { color: "#2ecbcb" },
            h2: { color: "#f1f5f9" },
            h3: { color: "#cbd5e1" },
            strong: { color: "#f1f5f9" },
            code: { color: "#2ecbcb" },
          },
        },
      },
    },
  },
  plugins: [],
};
