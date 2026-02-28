/**
 * OneCoach Design System — Unified Tokens
 *
 * Glass Morphism Premium — Indigo-Violet Gradient
 * Dark-first design with light mode support
 *
 * Single source of truth for all visual tokens.
 * Replaces tokens.ts + tokens-complete.ts.
 */

export const designTokens = {
  /**
   * Color System — Indigo-Violet Premium
   *
   * Primary: Indigo (deep tech, trust, precision)
   * Secondary: Violet (energy, creativity, premium)
   * Accent: Cyan (contrast pop, data viz, CTAs)
   * Neutral: Zinc (true neutral, modern, clean)
   */
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },

    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },

    accent: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },

    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },

    semantic: {
      success: {
        light: { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
        dark: { bg: 'rgba(16, 185, 129, 0.12)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.25)' },
        DEFAULT: '#10b981',
      },
      warning: {
        light: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' },
        dark: { bg: 'rgba(245, 158, 11, 0.12)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' },
        DEFAULT: '#f59e0b',
      },
      error: {
        light: { bg: '#fecaca', text: '#dc2626', border: '#f87171' },
        dark: { bg: 'rgba(239, 68, 68, 0.12)', text: '#f87171', border: 'rgba(239, 68, 68, 0.25)' },
        DEFAULT: '#ef4444',
      },
      info: {
        light: { bg: '#e0e7ff', text: '#4338ca', border: '#818cf8' },
        dark: { bg: 'rgba(99, 102, 241, 0.12)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.25)' },
        DEFAULT: '#6366f1',
      },
    },

    background: {
      light: {
        base: '#ffffff',
        elevated: '#fafafa',
        subtle: '#f4f4f5',
        muted: '#e4e4e7',
        overlay: 'rgba(0, 0, 0, 0.4)',
      },
      dark: {
        base: '#09090b',
        elevated: '#18181b',
        subtle: '#27272a',
        muted: '#3f3f46',
        overlay: 'rgba(0, 0, 0, 0.7)',
      },
    },

    text: {
      light: {
        primary: '#09090b',
        secondary: '#3f3f46',
        tertiary: '#71717a',
        inverse: '#fafafa',
        disabled: '#a1a1aa',
      },
      dark: {
        primary: '#fafafa',
        secondary: '#d4d4d8',
        tertiary: '#a1a1aa',
        inverse: '#09090b',
        disabled: '#52525b',
      },
    },

    border: {
      light: {
        subtle: '#f4f4f5',
        DEFAULT: '#e4e4e7',
        strong: '#d4d4d8',
      },
      dark: {
        subtle: '#27272a',
        DEFAULT: '#3f3f46',
        strong: '#52525b',
      },
    },
  },

  /**
   * Glassmorphism System — Vision Pro-inspired
   *
   * Layered depth with blur, opacity, and luminance
   */
  glass: {
    blur: {
      xs: '4px',
      sm: '8px',
      DEFAULT: '12px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
    },

    background: {
      light: {
        subtle: 'rgba(255, 255, 255, 0.5)',
        DEFAULT: 'rgba(255, 255, 255, 0.7)',
        strong: 'rgba(255, 255, 255, 0.85)',
        solid: 'rgba(255, 255, 255, 0.95)',
      },
      dark: {
        subtle: 'rgba(9, 9, 11, 0.5)',
        DEFAULT: 'rgba(9, 9, 11, 0.7)',
        strong: 'rgba(9, 9, 11, 0.85)',
        solid: 'rgba(9, 9, 11, 0.95)',
      },
      tint: {
        primary: 'rgba(99, 102, 241, 0.08)',
        secondary: 'rgba(139, 92, 246, 0.08)',
        accent: 'rgba(6, 182, 212, 0.08)',
      },
    },

    border: {
      light: {
        subtle: 'rgba(0, 0, 0, 0.04)',
        DEFAULT: 'rgba(0, 0, 0, 0.06)',
        strong: 'rgba(0, 0, 0, 0.1)',
      },
      dark: {
        subtle: 'rgba(255, 255, 255, 0.04)',
        DEFAULT: 'rgba(255, 255, 255, 0.08)',
        strong: 'rgba(255, 255, 255, 0.12)',
      },
      accent: {
        primary: 'rgba(99, 102, 241, 0.25)',
        secondary: 'rgba(139, 92, 246, 0.25)',
        cyan: 'rgba(6, 182, 212, 0.25)',
      },
    },

    shadow: {
      light: {
        subtle: '0 4px 16px rgba(0, 0, 0, 0.04)',
        DEFAULT: '0 8px 32px rgba(0, 0, 0, 0.08)',
        strong: '0 16px 48px rgba(0, 0, 0, 0.12)',
      },
      dark: {
        subtle: '0 4px 16px rgba(0, 0, 0, 0.2)',
        DEFAULT: '0 8px 32px rgba(0, 0, 0, 0.32)',
        strong: '0 16px 48px rgba(0, 0, 0, 0.48)',
      },
      glow: {
        primary: '0 0 24px rgba(99, 102, 241, 0.25)',
        primaryStrong: '0 0 48px rgba(99, 102, 241, 0.35)',
        secondary: '0 0 24px rgba(139, 92, 246, 0.25)',
        accent: '0 0 24px rgba(6, 182, 212, 0.25)',
        gradient: '0 0 32px rgba(99, 102, 241, 0.2), 0 0 64px rgba(139, 92, 246, 0.15)',
      },
    },
  },

  /**
   * Gradient System — Premium Indigo-Violet
   */
  gradients: {
    primary: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    primarySubtle: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
    secondary: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    accent: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    mesh: 'radial-gradient(at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 70%)',
    surface: {
      light: 'linear-gradient(180deg, #fafafa 0%, #f4f4f5 100%)',
      dark: 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
    },
    hero: 'linear-gradient(135deg, #4f46e5, #7c3aed, #06b6d4)',
    text: 'linear-gradient(135deg, #818cf8, #a78bfa)',
    textVibrant: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
  },

  /**
   * Chat-specific design tokens
   */
  chat: {
    message: {
      user: {
        bg: 'rgba(99, 102, 241, 0.1)',
        bgHover: 'rgba(99, 102, 241, 0.15)',
        border: 'rgba(99, 102, 241, 0.2)',
        text: '#4f46e5',
      },
      assistant: {
        bg: 'rgba(255, 255, 255, 0.6)',
        bgDark: 'rgba(24, 24, 27, 0.6)',
        border: 'rgba(228, 228, 231, 0.5)',
        borderDark: 'rgba(63, 63, 70, 0.3)',
      },
    },
    input: {
      bg: 'rgba(255, 255, 255, 0.8)',
      bgDark: 'rgba(24, 24, 27, 0.8)',
      border: 'rgba(228, 228, 231, 0.6)',
      borderDark: 'rgba(63, 63, 70, 0.4)',
      focusRing: 'rgba(99, 102, 241, 0.4)',
    },
    sidebar: {
      bg: 'rgba(250, 250, 250, 0.9)',
      bgDark: 'rgba(9, 9, 11, 0.9)',
      itemHover: 'rgba(99, 102, 241, 0.08)',
      itemActive: 'rgba(99, 102, 241, 0.12)',
    },
  },

  /**
   * Domain Tokens — Feature-specific accents
   */
  domain: {
    card: {
      bg: 'rgba(24, 24, 27, 0.8)',
      bgSubtle: 'rgba(24, 24, 27, 0.5)',
      border: 'rgba(255, 255, 255, 0.05)',
      borderHover: 'rgba(255, 255, 255, 0.1)',
      borderActive: 'rgba(255, 255, 255, 0.15)',
    },

    accent: {
      workout: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        bg: 'rgba(99, 102, 241, 0.1)',
        border: 'rgba(99, 102, 241, 0.2)',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      },
      nutrition: {
        primary: '#10b981',
        secondary: '#14b8a6',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
        gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
      },
      cardio: {
        primary: '#06b6d4',
        secondary: '#22d3ee',
        bg: 'rgba(6, 182, 212, 0.1)',
        border: 'rgba(6, 182, 212, 0.2)',
        gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
      },
      circuit: {
        primary: '#f97316',
        secondary: '#f43f5e',
        bg: 'rgba(249, 115, 22, 0.1)',
        border: 'rgba(249, 115, 22, 0.2)',
        gradient: 'linear-gradient(135deg, #f97316, #f43f5e)',
      },
      superset: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        bg: 'rgba(139, 92, 246, 0.1)',
        border: 'rgba(139, 92, 246, 0.2)',
        gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      },
      warmup: {
        primary: '#f59e0b',
        secondary: '#f97316',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
      },
    },

    states: {
      active: { bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
      complete: { bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' },
      rest: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
      error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' },
    },

    input: {
      bg: 'rgba(39, 39, 42, 0.5)',
      border: 'rgba(255, 255, 255, 0.05)',
      focusBorder: 'rgba(99, 102, 241, 0.5)',
      placeholder: '#71717a',
    },
  },

  /**
   * Typography System — Inter + Geist Mono
   */
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['Geist Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      display: ['Inter', 'system-ui', 'sans-serif'],
    },

    fontSize: {
      '2xs': { size: '0.625rem', lineHeight: '0.875rem' },
      xs: { size: '0.75rem', lineHeight: '1rem' },
      sm: { size: '0.875rem', lineHeight: '1.25rem' },
      base: { size: '1rem', lineHeight: '1.5rem' },
      lg: { size: '1.125rem', lineHeight: '1.75rem' },
      xl: { size: '1.25rem', lineHeight: '1.75rem' },
      '2xl': { size: '1.5rem', lineHeight: '2rem' },
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
      '5xl': { size: '3rem', lineHeight: '1.15' },
      '6xl': { size: '3.75rem', lineHeight: '1.1' },
      '7xl': { size: '4.5rem', lineHeight: '1.05' },
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

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
   * Spacing System — 4px base unit
   */
  spacing: {
    0: '0px',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },

  /**
   * Border Radius System — Rounded premium feel
   */
  borderRadius: {
    none: '0px',
    xs: '0.125rem',
    sm: '0.25rem',
    DEFAULT: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    '4xl': '2rem',
    full: '9999px',
  },

  /**
   * Shadow System — Light & Dark
   */
  shadows: {
    light: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      md: '0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
      none: 'none',
    },
    dark: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
      DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      md: '0 4px 8px -2px rgb(0 0 0 / 0.45), 0 2px 4px -2px rgb(0 0 0 / 0.35)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.7)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
      none: 'none',
    },
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
      slowest: '1000ms',
    },
    timing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },

  /**
   * Animation Presets
   */
  animations: {
    fadeIn: 'fadeIn 0.2s ease-out',
    fadeInUp: 'fadeInUp 0.3s ease-out',
    fadeInDown: 'fadeInDown 0.3s ease-out',
    slideInRight: 'slideInRight 0.3s ease-out',
    slideInLeft: 'slideInLeft 0.3s ease-out',
    scaleIn: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
    pulse: 'pulse 2s ease-in-out infinite',
    shimmer: 'shimmer 2s linear infinite',
    glow: 'glow 2s ease-in-out infinite',
    float: 'float 6s ease-in-out infinite',
    typing: 'typing 1.4s ease-in-out infinite',
  },

  /**
   * Breakpoints — Mobile-first
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
   * Z-index Scale
   */
  zIndex: {
    base: 0,
    raised: 1,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
    copilot: 9999,
  },

  /**
   * Touch Targets — WCAG / Apple HIG compliant
   */
  touchTarget: {
    min: '2.75rem',
    sm: '2.75rem',
    md: '3rem',
    lg: '3.5rem',
  },

  /**
   * Opacity Scale
   */
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    15: '0.15',
    20: '0.2',
    25: '0.25',
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

// Type exports
export type DesignTokens = typeof designTokens;
export type ColorMode = 'light' | 'dark';
export type ColorScale = keyof typeof designTokens.colors.primary;
export type SemanticColor = keyof typeof designTokens.colors.semantic;
export type GlassBlur = keyof typeof designTokens.glass.blur;
export type ChatMessageType = keyof typeof designTokens.chat.message;
export type DomainAccent = keyof typeof designTokens.domain.accent;
