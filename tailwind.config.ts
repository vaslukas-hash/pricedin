import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LinkedIn + Stripe aesthetic - neutral grays with purple accents
        brand: {
          50: '#f7f9fc',   // Very light blue-gray (page backgrounds)
          100: '#e3e8ef',  // Light blue-gray (subtle borders)
          200: '#c1cad8',  // Lighter gray (borders, disabled)
          300: '#9ba5b7',  // Medium gray (secondary text)
          400: '#6f7b8f',  // Gray (tertiary text)
          500: '#4a5568',  // Slate (body text)
          600: '#3d4656',  // Dark slate
          700: '#2d3748',  // Darker slate
          800: '#1a202c',  // Very dark (headings)
          900: '#0f1419',  // Almost black (primary headings)
        },
        accent: {
          50: '#f0f4ff',   // Very light blue
          100: '#e0e7ff',  // Light blue
          200: '#c7d2fe',  // Lighter purple-blue
          300: '#a5b4fc',  // Medium purple-blue
          400: '#818cf8',  // Bright indigo
          500: '#635bff',  // Stripe purple (primary CTA)
          600: '#5145e5',  // Darker purple (hover)
          700: '#4339ca',  // Deep purple (active)
          800: '#3730a3',  // Very deep purple
          900: '#312e81',  // Darkest purple
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config
