import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Digital Gallery Tokens
        void:       '#6B1428',
        'diox-rich':'#6B1428',
        // Zinnia flower palette
        'zinnia-deep':  '#7A1835',
        'zinnia-mid':   '#D4487A',
        'zinnia-bloom': '#F07898',
        'zinnia-tip':     '#FFADC6',
        'zinnia-lime':    '#829942',
        'zinnia-apricot': '#C28E70',
        // Legacy tokens → zinnia equivalents
        magenta:    '#F07898',   // was #E40078 — now zinnia-bloom
        vermillion: '#D4487A',   // was rgba(155,27,21,0.85) — now zinnia-mid
        benzi:      '#7A1835',   // was #962814 — now zinnia-deep
        parchment:  '#FDF5E6',   // UNCHANGED
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'serif'],
        sans:  ['var(--font-inter)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'lux-ease': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      transitionDuration: {
        '800': '800ms',
      }
    },
  },
  plugins: [],
};
export default config;
