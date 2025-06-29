// tailwind.config.js - Learning Playground Login Theme
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx,vue}",
    "./pages/**/*.{html,js,jsx,ts,tsx,vue}",
    "./components/**/*.{html,js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors from the login screen
        primary: {
          50: '#e6f9ff',
          100: '#ccf3ff',
          200: '#99e7ff',
          300: '#66dbff',
          400: '#33cfff',
          500: '#00c3ff', // Main brand blue
          600: '#009ccc',
          700: '#007599',
          800: '#004e66',
          900: '#002733',
        },
        
        // Cyan/turquoise accent from the design
        cyan: {
          50: '#e6ffff',
          100: '#ccffff',
          200: '#99ffff',
          300: '#66ffff',
          400: '#33ffff',
          500: '#00ffff', // Bright cyan accent
          600: '#00cccc',
          700: '#009999',
          800: '#006666',
          900: '#003333',
        },
        
        // Illustration accent colors
        accent: {
          purple: '#9333ea',
          magenta: '#d946ef',
          pink: '#ec4899',
          green: '#22c55e',
          yellow: '#eab308',
          orange: '#f97316',
          red: '#ef4444',
        },
        
        // Form and UI colors
        form: {
          bg: '#f8fafc',
          border: '#e2e8f0',
          'border-focus': '#00c3ff',
          text: '#1e293b',
          placeholder: '#64748b',
          error: '#ef4444',
        },
        
        // Neutral palette
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      
      // Custom gradient backgrounds
      backgroundImage: {
        'login-gradient': 'linear-gradient(135deg, #00c3ff 0%, #00ffff 25%, #0099cc 50%, #007399 75%, #004e66 100%)',
        'hero-blob': 'radial-gradient(ellipse at center, #00c3ff 0%, #0099cc 50%, #007399 100%)',
        'form-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        'button-primary': 'linear-gradient(135deg, #00c3ff 0%, #0099cc 100%)',
        'button-secondary': 'linear-gradient(135deg, #00ffff 0%, #00cccc 100%)',
        'illustration-purple': 'linear-gradient(135deg, #9333ea 0%, #d946ef 100%)',
        'illustration-green': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      },
      
      // Custom shadows with brand colors
      boxShadow: {
        'form': '0 4px 12px -2px rgba(0, 195, 255, 0.08), 0 2px 6px -1px rgba(0, 195, 255, 0.04)',
        'form-focus': '0 0 0 3px rgba(0, 195, 255, 0.1), 0 4px 12px -2px rgba(0, 195, 255, 0.15)',
        'button': '0 4px 14px 0 rgba(0, 195, 255, 0.25)',
        'button-hover': '0 6px 20px 0 rgba(0, 195, 255, 0.35)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px -10px rgba(0, 0, 0, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 30px rgba(0, 195, 255, 0.3)',
        'glow-cyan': '0 0 30px rgba(0, 255, 255, 0.3)',
      },
      
      // Typography
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'display': ['Poppins', 'Inter', 'sans-serif'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      
      // Spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(-5px) rotate(-1deg)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 20px rgba(0, 195, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 195, 255, 0.6)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '25%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(-10px)' },
          '75%': { transform: 'translateY(-5px)' },
        },
      },
      
      // Backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
      },
    },
  },
  plugins: [
    function({ addUtilities, addComponents, theme }) {
      // Custom utilities
      const newUtilities = {
        '.text-gradient-primary': {
          'background': 'linear-gradient(135deg, #00c3ff 0%, #0099cc 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-cyan': {
          'background': 'linear-gradient(135deg, #00ffff 0%, #00cccc 100%)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-card': {
          'background': 'rgba(255, 255, 255, 0.85)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.3)',
        },
      }
      
      // Custom components
      const newComponents = {
        '.form-input': {
          'width': '100%',
          'padding': `${theme('spacing.3')} ${theme('spacing.4')}`,
          'border': `1px solid ${theme('colors.form.border')}`,
          'border-radius': theme('borderRadius.lg'),
          'background-color': theme('colors.form.bg'),
          'color': theme('colors.form.text'),
          'font-size': theme('fontSize.base[0]'),
          'line-height': theme('fontSize.base[1].lineHeight'),
          'transition': 'all 0.2s ease',
          '&::placeholder': {
            'color': theme('colors.form.placeholder'),
          },
          '&:focus': {
            'outline': 'none',
            'border-color': theme('colors.form["border-focus"]'),
            'box-shadow': theme('boxShadow["form-focus"]'),
          },
        },
        '.btn-primary': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'width': '100%',
          'padding': `${theme('spacing.3')} ${theme('spacing.6')}`,
          'background': theme('backgroundImage["button-primary"]'),
          'color': 'white',
          'font-weight': theme('fontWeight.semibold'),
          'font-size': theme('fontSize.base[0]'),
          'border-radius': theme('borderRadius.lg'),
          'border': 'none',
          'cursor': 'pointer',
          'transition': 'all 0.3s ease',
          'box-shadow': theme('boxShadow.button'),
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': theme('boxShadow["button-hover"]'),
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
        },
        '.btn-secondary': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'width': '100%',
          'padding': `${theme('spacing.3')} ${theme('spacing.6')}`,
          'background': 'transparent',
          'color': theme('colors.primary.500'),
          'font-weight': theme('fontWeight.semibold'),
          'font-size': theme('fontSize.base[0]'),
          'border-radius': theme('borderRadius.lg'),
          'border': `2px solid ${theme('colors.primary.500')}`,
          'cursor': 'pointer',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'background': theme('colors.primary.500'),
            'color': 'white',
            'transform': 'translateY(-2px)',
            'box-shadow': theme('boxShadow.button'),
          },
        },
        '.login-card': {
          'background': theme('backgroundImage["form-gradient"]'),
          'border-radius': theme('borderRadius["2xl"]'),
          'padding': theme('spacing.8'),
          'box-shadow': theme('boxShadow.card'),
          'border': '1px solid rgba(0, 195, 255, 0.1)',
          'max-width': '400px',
          'width': '100%',
        },
        '.floating-shape': {
          'position': 'absolute',
          'border-radius': '50%',
          'background': theme('backgroundImage["hero-blob"]'),
          'opacity': '0.6',
          'animation': `${theme('animation.blob')}`,
          'filter': 'blur(40px)',
        },
      }
      
      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
}