'use client';

import { useState, useEffect } from 'react';

/**
 * SSR-safe media query hook.
 *
 * Returns `false` during SSR and first render (matching the server),
 * then updates to the actual media query result after hydration.
 * Subscribes to `matchMedia` changes so the value stays in sync.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Common breakpoint: `(max-width: 639px)` — matches Tailwind `sm` */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Common breakpoint: `(min-width: 1024px)` — matches Tailwind `lg` */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
