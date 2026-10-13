import type { Config } from "tailwindcss";

// Scrapbook theme: cream paper, kraft card, pen ink. The app pages are written
// against Tailwind's zinc / red / green / amber scales, so those scales are
// remapped here to warm paper and ink tones instead of restyling every class.
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-courier-prime)', 'monospace'],
        display: ['var(--font-caveat)', 'cursive'],
        heading: ['var(--font-caveat)', 'cursive'],
        hand: ['var(--font-caveat)', 'cursive'],
        mono: ['var(--font-courier-prime)', 'monospace'],
        note: ['var(--font-patrick-hand)', 'cursive'],
        type: ['var(--font-courier-prime)', 'monospace'],
      },
      colors: {
        paper: { DEFAULT: '#F1EADB', dark: '#E5DAC4', white: '#FAF8F2' },
        kraft: '#CFA77F',
        ink: { DEFAULT: '#1F1B16', soft: '#5B5348', faint: '#8C8272' },
        tape: '#E9DAB3',
        blush: '#E5A4C3',
        moss: '#5F6B3A',
        stamp: '#B4472E',

        white: '#FAF8F2',
        zinc: {
          50: '#FAF8F2',
          100: '#F1EADB',
          200: '#E0D5BE',
          300: '#CBBE9F',
          400: '#8C8272',
          500: '#6E6557',
          600: '#5B5348',
          700: '#40392F',
          800: '#2B2823',
          900: '#1F1B16',
          950: '#15120E',
        },
        red: {
          50: '#F8E9E2',
          100: '#F1D5C9',
          200: '#E5B5A3',
          400: '#C9654C',
          500: '#B4472E',
          600: '#A03D27',
          700: '#873220',
        },
        green: {
          50: '#EEF0E2',
          100: '#DFE3CB',
          200: '#C5CCA6',
          300: '#A7B180',
          400: '#8A9660',
          500: '#6F7B47',
          600: '#5F6B3A',
          700: '#4C5630',
        },
        amber: {
          50: '#FAF1D8',
          200: '#EBD9A0',
          400: '#D2A640',
          500: '#B98A2B',
          600: '#9C7322',
          700: '#7E5C1B',
        },
        racing: {
          red: '#B4472E',
          dark: '#1F1B16',
          panel: '#2B2823',
        },
        volt: '#5F6B3A',
      },
      // Cut paper has near-square corners
      borderRadius: {
        md: '2px',
        lg: '3px',
        xl: '4px',
        '2xl': '6px',
      },
      // Soft, warm shadows as if scraps are resting on the page
      boxShadow: {
        sm: '1px 1px 2px rgba(60, 40, 20, 0.12)',
        DEFAULT: '1px 2px 4px rgba(60, 40, 20, 0.14)',
        md: '2px 3px 6px rgba(60, 40, 20, 0.16)',
        lg: '2px 4px 10px rgba(60, 40, 20, 0.18)',
        xl: '3px 5px 12px rgba(60, 40, 20, 0.2)',
        '2xl': '3px 6px 14px rgba(60, 40, 20, 0.22)',
      },
      // Typewriter face is wide, so keep label tracking modest
      letterSpacing: {
        wider: '0.04em',
        widest: '0.08em',
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
