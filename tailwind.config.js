export default {
  content: [
    './index.html',
    './UI/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // RazorRecon Institutional FinTech Palette
        canvas: '#080D18',
        surface: {
          DEFAULT: '#0F1726',
          sub: '#151F31',
          elevated: '#1A263A',
        },
        line: '#263247',
        hairline: '#151F31',
        ink: {
          950: '#040711',
          900: '#080D18', // Canvas
          850: '#0F1726', // Primary surface
          800: '#151F31', // Secondary surface
          700: '#1A263A', // Elevated surface
          600: '#263247', // Border line
          500: '#64748B', // Muted text
          400: '#94A3B8', // Secondary text
          300: '#CBD5E1', // Sub-body text
          200: '#E2E8F0', // Body text
          100: '#F1F5F9', // High contrast text
          50: '#F4F7FB',  // Primary white text
        },
        cyan: {
          DEFAULT: '#22D3EE',
          400: '#22D3EE',
          soft: 'rgba(34, 211, 238, 0.12)',
          line: 'rgba(34, 211, 238, 0.3)',
        },
        indigo: {
          DEFAULT: '#818CF8',
          400: '#818CF8',
          soft: 'rgba(129, 140, 248, 0.12)',
          line: 'rgba(129, 140, 248, 0.3)',
        },
        brand: {
          DEFAULT: '#22D3EE',
          600: '#06B6D4',
          soft: 'rgba(34, 211, 238, 0.12)',
          line: 'rgba(34, 211, 238, 0.3)',
        },
        accent: {
          DEFAULT: '#22D3EE',
          600: '#06B6D4',
          soft: 'rgba(34, 211, 238, 0.12)',
          line: 'rgba(34, 211, 238, 0.3)',
        },
        pos: { DEFAULT: '#22C55E', soft: 'rgba(34, 197, 94, 0.12)', line: 'rgba(34, 197, 94, 0.3)' },
        warn: { DEFAULT: '#F59E0B', soft: 'rgba(245, 158, 11, 0.12)', line: 'rgba(245, 158, 11, 0.3)' },
        crit: { DEFAULT: '#EF4444', soft: 'rgba(239, 68, 68, 0.12)', line: 'rgba(239, 68, 68, 0.3)' },
        ai: { DEFAULT: '#818CF8', soft: 'rgba(129, 140, 248, 0.12)', line: 'rgba(129, 140, 248, 0.3)' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        panel: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        pop: '0 16px 24px -4px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(38, 50, 71, 0.8)',
      },
      letterSpacing: {
        label: '0.05em',
      },
    },
  },
  plugins: [],
};
