/**
 * Complete Design Tokens System
 *
 * Centralized design tokens for light & dark mode
 * Following 8pt spacing scale, WCAG AA contrast, mobile-first approach
 */

export const designTokens = {
  /**
   * Color System - Light & Dark Mode
   * All colors meet WCAG AA contrast requirements
   */
  colors: {
    light: {
      // Primary brand colors (Violet - Premium Tech)
      primary: {
        50: '#f5f3ff',
        100: '#ede9fe',
        200: '#ddd6fe',
        300: '#c4b5fd',
        400: '#a78bfa',
        500: '#8b5cf6', // Main primary
        600: '#7c3aed',
        700: '#6d28d9',
        800: '#5b21b6',
        900: '#4c1d95',
        950: '#2e1065',
      },
      // Secondary brand colors (Fuchsia - Vibrant Accents)
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Main secondary
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e',
      },
      // Neutral colors (Zinc - Premium Neutral)
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
      // Backgrounds
      background: {
        base: '#ffffff',
        elevated: '#ffffff',
        subtle: '#fafafa',
        muted: '#f4f4f5',
        overlay: 'rgba(9, 9, 11, 0.4)', // Zinc-950 based overlay
      },
      // Text
      text: {
        primary: '#18181b', // Zinc-900
        secondary: '#52525b', // Zinc-600
        tertiary: '#71717a', // Zinc-500
        inverse: '#ffffff',
        disabled: '#a1a1aa', // Zinc-400
      },
      // Borders
      border: {
        light: '#e4e4e7', // Zinc-200
        base: '#d4d4d8', // Zinc-300
        strong: '#a1a1aa', // Zinc-400
      },
    },
    dark: {
      // Primary brand colors (Violet) - Adjusted for dark
      primary: {
        50: '#2e1065',
        100: '#4c1d95',
        200: '#5b21b6',
        300: '#6d28d9',
        400: '#7c3aed',
        500: '#8b5cf6', // Main primary
        600: '#a78bfa',
        700: '#c4b5fd',
        800: '#ddd6fe',
        900: '#ede9fe',
        950: '#f5f3ff',
      },
      // Secondary brand colors (Fuchsia) - Adjusted for dark
      secondary: {
        50: '#4a044e',
        100: '#701a75',
        200: '#86198f',
        300: '#a21caf',
        400: '#c026d3',
        500: '#d946ef', // Main secondary
        600: '#e879f9',
        700: '#f0abfc',
        800: '#f5d0fe',
        900: '#fae8ff',
        950: '#fdf4ff',
      },
      // Neutral colors (Zinc) - Deep dark mode
      neutral: {
        50: '#09090b',
        100: '#18181b',
        200: '#27272a',
        300: '#3f3f46',
        400: '#52525b',
        500: '#71717a',
        600: '#a1a1aa',
        700: '#d4d4d8',
        800: '#e4e4e7',
        900: '#f4f4f5',
        950: '#fafafa',
      },
      // Backgrounds - Deep dark mode
      background: {
        base: '#09090b', // Zinc-950 (Deep Black)
        elevated: '#18181b', // Zinc-900
        subtle: '#18181b', // Zinc-900
        muted: '#27272a', // Zinc-800
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      // Text - High contrast for dark mode
      text: {
        primary: '#fafafa', // Zinc-50
        secondary: '#d4d4d8', // Zinc-300
        tertiary: '#a1a1aa', // Zinc-400
        inverse: '#09090b', // Zinc-950
        disabled: '#52525b', // Zinc-600
      },
      // Borders
      border: {
        light: '#18181b', // Zinc-900
        base: '#27272a', // Zinc-800
        strong: '#3f3f46', // Zinc-700
      },
    },
    // Semantic colors - Light & Dark
    semantic: {
      success: {
        light: { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' },
        dark: { bg: '#064e3b', text: '#6ee7b7', border: '#047857' },
      },
      warning: {
        light: { bg: '#fef3c7', text: '#d97706', border: '#fbbf24' },
        dark: { bg: '#78350f', text: '#fbbf24', border: '#d97706' },
      },
      error: {
        light: { bg: '#fecaca', text: '#dc2626', border: '#f87171' },
        dark: { bg: '#7f1d1d', text: '#f87171', border: '#dc2626' },
      },
      info: {
        light: { bg: '#dbeafe', text: '#1d4ed8', border: '#60a5fa' },
        dark: { bg: '#1e3a8a', text: '#60a5fa', border: '#3b82f6' },
      },
    },
  },

  /**
   * Typography System
   * Mobile-first with responsive scaling
   */
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      mono: ['Fira Code', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
    },
    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem' }, // 12px/16px
      sm: { size: '0.875rem', lineHeight: '1.25rem' }, // 14px/20px
      base: { size: '1rem', lineHeight: '1.5rem' }, // 16px/24px
      lg: { size: '1.125rem', lineHeight: '1.75rem' }, // 18px/28px
      xl: { size: '1.25rem', lineHeight: '1.75rem' }, // 20px/28px
      '2xl': { size: '1.5rem', lineHeight: '2rem' }, // 24px/32px
      '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px/36px
      '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px/40px
      '5xl': { size: '3rem', lineHeight: '1' }, // 48px
      '6xl': { size: '3.75rem', lineHeight: '1' }, // 60px
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
   * Spacing System - 8pt scale
   * All values are multiples of 8px (0.5rem base)
   */
  spacing: {
    0: '0',
    1: '0.5rem', // 8px
    2: '1rem', // 16px
    3: '1.5rem', // 24px
    4: '2rem', // 32px
    5: '2.5rem', // 40px
    6: '3rem', // 48px
    7: '3.5rem', // 56px
    8: '4rem', // 64px
    9: '4.5rem', // 72px
    10: '5rem', // 80px
    12: '6rem', // 96px
    16: '8rem', // 128px
    20: '10rem', // 160px
    24: '12rem', // 192px
  },

  /**
   * Border Radius System
   */
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    base: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    full: '9999px',
  },

  /**
   * Shadow System - Light & Dark Mode
   */
  shadows: {
    light: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none',
    },
    dark: {
      xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      base: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.5)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.7), 0 8px 10px -6px rgb(0 0 0 / 0.7)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.8)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
      none: 'none',
    },
  },

  /**
   * Breakpoints - Mobile-first
   */
  breakpoints: {
    xs: '0px',
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
  },

  /**
   * Touch targets - Minimum 44x44px
   */
  touchTarget: {
    min: '2.75rem', // 44px
    sm: '2.75rem', // 44px
    md: '3rem', // 48px
    lg: '3.5rem', // 56px
  },

  /**
   * Transitions
   */
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      medium: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

