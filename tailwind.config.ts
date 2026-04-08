import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        sidebar: 'var(--color-sidebar)',
        hover: 'var(--color-hover)',
        selected: 'var(--color-selected)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
        },
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        placeholder: 'var(--color-placeholder)',
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        md: ['18px', { lineHeight: '1.2' }],
        lg: ['24px', { lineHeight: '1.2' }],
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      transitionDuration: {
        fast: '150ms',
        open: '200ms',
      },
    },
  },
  plugins: [],
}

export default config
