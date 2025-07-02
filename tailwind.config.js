/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#2B7A0B',
          600: '#1e5e0a',
          700: '#164208'
        },
        secondary: {
          100: '#f0fdf4',
          500: '#7DCE13',
          600: '#65b00f'
        },
        accent: {
          500: '#F4A442',
          600: '#e18935'
        },
        surface: '#F5F5DC',
        background: '#FAFAF5',
        success: '#5CB85C',
        warning: '#F0AD4E',
        error: '#D9534F',
        info: '#5BC0DE'
      },
fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        card: '0 4px 8px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 6px 16px rgba(0, 0, 0, 0.15)'
      },
      zIndex: {
        modal: '9999'
      }
    }
  },
  plugins: []
}