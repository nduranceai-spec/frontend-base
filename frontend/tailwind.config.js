/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // NDURANCE Brand Palette
        brand: {
          50:  '#e0fffe',
          100: '#b3fffd',
          200: '#66fffb',
          300: '#1afff9',
          400: '#00e5f5',
          500: '#00ccdc',
          600: '#00a3b3',
          700: '#007a88',
          800: '#00515d',
          900: '#002832',
        },
        cyan: {
          neon: '#00E5FF',
          glow: '#00BFFF',
        },
        purple: {
          deep:  '#1a0533',
          mid:   '#4a1a8a',
          brand: '#7c3aed',
          light: '#a855f7',
        },
        surface: {
          950: '#050810',
          900: '#0a0f1e',
          800: '#111827',
          700: '#1e293b',
          600: '#334155',
        },
        alert: {
          danger:  '#ef4444',
          warning: '#f59e0b',
          success: '#22c55e',
          info:    '#3b82f6',
        },
      },
      backgroundImage: {
        'grid-dark':
          'radial-gradient(ellipse at center, rgba(0,229,255,0.04) 0%, transparent 60%), ' +
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M0 0v40M40 0v40M0 0h40M0 40h40' stroke='%2300e5ff' stroke-width='0.15' opacity='0.15'/%3E%3C/svg%3E\")",
        'hero-gradient':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.35) 0%, transparent 60%), ' +
          'radial-gradient(ellipse 60% 40% at 90% 40%, rgba(0,229,255,0.2) 0%, transparent 50%), ' +
          'linear-gradient(180deg, #050810 0%, #0a0f1e 100%)',
        'card-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'cyan-glow':
          'radial-gradient(circle at center, rgba(0,229,255,0.15) 0%, transparent 70%)',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'glass':     '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':  '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'cyan-glow': '0 0 30px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)',
        'cyan-sm':   '0 0 12px rgba(0,229,255,0.4)',
        'purple-glow': '0 0 30px rgba(124,58,237,0.3)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'scan-line':     'scanLine 2s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'spin-slow':     'spin 8s linear infinite',
        'radar':         'radar 3s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,229,255,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(0,229,255,0.6), 0 0 60px rgba(0,229,255,0.2)' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        radar: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
