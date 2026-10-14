/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Fondo y superficies — la arquitectura en sombra.
        void: '#0a0a0a',
        coal: '#161616',
        slate: '#222222',
        ash: '#2a2a2a',
        // Texto — blanco hueso, no blanco puro. Menos clinical, más papel.
        bone: '#ece8e1',
        smoke: '#8a857d',
        ember: '#d9a15b',
        emberDim: '#a87c42',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wide2: '0.2em',
        wide3: '0.35em',
      },
      transitionTimingFunction: {
        cine: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        grain: '60',
        vignette: '50',
        cursor: '100',
        overlay: '90',
        preloader: '95',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
    },
  },
  plugins: [],
};