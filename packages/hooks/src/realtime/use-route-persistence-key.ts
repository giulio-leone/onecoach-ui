'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Generates a unique key based on the current route and optional context.
 * Useful for auto-generating persistence keys.
 *
 * @param contextSuffix Optional suffix to distinguish multiple forms on the same page
 * @returns A unique string key (e.g., "route:/nutrition/plan/new?id=123:main-form")
 */
export function useRoutePersistenceKey(contextSuffix: string = 'default'): string {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const key = useMemo(() => {
    // Sort params to ensure stability (e.g. ?a=1&b=2 should be same as ?b=2&a=1)
    const params = new URLSearchParams(searchParams?.toString());
    params.sort();
    const paramString = params.toString();

    return `route:${pathname}${paramString ? `?${paramString}` : ''}:${contextSuffix}`;
  }, [pathname, searchParams, contextSuffix]);

  return key;
}
