/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './app/**/*.{ts,tsx,js,jsx}',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      animation: {
        'in': 'fade-in-0 zoom-in-95',
        'out': 'fade-out-0 zoom-out-95',
      },
      keyframes: {
        'fade-in-0': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out-0': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'zoom-in-95': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' }
        },
        'zoom-out-95': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.95)' }
        }
      },
      colors: {
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        background: "hsl(var(--background))",
        ring: "hsl(var(--ring))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        scrollbar: {
          track: "hsl(var(--scrollbar-track))",
          thumb: "hsl(var(--scrollbar-thumb))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "animate-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scrollbar": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-down": "fade-in-down 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out",
        "animate-in": "animate-in 0.2s ease-out",
        "scrollbar": "scrollbar 0.3s ease-in-out",
        'in': 'fade-in-0 zoom-in-95',
        'out': 'fade-out-0 zoom-out-95',
      },
      
      scrollbar: {
        DEFAULT: {
          width: '8px',
          track: {
            backgroundColor: 'hsl(var(--scrollbar-track))',
            borderRadius: '4px'
          },
          thumb: {
            backgroundColor: 'hsl(var(--scrollbar-thumb))',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'hsl(var(--scrollbar-thumb-hover))'
            }
          }
        }
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require('tailwind-scrollbar')({ nocompatible: true })
  ],
}