/**
 * Design System Tokens
 *
 * Centralized design tokens for the onecoach application.
 * These tokens define the core visual language and should be used
 * consistently across all components.
 */

export const designTokens = {
  /**
   * Color System
   * Following a structured approach with primary, secondary, neutral, and semantic colors
   */
  colors: {
    // Primary brand colors (Emerald/Teal gradient)
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main primary
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },

    // Secondary brand colors (Blue/Indigo)
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main secondary
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },

    // Neutral colors (Slate) - for text, backgrounds, borders
    neutral: {
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
      950: '#020617',
    },

    // Semantic colors
    semantic: {
      success: {
        light: '#d1fae5',
        DEFAULT: '#10b981',
        dark: '#047857',
      },
      warning: {
        light: '#fef3c7',
        DEFAULT: '#f59e0b',
        dark: '#d97706',
      },
      error: {
        light: '#fecaca',
        DEFAULT: '#ef4444',
        dark: '#dc2626',
      },
      info: {
        light: '#dbeafe',
        DEFAULT: '#3b82f6',
        dark: '#1d4ed8',
      },
    },

    // Background colors
    background: {
      light: '#ffffff',
      subtle: '#f8fafc',
      muted: '#f1f5f9',
      dark: '#0f172a',
    },

    // Text colors
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
      disabled: '#cbd5e1',
    },

    // Border colors
    border: {
      light: '#f1f5f9',
      DEFAULT: '#e2e8f0',
      strong: '#cbd5e1',
      inverse: '#334155',
    },
  },

  /**
   * Glassmorphism System
   * Premium glass effects for modern UI
   */
  glass: {
    blur: {
      xs: '4px',
      sm: '8px',
      DEFAULT: '12px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
    },
    background: {
      light: 'rgba(255, 255, 255, 0.7)',
      lightSubtle: 'rgba(255, 255, 255, 0.5)',
      lightStrong: 'rgba(255, 255, 255, 0.85)',
      dark: 'rgba(15, 23, 42, 0.7)',
      darkSubtle: 'rgba(15, 23, 42, 0.5)',
      darkStrong: 'rgba(15, 23, 42, 0.85)',
      primary: 'rgba(16, 185, 129, 0.1)',
      secondary: 'rgba(59, 130, 246, 0.1)',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(255, 255, 255, 0.1)',
      accent: 'rgba(16, 185, 129, 0.3)',
    },
    shadow: {
      light: '0 8px 32px rgba(0, 0, 0, 0.08)',
      dark: '0 8px 32px rgba(0, 0, 0, 0.32)',
      glow: '0 0 20px rgba(16, 185, 129, 0.2)',
      glowStrong: '0 0 40px rgba(16, 185, 129, 0.3)',
    },
  },

  /**
   * Chat-specific design tokens
   */
  chat: {
    message: {
      user: {
        bg: 'rgba(16, 185, 129, 0.1)',
        bgHover: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.2)',
        text: '#047857',
      },
      assistant: {
        bg: 'rgba(255, 255, 255, 0.6)',
        bgDark: 'rgba(30, 41, 59, 0.6)',
        border: 'rgba(226, 232, 240, 0.5)',
        borderDark: 'rgba(71, 85, 105, 0.3)',
      },
    },
    input: {
      bg: 'rgba(255, 255, 255, 0.8)',
      bgDark: 'rgba(30, 41, 59, 0.8)',
      border: 'rgba(226, 232, 240, 0.6)',
      borderDark: 'rgba(71, 85, 105, 0.4)',
      focusRing: 'rgba(16, 185, 129, 0.4)',
    },
    sidebar: {
      bg: 'rgba(248, 250, 252, 0.9)',
      bgDark: 'rgba(15, 23, 42, 0.9)',
      itemHover: 'rgba(16, 185, 129, 0.08)',
      itemActive: 'rgba(16, 185, 129, 0.12)',
    },
  },

  /**
   * Typography System
   */
  typography: {
    // Font families
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    },

    // Font sizes with corresponding line heights
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' }, // 12px
      sm: { size: '0.875rem', lineHeight: '1.25rem' }, // 14px
      base: { size: '1rem', lineHeight: '1.5rem' }, // 16px
      lg: { size: '1.125rem', lineHeight: '1.75rem' }, // 18px
      xl: { size: '1.25rem', lineHeight: '1.75rem' }, // 20px
      '2xl': { size: '1.5rem', lineHeight: '2rem' }, // 24px
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px
      '5xl': { size: '3rem', lineHeight: '1' }, // 48px
      '6xl': { size: '3.75rem', lineHeight: '1' }, // 60px
    },

    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  /**
   * Spacing System
   * Using a consistent 4px base unit scale
   */
  spacing: {
    0: '0px',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
  },

  /**
   * Border Radius System
   */
  borderRadius: {
    none: '0px',
    sm: '0.125rem', // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  /**
   * Shadow System
   */
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
    // Glass shadows
    glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
    glassDark: '0 8px 32px rgba(0, 0, 0, 0.32)',
    glow: '0 0 20px rgba(16, 185, 129, 0.2)',
    glowStrong: '0 0 40px rgba(16, 185, 129, 0.3)',
  },

  /**
   * Animation & Transition System
   */
  transitions: {
    duration: {
      instant: '75ms',
      fast: '150ms',
      DEFAULT: '200ms',
      medium: '300ms',
      slow: '500ms',
      slower: '700ms',
    },
    timing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  /**
   * Chat-specific animations
   */
  animations: {
    fadeIn: 'fadeIn 0.2s ease-out',
    fadeInUp: 'fadeInUp 0.3s ease-out',
    slideInRight: 'slideInRight 0.3s ease-out',
    slideInLeft: 'slideInLeft 0.3s ease-out',
    pulse: 'pulse 2s ease-in-out infinite',
    shimmer: 'shimmer 2s linear infinite',
    typing: 'typing 1.4s ease-in-out infinite',
    bounce: 'bounce 1s ease-in-out infinite',
  },

  /**
   * Breakpoints for responsive design
   */
  breakpoints: {
    xs: '375px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  /**
   * Z-index scale
   */
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    copilot: 9999,
  },

  /**
   * Opacity scale
   */
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },
} as const;

// Type exports for TypeScript autocomplete
export type DesignTokens = typeof designTokens;
export type ColorScale = keyof typeof designTokens.colors.primary;
export type SemanticColor = keyof typeof designTokens.colors.semantic;
export type GlassBlur = keyof typeof designTokens.glass.blur;
export type ChatMessageType = keyof typeof designTokens.chat.message;
