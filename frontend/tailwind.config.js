module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        brand: "16rem",
      },
      colors: {
        "gray-light": "#e5e5e5",
      },
    },
  },
  plugins: [],
};
