/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],

  theme: {
    extend: {
      colors: {
        indigo: {
          105: "#dbe0fe",
          150: "#ccd5ff",
          205: "#b7c2fe",
          250: "#9eafff",
          455: "#7585ec",
          605: "#5145e6",
          650: "#493fcb",
          655: "#463cb9",
          850: "#2c278c",
        },
        violet: {
          605: "#7a35ea",
          650: "#7233e1",
        },
        rose: {
          455: "#e64a67",
          605: "#dd1844",
          650: "#cb1741",
        },
        emerald: {
          450: "#22c08c",
          605: "#059064",
          650: "#04875e",
        },
        teal: {
          650: "#0e857c",
        },
        amber: {
          650: "#c66507",
        },
        orange: {
          655: "#d84f06",
        },
        slate: {
          205: "#dce3eb",
          405: "#7d8da1",
          450: "#748396",
          455: "#6c7b8f",
          650: "#4c5b70",
          705: "#3b495b",
          750: "#293548",
          805: "#1b2537",
          850: "#152033",
          955: "#090e18",
        },
      },
    },
  },

  plugins: [],
};