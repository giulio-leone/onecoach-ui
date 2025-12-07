/**
 * Design System - Central Export
 *
 * Esporta tutti gli elementi del design system
 */

// Tokens and utilities (local)
export * from './tokens';
export * from './z-index';

// Theme system (from @OneCoach/lib-theme)
export {
    ThemeProvider,
    useTheme,
    useThemeContext,
    useSystemThemeSync,
    useThemeStore,
    cn,
    darkModeClasses,
    lightColors,
    darkColors,
    THEME_STORAGE_KEY,
} from '@OneCoach/lib-theme';

export type {
    ThemePreference,
    ResolvedTheme,
    ThemeColors,
    ThemeProviderProps,
} from '@OneCoach/lib-theme';
