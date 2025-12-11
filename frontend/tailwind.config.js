import defaultTheme from 'tailwindcss/defaultTheme';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read branding config
const brandingConfigPath = path.resolve(__dirname, '../branding.config.json');
let brandingConfig = {};
try {
  brandingConfig = JSON.parse(fs.readFileSync(brandingConfigPath, 'utf-8'));
} catch (e) {
  console.error("Could not load branding config:", e);
}

const colors = brandingConfig.branding?.colors || {
  primary: '#ff0000',
  secondary: '#000000',
  accent: '#8a8a8a'
};

const borderRadius = brandingConfig.branding?.borderRadius || {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  pill: '9999px'
};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent,
      },
      borderRadius: {
        ...borderRadius
      },
      fontFamily: {
        microgramma: ['Microgramma D Extended', 'sans-serif'],
        inter: ['Instrument Sans', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": colors.primary,
          "secondary": colors.secondary,
          "accent": colors.accent,
          "neutral": "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};
