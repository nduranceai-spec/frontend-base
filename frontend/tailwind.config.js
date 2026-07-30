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
        // Spider Track AI — Core Palette
        spider: {
          void:      '#03010A',
          black:     '#0A0008',
          graphite:  '#1A1020',
          deep:      '#120D18',
          crimson:   '#8B0000',
          scarlet:   '#DC143C',
          red:       '#FF2244',
          glow:      '#FF4466',
          electric:  '#4FC3F7',
          'electric-dim': '#1A6F8A',
          white:     '#F0EEF5',
          silver:    '#B8B4C0',
          dim:       '#6B6478',
        },
        // Legacy surface tokens (kept for existing components)
        surface: {
          950: '#03010A',
          900: '#0A0008',
          800: '#1A1020',
          700: '#2A2030',
          600: '#3A3045',
        },
        alert: {
          danger:  '#DC143C',
          warning: '#f59e0b',
          success: '#22c55e',
          info:    '#4FC3F7',
        },
      },
      backgroundImage: {
        'spider-radial':
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,20,60,0.18) 0%, rgba(139,0,0,0.08) 35%, transparent 65%), ' +
          'radial-gradient(ellipse 50% 40% at 85% 50%, rgba(79,195,247,0.06) 0%, transparent 50%), ' +
          'linear-gradient(180deg, #03010A 0%, #0A0008 50%, #03010A 100%)',
        'spider-card':
          'linear-gradient(135deg, rgba(220,20,60,0.08) 0%, rgba(139,0,0,0.04) 50%, rgba(255,255,255,0.02) 100%)',
        'spider-nav':
          'linear-gradient(180deg, rgba(10,0,8,0.98) 0%, rgba(26,16,32,0.95) 100%)',
        'crimson-glow':
          'radial-gradient(circle at center, rgba(220,20,60,0.2) 0%, transparent 70%)',
        'hero-gradient':
          'radial-gradient(ellipse 100% 80% at 50% -5%, rgba(220,20,60,0.25) 0%, rgba(139,0,0,0.1) 30%, transparent 60%)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Orbitron', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'spider':        '0 0 20px rgba(220,20,60,0.3), 0 0 60px rgba(139,0,0,0.15), inset 0 1px 0 rgba(220,20,60,0.1)',
        'spider-lg':     '0 0 40px rgba(220,20,60,0.4), 0 0 80px rgba(139,0,0,0.2)',
        'spider-sm':     '0 0 10px rgba(220,20,60,0.4)',
        'electric':      '0 0 20px rgba(79,195,247,0.3), 0 0 40px rgba(79,195,247,0.1)',
        'glass':         '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-lg':      '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        'camera-border': '0 0 0 1px rgba(220,20,60,0.3), 0 0 30px rgba(220,20,60,0.15), inset 0 0 30px rgba(139,0,0,0.05)',
        'card':          '0 4px 24px rgba(0,0,0,0.5)',
      },
      animation: {
        // Web animations
        'web-pulse':    'webPulse 3s ease-in-out infinite',
        'web-expand':   'webExpand 0.4s ease-out forwards',
        'thread-draw':  'threadDraw 1.5s ease-out forwards',
        // Particle / environment
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 10s ease-in-out infinite',
        'particle':     'particle 8s linear infinite',
        // UI feedback
        'scan-line':    'scanLine 2.5s linear infinite',
        'scan-fast':    'scanLine 1.2s linear infinite',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
        'crimson-pulse':'crimsonPulse 2s ease-in-out infinite',
        // Motion
        'slide-up':     'slideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-left':'slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'zoom-in':      'zoomIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'spin-slow':    'spin 12s linear infinite',
        'spin-medium':  'spin 6s linear infinite',
        'radar':        'radar 3s linear infinite',
        'blink':        'blink 1.5s step-end infinite',
        'ring-expand':  'ringExpand 0.6s ease-out forwards',
        'body-scan':    'bodyScan 3s ease-in-out infinite',
      },
      keyframes: {
        webPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.02)' },
        },
        webExpand: {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        threadDraw: {
          from: { strokeDashoffset: '1000' },
          to:   { strokeDashoffset: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':      { transform: 'translateY(-15px) rotate(2deg)' },
          '66%':      { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        particle: {
          '0%':   { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { transform: 'translateY(-100px) translateX(50px)', opacity: '0' },
        },
        scanLine: {
          '0%':   { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(105%)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(220,20,60,0.3)' },
          '50%':      { boxShadow: '0 0 30px rgba(220,20,60,0.7), 0 0 60px rgba(139,0,0,0.3)' },
        },
        crimsonPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(220,20,60,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(220,20,60,0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        zoomIn: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        radar: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        ringExpand: {
          from: { transform: 'scale(0.5)', opacity: '1' },
          to:   { transform: 'scale(2)',   opacity: '0' },
        },
        bodyScan: {
          '0%, 100%': { opacity: '0.3' },
          '50%':      { opacity: '0.9' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '40px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
