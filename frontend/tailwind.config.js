/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ojas — Astronaut Wellness Universe Design System
        primary: {
          DEFAULT: '#7656D9',
          dark: '#5535A5',
          violet: '#8B78C6',
          lavender: '#E8E0FF',
          lilac: '#F2EDFF',
          hover: '#6444C9',
          light: '#E8E0FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          ground: '#F8F6FF',
          card: '#FFFFFF',
          subtle: '#F2EDFF',
          border: '#E9E4F2',
        },
        accent: {
          mint: '#9BDCC3',
          peach: '#FFC98B',
          critical: '#D9536F',
          violet: '#8B78C6',
          lavender: '#E8E0FF',
        },
        content: {
          main: '#252039',
          secondary: '#716B83',
          muted: '#8C869E',
          inverse: '#FFFFFF',
        },
        semantic: {
          success: '#19A974',
          warning: '#E9A23B',
          critical: '#D9536F',
          info: '#7656D9',
          normal: '#19A974',
          caution: '#E9A23B',
          priority: '#D9536F',
        },
        // Backward-compatible alias for existing components
        cosmos: {
          bg: '#F8F6FF',
          'bg-secondary': '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
          accent: '#7656D9',
          'accent-secondary': '#5535A5',
          text: '#252039',
          'text-secondary': '#716B83',
          muted: '#8C869E',
          border: '#E9E4F2',
        },
      },
      boxShadow: {
        'soft': '0 2px 14px rgba(118, 86, 217, 0.06), 0 1px 3px rgba(85, 53, 165, 0.03)',
        'soft-md': '0 6px 24px -2px rgba(118, 86, 217, 0.09), 0 2px 8px -1px rgba(85, 53, 165, 0.04)',
        'soft-lg': '0 12px 36px -4px rgba(118, 86, 217, 0.12), 0 4px 14px -2px rgba(85, 53, 165, 0.06)',
        'purple-glow': '0 0 24px rgba(118, 86, 217, 0.18)',
        'planet-glow': '0 0 40px rgba(118, 86, 217, 0.25)',
      },
      fontFamily: {
        heading: ['"Book Antiqua"', '"Book Antique"', 'Palatino', '"Palatino Linotype"', 'Georgia', 'serif'],
        sans: ['"Book Antiqua"', '"Book Antique"', 'Palatino', '"Palatino Linotype"', 'Georgia', 'serif'],
        serif: ['"Book Antiqua"', '"Book Antique"', 'Palatino', '"Palatino Linotype"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Book Antiqua"', 'monospace'],
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