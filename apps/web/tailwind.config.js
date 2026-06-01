/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── DESIGN.md Color System ───────────────────────────────────────────
      colors: {
        paper: {
          DEFAULT: '#F7F3EB',
          secondary: '#F2EBDD',
        },
        navy: {
          DEFAULT: '#17324D',
        },
        accent: {
          DEFAULT: '#C4623B',
        },
        success: {
          DEFAULT: '#5D8A6A',
        },
        border: {
          DEFAULT: '#D8D0C0',
        },
        warning: {
          DEFAULT: '#C98A2E',
        },
        error: {
          DEFAULT: '#B85450',
        },
      },

      // ─── DESIGN.md Typography ─────────────────────────────────────────────
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', '"Source Code Pro"', 'monospace'],
      },

      fontSize: {
        'page-title': ['3rem', { lineHeight: '1.15', fontWeight: '700' }],
        'section-title': ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
        'subsection-title': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        body: ['1.125rem', { lineHeight: '1.8' }],
        metadata: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.08em' }],
      },

      // ─── DESIGN.md Spacing ────────────────────────────────────────────────
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },

      // ─── DESIGN.md Layout ─────────────────────────────────────────────────
      maxWidth: {
        content: '700px',
        'main-content': '1000px',
      },

      width: {
        sidebar: '320px',
      },

      height: {
        topnav: '72px',
      },

      // ─── DESIGN.md Cards ──────────────────────────────────────────────────
      borderRadius: {
        card: '16px',
      },

      boxShadow: {
        card: '0 1px 4px rgba(23, 50, 77, 0.06)',
      },

      // ─── DESIGN.md Background Grid ────────────────────────────────────────
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
};
