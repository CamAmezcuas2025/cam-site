/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e60000",
          blue: "#0033cc",
          black: "#000000",
          white: "#ffffff",
        },
      },
      fontFamily: {
        heading: ['var(--font-bebas)', 'sans-serif'], // ✅ Use CSS variable
        body: ['var(--font-bebas)', 'Arial', 'sans-serif'], // ✅ Add body font
      },
    },
  },
  plugins: [],
};