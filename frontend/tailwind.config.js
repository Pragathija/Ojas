/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: '#08090B',
          'bg-secondary': '#111316',
          card: '#191C20',
          elevated: '#22262B',
          accent: '#F07832',
          'accent-secondary': '#F5A15C',
          text: '#F4F1EA',
          'text-secondary': '#A5A9AD',
          muted: '#70777D',
          border: '#30353A',
        },
        semantic: {
          normal: '#53B68A',
          caution: '#E7B45B',
          priority: '#E36B58',
          info: '#7D9CCB',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      screens: {
        'mobile': '360px',
        'tablet': '640px',
        'laptop': '1024px',
        'desktop': '1440px',
      },
    },
  },
  plugins: [],
}
