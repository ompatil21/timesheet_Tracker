import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        display: ['var(--font-orbitron)'],
        heading: ['var(--font-space-grotesk)'],
      },
      colors: {
        racing: {
          red: '#E10600',
          dark: '#111111',
          panel: '#1A1A1A',
        },
        volt: '#C8F135',
      },
      boxShadow: {
        'neon-red': '0 0 15px rgba(225, 6, 0, 0.5)',
        'neon-green': '0 0 15px rgba(0, 255, 0, 0.4)',
      },
      animation: {
        'marquee': 'marquee 28s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
