import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  theme: {
    extend: {
      fontFamily: {
        microgramma: ['Microgramma D Extended', 'sans-serif'],
  inter: ['Instrument Sans', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
