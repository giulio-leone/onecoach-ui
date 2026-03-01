/**
 * Theme Provider - Cross-platform
 *
 * React Native version using useColorScheme and AsyncStorage
 */

import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'onecoach-theme',
}: ThemeProviderProps) {
  'use no memo';
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = (await AsyncStorage.getItem(storageKey)) as Theme | null;
        if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
          setThemeState(storedTheme);
        }
      } catch (error: unknown) {
        // Silently fail - AsyncStorage might not be available
      }
    };

    loadTheme();
  }, [storageKey]);

  // Update actual theme when theme or system color scheme changes
  useEffect(() => {
    if (theme === 'system') {
      setActualTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    } else {
      setActualTheme(theme);
    }
  }, [theme, systemColorScheme]);

  // Set theme function
  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    } catch (error: unknown) {
      // Silently fail - AsyncStorage might not be available
    }
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
