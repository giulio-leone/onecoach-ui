'use client';

import { useSystemThemeSync } from '@giulio-leone/lib-stores';

/**
 * Theme Initializer Component
 *
 * Initializes theme from localStorage and sets up system theme detection
 * Replaces ThemeProvider context
 * Uses shared useSystemThemeSync hook
 */
export function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useSystemThemeSync();

  return <>{children}</>;
}
