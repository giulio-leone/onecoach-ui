/**
 * OneCoach Tailwind Preset
 *
 * Consumes designTokens to produce a Tailwind-compatible theme config.
 * Handles flattening of mode-aware (light/dark) token structures.
 */

import type { Config } from 'tailwindcss';
import { designTokens } from './tokens';

// Flatten fontSize from { size, lineHeight } to Tailwind's [size, { lineHeight }]
const fontSize = Object.fromEntries(
  Object.entries(designTokens.typography.fontSize).map(([key, val]) => [
    key,
    [val.size, { lineHeight: val.lineHeight }],
  ])
) as Record<string, [string, { lineHeight: string }]>;

// Flatten zIndex to string values (Tailwind expects strings)
const zIndex = Object.fromEntries(
  Object.entries(designTokens.zIndex).map(([k, v]) => [k, String(v)])
);

export const oneCoachPreset: Config = {
  content: [],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: designTokens.colors.primary,
        secondary: designTokens.colors.secondary,
        accent: designTokens.colors.accent,
        neutral: designTokens.colors.neutral,
        success: designTokens.colors.semantic.success.DEFAULT,
        warning: designTokens.colors.semantic.warning.DEFAULT,
        error: designTokens.colors.semantic.error.DEFAULT,
        info: designTokens.colors.semantic.info.DEFAULT,
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
        display: designTokens.typography.fontFamily.display,
      },
      fontSize,
      fontWeight: designTokens.typography.fontWeight,
      letterSpacing: designTokens.typography.letterSpacing,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows.light,
      zIndex,
      transitionDuration: designTokens.transitions.duration,
      transitionTimingFunction: designTokens.transitions.timing,
      backdropBlur: designTokens.glass.blur,
      opacity: designTokens.opacity,
      animation: designTokens.animations,
    },
  },
  plugins: [],
};

// CJS compat — consumed by packages/app/tailwind.config.js via require()
export const theme = oneCoachPreset.theme;
