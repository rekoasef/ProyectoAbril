/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beige-light': '#FAF0E6',
        'brown-light': '#D2B48C',
        'sepia-gray-soft': '#BDB7AB',
        'white-off': '#FFFAF0',
        'text-primary': '#424242',
        'text-secondary': '#757575',
        'accent-script': '#A88B79',
      },
      fontFamily: {
        script: ['Great Vibes', 'cursive'],
        sans: ['Montserrat', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.08)',
        'soft-md': '0 8px 16px rgba(0,0,0,0.08)',
      },
      // --- AÑADE ESTO ---
      animation: {
        modalShow: 'modalShow 0.3s ease-out forwards',
      },
      keyframes: {
        modalShow: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        }
      }
      // --- FIN DE LO AÑADIDO ---
    },
  },
  plugins: [],
}