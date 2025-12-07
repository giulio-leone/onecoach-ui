'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ActualTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  actualTheme: ActualTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  /**
   * Valori iniziali calcolati lato server per evitare flash in idratazione.
   * Se presenti, bypassano l'inizializzazione “light” di fallback.
   */
  initialTheme?: Theme;
  initialActualTheme?: ActualTheme;
}

// Get system theme preference
const getSystemTheme = (fallback: ActualTheme = 'light'): ActualTheme => {
  if (typeof window === 'undefined') return fallback;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Calculate actual theme based on theme setting
const calculateActualTheme = (themeValue: Theme, fallback: ActualTheme = 'light'): ActualTheme => {
  if (themeValue === 'system') {
    return getSystemTheme(fallback);
  }
  return themeValue;
};

const persistThemePreference = (value: Theme, storageKey: string) => {
  try {
    localStorage.setItem(storageKey, value);
  } catch (_error: unknown) {
    // localStorage non disponibile, ignora
  }

  try {
    const oneYearInSeconds = 60 * 60 * 24 * 365;
    document.cookie = `${storageKey}=${value}; path=/; max-age=${oneYearInSeconds}; SameSite=Lax`;
  } catch (_error: unknown) {
    // document non disponibile o cookie bloccati, ignora
  }
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'onecoach-theme',
  initialTheme,
  initialActualTheme,
}: ThemeProviderProps) {
  const resolveInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return initialTheme ?? defaultTheme;
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme | null;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        return storedTheme;
      }
    } catch (_error: unknown) {
      // Silently fail - localStorage might not be available
    }
    return initialTheme ?? defaultTheme;
  };

  const initialThemeValue = resolveInitialTheme();

  // Initialize theme from localStorage with lazy initial state
  const [theme, setThemeState] = useState<Theme>(initialThemeValue);

  // Initialize actualTheme with 'light' to ensure server-client hydration match
  // This value will be updated immediately on client mount via useEffect
  const [actualTheme, setActualTheme] = useState<ActualTheme>(
    () => initialActualTheme ?? calculateActualTheme(initialThemeValue)
  );

  // Update actual theme on mount and when theme changes (client-side only)
  useEffect(() => {
    setActualTheme(calculateActualTheme(theme));
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(actualTheme);
    root.dataset.theme = theme;
    root.style.colorScheme = actualTheme;

    // Update theme-color meta tag
    const themeColorMetaTag = document.querySelector('meta[name="theme-color"]');
    if (themeColorMetaTag) {
      themeColorMetaTag.setAttribute('content', actualTheme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [actualTheme]);

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setActualTheme(e.matches ? 'dark' : 'light');
    };

    // Initial check
    handleChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Set theme function
  const setTheme = (newTheme: Theme) => {
    persistThemePreference(newTheme, storageKey);
    setThemeState(newTheme);
    setActualTheme(calculateActualTheme(newTheme, actualTheme));
  };

  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
