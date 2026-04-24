import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can define custom solid brand colors here
        brand: {
          light: '#e0e7ff', // light indigo
          DEFAULT: '#4f46e5', // standard indigo
          dark: '#3730a3', // dark indigo
        }
      }
    },
  },
  plugins: [],
};
export default config;