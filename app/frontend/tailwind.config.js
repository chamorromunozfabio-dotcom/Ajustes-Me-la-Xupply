/** @type {import('tailwindcss').Config} */

// La paleta `brand` sigue los colores publicados por el CMS (bloque ui.shell).
// Si todavía no se publicaron, se usan los valores originales de Xupply.
const channelColor = (variable, fallback) =>
  `rgb(var(${variable}, ${fallback}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: channelColor('--shell-primary-channels', '2 132 199'),
          dark: channelColor('--shell-primary-dark-channels', '3 105 161'),
          light: channelColor('--shell-primary-light-channels', '56 189 248'),
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: channelColor('--shell-primary-channels', '2 132 199'),
          600: channelColor('--shell-primary-dark-channels', '3 105 161'),
          700: '#075985',
        },
      },
    },
  },
  plugins: [],
};
