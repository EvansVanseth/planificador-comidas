/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#ECFDF5",
          500: "#009966",
          700: "#008055",
        },
        dark: "#0F172B",
        "slate-500": "#62748E",
        "slate-600": "#45556C",
        "text-body": "#314158",
        "page-bg": "#F8FAFC",
      },
    },
  },
  plugins: [],
};
