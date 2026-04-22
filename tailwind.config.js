/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      colors: {
        bg: {
          base: "#0a0a0f",
          card: "#111118",
          elevated: "#1a1a24",
          border: "#2a2a38",
        },
        accent: {
          green: "#00e676",
          "green-dim": "#00c853",
          red: "#ff5252",
          "red-dim": "#d50000",
          blue: "#448aff",
          purple: "#e040fb",
          amber: "#ffab40",
        },
        text: {
          primary: "#f0f0ff",
          secondary: "#8888aa",
          muted: "#44445a",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