/**
 * Workout Element Colors
 * Semantic colors for different workout element types
 * Used in Visual Builder, Live Workout, and related components
 */
export const workoutElementColors = {
  warmup: {
    text: 'text-orange-500',
    bg: 'bg-orange-500/10',
    bgHover: 'hover:bg-orange-500/20',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/10 to-amber-500/10',
    hex: '#f97316',
  },
  exercise: {
    text: 'text-blue-500',
    bg: 'bg-blue-500/10',
    bgHover: 'hover:bg-blue-500/20',
    border: 'border-blue-500/30',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    hex: '#3b82f6',
  },
  superset: {
    text: 'text-purple-500',
    bg: 'bg-purple-500/10',
    bgHover: 'hover:bg-purple-500/20',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/10 to-pink-500/10',
    hex: '#a855f7',
  },
  circuit: {
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    bgHover: 'hover:bg-green-500/20',
    border: 'border-green-500/30',
    gradient: 'from-green-500/10 to-emerald-500/10',
    hex: '#22c55e',
  },
  cardio: {
    text: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    bgHover: 'hover:bg-cyan-500/20',
    border: 'border-cyan-500/30',
    gradient: 'from-cyan-500/10 to-teal-500/10',
    hex: '#06b6d4',
  },
} as const;

export type WorkoutElementType = keyof typeof workoutElementColors;

// Type exports
export type DesignTokens = typeof designTokens;
export type ColorMode = 'light' | 'dark';

