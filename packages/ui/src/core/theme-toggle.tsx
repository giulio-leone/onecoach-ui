'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@giulio-leone/lib-stores/index';
import { useState, useSyncExternalStore } from 'react';

// SSR-safe mounting detection without useEffect setState
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-lg p-2 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label="Toggle theme"
        suppressHydrationWarning
      >
        {!mounted ? (
          // Render placeholder during SSR to match initial client render
          <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        ) : actualTheme === 'light' ? (
          <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        ) : (
          <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
        )}
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />

          {/* Menu */}
          <div className="animate-slide-down absolute right-0 z-20 mt-2 w-48 rounded-lg border border-neutral-200/50 bg-white/70 py-1 shadow-lg backdrop-blur-2xl dark:border-neutral-800/50 dark:bg-[#020408]/70">
            {themes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setShowMenu(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  theme === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {theme === value && <span className="ml-auto text-xs">✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
