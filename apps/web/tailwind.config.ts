/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#082f49",
        },
        secondary: {
          50: "#f8fafc",
          500: "#64748b",
          600: "#475569",
          900: "#0f172a",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            color: "#475569",
            a: {
              color: "#0284c7",
              "&:hover": {
                color: "#0369a1",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};
