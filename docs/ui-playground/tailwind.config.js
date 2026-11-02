/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./**/*.{html,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        txt: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        semantic: {
          info: {
            DEFAULT: 'var(--accent-info)',
            bg: 'var(--accent-info-bg)',
            border: 'var(--accent-info-border)',
          },
          success: {
            DEFAULT: 'var(--accent-success)',
            bg: 'var(--accent-success-bg)',
            border: 'var(--accent-success-border)',
          },
          warning: {
            DEFAULT: 'var(--accent-warning)',
            bg: 'var(--accent-warning-bg)',
            border: 'var(--accent-warning-border)',
          },
          danger: {
            DEFAULT: 'var(--accent-danger)',
            bg: 'var(--accent-danger-bg)',
            border: 'var(--accent-danger-border)',
          },
        },
        line: {
          divider: 'var(--border-divider)',
          DEFAULT: 'var(--border-default)',
          highlight: 'var(--border-top-highlight)',
          hover: 'var(--border-hover)',
          active: 'var(--border-active)',
        },
      },
      fontFamily: {
        sans: ['Inter', '"SF Pro Display"', '"PingFang SC"', '"Noto Sans CJK SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'page-title': ['var(--text-page-title-size)', { lineHeight: 'var(--text-page-title-lh)', fontWeight: '600' }],
        'section-title': ['var(--text-section-title-size)', { lineHeight: 'var(--text-section-title-lh)', fontWeight: '600' }],
        'body': ['var(--text-body-size)', { lineHeight: 'var(--text-body-lh)', fontWeight: '400' }],
        'btn': ['var(--text-btn-size)', { lineHeight: 'var(--text-btn-lh)', fontWeight: '500' }],
        'meta': ['var(--text-meta-size)', { lineHeight: 'var(--text-meta-lh)', fontWeight: '400' }],
        'badge': ['var(--text-badge-size)', { lineHeight: 'var(--text-badge-lh)', fontWeight: '500' }],
      },
      spacing: {
        xs: 'var(--space-xs)',   /* 4px */
        sm: 'var(--space-sm)',   /* 8px */
        md: 'var(--space-md)',   /* 12px */
        lg: 'var(--space-lg)',   /* 16px */
        xl: 'var(--space-xl)',   /* 24px */
        '2xl': 'var(--space-2xl)', /* 32px */
        touch: 'var(--touch-target-min)', /* 44px */
      },
      borderRadius: {
        xs: 'var(--prim-radius-xs)',
        sm: 'var(--prim-radius-sm)',
        md: 'var(--prim-radius-md)',
        lg: 'var(--prim-radius-lg)',
        xl: 'var(--prim-radius-xl)',
        '2xl': 'var(--prim-radius-2xl)',
        full: 'var(--prim-radius-full)',
        'dock-outer': 'var(--comp-dock-radius-outer)',
        'dock-inner': 'var(--comp-dock-radius-inner)',
      },
      transitionTimingFunction: {
        press: 'var(--ease-press)',
        panel: 'var(--ease-panel)',
      },
      transitionDuration: {
        press: 'var(--dur-press)',
        hover: 'var(--dur-hover)',
        panel: 'var(--dur-panel)',
        modal: 'var(--dur-modal)',
      },
    },
  },
  plugins: [],
};
